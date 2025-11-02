import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFechaAlquiler3225() {
    try {
        console.log('🔧 Corrigiendo fecha del alquiler 3225...\n');

        // La fecha actual en DB: 2025-11-02T00:00:00.000Z
        // Se interpreta como: 1/11/2025 21:00 (Argentina UTC-3)
        
        // Necesitamos: 3/11/2025 00:00 UTC
        // Que se interpretará como: 2/11/2025 21:00 (Argentina)
        // Pero cuando el frontend compare, usará la fecha local: 2/11/2025
        
        // Mejor: Ajustar para mañana (3/11) para que sea claramente futuro
        const fechaCorrecta = new Date('2025-11-03T00:00:00.000Z');
        
        console.log('📅 Fecha actual del turno (DB): 2025-11-02T00:00:00.000Z');
        console.log('📅 Nueva fecha: ', fechaCorrecta.toISOString());
        console.log('📅 Se verá en Argentina como:', fechaCorrecta.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));
        
        // Actualizar los turnos del alquiler 3225
        const result = await prisma.turno.updateMany({
            where: {
                alquilerId: 3225
            },
            data: {
                fecha: fechaCorrecta
            }
        });
        
        console.log(`\n✅ Actualizados ${result.count} turnos`);
        
        // Verificar
        const turnosActualizados = await prisma.turno.findMany({
            where: { alquilerId: 3225 },
            select: {
                id: true,
                fecha: true,
                horaInicio: true,
                alquilerId: true
            }
        });
        
        console.log('\n📋 Turnos actualizados:');
        turnosActualizados.forEach(t => {
            const fechaLocal = new Date(t.fecha).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
            console.log(`   - Turno ${t.id}: ${fechaLocal} a las ${new Date(t.horaInicio).toISOString()}`);
        });
        
        console.log('\n✅ Fecha corregida! Ahora la reserva debería aparecer en el frontend.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixFechaAlquiler3225();
