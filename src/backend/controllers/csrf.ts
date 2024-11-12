import { NextApiResponse } from 'next';
import { INextApiRequest } from '../types';
import { Encryption, formatCsrfCookie } from '../utils';
import { setCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { AUTH_CONFIG } from '../configs/authConfig';
// import { accessTokenProviders } from '../providers';
// import { AccessTokens } from '../db/mysql/models';

const encrypted = new Encryption(process.env.ENCRYPTION_KEY);

const getCsrfToken = async (req: INextApiRequest, res: NextApiResponse): Promise<string> => {
  const { identifier, token } = req.locals;

  const isDev = !!(
    ['local', 'development'].includes(process.env.API_ENVIRONMENT) &&
    ['http://localhost:3000'].includes(req.headers.origin)
  );

  const tokenExpirationInMinutes = AUTH_CONFIG.userTokenExpiration;
  const expireIn = dayjs().add(tokenExpirationInMinutes, 'm').format();

  const csrfToken = jwt.sign(
    {
      identifier,
      exp: dayjs(expireIn).unix(),
    },
    process.env.CSRF_TOKEN_SECRET,
  );

  const encryptedCsrfToken = encrypted.encrypt(csrfToken);

  const {
    key: csrfCookieName,
    value: csrfCookieValue,
    options: csrfCookieOptions,
  } = formatCsrfCookie(encryptedCsrfToken, expireIn, isDev);

  setCookie(csrfCookieName, csrfCookieValue, { req, res, ...csrfCookieOptions });

  if (
    (['local', 'development'].includes(process.env.API_ENVIRONMENT) &&
      ['http://localhost:3000'].includes(req.headers.origin)) ||
    process.env.ENV_DOMAIN === req.headers.origin
  ) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // const updateData = { csrfToken };

  // await accessTokenProviders.updateAccessToken(token, { ...updateData } as AccessTokens);

  return csrfToken;
};

export const csrfControllers = {
  getCsrfToken,
};
