import { pino as Pino } from 'pino';
import { pinoHttp as PinoHttp } from 'pino-http';

/** @import {Application} from 'express' */
/** @import {LoggerOptions} from 'pino' */

/** @type {LoggerOptions} */
const developmentLoggerOptions = {
  transport: {
    target: 'pino-pretty'
  }
};

/** @type {LoggerOptions} */
const productionLoggerOptions = {
  formatters: {
    level(label) {
      return { severity: label };
    }
  },
  messageKey: 'message'
};

const loggerOptions =
  process.env.NODE_ENV === 'production'
    ? productionLoggerOptions
    : developmentLoggerOptions;

export const logger = Pino(loggerOptions);

const pinoHttp = PinoHttp({
  logger
});

/** @param {Application} app */
export default (app) => {
  app.use(pinoHttp);
};
