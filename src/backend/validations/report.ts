import Joi, { ValidationError } from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { formatJoiError } from '../middlewares';
import { sanitizeContent } from '../utils/inputSanitization';

const downloadReportSchema = Joi.object().keys({
  fileName: Joi.string().required().max(50),
});

const downloadReportValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  let data = sanitizeContent(req.body);
  try {
    data = await downloadReportSchema.validateAsync(data);
    req.body = data;
    next();
  } catch (error) {
    return formatJoiError(req, res, error as ValidationError);
  }
};

export const reportValidation = {
  downloadReportValidation,
};
