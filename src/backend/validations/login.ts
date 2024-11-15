import Joi, { ValidationError } from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { formatJoiError } from '../middlewares';
import { sanitizeContent } from '../utils/inputSanitization';

const emailLoginSchema = Joi.object().keys({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().trim().max(100),
});

const emailLoginValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  let data = sanitizeContent(req.body);
  try {
    data = await emailLoginSchema.validateAsync(data);
    req.body = data;
    next();
  } catch (error) {
    return formatJoiError(req, res, error as ValidationError);
  }
};

export const loginValidation = {
  emailLoginValidation,
};
