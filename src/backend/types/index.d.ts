import { NextApiRequest } from 'next';

interface INextApiRequest extends NextApiRequest {
  locals: {
    identifier: string;
    token: string;
  };
}
