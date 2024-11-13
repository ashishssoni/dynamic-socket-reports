import { Document, Model, model, models, Schema } from 'mongoose';

export interface ITransaction extends Document {
  date: Date;
  amount: number;
  transaction_code: string;
  symbol: string;
  price: number;
  total: number;
}

export interface ITransactions extends Document {
  account_id: number;
  transaction_count: number;
  bucket_start_date: Date;
  bucket_end_date: Date;
  transactions: ITransaction[];
}

const transactionSchema = new Schema<ITransaction>({
  date: Date,
  amount: Number,
  transaction_code: String,
  symbol: String,
  price: Number,
  total: Number,
});

const transactionsSchema = new Schema<ITransactions>({
  account_id: { type: Number, required: true },
  transaction_count: Number,
  bucket_start_date: Date,
  bucket_end_date: Date,
  transactions: [transactionSchema],
});

export const Transaction: Model<ITransactions> =
  models.Transaction || model<ITransactions>('Transaction', transactionsSchema);
