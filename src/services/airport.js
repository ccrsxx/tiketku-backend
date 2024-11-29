import { prisma } from '../utils/db.js'; // Mengimpor Prisma dari utils/db.js

/**
 * Mendapatkan semua bandara
 *
 * @returns {Promise<import('@prisma/client').Airport[]>}
 */
async function getAirports() {
  // Menggunakan instance prisma untuk mengambil data bandara
  return prisma.airport.findMany();
}

export const AirportService = {
  getAirports
};
