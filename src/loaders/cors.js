import cors from 'cors';
import { appEnv } from '../utils/env.js';

/** @import {Application} from 'express' */

/** @type {cors.CorsOptions} */
export const corsOptions = {
  origin: appEnv.FRONTEND_URL,
  credentials: true
};

/** @param {Application} app */
export default (app) => {
  app.use(cors(corsOptions));
};
