import { Document, Model, model, models, Schema } from 'mongoose';

export interface IAccount extends Document {
  account_id: number;
  limit: number;
  products: string[];
}

const accountSchema = new Schema<IAccount>({
  account_id: { type: Number, required: true, unique: true },
  limit: Number,
  products: [String],
});

export const Account: Model<IAccount> = models.Account || model<IAccount>('Account', accountSchema);
