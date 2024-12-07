import { BookingService } from '../services/booking.js';

/** @import {User} from '@prisma/client' */
/** @import {Request,Response} from 'express' */
/** @import {ValidBookingPayload,ValidMyBookingsQueryParams} from '../middlewares/validation/booking.js' */

/**
 * @param {Request<unknown, unknown, ValidBookingPayload>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function createBooking(req, res) {
  await BookingService.createBooking(res.locals.user.id, req.body);

  res.status(201).json({ message: 'Booking created successfully' });
}

/**
 * @param {Request<unknown, unknown, unknown, ValidMyBookingsQueryParams>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function getMyBookings(req, res) {
  const bookings = await BookingService.getMyBookings(
    res.locals.user.id,
    req.query
  );

  res.status(200).json({ data: bookings });
}

export const BookingController = {
  getMyBookings,
  createBooking
};
