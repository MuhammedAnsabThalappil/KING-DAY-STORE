import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

const prismaConfig = {
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
};

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    ...prismaConfig,
    log: ['error', 'warn']
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      ...prismaConfig,
      log: ['query', 'info', 'warn', 'error']
    });
  }
  prisma = global.__prisma;
}

export { prisma };

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection established successfully (PostgreSQL).');
    return true;
  } catch (error: any) {
    logger.warn('Database connection check failed:', error?.message || error);
    return false;
  }
}
