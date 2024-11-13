import { NextApiResponse } from 'next';

import nc from 'next-connect';
import { reportConfigControllers } from '@/backend/controllers';
import { handleError, validateCsrfToken } from '@/backend/middlewares';
import { validateUserToken } from '@/backend/middlewares/validateUserToken';
import { INextApiRequest } from '@/backend/types';

const handler = nc({ onError: handleError });

handler.use(validateUserToken, validateCsrfToken);

handler
  .get(async (_req: INextApiRequest, res: NextApiResponse) => {
    const reportsConfig = await reportConfigControllers.getReportConfig();

    return res.status(200).send({
      status: true,
      reportsConfig,
    });
  })
  .put(async (req: INextApiRequest, res: NextApiResponse) => {
    const reportsConfig = await reportConfigControllers.updateReportConfig(req);

    return res.status(200).send({
      status: true,
      reportsConfig,
    });
  });

export default handler;
