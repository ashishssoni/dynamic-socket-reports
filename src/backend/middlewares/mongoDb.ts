import mongoose from 'mongoose';
import { mongoProviders } from '../database/configs/mongo.providers';

const dbConnectionTemplate = mongoProviders();

const connectDB = (handler) => async (req, res) => {
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    return handler(req, res);
  }
  // Use new db connection
  mongoose.connect(dbConnectionTemplate, {
    bufferCommands: false,
  });
  return handler(req, res);
};

export default connectDB;
