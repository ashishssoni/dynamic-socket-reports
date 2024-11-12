import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { ErrorHandler } from '../handlers';
import dayjs from 'dayjs';
import { INextApiRequest } from '../types';
import { Encryption } from '../utils';
import connectMongo, { AccessToken } from '../database/models';
import { formatErrorMessages } from '../configs';
import { ERROR_CODE } from '../constants';

const encrypted = new Encryption(process.env.ENCRYPTION_KEY);

export const validateCsrfToken = async (
  req: INextApiRequest,
  _res: NextApiResponse,
  next: NextHandler,
) => {
  try {
    const { identifier } = req.locals;
    const csrfCookieKey = 'app_csrf';
    let cookieCsrfToken: string = null;

    if (req.cookies && req.cookies[csrfCookieKey]) {
      cookieCsrfToken = req.cookies[csrfCookieKey];
    }

    const csrfHeader = req.headers['x-csrf-token'];

    if (!cookieCsrfToken || !csrfHeader) {
      throw new ErrorHandler(403, formatErrorMessages('csrf Token', ERROR_CODE.INVALID));
    }

    const decryptedCsrfToken = encrypted.decrypt(cookieCsrfToken);

    if (csrfHeader !== decryptedCsrfToken) {
      throw new ErrorHandler(403, formatErrorMessages('csrf Token', ERROR_CODE.INVALID));
    }

    await connectMongo();

    const csrfToken = await AccessToken.findOne(
      {
        csrfToken: decryptedCsrfToken,
        expireIn: { $gt: dayjs().format() },
      },
      { _id: 0, token: 1, identifier: 1 },
    ).sort({ createdAt: 'desc' });

    if (!csrfToken) {
      throw new ErrorHandler(403, formatErrorMessages('csrf Token', ERROR_CODE.INVALID));
    }

    if (identifier !== csrfToken.identifier) {
      throw new ErrorHandler(403, formatErrorMessages('csrf Token', ERROR_CODE.INVALID));
    }
  } catch (err: any) {
    throw new ErrorHandler(err.statusCode || 403, err.message || 'Invalid Token');
  }
  next();
};
