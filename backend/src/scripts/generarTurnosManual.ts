// Script temporal para generar turnos de los próximos 8 días
import prisma from '../config/prisma';
import { DiaSemana } from '@prisma/client';

async function generarTurnosManual() {
  console.log('🚀 Generando turnos para los próximos 8 días...');
  
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const diasSemanaPrisma = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    
    // Obtener todos los cronogramas
    const cronogramas = await prisma.horarioCronograma.findMany({
      include: {
        cancha: true
      }
    });
    
    console.log(`📋 Encontrados ${cronogramas.length} cronogramas`);
    
    const turnosACrear = [];
    
    // Generar para los próximos 8 días
    for (let dia = 0; dia <= 7; dia++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + dia);
      
      const diaJS = fecha.getDay();
      const diaSemanaActual = diasSemanaPrisma[diaJS] as DiaSemana;
      
      console.log(`\n📅 Procesando ${diaSemanaActual} ${fecha.toLocaleDateString()}`);
      
      const cronogramasDelDia = cronogramas.filter(c => c.diaSemana === diaSemanaActual);
      console.log(`   ✅ ${cronogramasDelDia.length} cronogramas para este día`);
      
      for (const cronograma of cronogramasDelDia) {
        // Verificar si ya existe
        const turnoExistente = await prisma.turno.findFirst({
          where: {
            canchaId: cronograma.canchaId,
            fecha: fecha,
            horaInicio: cronograma.horaInicio
          }
        });
        
        if (!turnoExistente) {
          turnosACrear.push({
            fecha: fecha,
            horaInicio: cronograma.horaInicio,
            precio: cronograma.precio,
            reservado: false,
            canchaId: cronograma.canchaId,
          });
        }
      }
    }
    
    console.log(`\n📊 Total de turnos a crear: ${turnosACrear.length}`);
    
    if (turnosACrear.length > 0) {
      // Crear en lotes de 100
      for (let i = 0; i < turnosACrear.length; i += 100) {
        const batch = turnosACrear.slice(i, i + 100);
        await prisma.turno.createMany({
          data: batch,
          skipDuplicates: true
        });
        console.log(`   ✅ Creados ${Math.min(i + 100, turnosACrear.length)}/${turnosACrear.length} turnos`);
      }
      console.log(`\n✅ ¡Generación completa! ${turnosACrear.length} turnos creados`);
    } else {
      console.log('\nℹ️ No hay turnos nuevos para crear (todos ya existen)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generarTurnosManual()
  .then(() => {
    console.log('\n🎉 Proceso finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
