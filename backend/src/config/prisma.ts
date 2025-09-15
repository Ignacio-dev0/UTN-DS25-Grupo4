import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    // Configuración optimizada para Railway con pooling limitado
    prisma = new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
    
    // Configurar timeouts más estrictos para Railway
    prisma.$queryRaw`SET statement_timeout = '30s'`;
    prisma.$queryRaw`SET lock_timeout = '10s'`;
} else {
    // Configuración para desarrollo
    prisma = new PrismaClient({
        log: ["error", "warn", "query"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
}

export default prisma;