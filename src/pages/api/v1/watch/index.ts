import type { NextApiResponse } from 'next';

import nc from 'next-connect';
import { handleError, validateCsrfToken } from '@/backend/middlewares';
import { validateUserToken } from '@/backend/middlewares/validateUserToken';
import { INextApiRequest } from '@/backend/types';
import { watchConfig } from '@/backend/controllers/watch';

const handler = nc({ onError: handleError });

handler.use(validateUserToken, validateCsrfToken);

handler.get(async (_req: INextApiRequest, res: NextApiResponse) => {
  const io = res.socket['server'].io;
  watchConfig(io);

  return res.status(200).send({
    status: true,
  });
});

export default handler;
