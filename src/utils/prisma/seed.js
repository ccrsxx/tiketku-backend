import { prisma } from '../db.js';
import { logger } from '../../loaders/pino.js';

async function main() {
  try {
    // TODO: Add your seed data here
    const oneUser = await prisma.user.findFirst();

    logger.info(oneUser);

    await prisma.$disconnect();
  } catch (err) {
    logger.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void main();
