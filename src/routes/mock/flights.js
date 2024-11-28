import { Router } from 'express';

/** @param {Router} mockApp */
export default (mockApp) => {
  const router = Router();

  mockApp.use('/flights', router);

  router.get('/:id', (req, res) => {
    const flight = {
      id: req.params.id,
      type: 'ECONOMY',
      price: 850,
      discount: 50,
      arrivalTimestamp: '2024-03-15T14:30:00.000Z',
      departureTimestamp: '2024-03-15T10:00:00.000Z',
      airline: { name: 'Delta Airlines', code: 'DL' },
      airplane: { name: 'Boeing 747' },
      departureAirport: {
        name: 'John F. Kennedy International Airport',
        type: 'INTERNATIONAL',
        code: 'JFK',
        location: 'New York, USA'
      },
      destinationAirport: {
        name: 'Heathrow Airport',
        type: 'INTERNATIONAL',
        code: 'LHR',
        location: 'London, UK'
      }
    };

    res.status(200).json(flight);
  });
};
