'use server';

import mongoose from 'mongoose';
import { mongoProviders } from '../configs/mongo.providers';

const MONGO_URI = mongoProviders();
const cached: { connection?: typeof mongoose; promise?: Promise<typeof mongoose> } = {};
async function connectMongo() {
  if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
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
  return cached.connection;
}

export default connectMongo;
