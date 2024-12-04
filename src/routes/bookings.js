import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { BookingController } from '../controllers/booking.js';
import { BookingValidationMiddleware } from '../middlewares/validation/booking.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/bookings', router);

  router.get(
    '/me',
    AuthMiddleware.isAuthorized,
    BookingController.getMyBookings
  );

  router.post(
    '/',
    BookingValidationMiddleware.isValidBookingPayload,
    AuthMiddleware.isAuthorized,
    BookingController.createBooking
  );
};
