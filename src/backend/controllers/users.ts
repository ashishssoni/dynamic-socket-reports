import { formatErrorMessages } from '../configs';
import { ERROR_CODE, USERS } from '../constants';
import { ErrorHandler } from '../handlers';
import { INextApiRequest } from '../types';

const getUser = async (req: INextApiRequest) => {
  const { identifier } = req.locals;

  const user = USERS.find((item) => item.id === identifier);

  if (!user) {
    throw new ErrorHandler(400, formatErrorMessages('user', ERROR_CODE.NOT_FOUND));
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const userControllers = {
  getUser,
};
