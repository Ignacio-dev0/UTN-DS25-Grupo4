
import { PrismaClient } from '@prisma/client'

// Configuración específica para evitar prepared statement conflicts con Supabase pooler
const prismaClientSingleton = () => {
    // Agregar parámetro pgbouncer=true para deshabilitar prepared statements
    const databaseUrl = process.env.DATABASE_URL
    const urlWithPgBouncer = databaseUrl?.includes('?') 
        ? `${databaseUrl}&pgbouncer=true`
        : `${databaseUrl}?pgbouncer=true`
    
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
        errorFormat: 'minimal',
        datasources: {
            db: {
                url: urlWithPgBouncer,
            },
        },
    })
}

// Prevenir múltiples instancias en desarrollo con hot reload
declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma
}

// Manejo de desconexión al cerrar la aplicación
process.on('beforeExit', async () => {
    await prisma.$disconnect()
})

export default prisma;