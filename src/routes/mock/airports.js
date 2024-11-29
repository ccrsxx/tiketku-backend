import { Router } from 'express';

/** @param {Router} mockApp */
export default (mockApp) => {
  const router = Router();

  mockApp.use('/airports', router);

  // Mock data for airports
  const airportsData = [
    {
      id: '1',
      type: 'DOMESTIC',
      name: 'Soekarno-Hatta International Airport',
      code: 'CGK',
      image: 'https://example.com/images/cgk.jpg',
      location: 'Jakarta, Indonesia',
      createdAt: '2024-11-01T08:00:00Z',
      updatedAt: '2024-11-01T08:00:00Z'
    },
    {
      id: '2',
      type: 'INTERNATIONAL',
      name: 'Changi Airport',
      code: 'SIN',
      image: 'https://example.com/images/sin.jpg',
      location: 'Singapore',
      createdAt: '2024-11-01T08:00:00Z',
      updatedAt: '2024-11-01T08:00:00Z'
    },
    {
      id: '3',
      type: 'DOMESTIC',
      name: 'Ngurah Rai International Airport',
      code: 'DPS',
      image: 'https://example.com/images/dps.jpg',
      location: 'Bali, Indonesia',
      createdAt: '2024-11-01T08:00:00Z',
      updatedAt: '2024-11-01T08:00:00Z'
    }
  ];

  // GET: Fetch all airports
  router.get('/', (_req, res) => {
    res.status(200).json(airportsData);
  });
};
