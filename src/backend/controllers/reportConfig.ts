import fs from 'fs';
import { INextApiRequest } from '../types';
import connectMongo, { Report } from '../database/models';
import { NextApiResponse } from 'next';

const getReportConfig = async () => {
  const reportsConfig = JSON.parse(fs.readFileSync('data/configs/report-config.json', 'utf-8'));

  return reportsConfig;
};

const updateReportConfig = async (req: INextApiRequest) => {
  const { body } = req;

  fs.writeFileSync('data/configs/report-config.json', JSON.stringify(body));

  return body;
};

const downloadReportConfig = async (req: INextApiRequest, res: NextApiResponse) => {
  const { fileName } = req.body;
  const { identifier } = req.locals;

  await connectMongo();

  const report = await Report.findOne({ fileName, userId: identifier }, 'reportConfig');

  const reportConfig = report.reportConfig;

  const generatedFile = Buffer.from(JSON.stringify(reportConfig), 'binary');

  const modifiedFilename = fileName.split('.')[0];

  res.setHeader(
    'Content-disposition',
    `attachment; filename=${modifiedFilename}_report_config.json`,
  );
  res.setHeader('Content-Type', 'application/json');

  return res.send(generatedFile);
};

export const reportConfigControllers = {
  getReportConfig,
  updateReportConfig,
  downloadReportConfig,
};
