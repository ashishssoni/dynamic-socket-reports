import { IMongoConfig } from './mongo.interface';

export const mongoConfig: IMongoConfig = {
  host: process.env.MONGO_DB_HOST || 'mongo',
  port: process.env.MONGO_DB_PORT || 27017,
  name: process.env.MONGO_DB_NAME || 'dynamic-reports',
  protocol: process.env.MONGO_DB_PROTOCOL || 'mongodb',
};
