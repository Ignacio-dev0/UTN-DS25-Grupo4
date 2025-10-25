import prisma from '../config/prisma';

async function fixDeporteSequence() {
  try {
    console.log('🔧 Fixing Deporte ID sequence...');
    
    // Get the current max ID
    const maxDeporte = await prisma.deporte.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    
    const maxId = maxDeporte?.id || 0;
    console.log(`📊 Max ID actual: ${maxId}`);
    
    // Reset the sequence to max ID + 1
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"Deporte"', 'id'), ${maxId}, true);`
    );
    
    console.log(`✅ Secuencia reseteada exitosamente a ${maxId + 1}`);
    
    // Verify
    const result = await prisma.$queryRaw`
      SELECT last_value FROM "Deporte_id_seq";
    ` as any[];
    
    console.log(`🔍 Valor actual de la secuencia: ${result[0]?.last_value}`);
    
  } catch (error) {
    console.error('❌ Error al resetear secuencia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDeporteSequence();
