import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a base de datos...\n');
    
    // Obtener información de la conexión
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, inet_server_addr(), inet_server_port()`;
    
    console.log('✅ Conexión exitosa!');
    console.log('📊 Información de la base de datos:');
    console.log(result);
    
    // Contar algunos registros para verificar que tenemos datos
    const countUsuarios = await prisma.usuario.count();
    const countComplejos = await prisma.complejo.count();
    const countCanchas = await prisma.cancha.count();
    
    console.log('\n📈 Datos disponibles:');
    console.log(`   - ${countUsuarios} usuarios`);
    console.log(`   - ${countComplejos} complejos`);
    console.log(`   - ${countCanchas} canchas`);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
