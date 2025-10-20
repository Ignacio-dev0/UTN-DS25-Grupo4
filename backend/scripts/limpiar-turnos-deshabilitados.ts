import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiarTurnosDeshabilitados() {
  console.log('🧹 Iniciando limpieza de turnos deshabilitados...');

  try {
    // 1. Contar cuántos turnos están deshabilitados
    const turnosDeshabilitados = await prisma.turno.count({
      where: {
        deshabilitado: true
      }
    });

    console.log(`📊 Turnos marcados como deshabilitados: ${turnosDeshabilitados}`);

    if (turnosDeshabilitados === 0) {
      console.log('✅ No hay turnos deshabilitados para limpiar');
      return;
    }

    // 2. Obtener algunos ejemplos para verificar
    const ejemplos = await prisma.turno.findMany({
      where: {
        deshabilitado: true
      },
      take: 5,
      select: {
        id: true,
        fecha: true,
        horaInicio: true,
        precio: true,
        reservado: true,
        alquilerId: true,
        canchaId: true
      }
    });

    console.log('\n📋 Ejemplos de turnos deshabilitados:');
    ejemplos.forEach(t => {
      console.log(`  - ID ${t.id}: Cancha ${t.canchaId}, Fecha ${t.fecha.toISOString().split('T')[0]}, Hora ${t.horaInicio.toISOString().split('T')[1].substring(0, 5)}, Precio $${t.precio}`);
    });

    // 3. Preguntar confirmación (en producción usarías un prompt)
    console.log('\n⚠️  Esta operación habilitará todos los turnos marcados como deshabilitados');
    console.log('⚠️  Solo procede si estás seguro de que estos turnos NO deben estar deshabilitados\n');

    // DESCOMENTAR ESTA LÍNEA PARA EJECUTAR LA LIMPIEZA:
    // const resultado = await prisma.turno.updateMany({
    //   where: {
    //     deshabilitado: true
    //   },
    //   data: {
    //     deshabilitado: false
    //   }
    // });
    
    // console.log(`✅ Se habilitaron ${resultado.count} turnos`);

    console.log('\n💡 Para ejecutar la limpieza, descomenta la línea en el script');

  } catch (error) {
    console.error('❌ Error al limpiar turnos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarTurnosDeshabilitados();
