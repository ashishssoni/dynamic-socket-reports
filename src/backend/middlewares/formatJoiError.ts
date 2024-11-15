import { ValidationError } from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatValidationError } from '../utils/formatValidationError';

export const formatJoiError = (
  _req: NextApiRequest,
  res: NextApiResponse,
  error: ValidationError,
) => {
  return res.status(400).send({
    status: false,
    message: formatValidationError(error),
  });
};
