import { Router } from 'express';
import { AirportController } from '../controllers/airport.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/airports', router);

  router.get('/', AirportController.getAirports);
};
