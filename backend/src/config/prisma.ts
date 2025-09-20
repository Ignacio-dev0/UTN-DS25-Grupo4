import { PrismaClient } from "@prisma/client";

// Solo usar Prisma Optimize en Railway si está disponible
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production' && process.env.OPTIMIZE_API_KEY) {
    // En producción con Optimize
    try {
        const { withOptimize } = require("@prisma/extension-optimize");
        const basePrisma = new PrismaClient({
            log: ['error'],
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
        
        // Extender con Optimize
        prisma = basePrisma.$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })) as any;
    } catch (error) {
        console.warn('⚠️ Prisma Optimize no disponible, usando cliente estándar');
        // Fallback a cliente estándar
        prisma = new PrismaClient({
            log: ['error'],
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
    }
} else {
    // Desarrollo o sin Optimize
    prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'production' ? ['error'] : ["error", "warn"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
}

export default prisma;