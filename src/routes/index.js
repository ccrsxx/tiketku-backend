import root from './root.js';
import auth from './auth.js';
import docs from './docs.js';
import users from './users.js';
import upload from './upload.js';
import flights from './flights.js';
import airports from './airports.js';
import notifications from './notifications.js';
import bookings from './bookings.js';

/** @import {Application} from 'express' */

/** @param {Application} app */
export default (app) => {
  root(app);
  auth(app);
  docs(app);
  users(app);
  upload(app);
  flights(app);
  airports(app);
  notifications(app);
  bookings(app);
};
