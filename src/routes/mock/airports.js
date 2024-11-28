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

  // GET: Fetch a single airport by ID
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    const airport = airportsData.find((a) => a.id === id);

    if (airport) {
      res.status(200).json(airport);
    } else {
      res.status(404).json({ error: 'Airport not found' });
    }
  });

  // POST: Create a new airport
  router.post('/', (req, res) => {
    const newAirport = {
      ...req.body,
      id: String(airportsData.length + 1), // Generate a mock ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    airportsData.push(newAirport);
    res.status(201).json(newAirport);
  });

  // PUT: Update an airport by ID
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const index = airportsData.findIndex((a) => a.id === id);

    if (index !== -1) {
      airportsData[index] = {
        ...airportsData[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      res.status(200).json(airportsData[index]);
    } else {
      res.status(404).json({ error: 'Airport not found' });
    }
  });

  // DELETE: Remove an airport by ID
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = airportsData.findIndex((a) => a.id === id);

    if (index !== -1) {
      const deletedAirport = airportsData.splice(index, 1);
      res.status(200).json(deletedAirport[0]);
    } else {
      res.status(404).json({ error: 'Airport not found' });
    }
  });
};
