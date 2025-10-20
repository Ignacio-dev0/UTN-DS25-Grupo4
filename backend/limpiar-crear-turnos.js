const { PrismaClient } = require('@prisma/client');

async function limpiarYCrearTurnos() {
  let prisma;
  
  try {
    // Crear nueva instancia de Prisma para evitar conexiones previas
    prisma = new PrismaClient();
    
    console.log('🔌 Conectando a la base de datos...');
    await prisma.$connect();
    
    console.log('🧹 Paso 1: Limpiando alquileres existentes...');
    const alquileresEliminados = await prisma.$executeRaw`DELETE FROM "Alquiler"`;
    console.log(`✅ Alquileres eliminados: ${alquileresEliminados}`);
    
    console.log('🧹 Paso 2: Limpiando turnos existentes...');
    const turnosEliminados = await prisma.$executeRaw`DELETE FROM "Turno"`;
    console.log(`✅ Turnos eliminados: ${turnosEliminados}`);
    
    console.log('📋 Paso 3: Obteniendo canchas...');
    const canchas = await prisma.cancha.findMany({
      select: { id: true, nombre: true }
    });
    console.log(`📊 Canchas encontradas: ${canchas.length}`);
    
    if (canchas.length === 0) {
      console.log('❌ No hay canchas en la base de datos. Ejecuta el seed principal primero.');
      return;
    }
    
    // Obtener usuarios clientes para crear algunas reservas
    console.log('👥 Paso 4: Obteniendo clientes...');
    const clientes = await prisma.usuario.findMany({ 
      where: { rol: 'CLIENTE' },
      take: 8,
      select: { id: true, nombre: true }
    });
    console.log(`👥 Clientes encontrados: ${clientes.length}`);
    
    // Generar fechas para los próximos 6 días
    console.log('📅 Paso 5: Generando fechas...');
    const hoy = new Date();
    const fechas = [];
    
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fecha.setHours(0, 0, 0, 0); // Resetear horas para tener fechas limpias
      fechas.push(fecha);
    }
    
    console.log('📅 Fechas a generar:', fechas.map(f => f.toISOString().split('T')[0]));
    
    // Horarios de 7:00 a 22:00
    const horarios = [];
    for (let hora = 7; hora <= 22; hora++) {
      horarios.push({
        inicio: new Date(`1970-01-01T${hora.toString().padStart(2, '0')}:00:00.000Z`),
        fin: new Date(`1970-01-01T${(hora + 1).toString().padStart(2, '0')}:00:00.000Z`)
      });
    }
    
    console.log(`⏰ Horarios a generar: ${horarios.length} (${horarios[0].inicio.toISOString().split('T')[1].split('.')[0]} - ${horarios[horarios.length-1].fin.toISOString().split('T')[1].split('.')[0]})`);
    
    let turnosCreados = 0;
    let reservasCreadas = 0;
    
    console.log('🏗️ Paso 6: Creando turnos...');
    
    for (const cancha of canchas) {
      console.log(`  🏟️ Procesando cancha: ${cancha.nombre} (ID: ${cancha.id})`);
      
      for (const fecha of fechas) {
        for (const horario of horarios) {
          // Crear turno base
          const precio = 15000 + Math.floor(Math.random() * 10000); // Entre 15k y 25k
          
          const turno = await prisma.turno.create({
            data: {
              canchaId: cancha.id,
              fecha: fecha,
              horaInicio: horario.inicio,
              horaFin: horario.fin,
              precio: precio,
              reservado: false,
              alquilerId: null
            }
          });
          
          turnosCreados++;
          
          // Crear algunas reservas aleatorias (25% de probabilidad)
          if (Math.random() < 0.25 && clientes.length > 0) {
            const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
            
            try {
              // Crear alquiler
              const alquiler = await prisma.alquiler.create({
                data: {
                  clienteId: clienteAleatorio.id,
                  estado: 'PROGRAMADO'
                }
              });
              
              // Actualizar turno como reservado
              await prisma.turno.update({
                where: { id: turno.id },
                data: {
                  reservado: true,
                  alquilerId: alquiler.id
                }
              });
              
              reservasCreadas++;
            } catch (reservaError) {
              console.log(`⚠️ Error creando reserva: ${reservaError.message}`);
            }
          }
        }
      }
    }
    
    console.log('\\n🎉 ¡COMPLETADO EXITOSAMENTE!');
    console.log(`📊 Estadísticas finales:`);
    console.log(`   - Turnos creados: ${turnosCreados}`);
    console.log(`   - Reservas creadas: ${reservasCreadas}`);
    console.log(`   - Canchas procesadas: ${canchas.length}`);
    console.log(`   - Fechas: ${fechas.length} días`);
    console.log(`   - Horarios por día: ${horarios.length}`);
    console.log(`   - Total esperado: ${canchas.length * fechas.length * horarios.length} turnos`);
    
  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (prisma) {
      console.log('🔌 Cerrando conexión...');
      await prisma.$disconnect();
    }
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  limpiarYCrearTurnos()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💀 Script falló:', error);
      process.exit(1);
    });
}

module.exports = { limpiarYCrearTurnos };