import { NextApiRequest } from 'next';
import { LogHandler } from '../handlers/log';
import { stripmoduleUrlFromUrl } from './stripModuleFromUrl';

const logHandler = new LogHandler();

export const pushLogs = (req: NextApiRequest, data: any, namespace = 'SPARK') => {
  try {
    const headers = { ...req.headers };
    const projectId = req.query.projectId || req.body.projectId || '';
    const companyId = data.companyId || req.query.companyId || req.body.companyId;

    const body = { ...req.body };

    if (body.password) {
      body.password = body.password.replace(/./g, '*');
    }

    if (headers['x-api-key']) {
      headers['x-api-key'] = `${(headers['x-api-key'] as string).substring(0, 5)}*****`;
    }

    let authorization = null;
    if (headers.authorization) {
      const [tokenType, token] = headers.authorization.split(' ');
      authorization = `${tokenType} ${token.substring(0, 15)}*****`;
    }

    if (headers['cookie']) {
      headers['cookie'] = `${(headers['cookie'] as string).substring(0, 5)}*****`;
    }

    if (headers['x-csrf-token']) {
      headers['x-csrf-token'] = `${(headers['x-csrf-token'] as string).substring(0, 5)}*****`;
    }

    const requestUrl = req.url.replace(/\/v[1-9]{1}\//g, '/'); // replace /v1,/v2,/v3,..,/vn
    const moduleUrl = stripmoduleUrlFromUrl(requestUrl);

    const log = {
      url: req.url,
      query: req.query,
      body,
      method: req.method,
      companyId,
      projectId,
      module: moduleUrl,
      headers: { ...headers, authorization },
      clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user: {
        id: data ? data.identifier : '',
      },
    };

    logHandler.log(`request_loggers.${namespace}.log: ${JSON.stringify(log)}`);
  } catch (e) {
    logHandler.log(`request_loggers.${namespace}.ERROR: 'unable to log' ${req.url}`);
  }
};
