import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarAlquiler() {
  try {
    console.log('🔍 Verificando alquiler 3225...\n');
    
    const alquiler = await prisma.alquiler.findUnique({
      where: { id: 3225 },
      include: {
        turnos: {
          include: {
            cancha: {
              include: {
                complejo: true
              }
            }
          }
        },
        cliente: true,
        pago: true
      }
    });

    if (!alquiler) {
      console.log('❌ Alquiler 3225 NO encontrado');
      return;
    }

    console.log('✅ Alquiler encontrado:');
    console.log(JSON.stringify(alquiler, null, 2));
    
    console.log('\n📊 Resumen:');
    console.log(`   - ID: ${alquiler.id}`);
    console.log(`   - Cliente: ${alquiler.cliente.nombre} ${alquiler.cliente.apellido}`);
    console.log(`   - Estado: ${alquiler.estado}`);
    console.log(`   - Cantidad de turnos: ${alquiler.turnos.length}`);
    console.log(`   - Pago: ${alquiler.pago ? 'SÍ' : 'NO'}`);
    
    if (alquiler.turnos.length > 0) {
      console.log('\n🕐 Turnos:');
      alquiler.turnos.forEach((turno, i) => {
        console.log(`   ${i + 1}. Fecha: ${turno.fecha}, Hora: ${turno.horaInicio}, Cancha: ${turno.cancha.nombre || turno.cancha.nroCancha}, Complejo: ${turno.cancha.complejo.nombre}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarAlquiler();
