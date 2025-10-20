// Script para recalcular el precio "desde" de todas las canchas
import prisma from '../src/config/prisma';
import { recalcularPrecioDesde } from '../src/services/cancha.service';

async function recalcularPreciosDesdeCanchas() {
    try {
        console.log('🔄 Iniciando recálculo de precios "desde" para todas las canchas...');
        
        // Obtener todas las canchas
        const canchas = await prisma.cancha.findMany({
            select: {
                id: true,
                nroCancha: true,
                complejoId: true
            }
        });
        
        console.log(`📊 Encontradas ${canchas.length} canchas`);
        
        // Recalcular precio "desde" para cada cancha
        for (const cancha of canchas) {
            console.log(`\n🔄 Procesando cancha ${cancha.nroCancha} (ID: ${cancha.id})...`);
            await recalcularPrecioDesde(cancha.id);
        }
        
        console.log('\n✅ ¡Recálculo completado para todas las canchas!');
        
        // Mostrar resumen
        const canchasActualizadas = await prisma.cancha.findMany({
            select: {
                id: true,
                nroCancha: true,
                precioDesde: true,
                precioHora: true
            },
            orderBy: {
                nroCancha: 'asc'
            }
        });
        
        console.log('\n📊 Resumen de precios actualizados:');
        canchasActualizadas.forEach(cancha => {
            console.log(`  - Cancha ${cancha.nroCancha}: precioDesde = $${cancha.precioDesde}, precioHora = $${cancha.precioHora}`);
        });
        
    } catch (error) {
        console.error('❌ Error recalculando precios:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
recalcularPreciosDesdeCanchas()
    .then(() => {
        console.log('\n✅ Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error ejecutando script:', error);
        process.exit(1);
    });
