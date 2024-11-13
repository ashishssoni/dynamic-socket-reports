import fs from 'fs';
import { INextApiRequest } from '../types';
import XLSX from 'xlsx';
import connectMongo, { Customer } from '../database/models';
import { nanoIdGenerator } from '../utils';

const generateReport = async (req: INextApiRequest) => {
  const { identifier } = req.locals;
  const reportsConfig = JSON.parse(fs.readFileSync('data/configs/report-config.json', 'utf-8'));

  await connectMongo();

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

  const data = await Customer.aggregate(aggregationPipeline);

  console.log('data', data);

  const formattedData = data.map((row) => {
    const formattedRow = {};
    reportsConfig.columns.forEach((column) => {
      let value;

      try {
        value = column.path.split('.').reduce((acc, curr) => acc[curr], row);

        if (column.formatter) {
          if (column.formatter === 'arrayJoin') {
            value = Array.isArray(value) ? value.join(', ') : value;
          }
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
  console.log('Report generated successfully!');

  return data;
};

export const generateReportControllers = {
  generateReport,
};
