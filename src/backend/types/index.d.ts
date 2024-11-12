import { NextApiRequest } from 'next';
import { AttendeeProject, Companies } from '../db/mysql/models';

interface INextApiRequest extends NextApiRequest {
  locals: {
    identifier: string;
    token: string;
  };
}
