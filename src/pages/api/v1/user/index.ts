import { NextApiResponse } from 'next';

import nc from 'next-connect';
import { userControllers } from '@/backend/controllers';
import { handleError, validateCsrfToken } from '@/backend/middlewares';
import { validateUserToken } from '@/backend/middlewares/validateUserToken';
import { INextApiRequest } from '@/backend/types';

const handler = nc({ onError: handleError });

handler.use(validateUserToken, validateCsrfToken);

handler.get(async (req: INextApiRequest, res: NextApiResponse) => {
  const user = await userControllers.getUser(req);

  return res.status(200).send({
    status: true,
    user,
  });
});

export default handler;
