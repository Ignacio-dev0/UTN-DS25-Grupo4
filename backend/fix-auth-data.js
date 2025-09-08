const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function fixAuthAndData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== SOLUCIONANDO PROBLEMAS DE AUTENTICACIÓN ===');
    
    // 1. Crear admin con contraseña hasheada
    const adminPassword = await bcrypt.hash('admin', 10);
    const admin = await prisma.administrador.upsert({
      where: { email: 'admin@admin.com' },
      update: { password: adminPassword },
      create: {
        email: 'admin@admin.com',
        password: adminPassword,
        rol: 'ADMINISTRADOR'
      }
    });
    console.log('✓ Admin creado/actualizado');

    // 2. Crear localidad base
    const localidad = await prisma.localidad.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        nombre: 'La Plata'
      }
    });
    console.log('✓ Localidad creada');

    // 3. Crear deporte base
    const deporte = await prisma.deporte.upsert({
      where: { nombre: 'Fútbol' },
      update: {},
      create: {
        nombre: 'Fútbol'
      }
    });
    console.log('✓ Deporte creado');

    // 4. Crear usuario dueño con contraseña hasheada
    const duenioPassword = await bcrypt.hash('owner123', 10);
    const duenio = await prisma.usuario.upsert({
      where: { correo: 'dueno@test.com' },
      update: { password: duenioPassword },
      create: {
        apellido: 'García',
        nombre: 'Juan',
        dni: '12345678',
        correo: 'dueno@test.com',
        password: duenioPassword,
        telefono: '221-123-4567',
        direccion: 'Av. Test 123',
        rol: 'DUENIO'
      }
    });
    console.log('✓ Dueño creado/actualizado');

    // 5. Crear solicitud aprobada
    const solicitud = await prisma.solicitud.upsert({
      where: { usuarioId: duenio.id },
      update: { estado: 'APROBADA' },
      create: {
        cuit: '20-12345678-9',
        estado: 'APROBADA',
        usuarioId: duenio.id,
        adminId: admin.id
      }
    });
    console.log('✓ Solicitud creada/actualizada');

    // 6. Crear domicilio
    const domicilio = await prisma.domicilio.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        calle: 'Av. Deportes',
        altura: 123,
        localidadId: localidad.id
      }
    });
    console.log('✓ Domicilio creado');

    // 7. Crear complejo
    const complejo = await prisma.complejo.upsert({
      where: { usuarioId: duenio.id },
      update: {},
      create: {
        nombre: 'Complejo Deportivo Test',
        descripcion: 'Un complejo de prueba',
        cuit: '20-12345678-9',
        domicilioId: domicilio.id,
        usuarioId: duenio.id,
        solicitudId: solicitud.id
      }
    });
    console.log('✓ Complejo creado');

    // 8. Crear cancha
    const cancha = await prisma.cancha.upsert({
      where: { nroCancha: 1 },
      update: {},
      create: {
        nroCancha: 1,
        descripcion: 'Cancha de fútbol 5',
        image: [],
        complejoId: complejo.id,
        deporteId: deporte.id
      }
    });
    console.log('✓ Cancha creada');

    // 9. Limpiar turnos y horarios existentes
    await prisma.turno.deleteMany({});
    await prisma.horarioCronograma.deleteMany({});
    console.log('✓ Datos antiguos limpiados');

    // 10. Crear horarios cronograma (horarios semanales)
    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    
    for (const dia of dias) {
      for (let hora = 8; hora <= 21; hora++) {
        const horaInicio = new Date();
        horaInicio.setHours(hora, 0, 0, 0);
        
        const horaFin = new Date();
        horaFin.setHours(hora + 1, 0, 0, 0);
        
        await prisma.horarioCronograma.create({
          data: {
            horaInicio: horaInicio,
            horaFin: horaFin,
            diaSemana: dia,
            canchaId: cancha.id
          }
        });
      }
    }
    console.log('✓ Horarios cronograma creados');

    // 11. Crear turnos específicos para calendario (próximos 7 días)
    const hoy = new Date();
    let turnosCreados = 0;
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fecha.setHours(0, 0, 0, 0); // Solo fecha sin hora
      
      for (let hora = 8; hora <= 21; hora++) {
        const horaInicio = new Date();
        horaInicio.setHours(hora, 0, 0, 0);
        
        await prisma.turno.create({
          data: {
            fecha: fecha,
            horaInicio: horaInicio,
            precio: 5000,
            reservado: false,
            canchaId: cancha.id
          }
        });
        turnosCreados++;
      }
    }
    console.log(`✓ ${turnosCreados} turnos específicos creados`);

    // 12. Crear usuario cliente de prueba
    const clientePassword = await bcrypt.hash('cliente123', 10);
    const cliente = await prisma.usuario.upsert({
      where: { correo: 'cliente@test.com' },
      update: { password: clientePassword },
      create: {
        apellido: 'Pérez',
        nombre: 'María',
        dni: '87654321',
        correo: 'cliente@test.com',
        password: clientePassword,
        telefono: '221-987-6543',
        rol: 'CLIENTE'
      }
    });
    console.log('✓ Cliente de prueba creado');

    // Verificaciones finales
    const horariosCount = await prisma.horarioCronograma.count();
    const turnosCount = await prisma.turno.count();
    const usuariosCount = await prisma.usuario.count();
    const adminsCount = await prisma.administrador.count();
    
    console.log('\n=== RESUMEN FINAL ===');
    console.log(`Administradores: ${adminsCount}`);
    console.log(`Usuarios: ${usuariosCount}`);
    console.log(`Horarios cronograma: ${horariosCount}`);
    console.log(`Turnos disponibles: ${turnosCount}`);
    console.log('\n=== CREDENCIALES DE PRUEBA ===');
    console.log('Admin: admin@admin.com / admin');
    console.log('Dueño: dueno@test.com / owner123');
    console.log('Cliente: cliente@test.com / cliente123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuthAndData();
