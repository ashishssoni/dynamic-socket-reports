import Joi, { ValidationError } from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { formatJoiError } from '../middlewares';
import { sanitizeContent } from '../utils/inputSanitization';

const updateReportConfigSchema = Joi.object().keys({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().trim().max(100),
});

const updateReportConfigValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  let data = sanitizeContent(req.body);
  try {
    data = await updateReportConfigSchema.validateAsync(data);
    req.body = data;
    next();
  } catch (error) {
    return formatJoiError(req, res, error as ValidationError);
  }
};

const downloadReportConfigSchema = Joi.object().keys({
  fileName: Joi.string().required().max(50),
});

const downloadReportConfigValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  let data = sanitizeContent(req.body);
  try {
    data = await downloadReportConfigSchema.validateAsync(data);
    req.body = data;
    next();
  } catch (error) {
    return formatJoiError(req, res, error as ValidationError);
  }
};

export const reportConfigValidation = {
  updateReportConfigValidation,
  downloadReportConfigValidation,
};
