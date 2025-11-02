import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:canchayadatabase2025@db.xxgebxykshmwomdzywda.supabase.co:5432/postgres'
    }
  }
});

async function resetearSecuencias() {
  try {
    console.log('🔧 Reseteando secuencias de autoincremento en Supabase...\n');

    // Lista de tablas con sus columnas de ID
    const tablas = [
      'Localidad',
      'Deporte',
      'Servicio',
      'Administrador',
      'Usuario',
      'Domicilio',
      'Complejo',
      'Cancha',
      'ComplejoServicio',
      'HorarioCronograma',
      'HorarioDeshabilitado',
      'Alquiler',
      'Turno',
      'Pago',
      'Resenia'
    ];

    for (const tabla of tablas) {
      // Obtener el máximo ID actual de la tabla
      const maxIdResult: any = await prisma.$queryRawUnsafe(
        `SELECT MAX(id) as max_id FROM "${tabla}"`
      );
      
      const maxId = maxIdResult[0]?.max_id || 0;
      const nextId = maxId + 1;

      // Resetear la secuencia al siguiente valor disponible
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${tabla}"', 'id'), ${nextId}, false)`
      );

      console.log(`✅ ${tabla}: Secuencia reseteada a ${nextId} (máximo ID actual: ${maxId})`);
    }

    console.log('\n🎉 ¡Todas las secuencias reseteadas correctamente!');
    console.log('Ahora puedes crear nuevos registros sin problemas de ID duplicado.');

  } catch (error) {
    console.error('❌ Error al resetear secuencias:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
resetearSecuencias()
  .then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
