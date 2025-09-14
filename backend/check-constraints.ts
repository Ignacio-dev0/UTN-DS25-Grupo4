// Script para revisar constraints de la tabla Cancha
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Revisando estructura y constraints de la tabla Cancha...');
  
  try {
    // Query para obtener información de constraints
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'Cancha'
      ORDER BY tc.constraint_type, tc.constraint_name;
    `;

    console.log('\n📋 Constraints encontrados:');
    (constraints as any[]).forEach((constraint: any) => {
      console.log(`  • ${constraint.constraint_type}: ${constraint.constraint_name} en columna "${constraint.column_name}"`);
    });

    // Query para obtener índices únicos
    const indexes = await prisma.$queryRaw`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'Cancha'
      AND indexdef LIKE '%UNIQUE%';
    `;

    console.log('\n📊 Índices únicos:');
    (indexes as any[]).forEach((index: any) => {
      console.log(`  • ${index.indexname}: ${index.indexdef}`);
    });

    // Probar datos actuales que podrían causar conflicto
    console.log('\n🔍 Revisando últimas canchas por complejo:');
    const complejos = await prisma.complejo.findMany({
      select: { id: true, nombre: true }
    });

    for (const complejo of complejos) {
      const ultimaCancha = await prisma.cancha.findFirst({
        where: { complejoId: complejo.id },
        orderBy: { nroCancha: 'desc' },
        select: { nroCancha: true, nombre: true, deporteId: true }
      });

      if (ultimaCancha) {
        console.log(`  • Complejo ${complejo.id} (${complejo.nombre}): última cancha N° ${ultimaCancha.nroCancha} (deporte: ${ultimaCancha.deporteId})`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });