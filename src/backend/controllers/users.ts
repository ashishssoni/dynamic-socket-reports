import { USERS } from '../constants';
import connectMongo from '../database/models';
import { Product } from '../database/models/product';
import { INextApiRequest } from '../types';

const getUser = async (req: INextApiRequest) => {
  const { identifier } = req.locals;

  await connectMongo();

  const sdsd = await Product.findOne({ id: '6733a2211eb3a44bb5e01298' });
  console.log(sdsd, 'sdsd');
  const user = USERS.find((item) => item.id === identifier);

  delete user.password;

  return user;
};

export const userControllers = {
  getUser,
};
