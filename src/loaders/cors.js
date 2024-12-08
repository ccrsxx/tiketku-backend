import cors from 'cors';
import { appEnv } from '../utils/env.js';

/** @import {Application} from 'express' */

const ALLOWED_ORIGINS = appEnv.VALID_ORIGINS.split(',');

/** @type {cors.CorsOptions} */
export const corsOptions = {
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
};

/** @param {Application} app */
export default (app) => {
  app.use(cors(corsOptions));
};
