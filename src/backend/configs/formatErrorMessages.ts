import { ERROR_CODE } from '../constants/errorCodes';

export const formatErrorMessages = (name?: string, key?: string, plural = false) => {
  switch (key) {
    case ERROR_CODE.REQUIRED:
      return `${name} ${plural ? 'are' : 'is'} required`;
    case ERROR_CODE.NOT_FOUND:
      return `${name} not found`;
    case ERROR_CODE.INVALID:
      return `${name} ${plural ? 'are' : 'is'} invalid`;
    case ERROR_CODE.NO_DATA_FOUND:
      return `no ${name} data available for this`;
    default:
      return 'unable to process this request';
  }
};
