'use server';

import mongoose from 'mongoose';
import { mongoProviders } from '../configs/mongo.providers';
import { ErrorHandler, LogHandler } from '@/backend/handlers';
import { formatErrorMessages } from '@/backend/configs';
import { ERROR_CODE } from '@/backend/constants';
import { AccessToken } from './accessTokens';
import { Customer } from './customers';
import { Transaction } from './transactions';
import { Account } from './accounts';

const logHandler = new LogHandler();

const MONGO_URI = mongoProviders();
const cached: {
  connection?: typeof mongoose;
  promise?: Promise<typeof mongoose>;
} = {};

async function connectMongo() {
  if (!MONGO_URI) {
    throw new ErrorHandler(404, formatErrorMessages('Mongo Uri', ERROR_CODE.REQUIRED));
  }

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000,
    };
    cached.promise = mongoose.connect(MONGO_URI, opts);
  }
  try {
    cached.connection = await cached.promise;
  } catch (e) {
    cached.promise = undefined;
    throw e;
  }

  logHandler.log('MongoDB connected successfully');
  return cached.connection;
}

export default connectMongo;

export { AccessToken, Customer, Account, Transaction };
