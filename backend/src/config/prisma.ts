
import { PrismaClient } from '@prisma/client'

let prisma: any;

if (process.env.NODE_ENV === 'production') {
    // Configuración para Railway PostgreSQL (producción)
    prisma = new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal'
    });
} else {
    // Configuración para desarrollo (Supabase directo)
    prisma = new PrismaClient({
        log: ['error', 'warn'],
        errorFormat: 'pretty'
    });
}

export default prisma;