import swagger from 'swagger-ui-express';
import openapiDocument from '../docs/openapi.json' with { type: 'json' };

/** @import {Router} from 'express' */

/** @param {Router} app */
export default async (app) => {
  app.use('/docs', swagger.serve, swagger.setup(openapiDocument));
};
