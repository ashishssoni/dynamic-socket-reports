import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { AUTH_CONFIG, formatErrorMessages } from '../configs';
import { formatUserCookie, issueJwt, nanoIdGenerator } from '../utils';
import { RateLimiterService } from '../services';
import { ErrorHandler } from '../handlers';
import { ERROR_CODE, RATE_LIMITER_CONSTANTS, USERS } from '../constants';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import connectMongo, { AccessToken } from '../database/models';

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

  const user = USERS.find((item) => item.email === email);
  if (!user) {
    throw new ErrorHandler(404, formatErrorMessages('user', ERROR_CODE.NOT_FOUND));
  }

  const pstatus = await bcrypt.compare(password, user.password);
  delete user.password;
  if (!pstatus) {
    throw new ErrorHandler(404, formatErrorMessages('password', ERROR_CODE.INVALID));
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

  await connectMongo();
  await AccessToken.create({ ...tokenData });

  const isDev = !!(
    ['local', 'development'].includes(process.env.API_ENVIRONMENT) &&
    ['http://localhost:3000'].includes(req.headers.origin)
  );

  const {
    key: cookieName,
    value: cookieValue,
    options: cookieOptions,
  } = formatUserCookie(token, tokenExpirationInMinutes, expireIn, isDev);

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
