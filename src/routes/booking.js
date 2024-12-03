import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/booking', router);

  router.get('/booking/me');

  router.post('/booking', AuthMiddleware.isAuthorized);
};
