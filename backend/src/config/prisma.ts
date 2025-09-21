
import { PrismaClient } from '@prisma/client'

let prisma: any;

if (process.env.NODE_ENV === 'production') {
    // Configuración para Railway PostgreSQL (producción)
    prisma = new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
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
    });
}

export default prisma;