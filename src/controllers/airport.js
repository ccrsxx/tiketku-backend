import { AirportService } from '../services/airport.js'; // Import layanan yang relevan

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
async function getAirports(_req, res) {
  try {
    const airports = await AirportService.getAirports();
    res.status(200).json({ data: airports });
  } catch (error) {
    // Menangani error secara lebih baik
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: error.message || 'Internal Server Error' });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
}

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export const AirportController = {
  getAirports
};
