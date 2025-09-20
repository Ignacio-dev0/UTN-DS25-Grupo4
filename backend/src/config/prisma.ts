import { PrismaClient } from "@prisma/client";

// Configuración estable de Prisma Client
let prisma: PrismaClient;

prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ["error", "warn"],
    errorFormat: 'minimal',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    transactionOptions: {
        timeout: 10000,
    },
});

export default prisma;