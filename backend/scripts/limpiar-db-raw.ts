import { PrismaClient } from '@prisma/client';

async function main() {
  // Crear cliente con configuración básica
  const prisma = new PrismaClient({
    log: ['error']
  });

  console.log('🧹 Iniciando limpieza de base de datos...');

  try {
    // Usar SQL crudo para evitar problemas de prepared statements
    console.log('📅 Eliminando turnos anteriores a abril 2025...');
    const result1 = await prisma.$executeRaw`
      DELETE FROM "Turno" WHERE fecha < '2025-04-01'::date
    `;
    console.log(`✅ Eliminados ${result1} turnos antiguos`);

    console.log('🗓️ Eliminando turnos más allá de 6 días...');
    const result2 = await prisma.$executeRaw`
      DELETE FROM "Turno" WHERE fecha > CURRENT_DATE + INTERVAL '6 days'
    `;
    console.log(`✅ Eliminados ${result2} turnos futuros`);

    // Verificar el estado actual
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::int as total_turnos,
        MIN(fecha) as fecha_min,
        MAX(fecha) as fecha_max
      FROM "Turno"
    `;
    
    console.log('📊 Estado actual de la base de datos:');
    console.log(stats);

    // Contar turnos por estado
    const estadoTurnos = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN reservado = false THEN 1 END)::int as disponibles,
        COUNT(CASE WHEN reservado = true THEN 1 END)::int as ocupados
      FROM "Turno"
    `;
    
    console.log('🎯 Distribución de turnos:');
    console.log(estadoTurnos);

    console.log('✅ Limpieza completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });