import { PrismaClient } from '@prisma/client'; // Import Prisma Client

const prisma = new PrismaClient();

class AirportService {
  /**
   * Mendapatkan semua bandara
   *
   * @returns {Promise<import('@prisma/client').Airport[]>}
   */
  static async getAirports() {
    try {
      const airports = await prisma.airport.findMany();
      return airports;
    } catch (error) {
      // Memastikan error adalah instance dari Error
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to get airports');
      } else {
        // Jika bukan instance Error, kita bisa berikan pesan default
        throw new Error('Unknown error occurred while fetching airports');
      }
    }
  }
}

export { AirportService };
