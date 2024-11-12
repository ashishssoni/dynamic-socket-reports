import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { NextHandler } from 'next-connect';
import { ErrorHandler } from '../handlers';
import { pushLogs } from '../utils';
import { AccessToken } from '../database/models';
import dayjs from 'dayjs';
import { formatErrorMessages } from '../configs';
import { ERROR_CODE } from '../constants';

export const validateUserToken = async (
  req: NextApiRequest,
  _res: NextApiResponse,
  next: NextHandler,
) => {
  const userCookieKey = 'app_ai_auth';
  let jwtToken: string = null;

  if (req.cookies && req.cookies[userCookieKey]) {
    jwtToken = req.cookies[userCookieKey];
  } else {
    throw new ErrorHandler(403, formatErrorMessages('token', ERROR_CODE.INVALID));
  }

  try {
    const payload: any = await jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    const { identifier } = payload;

    const userTokenData = await AccessToken.findOne(
      {
        token: jwtToken,
        expireIn: { $gt: dayjs().format() },
      },
      { _id: 0, token: 1, identifier: 1 },
    ).sort({ createdAt: 'desc' });

    if (!userTokenData || userTokenData.identifier !== identifier) {
      throw new ErrorHandler(403, formatErrorMessages('token', ERROR_CODE.INVALID));
    }

    req['locals'] = { identifier, token: jwtToken };

    if (process.env.API_ENVIRONMENT !== 'local') {
      pushLogs(req, req['locals']);
    }
  } catch (err: any) {
    throw new ErrorHandler(err.statusCode || 403, err.message || 'Invalid Token');
  }

  next();
};
