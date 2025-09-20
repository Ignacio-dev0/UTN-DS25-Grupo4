import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import * as dotenv from 'dotenv';

// Cargar variables de entorno explícitamente
dotenv.config();

// Configuración de Prisma Client con Accelerate para máximo rendimiento
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ["error", "warn"],
    errorFormat: 'minimal',
    transactionOptions: {
        timeout: 10000,
    },
}).$extends(withAccelerate());

export default prisma;