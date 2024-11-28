import { Router } from 'express';
import { FlightController } from '../controllers/flight.js';
import { FlightValidationMiddleware } from '../middlewares/validation/flight.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/flights', router);

  router.get(
    '/',
    FlightValidationMiddleware.isValidFlightPayload,
    FlightController.getFlights
  );

  router.get(
    '/favorites',
    FlightValidationMiddleware.isValidFavoriteFlightPayload,
    FlightController.getFavoriteFlights
  );
};
