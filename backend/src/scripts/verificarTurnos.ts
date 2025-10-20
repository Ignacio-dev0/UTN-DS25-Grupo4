// Script para verificar turnos por día
import prisma from '../config/prisma';

async function verificarTurnosPorDia() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    console.log('📅 Verificando turnos para los próximos 8 días...\n');
    
    for (let dia = 0; dia <= 7; dia++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + dia);
      
      const fechaSiguiente = new Date(fecha);
      fechaSiguiente.setDate(fecha.getDate() + 1);
      
      const turnos = await prisma.turno.findMany({
        where: {
          fecha: {
            gte: fecha,
            lt: fechaSiguiente
          },
          canchaId: 1 // Solo cancha 1 para simplificar
        }
      });
      
      const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const diaNombre = diasSemana[fecha.getDay()];
      
      console.log(`Día ${dia} - ${diaNombre} ${fecha.toLocaleDateString()}: ${turnos.length} turnos`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTurnosPorDia();
