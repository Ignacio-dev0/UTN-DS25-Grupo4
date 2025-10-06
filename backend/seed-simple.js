const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simple...');

  try {
    // Limpiar base de datos
    console.log('🧹 Limpiando base de datos...');
    await prisma.complejoServicio.deleteMany();
    await prisma.pago.deleteMany();
    await prisma.resenia.deleteMany();
    await prisma.alquiler.deleteMany();
    await prisma.turno.deleteMany();
    await prisma.horarioCronograma.deleteMany();
    await prisma.cancha.deleteMany();
    await prisma.complejo.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.administrador.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.domicilio.deleteMany();
    await prisma.localidad.deleteMany();
    await prisma.deporte.deleteMany();
    await prisma.servicio.deleteMany();

    // 1. Crear localidades
    console.log('📍 Creando localidades...');
    const localidades = await prisma.localidad.createManyAndReturn({
      data: [
        { nombre: 'La Plata' },
        { nombre: 'City Bell' }, 
        { nombre: 'Gonnet' },
        { nombre: 'Ensenada' },
        { nombre: 'Los Hornos' },
        { nombre: 'Tolosa' },
        { nombre: 'Villa Elisa' },
        { nombre: 'Berisso' }
      ]
    });

    // 2. Crear deportes
    console.log('⚽ Creando deportes...');
    const deportes = await prisma.deporte.createManyAndReturn({
      data: [
        { nombre: 'Fútbol 5', icono: '⚽' },
        { nombre: 'Fútbol 11', icono: '🥅' },
        { nombre: 'Vóley', icono: '🏐' },
        { nombre: 'Básquet', icono: '🏀' },
        { nombre: 'Handball', icono: '🤾' },
        { nombre: 'Tenis', icono: '🎾' },
        { nombre: 'Paddle', icono: '🏓' },
        { nombre: 'Fútbol 7', icono: '⚽' }
      ]
    });

    // 3. Crear servicios
    console.log('🛠️ Creando servicios...');
    const servicios = await prisma.servicio.createManyAndReturn({
      data: [
        { nombre: 'Estacionamiento', descripcion: 'Estacionamiento gratuito', icono: '🚗' },
        { nombre: 'Vestuarios', descripcion: 'Vestuarios con duchas', icono: '🚿' },
        { nombre: 'Cantina', descripcion: 'Cantina con bebidas y snacks', icono: '🍔' },
        { nombre: 'Iluminación', descripcion: 'Iluminación artificial', icono: '💡' },
        { nombre: 'Césped sintético', descripcion: 'Césped sintético de calidad', icono: '🌱' },
        { nombre: 'Arquero', descripcion: 'Arcos profesionales', icono: '🥅' },
        { nombre: 'Seguridad', descripcion: 'Personal de seguridad', icono: '🛡️' },
        { nombre: 'WiFi', descripcion: 'Internet gratuito', icono: '📶' }
      ]
    });

    // 4. Crear administrador
    console.log('👤 Creando administrador...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const administrador = await prisma.administrador.create({
      data: {
        email: 'admin@canchaya.com',
        password: adminPassword,
        rol: 'ADMINISTRADOR'
      }
    });

    // 5. Crear usuarios
    console.log('👥 Creando usuarios...');
    const usuarios = [];
    const userPassword = await bcrypt.hash('user123', 10);
    
    for (let i = 1; i <= 8; i++) {
      const usuario = await prisma.usuario.create({
        data: {
          nombre: `Usuario${i}`,
          apellido: `Apellido${i}`,
          dni: `1234567${i}`,
          correo: `usuario${i}@email.com`,
          password: userPassword,
          telefono: `221-123-456${i}`,
          rol: i <= 4 ? 'CLIENTE' : 'DUENIO',
          direccion: `Dirección ${i}`
        }
      });
      usuarios.push(usuario);
    }

    // 6. Crear domicilios
    console.log('🏠 Creando domicilios...');
    const domicilios = [];
    for (let i = 0; i < 8; i++) {
      const domicilio = await prisma.domicilio.create({
        data: {
          calle: `Calle ${i + 1}`,
          altura: (i + 1) * 100,
          localidadId: localidades[i].id
        }
      });
      domicilios.push(domicilio);
    }

    // 7. Crear solicitudes
    console.log('📋 Creando solicitudes...');
    const solicitudes = [];
    for (let i = 0; i < 4; i++) {
      const solicitud = await prisma.solicitud.create({
        data: {
          cuit: `20-1234567${i}-9`,
          estado: 'APROBADA',
          usuarioId: usuarios[i + 4].id, // Dueños
          adminId: administrador.id
        }
      });
      solicitudes.push(solicitud);
    }

    // 8. Crear complejos
    console.log('🏢 Creando complejos...');
    const complejos = [];
    for (let i = 0; i < 4; i++) {
      const complejo = await prisma.complejo.create({
        data: {
          nombre: `Complejo ${i + 1}`,
          descripcion: `Descripción del complejo ${i + 1}`,
          puntaje: 4.5,
          cuit: `20-1234567${i}-9`,
          domicilioId: domicilios[i].id,
          usuarioId: usuarios[i + 4].id,
          solicitudId: solicitudes[i].id
        }
      });
      complejos.push(complejo);
    }

    // 9. Crear canchas
    console.log('⚽ Creando canchas...');
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 2; j++) {
        await prisma.cancha.create({
          data: {
            nroCancha: j,
            descripcion: `Cancha ${j} del Complejo ${i + 1}`,
            puntaje: 4.0,
            image: [`cancha${i + 1}_${j}_1.jpg`, `cancha${i + 1}_${j}_2.jpg`],
            precioHora: 1500 + (i * 500),
            complejoId: complejos[i].id,
            deporteId: deportes[i].id
          }
        });
      }
    }

    // 10. Crear horarios
    console.log('⏰ Creando horarios...');
    const canchas = await prisma.cancha.findMany();
    for (const cancha of canchas) {
      await prisma.horarioCronograma.createMany({
        data: [
          {
            horaInicio: new Date('2024-01-01T09:00:00'),
            horaFin: new Date('2024-01-01T10:00:00'),
            diaSemana: 'LUNES',
            canchaId: cancha.id,
            precio: cancha.precioHora
          },
          {
            horaInicio: new Date('2024-01-01T10:00:00'),
            horaFin: new Date('2024-01-01T11:00:00'),
            diaSemana: 'LUNES',
            canchaId: cancha.id,
            precio: cancha.precioHora
          }
        ]
      });
    }

    console.log('✅ Seed completado exitosamente!');
    console.log(`📊 Datos creados:`);
    console.log(`- ${localidades.length} localidades`);
    console.log(`- ${deportes.length} deportes`);
    console.log(`- ${servicios.length} servicios`);
    console.log(`- 1 administrador`);
    console.log(`- ${usuarios.length} usuarios`);
    console.log(`- ${complejos.length} complejos`);
    console.log(`- ${canchas.length} canchas`);

  } catch (error) {
    console.error('❌ Error en el seed:', error);
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
