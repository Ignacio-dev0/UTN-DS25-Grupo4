import { PrismaClient } from '@prisma/client';

// Prisma para Railway (origen)
const prismaRailway = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:qARAtCXWijIKWYYWLcbWtQSJzGWXxHBs@hopper.proxy.rlwy.net:59063/railway'
    }
  }
});

// Prisma para Supabase (destino)
const prismaSupabase = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:canchayadatabase2025@db.xxgebxykshmwomdzywda.supabase.co:5432/postgres'
    }
  }
});

async function copiarDatos() {
  try {
    console.log('🚀 Iniciando copia de datos de Railway a Supabase...\n');

    // 1. Localidades
    console.log('📍 Copiando Localidades...');
    const localidades = await prismaRailway.localidad.findMany();
    for (const loc of localidades) {
      await prismaSupabase.localidad.upsert({
        where: { id: loc.id },
        update: {},
        create: loc
      });
    }
    console.log(`✅ ${localidades.length} localidades copiadas\n`);

    // 2. Deportes
    console.log('⚽ Copiando Deportes...');
    const deportes = await prismaRailway.deporte.findMany();
    for (const dep of deportes) {
      await prismaSupabase.deporte.upsert({
        where: { id: dep.id },
        update: {},
        create: dep
      });
    }
    console.log(`✅ ${deportes.length} deportes copiados\n`);

    // 3. Servicios
    console.log('🛠️ Copiando Servicios...');
    const servicios = await prismaRailway.servicio.findMany();
    for (const srv of servicios) {
      await prismaSupabase.servicio.upsert({
        where: { id: srv.id },
        update: {},
        create: srv
      });
    }
    console.log(`✅ ${servicios.length} servicios copiados\n`);

    // 4. Administradores
    console.log('👨‍💼 Copiando Administradores...');
    const admins = await prismaRailway.administrador.findMany();
    for (const admin of admins) {
      await prismaSupabase.administrador.upsert({
        where: { id: admin.id },
        update: {},
        create: admin
      });
    }
    console.log(`✅ ${admins.length} administradores copiados\n`);

    // 5. Usuarios
    console.log('👥 Copiando Usuarios...');
    const usuarios = await prismaRailway.usuario.findMany();
    for (const user of usuarios) {
      await prismaSupabase.usuario.upsert({
        where: { id: user.id },
        update: {},
        create: user
      });
    }
    console.log(`✅ ${usuarios.length} usuarios copiados\n`);

    // 6. Domicilios
    console.log('🏠 Copiando Domicilios...');
    const domicilios = await prismaRailway.domicilio.findMany();
    for (const dom of domicilios) {
      await prismaSupabase.domicilio.upsert({
        where: { id: dom.id },
        update: {},
        create: dom
      });
    }
    console.log(`✅ ${domicilios.length} domicilios copiados\n`);

    // 7. Complejos
    console.log('🏟️ Copiando Complejos...');
    const complejos = await prismaRailway.complejo.findMany();
    for (const comp of complejos) {
      await prismaSupabase.complejo.upsert({
        where: { id: comp.id },
        update: {},
        create: comp
      });
    }
    console.log(`✅ ${complejos.length} complejos copiados\n`);

    // 8. Canchas
    console.log('🥅 Copiando Canchas...');
    const canchas = await prismaRailway.cancha.findMany();
    for (const cancha of canchas) {
      await prismaSupabase.cancha.upsert({
        where: { id: cancha.id },
        update: {},
        create: cancha
      });
    }
    console.log(`✅ ${canchas.length} canchas copiadas\n`);

    // 9. ComplejoServicio
    console.log('🔗 Copiando ComplejoServicio...');
    const complejoServicios = await prismaRailway.complejoServicio.findMany();
    for (const cs of complejoServicios) {
      await prismaSupabase.complejoServicio.upsert({
        where: { id: cs.id },
        update: {},
        create: cs
      });
    }
    console.log(`✅ ${complejoServicios.length} relaciones complejo-servicio copiadas\n`);

    // 10. HorarioCronograma
    console.log('📅 Copiando HorarioCronograma...');
    const cronogramas = await prismaRailway.horarioCronograma.findMany();
    for (const crono of cronogramas) {
      await prismaSupabase.horarioCronograma.upsert({
        where: { id: crono.id },
        update: {},
        create: crono
      });
    }
    console.log(`✅ ${cronogramas.length} cronogramas copiados\n`);

    // 11. HorarioDeshabilitado
    console.log('🚫 Copiando HorarioDeshabilitado...');
    const horariosDeshabilitados = await prismaRailway.horarioDeshabilitado.findMany();
    for (const hd of horariosDeshabilitados) {
      await prismaSupabase.horarioDeshabilitado.upsert({
        where: { id: hd.id },
        update: {},
        create: hd
      });
    }
    console.log(`✅ ${horariosDeshabilitados.length} horarios deshabilitados copiados\n`);

    // 12. Alquileres
    console.log('📝 Copiando Alquileres...');
    const alquileres = await prismaRailway.alquiler.findMany();
    for (const alq of alquileres) {
      await prismaSupabase.alquiler.upsert({
        where: { id: alq.id },
        update: {},
        create: alq
      });
    }
    console.log(`✅ ${alquileres.length} alquileres copiados\n`);

    // 13. Turnos
    console.log('🕐 Copiando Turnos...');
    const turnos = await prismaRailway.turno.findMany();
    for (const turno of turnos) {
      await prismaSupabase.turno.upsert({
        where: { id: turno.id },
        update: {},
        create: turno
      });
    }
    console.log(`✅ ${turnos.length} turnos copiados\n`);

    // 14. Pagos
    console.log('💳 Copiando Pagos...');
    const pagos = await prismaRailway.pago.findMany();
    for (const pago of pagos) {
      await prismaSupabase.pago.upsert({
        where: { id: pago.id },
        update: {},
        create: pago
      });
    }
    console.log(`✅ ${pagos.length} pagos copiados\n`);

    // 15. Reseñas
    console.log('⭐ Copiando Reseñas...');
    const resenias = await prismaRailway.resenia.findMany();
    for (const res of resenias) {
      await prismaSupabase.resenia.upsert({
        where: { id: res.id },
        update: {},
        create: res
      });
    }
    console.log(`✅ ${resenias.length} reseñas copiadas\n`);

    console.log('🎉 ¡Copia completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${localidades.length} localidades`);
    console.log(`   - ${deportes.length} deportes`);
    console.log(`   - ${servicios.length} servicios`);
    console.log(`   - ${admins.length} administradores`);
    console.log(`   - ${usuarios.length} usuarios`);
    console.log(`   - ${complejos.length} complejos`);
    console.log(`   - ${canchas.length} canchas`);
    console.log(`   - ${alquileres.length} alquileres`);
    console.log(`   - ${turnos.length} turnos`);
    console.log(`   - ${pagos.length} pagos`);
    console.log(`   - ${resenias.length} reseñas`);

  } catch (error) {
    console.error('❌ Error durante la copia:', error);
    throw error;
  } finally {
    await prismaRailway.$disconnect();
    await prismaSupabase.$disconnect();
  }
}

// Ejecutar
copiarDatos()
  .then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
