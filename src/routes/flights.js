import { Router } from 'express';
import { FlightController } from '../controllers/flight.js';
import { FlightValidationMiddleware } from '../middlewares/validation/flight.js';
import { CommonValidationMiddleware } from '../middlewares/validation/common.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/flights', router);

  router.get(
    '/',
    FlightValidationMiddleware.isValidFlightQueryParams,
    FlightController.getFlights
  );

  router.get(
    '/:id',
    CommonValidationMiddleware.isValidParamsIdUuid,
    FlightController.getFlight
  );

  router.get(
    '/favorites',
    FlightValidationMiddleware.isValidFavoriteFlightQueryParams,
    FlightController.getFavoriteFlights
  );
};