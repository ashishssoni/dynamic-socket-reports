import fs from 'fs';
import { INextApiRequest } from '../types';

const getReportConfig = async () => {
  const reportsConfig = JSON.parse(fs.readFileSync('data/configs/report-config.json', 'utf-8'));

  return reportsConfig;
};

const updateReportConfig = async (req: INextApiRequest) => {
  const { body } = req;

  fs.writeFileSync('data/configs/report-config.json', JSON.stringify(body));

  return body;
};

export const reportConfigControllers = {
  getReportConfig,
  updateReportConfig,
};
