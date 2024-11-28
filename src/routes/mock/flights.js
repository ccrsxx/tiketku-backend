import { Router } from 'express';

/** @param {Router} mockApp */
export default (mockApp) => {
  const router = Router();

  mockApp.use('/flights', router);

  router.get('/', (_req, res) => {
    const flightsData = {
      data: [
        {
          departureFlights: [
            {
              id: 'b7e3f924-e12b-4ff7-9c47-b8d22765b0f8',
              type: 'ECONOMY',
              price: 800,
              discount: 50,
              arrivalTimestamp: '2024-03-10T12:30:00.000Z',
              departureTimestamp: '2024-03-10T10:00:00.000Z',
              airlineId: '7c376585-51f3-4bfa-8037-c0f7ad26f87d',
              airplaneId: 'd153c3b8-96f7-4d33-83cd-991b25f460ee',
              departureAirportId: '12b6dba6-1975-4782-bc22-5b529276a528',
              destinationAirportId: 'b17c10f7-43d6-4a49-b6c2-0a59311a4d87',
              airline: {
                name: 'American Airlines',
                code: 'AA'
              },
              airplane: {
                name: 'Airbus A320'
              },
              departureAirport: {
                name: 'Los Angeles International Airport',
                type: 'INTERNATIONAL',
                code: 'LAX',
                location: 'Los Angeles, USA'
              },
              destinationAirport: {
                name: 'Tokyo Narita Airport',
                type: 'INTERNATIONAL',
                code: 'NRT',
                location: 'Tokyo, Japan'
              }
            },
            {
              id: '7a8f79c2-1b3c-46f6-b7d9-53f1c734e4e7',
              type: 'ECONOMY',
              price: 950,
              discount: 100,
              arrivalTimestamp: '2024-04-01T14:00:00.000Z',
              departureTimestamp: '2024-04-01T12:00:00.000Z',
              airlineId: '0e2384f4-9572-4535-b215-bf734ef7c70f',
              airplaneId: '06d46f7e-62e2-44c1-9d8e-6c90214b1f5c',
              departureAirportId: 'b17c10f7-43d6-4a49-b6c2-0a59311a4d87',
              destinationAirportId: '12b6dba6-1975-4782-bc22-5b529276a528',
              airline: {
                name: 'United Airlines',
                code: 'UA'
              },
              airplane: {
                name: 'Boeing 737'
              },
              departureAirport: {
                name: 'Tokyo Narita Airport',
                type: 'INTERNATIONAL',
                code: 'NRT',
                location: 'Tokyo, Japan'
              },
              destinationAirport: {
                name: 'Los Angeles International Airport',
                type: 'INTERNATIONAL',
                code: 'LAX',
                location: 'Los Angeles, USA'
              }
            }
          ],
          returnFlights: [
            {
              id: '3a497df9-687d-4633-aeaf-5ab84f741314',
              type: 'BUSINESS',
              price: 1700,
              discount: 200,
              arrivalTimestamp: '2024-03-20T18:15:00.000Z',
              departureTimestamp: '2024-03-20T16:45:00.000Z',
              airlineId: '1b632e56-0844-4d34-b5d9-6ea2e8d706fa',
              airplaneId: '91b1c2c5-cdd8-4c67-8d59-e47a4c56438f',
              departureAirportId: 'b17c10f7-43d6-4a49-b6c2-0a59311a4d87',
              destinationAirportId: '12b6dba6-1975-4782-bc22-5b529276a528',
              airline: {
                name: 'Singapore Airlines',
                code: 'SQ'
              },
              airplane: {
                name: 'Airbus A350'
              },
              departureAirport: {
                name: 'Tokyo Narita Airport',
                type: 'INTERNATIONAL',
                code: 'NRT',
                location: 'Tokyo, Japan'
              },
              destinationAirport: {
                name: 'Los Angeles International Airport',
                type: 'INTERNATIONAL',
                code: 'LAX',
                location: 'Los Angeles, USA'
              }
            },
            {
              id: '17a5d18c-57c3-497e-9786-4130b053a428',
              type: 'FIRST_CLASS',
              price: 3000,
              discount: 250,
              arrivalTimestamp: '2024-04-10T13:30:00.000Z',
              departureTimestamp: '2024-04-10T11:00:00.000Z',
              airlineId: 'c479ed79-17b4-47ac-b0bb-c3e2993e8f3c',
              airplaneId: 'a4dbce8d-89b3-4c79-8d44-cb9e156c61a4',
              departureAirportId: '12b6dba6-1975-4782-bc22-5b529276a528',
              destinationAirportId: 'b17c10f7-43d6-4a49-b6c2-0a59311a4d87',
              airline: {
                name: 'Qatar Airways',
                code: 'QR'
              },
              airplane: {
                name: 'Boeing 787 Dreamliner'
              },
              departureAirport: {
                name: 'Los Angeles International Airport',
                type: 'INTERNATIONAL',
                code: 'LAX',
                location: 'Los Angeles, USA'
              },
              destinationAirport: {
                name: 'Tokyo Narita Airport',
                type: 'INTERNATIONAL',
                code: 'NRT',
                location: 'Tokyo, Japan'
              }
            }
          ]
        }
      ]
    };

    res.status(200).json(flightsData);
  });
};
