import { USERS } from '../constants';
import { INextApiRequest } from '../types';

const getUser = async (req: INextApiRequest) => {
  const { identifier } = req.locals;

  const user = USERS.find((item) => item.id === identifier);
  delete user.password;

  return user;
};

export const userControllers = {
  getUser,
};
