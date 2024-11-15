import { NextApiResponse } from 'next';

import nc from 'next-connect';
import { generateReportControllers } from '@/backend/controllers';
import { handleError, validateCsrfToken } from '@/backend/middlewares';
import { validateUserToken } from '@/backend/middlewares/validateUserToken';
import { INextApiRequest } from '@/backend/types';
import { reportValidation } from '@/backend/validations';

const handler = nc({ onError: handleError });

const { downloadReportValidation } = reportValidation;

handler.use(validateUserToken, validateCsrfToken);

handler.post(downloadReportValidation, async (req: INextApiRequest, res: NextApiResponse) => {
  return await generateReportControllers.downloadReport(req, res);
});

export default handler;
