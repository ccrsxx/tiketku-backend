import { Router } from 'express';

/** @param {Router} mockApp */
export default (mockApp) => {
  const router = Router();

  mockApp.use('/flights', router);

  router.get('/', (_req, res) => {
    const flightsData = [
      {
        id: 1,
        flightNumber: 'JC 231',
        type: 'BUSINESS',
        price: 9000000,
        description:
          'Baggage Allowance: 30kg, Cabin Baggage: 7kg, In Flight Meal, In Flight Entertainment',
        departureId: 'JKT',
        departureName: 'Soekarno Hatta Airport',
        destinationId: 'HKG',
        destinationName: 'Hong Kong International Airport',
        departureTime: '2024-11-27T14:00:00+07:00',
        arrivalTime: '2024-11-27T21:00:00+07:00'
      },
      {
        id: 2,
        flightNumber: 'SM 232',
        type: 'ECONOMY',
        price: 1000000,
        description:
          'Baggage Allowance: 10kg, Cabin Baggage: 5kg, In Flight Meal',
        departureId: 'SIN',
        departureName: 'Changi Airport',
        destinationId: 'MAL',
        destinationName: 'Kuala Lumpur International Airport',
        departureTime: '2024-11-27T22:00:00+07:00',
        arrivalTime: '2024-11-27T23:00:00+07:00'
      }
    ];

    res.status(200).json(flightsData);
  });
};
