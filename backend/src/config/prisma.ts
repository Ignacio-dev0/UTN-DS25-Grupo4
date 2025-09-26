
import { PrismaClient } from '@prisma/client'

// Configuración específica para evitar prepared statement conflicts
function createPrismaClient() {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    })
    
    // Manejo de desconexión automática
    process.on('beforeExit', async () => {
        await client.$disconnect()
    })
    
    return client
}

// Cliente Prisma global con reconexión automática
let prismaClient: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
    if (!prismaClient) {
        prismaClient = createPrismaClient()
    }
    return prismaClient
}

const prisma = getPrismaClient()

export default prisma;