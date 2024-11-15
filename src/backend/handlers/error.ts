export class ErrorHandler extends Error {
  statusCode: number;
  type: string;
  constructor(statusCode: number, message: string, type = 'json') {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.type = type;
  }
}
