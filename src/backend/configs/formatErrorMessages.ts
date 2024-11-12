import { ERROR_CODE } from '../constants/errorCodes';

export const formatErrorMessages = (name?: string, key?: string, plural = false) => {
  switch (key) {
    case ERROR_CODE.REQUIRED:
      return `${name} ${plural ? 'are' : 'is'} required`;
    case ERROR_CODE.NOT_FOUND:
      return `${name} not found`;
    case ERROR_CODE.NOT_ALLOW_TO_GET:
      return `you are not allow to get this ${name}`;
    case ERROR_CODE.NOT_ALLOW_TO_UPDATE:
      return `you are not allow to update this ${name}`;
    case ERROR_CODE.NOT_ALLOW_TO_DELETE:
      return `you are not allow to delete this ${name}`;
    case ERROR_CODE.UNABLE_TO_CREATE:
      return `unable to create this ${name}`;
    case ERROR_CODE.UNABLE_TO_UPDATE:
      return `unable to update this ${name}`;
    case ERROR_CODE.UNABLE_TO_DELETE:
      return `unable to delete this ${name}`;
    case ERROR_CODE.NOT_ALLOW_TO_UPLOAD:
      return `You are not allowed to upload this ${name}`;
    case ERROR_CODE.ALREADY_EXISTS:
      return `${name} already exists`;
    case ERROR_CODE.NO_ACCESS:
      return `no access to this ${name}`;
    case ERROR_CODE.INVALID_FORMAT:
      return `${name} ${plural ? 'are' : 'is'} in invalid format`;
    case ERROR_CODE.INVALID:
      return `${name} ${plural ? 'are' : 'is'} invalid`;
    case ERROR_CODE.IN_USE:
      return `${name} is in use`;
    case ERROR_CODE.DIFFERENT_IDS:
      return `different ${name} ${plural ? 'are' : 'is'} provided`;
    case ERROR_CODE.ALREADY_UPDATED:
      return `${name} already updated`;
    case ERROR_CODE.NO_ADMIN_ACCESS:
      return `you dont have ${name} access`;
    case ERROR_CODE.CHAR_LIMIT_EXCEEDED:
      return `${name} ${plural ? 'are' : 'is'} too long`;
    case ERROR_CODE.CHAR_LIMIT_EXCEEDED:
      return `${name} ${plural ? 'are' : 'is'} in progress`;
    case ERROR_CODE.NO_LONGER_AVAILABLE:
      return `${name} ${plural ? 'are' : 'is'} no longer available`;
    case ERROR_CODE.NOT_ENABLED:
      return `${name} not enabled for this`;
    case ERROR_CODE.NO_DATA_FOUND:
      return `no ${name} data available for this`;
    default:
      return 'unable to process this request';
  }
};
