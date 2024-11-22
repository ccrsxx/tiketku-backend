import { Router } from 'express';

import root from './root.js';
import auth from './auth.js';
import docs from './docs.js';
import users from './users.js';
import upload from './upload.js';
import flights from './mock/flights.js';

/** @import {Application} from 'express' */

/** @param {Application} app */
export default (app) => {
  root(app);
  auth(app);
  docs(app);
  users(app);
  upload(app);

  const mockApp = Router();

  app.use('/mock', mockApp);

  flights(mockApp);
};
