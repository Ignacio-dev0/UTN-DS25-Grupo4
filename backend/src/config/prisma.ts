
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma: any;

if (process.env.NODE_ENV === 'production') {
    // Configuración para Railway con Prisma Accelerate
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    }).$extends(withAccelerate());
} else {
    // Configuración para desarrollo (sin Accelerate)
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