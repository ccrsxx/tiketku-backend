// routes/airportRoutes.js
import { Router } from 'express';
import { AirportController } from '../controllers/airport.js'; // Pastikan path impor benar
/** @param {Router} app */
export default (app) => {
  const router = Router();

  // Ganti '/users' dengan '/airports' untuk route bandara
  app.use('/airports', router);

  // Route untuk mendapatkan daftar semua bandara
  router.get('/', AirportController.getAirports);
};
