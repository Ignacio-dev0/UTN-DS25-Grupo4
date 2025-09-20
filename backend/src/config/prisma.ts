import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Cargar variables de entorno explícitamente
dotenv.config();

// Configuración de Prisma Client para conexión directa a base de datos
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ["error", "warn"],
    errorFormat: 'minimal',
    transactionOptions: {
        timeout: 10000,
    },
});

export default prisma;