// backend/src/scripts/resetearSistemaCompleto.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetearSistemaCompleto() {
  console.log('🔄 Iniciando reseteo completo del sistema de turnos...');
  
  try {
    // 1. Limpiar turnos muy antiguos
    console.log('🧹 Limpiando turnos antiguos...');
    const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const turnosEliminados = await prisma.turno.deleteMany({
      where: {
        fecha: {
          lt: hace3Dias
        }
      }
    });
    
    console.log(`   🗑️ Eliminados ${turnosEliminados.count} turnos antiguos`);
    
    // 2. Resetear todos los turnos restantes como disponibles
    console.log('🔄 Reseteando ocupaciones existentes...');
    const turnosReset = await prisma.turno.updateMany({
      where: {
        reservado: true
      },
      data: {
        reservado: false
      }
    });
    
    console.log(`   ✅ Liberados ${turnosReset.count} turnos ocupados`);
    
    // 3. Obtener estadísticas actuales
    const statsActuales = {
      total: await prisma.turno.count(),
      disponibles: await prisma.turno.count({ where: { reservado: false } }),
      ocupados: await prisma.turno.count({ where: { reservado: true } })
    };
    
    console.log('📊 Estado después de limpieza:');
    console.log(`   - Total: ${statsActuales.total}`);
    console.log(`   - Disponibles: ${statsActuales.disponibles}`);
    console.log(`   - Ocupados: ${statsActuales.ocupados}`);
    
    // 4. Aplicar ocupación realista del 35%
    console.log('🎭 Aplicando ocupación realista del 35%...');
    
    const turnosDisponibles = await prisma.turno.findMany({
      where: { 
        reservado: false,
        fecha: { gte: new Date() } // Solo turnos futuros
      }
    });
    
    const cantidadAOcupar = Math.floor(turnosDisponibles.length * 0.35);
    console.log(`   📈 Ocupando ${cantidadAOcupar} de ${turnosDisponibles.length} turnos (35%)`);
    
    // Seleccionar turnos aleatorios para ocupar
    const turnosSeleccionados = [];
    const turnosParaOcupar = [...turnosDisponibles];
    
    for (let i = 0; i < cantidadAOcupar; i++) {
      if (turnosParaOcupar.length === 0) break;
      
      const indiceRandom = Math.floor(Math.random() * turnosParaOcupar.length);
      const turnoSeleccionado = turnosParaOcupar.splice(indiceRandom, 1)[0];
      turnosSeleccionados.push(turnoSeleccionado.id);
    }
    
    // Ocupar los turnos seleccionados
    if (turnosSeleccionados.length > 0) {
      await prisma.turno.updateMany({
        where: {
          id: { in: turnosSeleccionados }
        },
        data: { reservado: true }
      });
      
      console.log(`   ✅ Ocupados ${turnosSeleccionados.length} turnos exitosamente`);
    }
    
    // 5. Estadísticas finales
    const statsFinales = {
      total: await prisma.turno.count(),
      disponibles: await prisma.turno.count({ where: { reservado: false } }),
      ocupados: await prisma.turno.count({ where: { reservado: true } }),
      futuros: await prisma.turno.count({ 
        where: { fecha: { gte: new Date() } }
      })
    };
    
    const porcentajeOcupacion = ((statsFinales.ocupados / statsFinales.total) * 100).toFixed(1);
    
    console.log('✅ RESETEO COMPLETO FINALIZADO:');
    console.log(`   📊 Total de turnos: ${statsFinales.total}`);
    console.log(`   ✅ Disponibles: ${statsFinales.disponibles}`);
    console.log(`   🔴 Ocupados: ${statsFinales.ocupados} (${porcentajeOcupacion}%)`);
    console.log(`   📅 Turnos futuros: ${statsFinales.futuros}`);
    
    return {
      turnosEliminados: turnosEliminados.count,
      turnosLiberados: turnosReset.count,
      turnosOcupados: turnosSeleccionados.length,
      estadisticas: statsFinales,
      porcentajeOcupacion: parseFloat(porcentajeOcupacion)
    };
    
  } catch (error) {
    console.error('❌ Error en reseteo completo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetearSistemaCompleto()
    .then((resultado) => {
      console.log('🎉 Reseteo exitoso:', resultado);
      process.exit(0);
    })
    .catch((error) => {
      console.error('🚨 Error en reseteo:', error);
      process.exit(1);
    });
}

export { resetearSistemaCompleto };