import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { ErrorHandler } from '../handlers';
import Joi from 'joi';
import { LogHandler } from '../handlers/log';

const logHandler = new LogHandler();

export const handleError = (err: any, req: NextApiRequest, res: NextApiResponse) => {
  console.log('comnig ')
  const requestUrl = req.url.replace(/\/v[1-9]{1}\//g, '/'); // replace /v1,/v2,/v3,..,/vn
  // pushed log
  logHandler.error(err.message, { requestUrl });
  const statusCode = err.statusCode || 500;
  let message = 'unable to process the request';

  if (err instanceof ErrorHandler || err instanceof Joi.ValidationError) {
    message = err.message;
  }

  if (err instanceof multer.MulterError) {
    message = err.message;
    if (err.code) {
      message = err.code;
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Max file upload limit exceeds';
      }

      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File is too large';
      }
    }
  }

  return res.status(statusCode).json({
    status: false,
    message,
  });
};
