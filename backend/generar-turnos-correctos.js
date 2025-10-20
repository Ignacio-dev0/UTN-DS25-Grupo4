const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generarTurnosCorrectos() {
  try {
    console.log('🧹 Limpiando turnos existentes...');
    
    // Eliminar turnos y alquileres relacionados
    await prisma.alquiler.deleteMany();
    await prisma.turno.deleteMany();
    
    console.log('✅ Turnos eliminados');

    // Obtener todas las canchas
    const canchas = await prisma.cancha.findMany();
    console.log(`📋 Encontradas ${canchas.length} canchas`);

    // Obtener usuarios clientes para reservas
    const clientes = await prisma.usuario.findMany({ 
      where: { rol: 'CLIENTE' },
      take: 10 
    });
    console.log(`👥 Encontrados ${clientes.length} clientes`);

    // Generar turnos para los próximos 6 días desde hoy
    const hoy = new Date();
    const fechasAGenerar = [];
    
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fechasAGenerar.push(fecha);
    }

    console.log('📅 Generando turnos para:', fechasAGenerar.map(f => f.toISOString().split('T')[0]));

    // Horarios de turnos (7:00 a 23:00)
    const horarios = [];
    for (let hora = 7; hora <= 22; hora++) {
      horarios.push({
        inicio: `${hora.toString().padStart(2, '0')}:00`,
        fin: `${(hora + 1).toString().padStart(2, '0')}:00`
      });
    }

    let turnosCreados = 0;
    let reservasCreadas = 0;

    for (const cancha of canchas) {
      for (const fecha of fechasAGenerar) {
        for (const horario of horarios) {
          // Crear turno
          const turno = await prisma.turno.create({
            data: {
              canchaId: cancha.id,
              fecha: fecha,
              horaInicio: new Date(`1970-01-01T${horario.inicio}:00.000Z`),
              horaFin: new Date(`1970-01-01T${horario.fin}:00.000Z`),
              precio: 15000 + Math.floor(Math.random() * 10000), // Precio aleatorio entre 15k y 25k
              reservado: false
            }
          });

          turnosCreados++;

          // Crear algunas reservas aleatorias (30% de probabilidad)
          if (Math.random() < 0.3 && clientes.length > 0) {
            const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
            
            // Crear alquiler
            const alquiler = await prisma.alquiler.create({
              data: {
                clienteId: clienteAleatorio.id,
                estado: 'PROGRAMADO'
              }
            });

            // Marcar turno como reservado
            await prisma.turno.update({
              where: { id: turno.id },
              data: {
                reservado: true,
                alquilerId: alquiler.id
              }
            });

            reservasCreadas++;
          }
        }
      }
    }

    console.log(`✅ Generación completada:`);
    console.log(`   - Turnos creados: ${turnosCreados}`);
    console.log(`   - Reservas creadas: ${reservasCreadas}`);
    console.log(`   - Fechas: ${fechasAGenerar.map(f => f.toISOString().split('T')[0]).join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generarTurnosCorrectos();