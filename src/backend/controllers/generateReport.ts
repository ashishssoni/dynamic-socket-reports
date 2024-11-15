import fs from 'fs';
import { INextApiRequest } from '../types';
import XLSX from 'xlsx';
import connectMongo, { Customer, Report } from '../database/models';
import { nanoIdGenerator } from '../utils';
import { NextApiResponse } from 'next';
import { ERROR_CODE, USERS } from '../constants';
import { ErrorHandler } from '../handlers';
import { formatErrorMessages } from '../configs';

const generateReport = async (req: INextApiRequest, res: NextApiResponse) => {
  const io = res.socket['server'].io;
  const { identifier } = req.locals;
  const reportsConfig = JSON.parse(fs.readFileSync('data/configs/report-config.json', 'utf-8'));

  await connectMongo();

  const customers = await Customer.countDocuments();
  if (!customers) {
    throw new ErrorHandler(400, formatErrorMessages('reports', ERROR_CODE.NOT_FOUND));
  }

  const convertObjectIdToString = (obj) => {
    if (obj instanceof Object && obj.constructor.name === 'ObjectId') {
      return obj.toString();
    }

    if (Array.isArray(obj) && obj.length) {
      return obj.join(', ');
    }
    return obj;
  };

  const cleanPath = (path) => {
    return path.startsWith('customers.') ? path.replace('customers.', '') : path;
  };

  const generateProjectStage = (columns) => {
    const projectStage = {};
    columns.forEach((column) => {
      projectStage[column.header] = `$${cleanPath(column.path)}`;
    });
    return projectStage;
  };

  const projectStage = generateProjectStage(reportsConfig.columns);

  const collectionNames = [...new Set(reportsConfig.columns.map((col) => col.path.split('.')[0]))];

  let aggregationPipeline: any = [
    {
      $addFields: {
        tier_and_details: { $objectToArray: '$tier_and_details' },
      },
    },
  ];

  if (collectionNames.includes('accounts')) {
    aggregationPipeline = [
      ...aggregationPipeline,
      {
        $unwind: {
          path: '$accounts',
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: 'accounts',
          foreignField: 'account_id',
          as: 'accounts',
        },
      },
      {
        $unwind: {
          path: '$accounts',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  if (collectionNames.includes('transactions')) {
    aggregationPipeline = [
      ...aggregationPipeline,
      {
        $lookup: {
          from: 'transactions',
          localField: 'accounts.account_id',
          foreignField: 'account_id',
          as: 'transactions',
        },
      },
      {
        $unwind: {
          path: '$transactions',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$transactions.transactions',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  aggregationPipeline = [
    ...aggregationPipeline,
    {
      $project: {
        _id: 0,
        ...projectStage,
      },
    },
  ];

  // Non-blocking task for aggregation
  setTimeout(() => {
    setImmediate(async () => {
      const data = await Customer.aggregate(aggregationPipeline);

      if (!data.length) {
        io.emit('reportFailed', {
          message: 'No Report Found',
        });

        return;
      }

      const formattedData = data.map((doc) => {
        reportsConfig.columns.forEach((column) => {
          if (!doc.hasOwnProperty(column.header)) {
            doc[column.header] = null;
          }
          doc[column.header] = convertObjectIdToString(doc[column.header]);
        });

        Object.keys(doc).forEach((key) => {
          if (!reportsConfig.columns.some((col) => col.header === key)) {
            delete doc[key]; // Delete keys not in reportConfig
          }
        });
        return doc;
      });

      const finalFilename = `Report_${nanoIdGenerator(6)}.xlsx`;
      const reportsPath = `data/output/${finalFilename}`;

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, reportsConfig.reportName || 'Report');
      XLSX.writeFile(workbook, reportsPath);

      io.emit('reportReady', { filename: finalFilename, message: 'Report generation completed!' });

      await Report.create({
        fileName: finalFilename,
        userId: identifier,
        reportConfig: reportsConfig,
      });

      console.log('Report generated successfully!');
    });
  }, 0);

  return true;
};

const getReports = async (req: INextApiRequest) => {
  const { identifier } = req.locals;
  const { sortBy = 'createdAt', search = '', sortOrder = 'desc' } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = limit * (page - 1);

  const sorting: any = {
    [sortBy as string]: (sortOrder as string).toLowerCase() === 'asc' ? 1 : -1,
  };

  await connectMongo();

  const query: any = { userId: identifier };

  if (search) {
    query.fileName = { $regex: search, $options: 'i' };
  }

  const [total, reportsData] = await Promise.all([
    Report.countDocuments(query),
    Report.find(query).sort(sorting).skip(skip).limit(limit).lean(),
  ]);

  const formattedData = reportsData.map((item) => {
    const { userId, fileName, createdAt } = item;

    const user = USERS.find((item) => item.id === userId);

    return { fileName, userName: user.name, createdAt };
  });

  return {
    formattedData,
    pagination: {
      limit,
      total,
      currentPage: page,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const downloadReport = async (req: INextApiRequest, res: NextApiResponse) => {
  const { fileName } = req.body;

  const filePath = `data/output/${fileName}`;

  const generatedFile = fs.readFileSync(filePath);

  res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );

  return res.send(generatedFile);
};

export const generateReportControllers = {
  generateReport,
  getReports,
  downloadReport,
};
