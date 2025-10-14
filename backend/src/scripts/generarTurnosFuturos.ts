// backend/src/scripts/generarTurnosFuturos.ts
import { PrismaClient, DiaSemana } from '@prisma/client';

const prisma = new PrismaClient();

async function generarTurnosFuturos(semanasAGenerar: number = 4) {
  console.log(`🔮 Generando turnos para las próximas ${semanasAGenerar} semanas...`);
  
  try {
    // 1. Obtener todos los cronogramas
    const cronogramas = await prisma.horarioCronograma.findMany();
    console.log(`   📋 Encontrados ${cronogramas.length} cronogramas de horarios`);
    
    const hoy = new Date();
    const turnosData = [];
    
    // 2. Generar turnos para las próximas semanas
    for (let semana = 1; semana <= semanasAGenerar; semana++) {
      console.log(`   📅 Procesando semana ${semana}...`);
      
      for (let dia = 0; dia < 7; dia++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + (semana * 7) + dia);
        fecha.setHours(0, 0, 0, 0); // Resetear hora para consistencia
        
        // Mapear día de la semana
        const diaSemanaJS = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const diaSemanaEnum = Object.values(DiaSemana)[diaSemanaJS === 0 ? 6 : diaSemanaJS - 1];
        
        // Encontrar cronogramas para este día
        const cronogramasDelDia = cronogramas.filter(c => c.diaSemana === diaSemanaEnum);
        
        for (const cronograma of cronogramasDelDia) {
          // Verificar si ya existe el turno
          const turnoExistente = await prisma.turno.findFirst({
            where: {
              canchaId: cronograma.canchaId,
              fecha: fecha,
              horaInicio: cronograma.horaInicio
            }
          });

          if (!turnoExistente) {
            // 90% de probabilidad de crear el turno (alta disponibilidad)
            if (Math.random() > 0.10) {
              turnosData.push({
                fecha: fecha,
                horaInicio: cronograma.horaInicio,
                precio: cronograma.precio,
                reservado: false,
                canchaId: cronograma.canchaId,
              });
            }
          }
        }
      }
    }

    // 3. Crear turnos en lotes para mejor rendimiento
    console.log(`   💾 Creando ${turnosData.length} nuevos turnos...`);
    
    let turnosCreados = 0;
    for (let i = 0; i < turnosData.length; i += 100) {
      const batch = turnosData.slice(i, i + 100);
      const resultado = await prisma.turno.createMany({
        data: batch,
        skipDuplicates: true
      });
      turnosCreados += resultado.count;
      
      if (i % 500 === 0) {
        console.log(`     Procesados ${Math.min(i + 100, turnosData.length)} de ${turnosData.length}...`);
      }
    }
    
    console.log(`   ✅ Creados ${turnosCreados} turnos nuevos`);
    
    // 4. Mostrar estadísticas finales
    const stats = {
      total: await prisma.turno.count(),
      disponibles: await prisma.turno.count({ where: { reservado: false } }),
      ocupados: await prisma.turno.count({ where: { reservado: true } })
    };
    
    console.log('   📊 Estadísticas finales:');
    console.log(`      - Total de turnos: ${stats.total}`);
    console.log(`      - Disponibles: ${stats.disponibles}`);
    console.log(`      - Ocupados: ${stats.ocupados}`);
    
    return {
      turnosGenerados: turnosCreados,
      totalTurnos: stats.total,
      disponibles: stats.disponibles,
      ocupados: stats.ocupados
    };
    
  } catch (error) {
    console.error('❌ Error generando turnos futuros:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const semanas = process.argv[2] ? parseInt(process.argv[2]) : 4;
  
  generarTurnosFuturos(semanas)
    .then((resultado) => {
      console.log('✅ Generación completada:', resultado);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en generación:', error);
      process.exit(1);
    });
}

export { generarTurnosFuturos };