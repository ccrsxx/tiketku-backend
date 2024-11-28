import { FlightService } from '../services/flight.js';
import { HttpError } from '../utils/error.js';

/** @import {Request, Response} from 'express' */

/**
 * Mengambil penerbangan berdasarkan ID
 * @param {Request<{ id: string }>} req
 * @param {Response} res
 */
async function getFlight(req, res) {
  try {
    const flight = await FlightService.getFlight(req.params.id);
    res.status(200).json({ data: flight });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        message: error.message,
        errors: error.errors || []
      });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
}

export const FlightController = {
  getFlight
};