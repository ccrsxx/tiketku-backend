import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   FlightController: Record<
 *     keyof import('../../controllers/flight.js')['FlightController'],
 *     jest.Mock
 *   >;
 * }} FlightControllerMock
 */

jest.unstable_mockModule('../../services/flight.js', () => ({
  FlightService: {
    getFlight: jest.fn(),
    getFlights: jest.fn(),
    getFavoriteFlights: jest.fn()
  }
}));

const { FlightController } = /** @type {FlightControllerMock} */ (
  await import('../../controllers/flight.js')
);

const { FlightService } = /** @type {FlightServiceMock} */ (
  await import('../../services/flight.js')
);

describe('Flight controller', () => {
  describe('getFlight', () => {
    it('should get a flight by id', async () => {
      const { req, res } = setupExpressMock();
      const flight = { id: '1', name: 'Flight 1' };

      FlightService.getFlight.mockResolvedValue(flight);

      req.params = { id: '1' };
      req.query = {};

      await FlightController.getFlight(req, res);

      expect(FlightService.getFlight).toHaveBeenCalledWith('1', {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(flight);
    });
  });

  describe('getFlights', () => {
    it('should get a list of flights', async () => {
      const { req, res } = setupExpressMock();
      const flights = [{ id: '1', name: 'Flight 1' }];
      const meta = { total: 1 };

      FlightService.getFlights.mockResolvedValue({ flights, meta });

      req.query = {};

      await FlightController.getFlights(req, res);

      expect(FlightService.getFlights).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ meta, data: flights });
    });
  });

  describe('getFavoriteFlights', () => {
    it('should get a list of favorite flights', async () => {
      const { req, res } = setupExpressMock();
      const flights = [{ id: '1', name: 'Favorite Flight 1' }];
      const meta = { total: 1 };

      FlightService.getFavoriteFlights.mockResolvedValue({ flights, meta });

      req.query = {};

      await FlightController.getFavoriteFlights(req, res);

      expect(FlightService.getFavoriteFlights).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ meta, data: flights });
    });
  });
});
