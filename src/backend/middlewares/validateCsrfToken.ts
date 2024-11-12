import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { ErrorHandler } from '../handlers';
// import { accessTokenProviders } from '../providers';
import { INextApiRequest } from '../types';
import { Encryption } from '../utils';

const encrypted = new Encryption(process.env.ENCRYPTION_KEY);

export const validateCsrfToken = async (
  req: INextApiRequest,
  _res: NextApiResponse,
  next: NextHandler,
) => {
  try {
    const { identifier } = req.locals;
    const csrfCookieKey = 'snapsight_csrf';
    let cookieCsrfToken: string = null;

    if (req.cookies && req.cookies[csrfCookieKey]) {
      cookieCsrfToken = req.cookies[csrfCookieKey];
    }

    const csrfHeader = req.headers['x-csrf-token'];

    if (!cookieCsrfToken || !csrfHeader) {
      throw new ErrorHandler(403, 'Invalid Csrf Token');
    }

    const decryptedCsrfToken = encrypted.decrypt(cookieCsrfToken);

    if (csrfHeader !== decryptedCsrfToken) {
      throw new ErrorHandler(403, 'Invalid Csrf Token');
    }

    // const csrfToken = await accessTokenProviders.findCsrfToken(decryptedCsrfToken);

    // if (!csrfToken) {
    //   throw new ErrorHandler(403, 'Invalid Csrf Token');
    // }

    // if (identifier !== csrfToken.identifier) {
    //   throw new ErrorHandler(403, 'Invalid Csrf Token');
    // }
  } catch (err: any) {
    throw new ErrorHandler(err.statusCode || 403, err.message || 'Invalid Token');
  }
  next();
};
