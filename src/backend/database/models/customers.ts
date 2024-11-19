import { Document, Model, model, models, Schema } from 'mongoose';

export interface ITierDetail extends Document {
  tier: string;
  id: string;
  active: boolean;
  benefits: string[];
}

export interface ICustomer extends Document {
  username: string;
  name: string;
  address: string;
  birthdate: Date;
  email: string;
  active: boolean;
  accounts: number[];
  tier_and_details: Map<string, ITierDetail>;
  createdAt: Date;
  updatedAt: Date;
}

const tierDetailSchema = new Schema<ITierDetail>({
  tier: String,
  id: { type: String, index: true },
  active: Boolean,
  benefits: [String],
});

const customerSchema = new Schema<ICustomer>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: String,
    address: String,
    birthdate: Date,
    email: String,
    active: Boolean,
    accounts: [{ type: Number }],
    tier_and_details: {
      type: Map,
      of: tierDetailSchema,
    },
  },
  { timestamps: true },
);

export const Customer: Model<ICustomer> =
  models.Customer || model<ICustomer>('Customer', customerSchema);
