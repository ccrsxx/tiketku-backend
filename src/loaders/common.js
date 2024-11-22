import { json } from 'express';

/** @import {Application} from 'express' */

/** @param {Application} app */
export default (app) => {
  app.use(json());
};
