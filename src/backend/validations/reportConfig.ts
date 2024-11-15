import Joi, { ValidationError } from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { formatJoiError } from '../middlewares';
import { sanitizeContent } from '../utils/inputSanitization';

const updateReportConfigValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const data = sanitizeContent(req.body);
  try {
    req.body = data;

    const validPrefixes = ['customers', 'accounts', 'transactions'];

    const isValid = data.columns.every((column) => {
      const pathPrefix = column.path.split('.')[0];
      return validPrefixes.includes(pathPrefix);
    });

    if (!isValid) {
      return res.status(400).json({
        status: false,
        message: `path should start with ${validPrefixes.join(', ')}`,
      });
    }

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
