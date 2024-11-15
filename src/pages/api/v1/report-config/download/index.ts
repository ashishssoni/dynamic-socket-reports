import { NextApiResponse } from 'next';

import nc from 'next-connect';
import { reportConfigControllers } from '@/backend/controllers';
import { handleError, validateCsrfToken, validateUserToken } from '@/backend/middlewares';
import { INextApiRequest } from '@/backend/types';
import { reportConfigValidation } from '@/backend/validations';

const handler = nc({ onError: handleError });

const { downloadReportConfigValidation } = reportConfigValidation;

handler.use(validateUserToken, validateCsrfToken);

handler.post(downloadReportConfigValidation, async (req: INextApiRequest, res: NextApiResponse) => {
  return await reportConfigControllers.downloadReportConfig(req, res);
});

export default handler;
