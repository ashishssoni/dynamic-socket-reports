import Joi, { ValidationError } from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { formatJoiError } from '../middlewares';
import { sanitizeContent } from '../utils/inputSanitization';

const sortByKeys = ['createdAt', 'updatedAt', 'fileName'];
const sortOrderKeys = ['asc', 'desc'];

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

const getReportsSchema = Joi.object().keys({
  sortBy: Joi.string()
    .valid(...sortByKeys)
    .insensitive(),
  search: Joi.string().allow('', null),
  sortOrder: Joi.string()
    .valid(...sortOrderKeys)
    .insensitive(),
  page: Joi.string().allow('', null),
  limit: Joi.string().allow('', null),
});

const getReportsValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const data = req.query;
  try {
    await getReportsSchema.validateAsync(data);
    next();
  } catch (error) {
    return formatJoiError(req, res, error as ValidationError);
  }
};

export const reportValidation = {
  downloadReportValidation,
  getReportsValidation,
};
