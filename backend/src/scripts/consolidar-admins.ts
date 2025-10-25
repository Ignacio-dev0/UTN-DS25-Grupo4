// Script para consolidar administradores
// Elimina la tabla Administrador y migra todo a Usuario con rol ADMINISTRADOR

import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

async function consolidarAdministradores() {
  console.log('🔄 Consolidando administradores...\n');

  try {
    // 1. Obtener todos los administradores de la tabla Administrador
    const adminsViejos = await prisma.administrador.findMany();
    console.log(`📋 Encontrados ${adminsViejos.length} administradores en tabla Administrador`);

    // 2. Verificar si ya existe admin@admin.com en Usuario
    const adminUsuarioExistente = await prisma.usuario.findUnique({
      where: { email: 'admin@admin.com' }
    });

    if (!adminUsuarioExistente) {
      console.log('⚠️ No existe admin@admin.com en Usuario, creándolo...');
      const hashedPassword = await bcrypt.hash('admin', 10);
      await prisma.usuario.create({
        data: {
          nombre: 'Admin',
          apellido: 'Sistema',
          dni: '11111111',
          email: 'admin@admin.com',
          password: hashedPassword,
          telefono: '221-0000000',
          rol: 'ADMINISTRADOR',
        }
      });
      console.log('✅ Administrador admin@admin.com creado en Usuario');
    } else {
      console.log(`✅ Admin admin@admin.com ya existe en Usuario (ID: ${adminUsuarioExistente.id})`);
    }

    // 3. Actualizar referencias en Complejo
    for (const admin of adminsViejos) {
      const complejosDelAdmin = await prisma.complejo.findMany({
        where: { administradorId: admin.id }
      });

      console.log(`\n📦 Admin ${admin.email} tiene ${complejosDelAdmin.length} complejos asignados`);

      if (complejosDelAdmin.length > 0) {
        // Asignar todos sus complejos a null (sin administrador específico)
        await prisma.complejo.updateMany({
          where: { administradorId: admin.id },
          data: { administradorId: null }
        });
        console.log(`✅ Desvinculados ${complejosDelAdmin.length} complejos del admin viejo`);
      }
    }

    // 4. Eliminar todos los registros de la tabla Administrador
    const { count } = await prisma.administrador.deleteMany();
    console.log(`\n🗑️ Eliminados ${count} registros de la tabla Administrador`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ CONSOLIDACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log('Ahora solo usa Usuario con rol ADMINISTRADOR');
    console.log('Login: admin@admin.com / admin');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error consolidando administradores:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
consolidarAdministradores()
  .then(() => {
    console.log('\n✨ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
