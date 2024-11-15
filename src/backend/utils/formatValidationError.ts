import { ValidationError } from 'joi';

export const formatValidationError = (error: ValidationError): string => {
  return error.details && error.details.length
    ? error.details[0].message.replace(/['"]+/g, '')
    : 'Invalid request data. Please review request and try again.';
};
