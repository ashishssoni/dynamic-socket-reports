import fs from 'fs';
import { INextApiRequest } from '../types';
import XLSX from 'xlsx';
import connectMongo, { Customer, Report } from '../database/models';
import { nanoIdGenerator } from '../utils';
import { NextApiResponse } from 'next';
import { USERS } from '../constants';

const generateReport = async (req: INextApiRequest, res: NextApiResponse) => {
  const io = res.socket['server'].io;
  const { identifier } = req.locals;
  const reportsConfig = JSON.parse(fs.readFileSync('data/configs/report-config.json', 'utf-8'));

  const aggregationPipeline = [
    { $match: { username: 'fmiller' } },
    {
      $lookup: {
        // Join with accounts
        from: 'accounts',
        localField: 'accounts', // accounts is an array of account IDs in customers collection
        foreignField: 'account_id',
        as: 'accounts',
      },
    },
    {
      $unwind: '$accounts', // Unwind the accounts array to create separate documents for each account
    },

    {
      $lookup: {
        // Join with transactions (after unwinding accounts)
        from: 'transactions',
        localField: 'accounts.account_id',
        foreignField: 'account_id',
        as: 'transactions',
      },
    },
    {
      // Deconstruct transactions array as we want one transaction in one row
      $unwind: {
        path: '$transactions',
        preserveNullAndEmptyArrays: true, // Important: keep customers even if no transactions
      },
    },

    {
      // Deconstruct transactions.transactions array (the actual transactions)

      $unwind: {
        path: '$transactions.transactions',
        preserveNullAndEmptyArrays: true,
      },
    },

    // ... (rest of your aggregation pipeline)
  ];

  console.log('aggregationPipeline', aggregationPipeline);

  // Start a non-blocking task for aggregation
  setTimeout(() => {
    setImmediate(async () => {
      await connectMongo();
      const data = await Customer.aggregate(aggregationPipeline);

      console.log('data', data);

      const formattedData = data.map((row) => {
        const formattedRow = {};
        reportsConfig.columns.forEach((column) => {
          let value;
          try {
            value = column.path.split('.').reduce((acc, curr) => acc[curr], row);
            if (column.formatter && column.formatter === 'arrayJoin') {
              value = Array.isArray(value) ? value.join(', ') : value;
            }
          } catch (error) {
            console.error(`Path Invalid ${column.path}`);
            value = undefined;
          }
          formattedRow[column.header] = value;
        });
        return formattedRow;
      });

      console.log('formattedData', formattedData);

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
  }, 5000);

  return true;
};

const getReports = async (req: INextApiRequest) => {
  const { identifier } = req.locals;

  await connectMongo();

  const reportsData = await Report.find({ userId: identifier }).sort({ createdAt: -1 }).lean();

  const formattedData = reportsData.map((item) => {
    const { userId, fileName, createdAt } = item;

    const user = USERS.find((item) => item.id === userId);

    return { fileName, userName: user.name, createdAt };
  });

  console.log('formattedData', formattedData);

  return formattedData;
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
