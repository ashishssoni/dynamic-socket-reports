import { NextApiResponse } from 'next';
import { LogHandler } from '../handlers/log';
import { INextApiRequest } from '../types';
import { NextHandler } from 'next-connect';

const logHandler = new LogHandler();

export const logRequest = (req: INextApiRequest, _res: NextApiResponse, next: NextHandler) => {
  const requestUrl = req.url.replace(/\/v[1-9]{1}\//g, '/'); // replace /v1,/v2,/v3,..,/vn
  const moduleName = requestUrl.split('/')[2];
  const headers = { ...req.headers };
  const body = { ...req.body };
  const query = { ...req.query };

  if (headers['x-api-key']) {
    const apiKey: any = headers['x-api-key'];
    headers['x-api-key'] = `${apiKey.substring(0, 5)}*****`;
  }

  delete headers['cookie'];

  // pushed log
  logHandler.log(`LOGGER: ${JSON.stringify({ headers, body, query, moduleName })}`);
  next();
};
