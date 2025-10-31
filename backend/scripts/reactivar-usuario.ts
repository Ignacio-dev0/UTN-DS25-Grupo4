import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reactivarUsuario() {
  const usuarioId = 2;
  
  console.log(`🔄 Reactivando usuario ${usuarioId}...`);
  
  // Calcular fecha hace 30 días
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30);
  
  console.log(`📅 Eliminando alquileres cancelados desde: ${fechaLimite.toISOString()}`);
  
  // Eliminar alquileres cancelados de los últimos 30 días
  const resultado = await prisma.alquiler.deleteMany({
    where: {
      clienteId: usuarioId,
      estado: 'CANCELADO',
      createdAt: {
        gte: fechaLimite
      }
    }
  });
  
  console.log(`✅ Eliminados ${resultado.count} alquileres cancelados`);
  console.log(`✅ Usuario ${usuarioId} reactivado - puede hacer nuevas reservas`);
  
  await prisma.$disconnect();
}

reactivarUsuario()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
