import { Document, Model, model, models, Schema } from 'mongoose';

export interface IAccessToken extends Document {
  token: string;
  identifier: string;
  refreshToken: string;
  expireIn: Date;
  type: 'email';
  csrfToken?: string;
  createdAt: Date;
}

const accessTokenSchema = new Schema<IAccessToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    maxLength: 700,
  },
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  refreshToken: {
    type: String,
    required: true,
    maxLength: 100,
  },
  expireIn: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['email'],
  },
  csrfToken: {
    type: String,
    maxLength: 700,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const AccessToken: Model<IAccessToken> =
  models.AccessToken || model<IAccessToken>('AccessToken', accessTokenSchema);
