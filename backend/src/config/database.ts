// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Configuración optimizada para Railway
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  // Configuración para desarrollo
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}

export default prisma;