import { NextApiRequest, NextApiResponse } from 'next';

import nc from 'next-connect';
import { loginValidation } from '@/backend/validations';
import { loginControllers } from '@/backend/controllers';
import { handleError } from '@/backend/middlewares';

const { emailLoginValidation } = loginValidation;

const handler = nc({ onError: handleError });

handler.post(emailLoginValidation, async (req: NextApiRequest, res: NextApiResponse) => {
  await loginControllers.loginByEmail(req, res);

  res.status(200).send({
    status: true,
    message: 'success',
  });
});

export default handler;
