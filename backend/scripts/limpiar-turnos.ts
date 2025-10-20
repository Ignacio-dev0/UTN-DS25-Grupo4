import { PrismaClient, DiaSemana } from '@prisma/client';

// Crear nueva instancia de Prisma para evitar conflictos
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🧹 Limpiando turnos antiguos...');
  
  try {
    // Eliminar turnos anteriores a abril 2025
    const fechaLimite = new Date('2025-04-01');
    const deletedCount = await prisma.turno.deleteMany({
      where: {
        fecha: {
          lt: fechaLimite
        }
      }
    });
    
    console.log(`✅ Eliminados ${deletedCount.count} turnos anteriores a abril 2025`);
    
    // Obtener todas las canchas con sus cronogramas
    const canchas = await prisma.cancha.findMany({
      include: {
        cronograma: true
      }
    });
    
    console.log(`📋 Regenerando turnos para ${canchas.length} canchas...`);
    
    // Generar turnos desde abril 1, 2025 hasta 6 días en adelante
    const fechaInicio = new Date('2025-04-01');
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 6); // 6 días hacia adelante
    
    let turnosCreados = 0;
    
    for (const cancha of canchas) {
      const fechaActual = new Date(fechaInicio);
      
      while (fechaActual <= fechaFin) {
        const diaSemana = getDiaSemana(fechaActual.getDay());
        
        // Buscar horarios para este día
        const horariosDelDia = cancha.cronograma.filter(h => h.diaSemana === diaSemana);
        
        for (const horario of horariosDelDia) {
          // La fecha del turno (solo fecha, sin hora)
          const fechaTurno = new Date(fechaActual);
          fechaTurno.setHours(0, 0, 0, 0);
          
          // Verificar si ya existe el turno
          const turnoExistente = await prisma.turno.findFirst({
            where: {
              canchaId: cancha.id,
              fecha: fechaTurno,
              horaInicio: horario.horaInicio
            }
          });
          
          if (!turnoExistente) {
            await prisma.turno.create({
              data: {
                fecha: fechaTurno,
                horaInicio: horario.horaInicio,
                precio: horario.precio,
                reservado: false,
                canchaId: cancha.id
              }
            });
            turnosCreados++;
          }
        }
        
        // Avanzar al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    }
    
    console.log(`✅ Regenerados ${turnosCreados} turnos desde abril 2025`);
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getDiaSemana(jsDay: number): DiaSemana {
  const dias: DiaSemana[] = [
    DiaSemana.DOMINGO,
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
    DiaSemana.SABADO
  ];
  return dias[jsDay];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });