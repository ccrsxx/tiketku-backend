import { Router } from 'express';

/** @param {Router} mockApp */
export default (mockApp) => {
  const router = Router();

  mockApp.use('/flights', router);

  router.get('/', (_req, res) => {
    const flightsData = [
      {
        id: 1,
        flightNumber: 'SQ 231',
        origin: 'SIN',
        destination: 'HKG',
        departureTime: '2022-01-01T12:00:00Z',
        arrivalTime: '2022-01-01T15:00:00Z',
        status: 'ON TIME'
      },
      {
        id: 2,
        flightNumber: 'SQ 232',
        origin: 'HKG',
        destination: 'SIN',
        departureTime: '2022-01-01T16:00:00Z',
        arrivalTime: '2022-01-01T19:00:00Z',
        status: 'DELAYED'
      }
    ];

    res.status(200).json(flightsData);
  });
};
