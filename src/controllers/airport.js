import { AirportService } from '../services/airport.js'; // Import layanan yang relevan

/**
 * Mendapatkan semua bandara dan mengembalikan respons JSON
 *
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
async function getAirports(_req, res) {
  const airports = await AirportService.getAirports();
  res.status(200).json({ data: airports });
}

export const AirportController = {
  getAirports
};
