import { jest } from '@jest/globals';
import { generatePrismaMock } from '../../utils/jest.js';

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);

const { prisma } =
  /** @type {import('../../utils/jest.js').GeneratedPrismaMock} */ (
    /** @type {unknown} */ (await import('../../utils/db.js'))
  );
const { AirportService } = await import('../airport.js');

describe('AirportService', () => {
  describe('getAirports', () => {
    it('should fetch all airports', async () => {
      const mockAirports = [
        { id: 'airport1', name: 'Airport One', location: 'Location One' },
        { id: 'airport2', name: 'Airport Two', location: 'Location Two' }
      ];

      prisma.airport.findMany.mockResolvedValue(mockAirports);

      const result = await AirportService.getAirports();

      expect(prisma.airport.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockAirports);
    });
  });
});
