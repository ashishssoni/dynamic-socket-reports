import winston from 'winston';
import { createLogger, transports } from 'winston';

const { format } = winston;

const errorLog = new transports.Console({
  level: 'error',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.colorize(),
    format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} ${label || '-'} ${level}: ${JSON.stringify(message)}`;
    }),
  ),
});

const consoleLog = new transports.Console({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.colorize(),
    format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} ${label || '-'} ${level}: ${message}`;
    }),
  ),
});

// Commented for now due to some issues
/*
const cloudWatchLog = new WinstonCloudWatch({
  name: 'MYXP-API',
  logGroupName: process.env.CLOUD_WATCH_LOG_GROUP_NAME,
  logStreamName() {
    // Spread log streams across dates as the server stays up
    return dayjs().format('YYYY/MM/DD HH-00-00');
  },
  awsRegion: process.env.AWS_REGION || 'ap-southeast-1',
  jsonMessage: true,
  level: 'error',
});
*/

export class LogHandler {
  logger: winston.Logger;
  constructor() {
    this.logger = createLogger({
      transports: [errorLog, consoleLog],
    });
  }

  /**
   * Write an 'log' level log.
   */
  log(message: any, ...options: any[]) {
    this.logger.info(message, options);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...options: any[]) {
    this.logger.error(message, options);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...options: any[]) {
    this.logger.warn(message, options);
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...options: any[]) {
    this.logger.info(message, options);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...options: any[]) {
    this.logger.info(message, options);
  }
}
