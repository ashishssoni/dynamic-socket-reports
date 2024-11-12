import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { NextHandler } from 'next-connect';
import { ErrorHandler } from '../handlers';
// import { accessTokenProviders, userCompanyProviders } from '../providers';
import { pushLogs } from '../utils';

export const validateUserToken = async (
  req: NextApiRequest,
  _res: NextApiResponse,
  next: NextHandler,
) => {
  const userCookieKey = 'snapsight_ai_auth';
  let jwtToken: string = null;

  if (req.cookies && req.cookies[userCookieKey]) {
    jwtToken = req.cookies[userCookieKey];
  } else {
    throw new ErrorHandler(403, 'No Token provided');
  }

  try {
    const payload: any = await jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    const { identifier } = payload;

    // const userTokenData = await accessTokenProviders.findAccessToken(jwtToken);

    // if (!userTokenData || userTokenData.identifier !== identifier) {
    //   throw new ErrorHandler(403, 'Invalid Token');
    // }

    // const userCompanyData = await userCompanyProviders.getUserCompany(identifier, ['companyId']);

    req['locals'] = { identifier, token: jwtToken };

    if (process.env.API_ENVIRONMENT !== 'local') {
      pushLogs(req, req['locals']);
    }
  } catch (err: any) {
    throw new ErrorHandler(err.statusCode || 403, err.message || 'Invalid Token');
  }

  next();
};
