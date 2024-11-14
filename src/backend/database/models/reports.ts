import { Document, Model, model, models, Schema } from 'mongoose';

export interface IReports extends Document {
  fileName: string;
  userId: string;
  reportConfig: any;
  createdAt: Date;
}

const reportSchema = new Schema<IReports>({
  fileName: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  reportConfig: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const Report: Model<IReports> = models.Report || model<IReports>('Report', reportSchema);
