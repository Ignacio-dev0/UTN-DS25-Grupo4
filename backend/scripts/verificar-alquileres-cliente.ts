import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarAlquileresCliente() {
  try {
    console.log('🔍 Verificando alquileres del cliente ID 2...\n');
    
    const alquileres = await prisma.alquiler.findMany({
      where: {
        clienteId: 2
      },
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
      },
      orderBy: {
        id: 'desc'
      },
      take: 10 // Solo los últimos 10
    });

    console.log(`✅ Encontrados ${alquileres.length} alquileres para el cliente 2\n`);
    
    console.log('📋 Últimos 10 alquileres:');
    alquileres.forEach((alq, i) => {
      console.log(`\n${i + 1}. Alquiler ID: ${alq.id}`);
      console.log(`   - Estado: ${alq.estado}`);
      console.log(`   - Fecha creación: ${alq.createdAt}`);
      console.log(`   - Cantidad turnos: ${alq.turnos.length}`);
      if (alq.turnos.length > 0) {
        const primerTurno = alq.turnos[0];
        console.log(`   - Primer turno: ${primerTurno.fecha} a las ${primerTurno.horaInicio}`);
        console.log(`   - Complejo: ${primerTurno.cancha.complejo.nombre}`);
      } else {
        console.log(`   - ⚠️ SIN TURNOS ASOCIADOS`);
      }
    });

    // Verificar específicamente el 3225
    console.log('\n\n🔍 Verificando alquiler 3225 específicamente:');
    const alq3225 = alquileres.find(a => a.id === 3225);
    if (alq3225) {
      console.log('✅ Alquiler 3225 SÍ está en la lista');
      console.log(`   - Tiene ${alq3225.turnos.length} turnos`);
    } else {
      console.log('❌ Alquiler 3225 NO está en la lista de los últimos 10');
      
      // Buscar si existe
      const existe = await prisma.alquiler.findUnique({
        where: { id: 3225 }
      });
      
      if (existe) {
        console.log('   - Pero SÍ existe en la base de datos');
        console.log(`   - ClienteId: ${existe.clienteId}`);
      } else {
        console.log('   - Y NO existe en la base de datos');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarAlquileresCliente();
