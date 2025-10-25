/**
 * Script para migrar datos desde Railway a base de datos local
 * 
 * USO:
 * 1. Asegúrate de tener ambas bases de datos configuradas
 * 2. Ejecuta: npm run migrate-data
 */

import { PrismaClient } from '@prisma/client';

// Base de datos ORIGEN (Railway)
const prismaSource = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:qARAtCXWijIKWYYWLcbWtQSJzGWXxHBs@hopper.proxy.rlwy.net:59063/railway"
    }
  }
});

// Base de datos DESTINO (Local)
const prismaTarget = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://thia@localhost:5432/canchaya_local"
    }
  }
});

async function migrateData() {
  console.log('🚀 Iniciando migración de datos...\n');
  
  try {
    // 1. Limpiar base de datos destino (opcional - comentar si no quieres borrar)
    console.log('🧹 Limpiando base de datos destino...');
    await prismaTarget.resenia.deleteMany();
    await prismaTarget.pago.deleteMany();
    await prismaTarget.alquiler.deleteMany();
    await prismaTarget.turno.deleteMany();
    await prismaTarget.horarioDeshabilitado.deleteMany();
    await prismaTarget.horarioCronograma.deleteMany();
    await prismaTarget.cancha.deleteMany();
    await prismaTarget.complejoServicio.deleteMany();
    await prismaTarget.complejo.deleteMany();
    await prismaTarget.domicilio.deleteMany();
    await prismaTarget.localidad.deleteMany();
    await prismaTarget.servicio.deleteMany();
    await prismaTarget.deporte.deleteMany();
    await prismaTarget.usuario.deleteMany();
    await prismaTarget.administrador.deleteMany();
    console.log('✅ Base de datos limpia\n');

    // 2. Migrar Administradores
    console.log('👤 Migrando Administradores...');
    const administradores = await prismaSource.administrador.findMany();
    for (const admin of administradores) {
      await prismaTarget.administrador.create({ data: admin });
    }
    console.log(`✅ ${administradores.length} administradores migrados\n`);

    // 3. Migrar Usuarios
    console.log('👥 Migrando Usuarios...');
    const usuarios = await prismaSource.usuario.findMany();
    for (const usuario of usuarios) {
      await prismaTarget.usuario.create({ data: usuario });
    }
    console.log(`✅ ${usuarios.length} usuarios migrados\n`);

    // 4. Migrar Localidades
    console.log('📍 Migrando Localidades...');
    const localidades = await prismaSource.localidad.findMany();
    for (const localidad of localidades) {
      await prismaTarget.localidad.create({ data: localidad });
    }
    console.log(`✅ ${localidades.length} localidades migradas\n`);

    // 5. Migrar Domicilios
    console.log('🏠 Migrando Domicilios...');
    const domicilios = await prismaSource.domicilio.findMany();
    for (const domicilio of domicilios) {
      await prismaTarget.domicilio.create({ data: domicilio });
    }
    console.log(`✅ ${domicilios.length} domicilios migrados\n`);

    // 6. Migrar Complejos
    console.log('🏢 Migrando Complejos...');
    const complejos = await prismaSource.complejo.findMany();
    for (const complejo of complejos) {
      await prismaTarget.complejo.create({ data: complejo });
    }
    console.log(`✅ ${complejos.length} complejos migrados\n`);

    // 7. Migrar Servicios
    console.log('🛠️  Migrando Servicios...');
    const servicios = await prismaSource.servicio.findMany();
    for (const servicio of servicios) {
      await prismaTarget.servicio.create({ data: servicio });
    }
    console.log(`✅ ${servicios.length} servicios migrados\n`);

    // 8. Migrar ComplejoServicio
    console.log('🔗 Migrando Relación Complejo-Servicio...');
    const complejoServicios = await prismaSource.complejoServicio.findMany();
    for (const cs of complejoServicios) {
      await prismaTarget.complejoServicio.create({ data: cs });
    }
    console.log(`✅ ${complejoServicios.length} relaciones migradas\n`);

    // 9. Migrar Deportes
    console.log('⚽ Migrando Deportes...');
    const deportes = await prismaSource.deporte.findMany();
    for (const deporte of deportes) {
      await prismaTarget.deporte.create({ data: deporte });
    }
    console.log(`✅ ${deportes.length} deportes migrados\n`);

    // 10. Migrar Canchas
    console.log('🎾 Migrando Canchas...');
    const canchas = await prismaSource.cancha.findMany();
    for (const cancha of canchas) {
      await prismaTarget.cancha.create({ data: cancha });
    }
    console.log(`✅ ${canchas.length} canchas migradas\n`);

    // 11. Migrar Horarios de Cronograma
    console.log('📅 Migrando Horarios de Cronograma...');
    const horarios = await prismaSource.horarioCronograma.findMany();
    for (const horario of horarios) {
      await prismaTarget.horarioCronograma.create({ data: horario });
    }
    console.log(`✅ ${horarios.length} horarios migrados\n`);

    // 12. Migrar Horarios Deshabilitados
    console.log('🚫 Migrando Horarios Deshabilitados...');
    const horariosDeshabilitados = await prismaSource.horarioDeshabilitado.findMany();
    for (const hd of horariosDeshabilitados) {
      await prismaTarget.horarioDeshabilitado.create({ data: hd });
    }
    console.log(`✅ ${horariosDeshabilitados.length} horarios deshabilitados migrados\n`);

    // 13. Migrar Turnos (sin alquilerId primero)
    console.log('🕐 Migrando Turnos...');
    const turnos = await prismaSource.turno.findMany();
    for (const turno of turnos) {
      // Crear turno sin alquilerId para evitar violación de foreign key
      const { alquilerId, ...turnoSinAlquiler } = turno;
      await prismaTarget.turno.create({ data: turnoSinAlquiler });
    }
    console.log(`✅ ${turnos.length} turnos migrados\n`);

    // 14. Migrar Alquileres
    console.log('📝 Migrando Alquileres...');
    const alquileres = await prismaSource.alquiler.findMany();
    for (const alquiler of alquileres) {
      await prismaTarget.alquiler.create({ data: alquiler });
    }
    console.log(`✅ ${alquileres.length} alquileres migrados\n`);
    
    // 15. Actualizar Turnos con alquilerId
    console.log('🔗 Actualizando relaciones Turno-Alquiler...');
    const turnosConAlquiler = turnos.filter(t => t.alquilerId !== null);
    for (const turno of turnosConAlquiler) {
      await prismaTarget.turno.update({
        where: { id: turno.id },
        data: { alquilerId: turno.alquilerId }
      });
    }
    console.log(`✅ ${turnosConAlquiler.length} turnos actualizados con alquilerId\n`);

    // 16. Migrar Pagos
    console.log('💰 Migrando Pagos...');
    const pagos = await prismaSource.pago.findMany();
    for (const pago of pagos) {
      await prismaTarget.pago.create({ data: pago });
    }
    console.log(`✅ ${pagos.length} pagos migrados\n`);

    // 17. Migrar Reseñas
    console.log('⭐ Migrando Reseñas...');
    const resenias = await prismaSource.resenia.findMany();
    for (const resenia of resenias) {
      await prismaTarget.resenia.create({ data: resenia });
    }
    console.log(`✅ ${resenias.length} reseñas migradas\n`);

    console.log('🎉 ¡Migración completada exitosamente!\n');
    
    // Resumen
    console.log('📊 RESUMEN:');
    console.log(`   - Administradores: ${administradores.length}`);
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Complejos: ${complejos.length}`);
    console.log(`   - Canchas: ${canchas.length}`);
    console.log(`   - Turnos: ${turnos.length}`);
    console.log(`   - Alquileres: ${alquileres.length}`);
    console.log(`   - Reseñas: ${resenias.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prismaSource.$disconnect();
    await prismaTarget.$disconnect();
  }
}

// Ejecutar migración
migrateData()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado con errores:', error);
    process.exit(1);
  });
