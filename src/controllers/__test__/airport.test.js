import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   AirportController: Record<
 *     keyof import('../../controllers/airport.js')['AirportController'],
 *     jest.Mock
 *   >;
 * }} AirportControllerMock
 */

/**
 * @typedef {{
 *   AirportService: Record<
 *     keyof import('../../services/airport.js')['AirportService'],
 *     jest.Mock
 *   >;
 * }} AirportServiceMock
 */

jest.unstable_mockModule(
  '../../services/airport.js',
  () =>
    /** @type {AirportServiceMock} */ ({
      AirportService: {
        getAirports: jest.fn()
      }
    })
);

const { AirportController } = /** @type {AirportControllerMock} */ (
  /** @type {unknown} */ (await import('../../controllers/airport.js'))
);

const { AirportService } = /** @type {AirportServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/airport.js'))
);

describe('Airport controller', () => {
  describe('getAirports', () => {
    it('should return a list of airports', async () => {
      const airports = [
        { id: '1', name: 'Airport One' },
        { id: '2', name: 'Airport Two' }
      ];

      AirportService.getAirports.mockImplementation(() =>
        Promise.resolve(airports)
      );

      const { req, res } = setupExpressMock();

      await AirportController.getAirports(req, res);

      expect(AirportService.getAirports).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: airports });
    });
  });
});
