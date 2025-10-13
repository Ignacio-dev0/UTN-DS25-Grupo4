// backend/src/scripts/limpiarTurnos.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiarTurnosObsoletos() {
  console.log('🧹 Limpiando turnos obsoletos...');
  
  try {
    const ahora = new Date();
    console.log(`   Fecha actual: ${ahora.toISOString()}`);
    
    // 1. Eliminar todos los turnos anteriores a hace 1 día
    const hace1Dia = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    
    const turnosEliminados = await prisma.turno.deleteMany({
      where: {
        fecha: {
          lt: hace1Dia
        }
      }
    });
    
    console.log(`   🗑️ Eliminados ${turnosEliminados.count} turnos obsoletos`);
    
    // 2. Mostrar estadísticas actuales
    const stats = {
      total: await prisma.turno.count(),
      disponibles: await prisma.turno.count({ where: { reservado: false } }),
      ocupados: await prisma.turno.count({ where: { reservado: true } })
    };
    
    console.log('   📊 Estadísticas actuales:');
    console.log(`      - Total de turnos: ${stats.total}`);
    console.log(`      - Disponibles: ${stats.disponibles}`);
    console.log(`      - Ocupados: ${stats.ocupados}`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error limpiando turnos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  limpiarTurnosObsoletos()
    .then(() => {
      console.log('✅ Limpieza completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en limpieza:', error);
      process.exit(1);
    });
}

export { limpiarTurnosObsoletos };