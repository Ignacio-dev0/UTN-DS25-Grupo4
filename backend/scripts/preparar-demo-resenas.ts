// Script para preparar datos de demo para reseñas
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎬 Preparando datos de demo para reseñas...\n');

  // 1. Buscar usuario Ignacio Benitez y sus reseñas
  const ignacio = await prisma.usuario.findFirst({
    where: {
      OR: [
        { email: { contains: 'ignacio', mode: 'insensitive' } },
        { nombre: { contains: 'ignacio', mode: 'insensitive' } }
      ]
    }
  });

  if (ignacio) {
    console.log(`👤 Usuario encontrado: ${ignacio.nombre} ${ignacio.apellido} (${ignacio.email})`);
    
    // Buscar reseñas de Ignacio
    const resenasIgnacio = await prisma.resenia.findMany({
      where: {
        alquiler: {
          clienteId: ignacio.id
        }
      },
      include: {
        alquiler: {
          include: {
            turnos: {
              include: {
                cancha: {
                  include: {
                    complejo: true
                  }
                }
              }
            }
          }
        }
      },
      take: 3
    });

    console.log(`\n📝 Reseñas de Ignacio encontradas: ${resenasIgnacio.length}`);
    
    if (resenasIgnacio.length > 0) {
      console.log('\n🗑️  Eliminando reseñas de Ignacio:');
      for (const resenia of resenasIgnacio) {
        const cancha = resenia.alquiler.turnos[0]?.cancha;
        console.log(`   - ID ${resenia.id}: ${resenia.puntaje}⭐ en ${cancha?.complejo.nombre} - ${cancha?.descripcion}`);
        await prisma.resenia.delete({
          where: { id: resenia.id }
        });
      }
      console.log('   ✅ Reseñas eliminadas');
    }
  } else {
    console.log('⚠️  No se encontró usuario Ignacio Benitez');
  }

  // 2. Buscar el usuario actual (admin o thia)
  const usuarioActual = await prisma.usuario.findFirst({
    where: {
      OR: [
        { email: 'admin@admin.com' },
        { email: { contains: 'thia', mode: 'insensitive' } }
      ]
    }
  });

  if (!usuarioActual) {
    console.log('\n❌ No se encontró el usuario actual');
    return;
  }

  console.log(`\n👤 Usuario actual: ${usuarioActual.nombre} ${usuarioActual.apellido} (${usuarioActual.email})`);

  // 3. Buscar 3 canchas diferentes para crear turnos
  const canchas = await prisma.cancha.findMany({
    where: {
      activa: true
    },
    include: {
      complejo: true,
      deporte: true
    },
    take: 3
  });

  console.log(`\n🏟️  Canchas encontradas: ${canchas.length}`);

  // 4. Crear 3 alquileres finalizados para el usuario actual
  console.log('\n📅 Creando turnos finalizados para el demo:');
  
  const hoy = new Date();
  const alquileresCreados = [];

  for (let i = 0; i < Math.min(3, canchas.length); i++) {
    const cancha = canchas[i];
    
    // Crear fecha en el pasado (hace 1-3 semanas)
    const fechaPasada = new Date(hoy);
    fechaPasada.setDate(hoy.getDate() - (7 * (i + 1))); // Hace 1, 2 o 3 semanas
    fechaPasada.setHours(0, 0, 0, 0);
    
    const horaInicio = new Date(fechaPasada);
    horaInicio.setHours(18 + i, 0, 0, 0); // 18:00, 19:00, 20:00
    
    // Crear turno
    const turno = await prisma.turno.create({
      data: {
        canchaId: cancha.id,
        fecha: fechaPasada,
        horaInicio: horaInicio,
        precio: cancha.precioDesde || 5000,
        reservado: true
      }
    });

    // Crear alquiler FINALIZADO
    const alquiler = await prisma.alquiler.create({
      data: {
        clienteId: usuarioActual.id,
        estado: 'FINALIZADO',
        turnos: {
          connect: { id: turno.id }
        },
        pago: {
          create: {
            metodoPago: 'TRANSFERENCIA',
            monto: cancha.precioDesde || 5000,
            codigoTransaccion: `DEMO-${Date.now()}-${i}`
          }
        }
      },
      include: {
        turnos: {
          include: {
            cancha: {
              include: {
                complejo: true,
                deporte: true
              }
            }
          }
        }
      }
    });

    // Actualizar el turno con el alquilerId
    await prisma.turno.update({
      where: { id: turno.id },
      data: { alquilerId: alquiler.id }
    });

    alquileresCreados.push(alquiler);
    
    const fechaFormateada = fechaPasada.toLocaleDateString('es-AR');
    const horaFormateada = horaInicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    
    console.log(`   ✅ Alquiler ${i + 1} creado:`);
    console.log(`      - Cancha: ${cancha.complejo.nombre} - ${cancha.deporte.nombre}`);
    console.log(`      - Fecha: ${fechaFormateada} a las ${horaFormateada}`);
    console.log(`      - Precio: $${(cancha.precioDesde || 5000).toLocaleString('es-AR')}`);
    console.log(`      - Estado: FINALIZADO`);
    console.log(`      - ID Alquiler: ${alquiler.id}`);
  }

  // Contar reseñas eliminadas
  const resenasEliminadas = ignacio ? (await prisma.resenia.findMany({
    where: { alquiler: { clienteId: ignacio.id } }
  })).length : 0;

  console.log('\n✅ Demo preparado exitosamente!');
  console.log(`\n📋 Resumen:`);
  console.log(`   - Reseñas de Ignacio encontradas y eliminadas`);
  console.log(`   - Alquileres finalizados creados: ${alquileresCreados.length}`);
  console.log(`\n💡 Ahora puedes ir a tu perfil y dejar reseñas para estos alquileres finalizados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
