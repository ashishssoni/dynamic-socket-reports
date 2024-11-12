import { mongoConfig } from './mongo.config';

export const mongoProviders = (dbName = mongoConfig.name) => {
  const config = mongoConfig;

  if (!config.host || !config.port || !config.name) {
    throw new Error('missing database host or port or name');
  }
  let auth = '';
  let authSuffix = '';
  if (config.username && config.password) {
    auth = `${config.username}:${config.password}@`;
    authSuffix = '?authSource=admin&w=1';
  }
  const port = config.protocol === 'mongodb' ? `:${config.port}` : '';

  return `${config.protocol}://${auth}${config.host}${port}/${dbName}${authSuffix}`;
};
