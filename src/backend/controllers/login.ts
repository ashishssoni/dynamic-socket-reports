import dayjs from 'dayjs';
import { AUTH_CONFIG, formatErrorMessages } from '../configs';
// import { AccessTokens, Otps, UserLogs, Users } from '../db/mysql/models';
// import {
//   accessTokenProviders,
//   otpProviders,
//   userCompanyProviders,
//   userLogsProviders,
//   userProviders,
// } from '../providers';
import { Encryption, formatUserCookie, issueJwt, nanoIdGenerator } from '../utils';
import { RateLimiterService } from '../services';
import { ErrorHandler } from '../handlers';
import { ERROR_CODE, RATE_LIMITER_CONSTANTS, USERS } from '../constants';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';

const encrypted = new Encryption(process.env.ENCRYPTION_KEY);

const loginByEmail = async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
  const { email, password } = req.body;

  const rateLimiterKey = `$login_${email.toLowerCase()}`;
  const rateLimiter = new RateLimiterService();

  const rateLimiterRes = await rateLimiter.consume(
    RATE_LIMITER_CONSTANTS.USER_LOGIN,
    rateLimiterKey,
  );

  if (!rateLimiterRes.status) {
    throw new ErrorHandler(400, rateLimiterRes.message);
  }

  const user = USERS.find((item) => item.email === email && item.password === password);
  console.log('user', user)
  if (!user) {
    throw new ErrorHandler(404, formatErrorMessages('user', ERROR_CODE.NOT_FOUND));
  }

  const tokenExpirationInMinutes = AUTH_CONFIG.userTokenExpiration;

  const expireIn = dayjs().add(tokenExpirationInMinutes, 'm').format();
  const createdAt = dayjs().format();

  const token = issueJwt({
    identifier: user.id,
    exp: dayjs(expireIn).unix(),
  });

  const tokenData = {
    token,
    identifier: user.id,
    expireIn,
    refreshToken: nanoIdGenerator(100),
    type: 'email',
    createdAt,
  };

  // await accessTokenProviders.createAccessToken({ ...tokenData } as AccessTokens);

  const isDev = !!(
    ['local', 'development'].includes(process.env.API_ENVIRONMENT) &&
    ['http://localhost:3000'].includes(req.headers.origin)
  );

  const {
    key: cookieName,
    value: cookieValue,
    options: cookieOptions,
  } = formatUserCookie('admin', token, tokenExpirationInMinutes, expireIn, isDev);

  setCookie(cookieName, cookieValue, { req, res, ...cookieOptions });

  if (
    (['local', 'development'].includes(process.env.API_ENVIRONMENT) &&
      ['http://localhost:3000'].includes(req.headers.origin)) ||
    process.env.ENV_DOMAIN === req.headers.origin
  ) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  await rateLimiter.reset(RATE_LIMITER_CONSTANTS.USER_LOGIN, rateLimiterKey);

  return true;
};

export const loginControllers = {
  loginByEmail,
};
