import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    // Configuración optimizada para Railway con mejor rendimiento
    prisma = new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        // Configuración para mejor rendimiento
        transactionOptions: {
            timeout: 10000, // 10 segundos timeout
        },
    });
} else {
    // Configuración para desarrollo
    prisma = new PrismaClient({
        log: ["error", "warn"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
}

export default prisma;