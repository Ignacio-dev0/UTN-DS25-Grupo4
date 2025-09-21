import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    // Configuración optimizada para Railway con Transaction Pooler (pgbouncer)
    prisma = new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        // Optimizaciones de rendimiento
        __internal: {
            engine: {
                enableRequestBatching: true,
                requestBatchingLimit: 10,
            },
        },
    });
} else {
    // Configuración para desarrollo con Supabase súper optimizada
    prisma = new PrismaClient({
        log: ["error"],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        // Optimizaciones de rendimiento para desarrollo
        __internal: {
            engine: {
                enableRequestBatching: true,
                requestBatchingLimit: 10,
            },
        },
    });
}

export default prisma;