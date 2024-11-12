import jwt from 'jsonwebtoken';

export const issueJwt = (
  payload: any,
  privateKey = '',
  secret: string = process.env.JWT_SECRET_KEY,
) => {
  if (privateKey) {
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  }
  return jwt.sign(payload, secret);
};
