import { NextApiResponse } from 'next';

import nc from 'next-connect';
import { csrfControllers } from '@/backend/controllers';
import { handleError } from '@/backend/middlewares';
import { validateUserToken } from '@/backend/middlewares/validateUserToken';
import { INextApiRequest } from '@/backend/types';

const handler = nc({ onError: handleError });

handler.use(validateUserToken);

handler.get(async (req: INextApiRequest, res: NextApiResponse) => {
  const csrfToken = await csrfControllers.getCsrfToken(req, res);

  return res.status(200).send({
    status: true,
    csrfToken,
  });
});

export default handler;
