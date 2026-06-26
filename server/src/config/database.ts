import { PrismaClient } from '@prisma/client';
import { env } from './env.config';

declare global {
  // Prevent multiple PrismaClient instances in dev hot-reload
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createClient = (): PrismaClient =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

export const db: PrismaClient = globalThis.__prisma ?? createClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = db;
}

export const connectDatabase = async (): Promise<void> => {
  await db.$connect();
  console.info('Database connected');
};

export const disconnectDatabase = async (): Promise<void> => {
  await db.$disconnect();
};
