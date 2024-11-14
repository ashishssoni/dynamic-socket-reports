import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorHandler } from '../handlers';
import Joi from 'joi';
import { LogHandler } from '../handlers/log';

const logHandler = new LogHandler();

export const handleError = (err: any, req: NextApiRequest, res: NextApiResponse) => {
  const requestUrl = req.url.replace(/\/v[1-9]{1}\//g, '/'); // replace /v1,/v2,/v3,..,/vn
  // pushed log
  logHandler.error(err.message, { requestUrl });
  const statusCode = err.statusCode || 500;
  let message = 'unable to process the request';

  if (err instanceof ErrorHandler || err instanceof Joi.ValidationError) {
    message = err.message;
  }

  return res.status(statusCode).json({
    status: false,
    message,
  });
};
