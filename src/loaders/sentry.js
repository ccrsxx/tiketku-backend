import * as sentry from '@sentry/node';

/** @import {Application} from 'express' */

/** @param {Application} app */
export default (app) => {
  if (process.env.NODE_ENV !== 'production') return;

  sentry.setupExpressErrorHandler(app);
};
