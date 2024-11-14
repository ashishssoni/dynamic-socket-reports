import { NextApiResponse } from 'next';

import nc from 'next-connect';
import { generateReportControllers } from '@/backend/controllers';
import { handleError, validateCsrfToken } from '@/backend/middlewares';
import { validateUserToken } from '@/backend/middlewares/validateUserToken';
import { INextApiRequest } from '@/backend/types';
import { reportValidation } from '@/backend/validations';

const handler = nc({ onError: handleError });

const { getReportsValidation } = reportValidation;

handler.use(validateUserToken, validateCsrfToken);

handler.get(getReportsValidation, async (req: INextApiRequest, res: NextApiResponse) => {
  const { formattedData: reports, pagination } = await generateReportControllers.getReports(req);

  return res.status(200).send({
    status: true,
    reports,
    pagination,
  });
});

export default handler;
