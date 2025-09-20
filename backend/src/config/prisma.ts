import { PrismaClient } from "@prisma/client";

// Temporalmente deshabilitado Prisma Optimize hasta configurar recording session
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

// TODO: Habilitar Optimize una vez configurada la recording session
// if (process.env.NODE_ENV === 'production' && process.env.OPTIMIZE_API_KEY) {
//     try {
//         const { withOptimize } = require("@prisma/extension-optimize");
//         prisma = basePrisma.$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })) as any;
//     } catch (error) {
//         console.warn('⚠️ Prisma Optimize no disponible');
//     }
// }

export default prisma;