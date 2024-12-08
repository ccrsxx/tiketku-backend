import { pino as Pino } from 'pino';
import { pinoHttp as PinoHttp } from 'pino-http';

/** @import {Application} from 'express' */
/** @import {LoggerOptions} from 'pino' */
/** @import {Options} from 'pino-http' */

/**
 * @typedef {Object} CombinedLoggerOptions
 * @property {LoggerOptions} pinoOptions
 * @property {Options} [pinoHttpOptions]
 */

/** @type {CombinedLoggerOptions} */
const developmentLoggerOptions = {
  pinoOptions: {
    transport: {
      target: 'pino-pretty'
    }
  },
  pinoHttpOptions: {
    autoLogging: false
  }
};

/** @type {CombinedLoggerOptions} */
const productionLoggerOptions = {
  pinoOptions: {
    formatters: {
      level(label) {
        return { severity: label };
      }
    },
    messageKey: 'message'
  }
};

const { pinoOptions, pinoHttpOptions } =
  process.env.NODE_ENV === 'production'
    ? productionLoggerOptions
    : developmentLoggerOptions;

export const logger = Pino(pinoOptions);

const pinoHttp = PinoHttp({
  ...pinoHttpOptions,
  logger
});

/** @param {Application} app */
export default (app) => {
  app.use(pinoHttp);
};
