import { PrismaClient, EstadoComplejo } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const solicitudesData = [
  {
    nombre: "Centro Deportivo San Martín",
    descripcion: "Moderno complejo deportivo con canchas de fútbol 5 y 11, completamente iluminadas para jugar de noche. Cuenta con vestuarios, estacionamiento y buffet.",
    cuit: "20-33445566-7",
    usuario: {
      nombre: "Roberto",
      apellido: "González",
      dni: "33445566",
      email: "roberto.gonzalez@email.com",
      telefono: "221-4567890"
    },
    domicilio: {
      calle: "Av. San Martín",
      altura: 2345,
      localidad: "La Plata"
    },
    canchas: [
      { deporte: "Fútbol 5", descripcion: "Cancha de césped sintético premium", precioHora: 8000 },
      { deporte: "Fútbol 11", descripcion: "Cancha reglamentaria con iluminación LED", precioHora: 15000 }
    ],
    imagen: "futbol5_1.jpg"
  },
  {
    nombre: "Sportivo Belgrano",
    descripcion: "Club deportivo tradicional con excelentes instalaciones. Canchas de paddle, tenis y básquet. Ideal para eventos deportivos y torneos.",
    cuit: "20-44556677-8",
    usuario: {
      nombre: "María",
      apellido: "Fernández",
      dni: "44556677",
      email: "maria.fernandez@email.com",
      telefono: "221-5678901"
    },
    domicilio: {
      calle: "Calle 50",
      altura: 1234,
      localidad: "La Plata"
    },
    canchas: [
      { deporte: "Paddle", descripcion: "Cancha techada con piso profesional", precioHora: 5000 },
      { deporte: "Tenis", descripcion: "Cancha de polvo de ladrillo", precioHora: 4000 },
      { deporte: "Básquet", descripcion: "Cancha cubierta climatizada", precioHora: 7000 }
    ],
    imagen: "padel_5.jpg"
  },
  {
    nombre: "Complejo Atlético Norte",
    descripcion: "Complejo de última generación ubicado en zona norte. Canchas sintéticas de primer nivel, amplios vestuarios, quinchos para eventos y seguridad las 24hs.",
    cuit: "20-55667788-9",
    usuario: {
      nombre: "Carlos",
      apellido: "Martínez",
      dni: "55667788",
      email: "carlos.martinez@email.com",
      telefono: "221-6789012"
    },
    domicilio: {
      calle: "Av. 32",
      altura: 567,
      localidad: "La Plata"
    },
    canchas: [
      { deporte: "Fútbol 5", descripcion: "Césped sintético última generación", precioHora: 9000 },
      { deporte: "Fútbol 5", descripcion: "Cancha techada", precioHora: 10000 }
    ],
    imagen: "futbol5_2.jpg"
  },
  {
    nombre: "Arena Sport Center",
    descripcion: "Centro deportivo con múltiples disciplinas. Especializados en deportes de raqueta con canchas profesionales de paddle y tenis.",
    cuit: "20-66778899-0",
    usuario: {
      nombre: "Laura",
      apellido: "Rodríguez",
      dni: "66778899",
      email: "laura.rodriguez@email.com",
      telefono: "221-7890123"
    },
    domicilio: {
      calle: "Diagonal 74",
      altura: 890,
      localidad: "La Plata"
    },
    canchas: [
      { deporte: "Paddle", descripcion: "Cancha panorámica con iluminación LED", precioHora: 6000 },
      { deporte: "Paddle", descripcion: "Cancha techada premium", precioHora: 7000 },
      { deporte: "Tenis", descripcion: "Cancha reglamentaria", precioHora: 5000 }
    ],
    imagen: "tenis_6.jpg"
  },
  {
    nombre: "Deportivo Los Hornos",
    descripcion: "Complejo familiar con ambiente cálido. Canchas de fútbol y básquet, buffet, parrillas y espacios verdes para disfrutar en familia.",
    cuit: "20-77889900-1",
    usuario: {
      nombre: "Diego",
      apellido: "López",
      dni: "77889900",
      email: "diego.lopez@email.com",
      telefono: "221-8901234"
    },
    domicilio: {
      calle: "Calle 66",
      altura: 1567,
      localidad: "La Plata"
    },
    canchas: [
      { deporte: "Fútbol 5", descripcion: "Cancha al aire libre", precioHora: 6000 },
      { deporte: "Básquet", descripcion: "Cancha techada", precioHora: 6500 }
    ],
    imagen: "basquet_4.jpg"
  },
  {
    nombre: "City Sports Complex",
    descripcion: "Moderno complejo en el centro de la ciudad. Canchas de última generación con tecnología de reserva online. Bar deportivo y wifi gratuito.",
    cuit: "20-88990011-2",
    usuario: {
      nombre: "Valentina",
      apellido: "Sánchez",
      dni: "88990011",
      email: "valentina.sanchez@email.com",
      telefono: "221-9012345"
    },
    domicilio: {
      calle: "Av. 7",
      altura: 678,
      localidad: "La Plata"
    },
    canchas: [
      { deporte: "Fútbol 5", descripcion: "Cancha techada climatizada", precioHora: 11000 },
      { deporte: "Paddle", descripcion: "Cancha indoor de cristal", precioHora: 8000 },
      { deporte: "Fútbol 11", descripcion: "Cancha sintética iluminada", precioHora: 18000 }
    ],
    imagen: "futbol5_3.jpg"
  }
];

async function main() {
  console.log('🗑️  Eliminando solicitudes existentes...');
  
  // Primero eliminar todos los complejos pendientes y sus relaciones
  const complejosPendientes = await prisma.complejo.findMany({
    where: { estado: EstadoComplejo.PENDIENTE },
    include: {
      canchas: {
        include: {
          cronograma: true,
          turnos: true,
          horariosDeshabilitados: true
        }
      },
      domicilio: true,
      usuario: true
    }
  });

  for (const complejo of complejosPendientes) {
    // Eliminar relaciones de canchas
    for (const cancha of complejo.canchas) {
      await prisma.horarioCronograma.deleteMany({ where: { canchaId: cancha.id } });
      await prisma.horarioDeshabilitado.deleteMany({ where: { canchaId: cancha.id } });
      await prisma.turno.deleteMany({ where: { canchaId: cancha.id } });
    }
    
    // Eliminar canchas
    await prisma.cancha.deleteMany({ where: { complejoId: complejo.id } });
    
    // Eliminar servicios
    await prisma.complejoServicio.deleteMany({ where: { complejoId: complejo.id } });
    
    // Eliminar complejo
    await prisma.complejo.delete({ where: { id: complejo.id } });
    
    // Eliminar domicilio
    if (complejo.domicilio) {
      await prisma.domicilio.delete({ where: { id: complejo.domicilio.id } });
    }
    
    // Eliminar usuario
    if (complejo.usuario) {
      await prisma.usuario.delete({ where: { id: complejo.usuario.id } });
    }
  }

  console.log('✅ Solicitudes antiguas eliminadas');
  console.log('📝 Creando nuevas solicitudes...\n');

  for (const solicitud of solicitudesData) {
    try {
      // Buscar localidad
      const localidad = await prisma.localidad.findFirst({
        where: { nombre: solicitud.domicilio.localidad }
      });

      if (!localidad) {
        console.log(`❌ Localidad "${solicitud.domicilio.localidad}" no encontrada`);
        continue;
      }

      // Crear usuario
      const hashedPassword = await bcrypt.hash('password123', 10);
      const usuario = await prisma.usuario.create({
        data: {
          nombre: solicitud.usuario.nombre,
          apellido: solicitud.usuario.apellido,
          dni: solicitud.usuario.dni,
          email: solicitud.usuario.email,
          password: hashedPassword,
          telefono: solicitud.usuario.telefono,
          rol: 'DUENIO'
        }
      });

      // Crear domicilio
      const domicilio = await prisma.domicilio.create({
        data: {
          calle: solicitud.domicilio.calle,
          altura: solicitud.domicilio.altura,
          localidadId: localidad.id
        }
      });

      // Crear complejo
      const complejo = await prisma.complejo.create({
        data: {
          nombre: solicitud.nombre,
          descripcion: solicitud.descripcion,
          cuit: solicitud.cuit,
          image: solicitud.imagen,
          estado: EstadoComplejo.PENDIENTE,
          usuarioId: usuario.id,
          domicilioId: domicilio.id
        }
      });

      // Crear canchas
      for (const canchaData of solicitud.canchas) {
        const deporte = await prisma.deporte.findFirst({
          where: { nombre: canchaData.deporte }
        });

        if (deporte) {
          await prisma.cancha.create({
            data: {
              descripcion: canchaData.descripcion,
              precioHora: canchaData.precioHora,
              image: [`${solicitud.imagen}`],
              complejoId: complejo.id,
              deporteId: deporte.id,
              activa: true
            }
          });
        }
      }

      console.log(`✅ Solicitud creada: ${solicitud.nombre}`);
    } catch (error) {
      console.error(`❌ Error creando ${solicitud.nombre}:`, error);
    }
  }

  console.log('\n🎉 Proceso completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
