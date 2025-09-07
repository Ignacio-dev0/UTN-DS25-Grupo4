// // backend/prisma/seed.ts
// import { PrismaClient, DiaSemana, Rol, EstadoSolicitud, EstadoAlquiler, MetodoPago, Turno } from '../src/generated/prisma/client';
// import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Iniciando seed de la base de datos...');

//   try {
//     // Limpiar base de datos en orden correcto (solo si las tablas existen)
//     console.log('🧹 Limpiando base de datos...');
//     try {
//       await prisma.pago.deleteMany();
//       await prisma.resenia.deleteMany();
//       await prisma.alquiler.deleteMany();
//       await prisma.turno.deleteMany();
//       await prisma.horarioCronograma.deleteMany();
//       await prisma.cancha.deleteMany();
//       await prisma.complejo.deleteMany();
//       await prisma.solicitud.deleteMany();
//       await prisma.administrador.deleteMany();
//       await prisma.usuario.deleteMany();
//       await prisma.domicilio.deleteMany();
//       await prisma.localidad.deleteMany();
//       await prisma.deporte.deleteMany();
//     } catch (cleanupError) {
//       console.log('⚠️  Base de datos ya está limpia o tablas no existen.');
//     }

//     // 1. Crear Localidades
//     console.log('📍 Creando localidades...');
//     const localidades = await Promise.all([
//       prisma.localidad.create({ data: { nombre: 'La Plata' } }),
//       prisma.localidad.create({ data: { nombre: 'City Bell' } }),
//       prisma.localidad.create({ data: { nombre: 'Gonnet' } }),
//       prisma.localidad.create({ data: { nombre: 'Ensenada' } }),
//       prisma.localidad.create({ data: { nombre: 'Los Hornos' } }),
//     ]);

//     const localidadMap = new Map(localidades.map(l => [l.nombre, l.id]));

//     // 2. Crear Deportes
//     console.log('⚽ Creando deportes...');
//     const deportes = await Promise.all([
//       prisma.deporte.create({ data: { nombre: 'Fútbol 5' } }),
//       prisma.deporte.create({ data: { nombre: 'Fútbol 11' } }),
//       prisma.deporte.create({ data: { nombre: 'Vóley' } }),
//       prisma.deporte.create({ data: { nombre: 'Básquet' } }),
//       prisma.deporte.create({ data: { nombre: 'Handball' } }),
//       prisma.deporte.create({ data: { nombre: 'Tenis' } }),
//       prisma.deporte.create({ data: { nombre: 'Pádel' } }),
//       prisma.deporte.create({ data: { nombre: 'Hockey' } }),
//     ]);

//     const deporteMap = new Map(deportes.map(d => [d.nombre, d.id]));

//     // 3. Crear Administrador
//     console.log('👤 Creando administrador...');
//     const hashedAdminPassword = await bcrypt.hash('admin123', 10);
//     const admin = await prisma.administrador.create({
//       data: {
//         correo: 'admin@sistema.com',
//         password: hashedAdminPassword,
//       }
//     });

//     // 4. Crear Usuarios (Clientes y Dueños)
//     console.log('👥 Creando usuarios...');
//     const hashedPassword = await bcrypt.hash('password123', 10);
    
//     // Usuario cliente de prueba
//     const cliente = await prisma.usuario.create({
//       data: {
//         nombre: 'Nacho',
//         apellido: 'Benitez',
//         dni: 40123456,
//         correo: 'nacho.benitez@email.com',
//         password: hashedPassword,
//         telefono: '221-5555555',
//         rol: Rol.CLIENTE,
//       }
//     });

//     // Usuarios dueños de complejos - Expandido para más complejos
//     const duenios = await Promise.all([
//       // Grupo 1 - Originales
//       prisma.usuario.create({
//         data: {
//           nombre: 'Juan',
//           apellido: 'Pérez',
//           dni: 30123456,
//           correo: 'juan.perez@email.com',
//           password: hashedPassword,
//           telefono: '221-6666666',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'María',
//           apellido: 'González',
//           dni: 31123456,
//           correo: 'maria.gonzalez@email.com',
//           password: hashedPassword,
//           telefono: '221-7777777',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Carlos',
//           apellido: 'Rodríguez',
//           dni: 32123456,
//           correo: 'carlos.rodriguez@email.com',
//           password: hashedPassword,
//           telefono: '221-8888888',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Ana',
//           apellido: 'Martínez',
//           dni: 33123456,
//           correo: 'ana.martinez@email.com',
//           password: hashedPassword,
//           telefono: '221-9999999',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Luis',
//           apellido: 'Fernández',
//           dni: 34123456,
//           correo: 'luis.fernandez@email.com',
//           password: hashedPassword,
//           telefono: '221-1111111',
//           rol: Rol.DUENIO,
//         }
//       }),
//       // Grupo 2 - Expansión
//       prisma.usuario.create({
//         data: {
//           nombre: 'Carmen',
//           apellido: 'López',
//           dni: 35123456,
//           correo: 'carmen.lopez@email.com',
//           password: hashedPassword,
//           telefono: '221-2222222',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Roberto',
//           apellido: 'Silva',
//           dni: 36123456,
//           correo: 'roberto.silva@email.com',
//           password: hashedPassword,
//           telefono: '221-3333333',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Elena',
//           apellido: 'Torres',
//           dni: 37123456,
//           correo: 'elena.torres@email.com',
//           password: hashedPassword,
//           telefono: '221-4444444',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Diego',
//           apellido: 'Morales',
//           dni: 38123456,
//           correo: 'diego.morales@email.com',
//           password: hashedPassword,
//           telefono: '221-5555555',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Patricia',
//           apellido: 'Herrera',
//           dni: 39123456,
//           correo: 'patricia.herrera@email.com',
//           password: hashedPassword,
//           telefono: '221-6666666',
//           rol: Rol.DUENIO,
//         }
//       }),
//       // Grupo 3 - Más dueños para más complejos
//       prisma.usuario.create({
//         data: {
//           nombre: 'Miguel',
//           apellido: 'Ramírez',
//           dni: 40123457,
//           correo: 'miguel.ramirez@email.com',
//           password: hashedPassword,
//           telefono: '221-7777777',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Sofía',
//           apellido: 'Vargas',
//           dni: 41123457,
//           correo: 'sofia.vargas@email.com',
//           password: hashedPassword,
//           telefono: '221-8888888',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Alejandro',
//           apellido: 'Mendoza',
//           dni: 42123457,
//           correo: 'alejandro.mendoza@email.com',
//           password: hashedPassword,
//           telefono: '221-9999999',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Valeria',
//           apellido: 'Castro',
//           dni: 43123457,
//           correo: 'valeria.castro@email.com',
//           password: hashedPassword,
//           telefono: '221-1010101',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Ricardo',
//           apellido: 'Flores',
//           dni: 44123457,
//           correo: 'ricardo.flores@email.com',
//           password: hashedPassword,
//           telefono: '221-1111112',
//           rol: Rol.DUENIO,
//         }
//       }),
//       // Grupo 4 - Aún más dueños
//       prisma.usuario.create({
//         data: {
//           nombre: 'Claudia',
//           apellido: 'Jiménez',
//           dni: 45123457,
//           correo: 'claudia.jimenez@email.com',
//           password: hashedPassword,
//           telefono: '221-1212121',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Fernando',
//           apellido: 'Gutiérrez',
//           dni: 46123457,
//           correo: 'fernando.gutierrez@email.com',
//           password: hashedPassword,
//           telefono: '221-1313131',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Lucía',
//           apellido: 'Romero',
//           dni: 47123457,
//           correo: 'lucia.romero@email.com',
//           password: hashedPassword,
//           telefono: '221-1414141',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Andrés',
//           apellido: 'Moreno',
//           dni: 48123457,
//           correo: 'andres.moreno@email.com',
//           password: hashedPassword,
//           telefono: '221-1515151',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Natalia',
//           apellido: 'Ramos',
//           dni: 49123457,
//           correo: 'natalia.ramos@email.com',
//           password: hashedPassword,
//           telefono: '221-1616161',
//           rol: Rol.DUENIO,
//         }
//       }),
//       // Grupo 5 - Completar hasta 50 complejos
//       prisma.usuario.create({
//         data: {
//           nombre: 'Sebastián',
//           apellido: 'Ortega',
//           dni: 50123457,
//           correo: 'sebastian.ortega@email.com',
//           password: hashedPassword,
//           telefono: '221-1717171',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Gabriela',
//           apellido: 'Delgado',
//           dni: 51123457,
//           correo: 'gabriela.delgado@email.com',
//           password: hashedPassword,
//           telefono: '221-1818181',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Martín',
//           apellido: 'Aguilar',
//           dni: 52123457,
//           correo: 'martin.aguilar@email.com',
//           password: hashedPassword,
//           telefono: '221-1919191',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Camila',
//           apellido: 'Vega',
//           dni: 53123457,
//           correo: 'camila.vega@email.com',
//           password: hashedPassword,
//           telefono: '221-2020202',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Joaquín',
//           apellido: 'Cruz',
//           dni: 54123457,
//           correo: 'joaquin.cruz@email.com',
//           password: hashedPassword,
//           telefono: '221-2121212',
//           rol: Rol.DUENIO,
//         }
//       }),
//       // Más usuarios hasta completar una buena cantidad
//       prisma.usuario.create({
//         data: {
//           nombre: 'Isabella',
//           apellido: 'Paredes',
//           dni: 55123457,
//           correo: 'isabella.paredes@email.com',
//           password: hashedPassword,
//           telefono: '221-2222223',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Emilio',
//           apellido: 'Santana',
//           dni: 56123457,
//           correo: 'emilio.santana@email.com',
//           password: hashedPassword,
//           telefono: '221-2323232',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Valentina',
//           apellido: 'Navarro',
//           dni: 57123457,
//           correo: 'valentina.navarro@email.com',
//           password: hashedPassword,
//           telefono: '221-2424242',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Tomás',
//           apellido: 'Hernández',
//           dni: 58123457,
//           correo: 'tomas.hernandez@email.com',
//           password: hashedPassword,
//           telefono: '221-2525252',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Agustina',
//           apellido: 'Reyes',
//           dni: 59123457,
//           correo: 'agustina.reyes@email.com',
//           password: hashedPassword,
//           telefono: '221-2626262',
//           rol: Rol.DUENIO,
//         }
//       }),
//     ]);

//     // 5. Crear Complejos con sus solicitudes aprobadas
//     console.log('🏢 Creando complejos...');
    
//     const complejosData = [
//       // Originales
//       { nombre: 'Complejo El Potrero', ubicacion: 'La Plata', cuit: 30123456781, usuarioIdx: 0, calle: '13', altura: 456 },
//       { nombre: 'Fútbol City', ubicacion: 'City Bell', cuit: 30123456782, usuarioIdx: 1, calle: '14', altura: 2345 },
//       { nombre: 'La Redonda FC', ubicacion: 'Ensenada', cuit: 30123456783, usuarioIdx: 2, calle: 'Av. Bossinga', altura: 567 },
//       { nombre: 'Pase a la Red', ubicacion: 'La Plata', cuit: 30123456784, usuarioIdx: 3, calle: '50', altura: 1234 },
//       { nombre: 'Estación Fútbol', ubicacion: 'City Bell', cuit: 30123456785, usuarioIdx: 4, calle: '476', altura: 890 },
//       { nombre: 'Club San Luis', ubicacion: 'La Plata', cuit: 30123456788, usuarioIdx: 5, calle: '70', altura: 234 },
//       { nombre: 'Club Atenas', ubicacion: 'La Plata', cuit: 30123456780, usuarioIdx: 6, calle: '13', altura: 1259 },
//       { nombre: 'Club de Tenis La Plata', ubicacion: 'La Plata', cuit: 30123456786, usuarioIdx: 7, calle: '4', altura: 1700 },
//       { nombre: 'Crystal Padel', ubicacion: 'La Plata', cuit: 30123456787, usuarioIdx: 8, calle: '19', altura: 456 },
//       { nombre: 'Club Santa Bárbara', ubicacion: 'Gonnet', cuit: 30123456789, usuarioIdx: 9, calle: 'Camino Gral. Belgrano', altura: 3456 },
      
//       // Expansión - Más complejos para soportar 64+ canchas
//       { nombre: 'Arena Deportiva Central', ubicacion: 'La Plata', cuit: 30123456790, usuarioIdx: 10, calle: '7', altura: 890 },
//       { nombre: 'Sporting Club La Plata', ubicacion: 'La Plata', cuit: 30123456791, usuarioIdx: 11, calle: 'Diagonal 74', altura: 567 },
//       { nombre: 'Complejo Deportivo Meridiano', ubicacion: 'City Bell', cuit: 30123456792, usuarioIdx: 12, calle: '60', altura: 1200 },
//       { nombre: 'Centro Atlético Tolosa', ubicacion: 'Tolosa', cuit: 30123456793, usuarioIdx: 13, calle: 'Av. 1', altura: 526 },
//       { nombre: 'Polideportivo City Bell', ubicacion: 'City Bell', cuit: 30123456794, usuarioIdx: 14, calle: '11', altura: 460 },
//       { nombre: 'Club Deportivo Gonnet', ubicacion: 'Gonnet', cuit: 30123456795, usuarioIdx: 15, calle: 'Camino Centenario', altura: 489 },
//       { nombre: 'Arena Futsal Premium', ubicacion: 'La Plata', cuit: 30123456796, usuarioIdx: 16, calle: '13', altura: 666 },
//       { nombre: 'Complejo Deportivo Ringuelet', ubicacion: 'La Plata', cuit: 30123456797, usuarioIdx: 17, calle: '514', altura: 678 },
//       { nombre: 'Centro de Alto Rendimiento', ubicacion: 'La Plata', cuit: 30123456798, usuarioIdx: 18, calle: '122', altura: 600 },
//       { nombre: 'Sports Center Villa Elvira', ubicacion: 'Ensenada', cuit: 30123456799, usuarioIdx: 19, calle: '7', altura: 610 },
//       { nombre: 'Megadeportivo La Plata', ubicacion: 'La Plata', cuit: 30123456800, usuarioIdx: 20, calle: '25 de Mayo', altura: 2500 },
//       { nombre: 'Club Atlético Boca Unidos', ubicacion: 'La Plata', cuit: 30123456801, usuarioIdx: 21, calle: '115', altura: 490 },
//       { nombre: 'Deportivo San Carlos', ubicacion: 'La Plata', cuit: 30123456802, usuarioIdx: 22, calle: '137', altura: 440 },
//       { nombre: 'Arena Multideporte', ubicacion: 'La Plata', cuit: 30123456803, usuarioIdx: 23, calle: '20', altura: 470 },
//       { nombre: 'Complejo Olímpico', ubicacion: 'La Plata', cuit: 30123456804, usuarioIdx: 24, calle: '60', altura: 250 },
//       { nombre: 'Centro Deportivo Hipódromo', ubicacion: 'City Bell', cuit: 30123456805, usuarioIdx: 25, calle: '38', altura: 1200 },
//       { nombre: 'Polideportivo República de los Niños', ubicacion: 'Gonnet', cuit: 30123456806, usuarioIdx: 26, calle: 'Camino Gral. Belgrano', altura: 1200 },
//       { nombre: 'Club Deportivo Almagro', ubicacion: 'La Plata', cuit: 30123456807, usuarioIdx: 27, calle: '2', altura: 720 },
//       { nombre: 'Arena Sport Complex', ubicacion: 'La Plata', cuit: 30123456808, usuarioIdx: 28, calle: '13', altura: 320 },
//       { nombre: 'Complejo Deportivo El Trébol', ubicacion: 'La Plata', cuit: 30123456809, usuarioIdx: 29, calle: '64', altura: 170 },
//     ];

//     const complejos = await Promise.all(
//       complejosData.map(async (data) => {
//         // Crear domicilio
//         const domicilio = await prisma.domicilio.create({
//           data: {
//             calle: data.calle,
//             altura: data.altura,
//             localidadId: localidadMap.get(data.ubicacion) || localidades[0].id,
//           }
//         });

//         // Crear solicitud aprobada
//         const solicitud = await prisma.solicitud.create({
//           data: {
//             cuit: data.cuit,
//             estado: EstadoSolicitud.APROBADA,
//             usuarioId: duenios[data.usuarioIdx].id,
//             adminId: admin.id,
//           }
//         });

//         // Crear complejo
//         return prisma.complejo.create({
//           data: {
//             nombre: data.nombre,
//             descripcion: `${data.nombre} - Complejo deportivo de primera categoría`,
//             puntaje: 4.5 + Math.random() * 0.5,
//             domicilioId: domicilio.id,
//             usuarioId: duenios[data.usuarioIdx].id,
//             solicitudId: solicitud.id,
//           }
//         });
//       })
//     );

//     const complejoMap = new Map(complejos.map(c => [c.nombre, c.id]));

//     // 6. Crear Canchas
//     console.log('🏟️ Creando canchas...');
    
//     const canchasData = [
//       // Fútbol 5 - 16 canchas
//       { complejoNombre: 'Complejo El Potrero', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de última generación.', puntaje: 4.8 },
//       { complejoNombre: 'Fútbol City', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha de 5 techada con caucho de alta densidad.', puntaje: 4.7 },
//       { complejoNombre: 'La Redonda FC', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'No se suspende por lluvia. Excelente iluminación.', puntaje: 4.2 },
//       { complejoNombre: 'Pase a la Red', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Iluminación LED profesional.', puntaje: 4.6 },
//       { complejoNombre: 'Estación Fútbol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'La clásica de Estación. Siempre impecable.', puntaje: 4.9 },
//       { complejoNombre: 'Arena Deportiva Central', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha principal con tribunas.', puntaje: 4.8 },
//       { complejoNombre: 'Sporting Club La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético profesional.', puntaje: 4.5 },
//       { complejoNombre: 'Complejo Deportivo Meridiano', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha techada anti lluvia.', puntaje: 4.7 },
//       { complejoNombre: 'Arena Futsal Premium', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Piso de futsal profesional.', puntaje: 4.9 },
//       { complejoNombre: 'Megadeportivo La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Instalaciones de primer nivel.', puntaje: 5.0 },
//       { complejoNombre: 'Arena Multideporte', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha multiuso adaptable.', puntaje: 4.6 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Estándares olímpicos.', puntaje: 4.8 },
//       { complejoNombre: 'Arena Sport Complex', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Tecnología de última generación.', puntaje: 4.7 },
//       { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Ambiente familiar y acogedor.', puntaje: 4.4 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Entrenamiento de alto nivel.', puntaje: 4.9 },
//       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de calidad.', puntaje: 4.3 },

//       // Fútbol 11 - 12 canchas
//       { complejoNombre: 'Estación Fútbol', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural con medidas reglamentarias.', puntaje: 4.9 },
//       { complejoNombre: 'Club San Luis', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha de entrenamiento San Luis.', puntaje: 4.5 },
//       { complejoNombre: 'Megadeportivo La Plata', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo reglamentario FIFA.', puntaje: 5.0 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Estadio con capacidad 5000 personas.', puntaje: 4.8 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped híbrido profesional.', puntaje: 4.9 },
//       { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha histórica del club.', puntaje: 4.6 },
//       { complejoNombre: 'Deportivo San Carlos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo de entrenamiento principal.', puntaje: 4.4 },
//       { complejoNombre: 'Club Deportivo Almagro', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural tradicional.', puntaje: 4.5 },
//       { complejoNombre: 'Club Santa Bárbara', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo secundario del club.', puntaje: 4.3 },
//       { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo educativo y recreativo.', puntaje: 4.2 },
//       { complejoNombre: 'Centro Deportivo Hipódromo', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Ubicación privilegiada.', puntaje: 4.7 },
//       { complejoNombre: 'Complejo Deportivo Ringuelet', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo comunitario.', puntaje: 4.1 },

//       // Vóley - 8 canchas
//       { complejoNombre: 'Club Atenas', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso de parquet flotante profesional.', puntaje: 4.8 },
//       { complejoNombre: 'Polideportivo City Bell', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Cancha cubierta con gradas.', puntaje: 4.6 },
//       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso sintético de alta calidad.', puntaje: 4.7 },
//       { complejoNombre: 'Arena Multideporte', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha adaptable multi-deporte.', puntaje: 4.5 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Instalaciones olímpicas.', puntaje: 4.9 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Entrenamiento de selecciones.', puntaje: 5.0 },
//       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Ambiente familiar.', puntaje: 4.3 },
//       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha techada moderna.', puntaje: 4.4 },

//       // Básquet - 8 canchas
//       { complejoNombre: 'Club Atenas', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tablero reglamentario FIBA.', puntaje: 4.7 },
//       { complejoNombre: 'Polideportivo City Bell', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha principal del polideportivo.', puntaje: 4.8 },
//       { complejoNombre: 'Arena Multideporte', nroCancha: 3, deporteNombre: 'Básquet', descripcion: 'Piso de maple canadiense.', puntaje: 4.9 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Arena principal con 3000 butacas.', puntaje: 5.0 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Entrenamiento profesional.', puntaje: 4.9 },
//       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha histórica del club.', puntaje: 4.5 },
//       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Instalaciones renovadas.', puntaje: 4.6 },
//       { complejoNombre: 'Club Deportivo Almagro', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tradición en básquet.', puntaje: 4.4 },

//       // Handball - 6 canchas
//       { complejoNombre: 'Arena Multideporte', nroCancha: 4, deporteNombre: 'Handball', descripcion: 'Cancha reglamentaria IHF.', puntaje: 4.8 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Instalaciones de elite.', puntaje: 4.9 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Centro de entrenamiento nacional.', puntaje: 5.0 },
//       { complejoNombre: 'Polideportivo City Bell', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Piso antideslizante.', puntaje: 4.6 },
//       { complejoNombre: 'Club Atenas', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Tradición en handball.', puntaje: 4.5 },
//       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Cancha recién inaugurada.', puntaje: 4.7 },

//       // Tenis - 10 canchas
//       { complejoNombre: 'Club de Tenis La Plata', nroCancha: 1, deporteNombre: 'Tenis', descripcion: 'Polvo de ladrillo profesional.', puntaje: 4.9 },
//       { complejoNombre: 'Club de Tenis La Plata', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Excelente drenaje.', puntaje: 4.8 },
//       { complejoNombre: 'Club Santa Bárbara', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Cancha central con gradas.', puntaje: 4.7 },
//       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Superficie de césped sintético.', puntaje: 4.6 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Entrenamiento de tenistas profesionales.', puntaje: 5.0 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Superficie hard court.', puntaje: 4.8 },
//       { complejoNombre: 'Club San Luis', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Canchas tradicionales de arcilla.', puntaje: 4.5 },
//       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Canchas al aire libre.', puntaje: 4.3 },
//       { complejoNombre: 'Arena Sport Complex', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Tecnología de punta.', puntaje: 4.7 },
//       { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Ambiente tranquilo.', puntaje: 4.4 },

//       // Pádel - 12 canchas
//       { complejoNombre: 'Crystal Padel', nroCancha: 1, deporteNombre: 'Pádel', descripcion: 'Paredes de blindex.', puntaje: 4.9 },
//       { complejoNombre: 'Crystal Padel', nroCancha: 2, deporteNombre: 'Pádel', descripcion: 'Cancha central.', puntaje: 5.0 },
//       { complejoNombre: 'Club de Tenis La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas techadas.', puntaje: 4.8 },
//       { complejoNombre: 'Arena Sport Complex', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Cristales panorámicos.', puntaje: 4.7 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Instalaciones premium.', puntaje: 4.9 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Entrenamiento profesional.', puntaje: 4.8 },
//       { complejoNombre: 'Club Santa Bárbara', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Ambiente exclusivo.', puntaje: 4.6 },
//       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas al aire libre cubiertas.', puntaje: 4.4 },
//       { complejoNombre: 'Megadeportivo La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Complejo de pádel más grande.', puntaje: 4.7 },
//       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas familiares.', puntaje: 4.3 },
//       { complejoNombre: 'Arena Multideporte', nroCancha: 5, deporteNombre: 'Pádel', descripcion: 'Diseño moderno.', puntaje: 4.5 },
//       { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas económicas.', puntaje: 4.2 },

//       // Hockey - 8 canchas
//       { complejoNombre: 'Club San Luis', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Césped sintético de agua.', puntaje: 5.0 },
//       { complejoNombre: 'Club Santa Bárbara', nroCancha: 5, deporteNombre: 'Hockey', descripcion: 'Instalaciones de primer nivel.', puntaje: 4.9 },
//       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo reglamentario FIH.', puntaje: 5.0 },
//       { complejoNombre: 'Complejo Olímpico', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo principal con tribunas.', puntaje: 4.8 },
//       { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Tradición en hockey femenino.', puntaje: 4.6 },
//       { complejoNombre: 'Club Deportivo Almagro', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Campo histórico.', puntaje: 4.4 },
//       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 4, deporteNombre: 'Hockey', descripcion: 'Césped sintético nuevo.', puntaje: 4.7 },
//       { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Campo educativo.', puntaje: 4.2 },
//     ];

//     const canchas = await Promise.all(
//       canchasData.map(async (data, index) => {
//         const complejoId = complejoMap.get(data.complejoNombre);
//         const deporteId = deporteMap.get(data.deporteNombre);
        
//         if (!complejoId || !deporteId) {
//           console.error(`No se encontró complejo o deporte para: ${data.complejoNombre} - ${data.deporteNombre}`);
//           return null;
//         }

//         return prisma.cancha.create({
//           data: {
//             nroCancha: 1000 + index, // Número único para evitar conflictos
//             descripcion: data.descripcion,
//             puntaje: data.puntaje,
//             complejoId: complejoId,
//             deporteId: deporteId,
//             image: [`/images/canchas/${data.deporteNombre.toLowerCase().replace(' ', '')}-${index + 1}.jpg`],
//           }
//         });
//       })
//     );

//     const canchasCreadas = canchas.filter(c => c !== null);

//     // 7. Crear Horarios de Cronograma para cada cancha
//     console.log('📅 Creando horarios de cronograma...');
    
//     const diasSemana = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
    
//     for (const cancha of canchasCreadas) {
//       if (!cancha) continue;
      
//       // Crear horarios para cada día de la semana
//       for (const dia of diasSemana) {
//         // Horario matutino (si es fin de semana)
//         if (dia === DiaSemana.SABADO || dia === DiaSemana.DOMINGO) {
//           await prisma.horarioCronograma.create({
//             data: {
//               horaInicio: new Date('1970-01-01T10:00:00'),
//               horaFin: new Date('1970-01-01T12:00:00'),
//               diaSemana: dia,
//               canchaId: cancha.id,
//             }
//           });
//         }
        
//         // Horario tarde
//         await prisma.horarioCronograma.create({
//           data: {
//             horaInicio: new Date('1970-01-01T16:00:00'),
//             horaFin: new Date('1970-01-01T20:00:00'),
//             diaSemana: dia,
//             canchaId: cancha.id,
//           }
//         });
        
//         // Horario noche
//         await prisma.horarioCronograma.create({
//           data: {
//             horaInicio: new Date('1970-01-01T20:00:00'),
//             horaFin: new Date('1970-01-01T23:00:00'),
//             diaSemana: dia,
//             canchaId: cancha.id,
//           }
//         });
//       }
//     }

//     // 8. Crear Turnos para las próximas 2 semanas
//     console.log('🕐 Creando turnos...');
    
//     const hoy = new Date();
//     const turnos: Turno[] = [];
    
//     for (const cancha of canchasCreadas) {
//       if (!cancha) continue;
      
//       // Crear turnos para los próximos 14 días
//       for (let dia = 0; dia < 14; dia++) {
//         const fecha = new Date(hoy);
//         fecha.setDate(fecha.getDate() + dia);
        
//         // Crear turnos cada hora desde las 10:00 hasta las 22:00
//         for (let hora = 10; hora <= 22; hora++) {
//           const precio = 15000 + Math.random() * 20000; // Precio entre 15000 y 35000
//           const reservado = Math.random() > 0.6; // 40% de probabilidad de estar reservado
          
//           const turno = await prisma.turno.create({
//             data: {
//               fecha: fecha,
//               horaInicio: new Date(`1970-01-01T${hora.toString().padStart(2, '0')}:00:00`),
//               precio: Math.round(precio / 500) * 500, // Redondear a múltiplos de 500
//               reservado: reservado,
//               canchaId: cancha.id,
//             }
//           });
//           turnos.push(turno);
//         }
//       }
//     }

//     // 9. Crear algunas reservas/alquileres de ejemplo
//     console.log('📝 Creando alquileres de ejemplo...');
    
//     // Seleccionar algunos turnos reservados para crear alquileres
//     const turnosReservados = turnos.filter(t => t.reservado).slice(0, 5);
    
//     for (const turno of turnosReservados) {
//       const alquiler = await prisma.alquiler.create({
//         data: {
//           estado: EstadoAlquiler.PAGADO,
//           horaInicio: turno.horaInicio,
//           horaFin: new Date(`1970-01-01T${(parseInt(turno.horaInicio.toISOString().slice(11, 13)) + 1).toString().padStart(2, '0')}:00:00`),
//           clienteId: cliente.id,
//         }
//       });

//       // Actualizar el turno con el alquilerId
//       await prisma.turno.update({
//         where: { id: turno.id },
//         data: { alquilerId: alquiler.id }
//       });

//       // Crear pago para el alquiler
//       await prisma.pago.create({
//         data: {
//           codigoTransaccion: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//           metodoPago: MetodoPago.CREDITO,
//           monto: turno.precio,
//           alquilerId: alquiler.id,
//         }
//       });

//       // Crear reseña para algunos alquileres
//       if (Math.random() > 0.5) {
//         await prisma.resenia.create({
//           data: {
//             descripcion: 'Excelente cancha, muy bien mantenida. Volveremos!',
//             puntaje: 4 + Math.floor(Math.random() * 2), // Entre 4 y 5
//             alquilerId: alquiler.id,
//           }
//         });
//       }
//     }

//     // 10. Crear solicitudes pendientes
//     console.log('📋 Creando solicitudes pendientes...');
    
//     // Crear usuarios adicionales para solicitudes pendientes
//     const usuariosSolicitudesPendientes = await Promise.all([
//       prisma.usuario.create({
//         data: {
//           nombre: 'Fernando',
//           apellido: 'Castro',
//           dni: 50123456,
//           correo: 'fernando.castro@email.com',
//           password: hashedPassword,
//           telefono: '221-7777777',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Silvia',
//           apellido: 'Ruiz',
//           dni: 51123456,
//           correo: 'silvia.ruiz@email.com',
//           password: hashedPassword,
//           telefono: '221-8888888',
//           rol: Rol.DUENIO,
//         }
//       }),
//       prisma.usuario.create({
//         data: {
//           nombre: 'Gabriel',
//           apellido: 'Vega',
//           dni: 52123456,
//           correo: 'gabriel.vega@email.com',
//           password: hashedPassword,
//           telefono: '221-9999999',
//           rol: Rol.DUENIO,
//         }
//       }),
//     ]);
    
//     const solicitudesPendientesData = [
//       { nombre: 'Distrito Pádel Center', cuit: 30900000001, usuarioId: usuariosSolicitudesPendientes[0].id },
//       { nombre: 'El Muro Padel', cuit: 30900000002, usuarioId: usuariosSolicitudesPendientes[1].id },
//       { nombre: 'Club Hípico', cuit: 30900000003, usuarioId: usuariosSolicitudesPendientes[2].id },
//     ];

//     for (const data of solicitudesPendientesData) {
//       await prisma.solicitud.create({
//         data: {
//           cuit: data.cuit,
//           estado: EstadoSolicitud.PENDIENTE,
//           usuarioId: data.usuarioId,
//         }
//       });
//     }

//     console.log('✅ Seed completado exitosamente!');
//     console.log(`📊 Resumen:
//       - Localidades creadas: ${localidades.length}
//       - Deportes creados: ${deportes.length}
//       - Usuarios creados: ${duenios.length + usuariosSolicitudesPendientes.length + 1} (${duenios.length} dueños de complejos + ${usuariosSolicitudesPendientes.length} con solicitudes pendientes + 1 cliente)
//       - Complejos creados: ${complejos.length}
//       - Canchas creadas: ${canchasCreadas.length}
//       - Turnos creados: ${turnos.length}
//       - Alquileres creados: ${turnosReservados.length}
//     `);

//   } catch (error) {
//     console.error('❌ Error durante el seed:', error);
//     throw error;
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// import { PrismaClient, DiaSemana, Rol, EstadoSolicitud, EstadoAlquiler, MetodoPago, Usuario, Complejo, Cancha, Turno } from '../src/generated/prisma/client';
// import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Iniciando seed de la base de datos...');

//   try {
//     // Limpiar base de datos en orden correcto para evitar errores de constraints
//     console.log('🧹 Limpiando base de datos...');
//     await prisma.pago.deleteMany();
//     await prisma.resenia.deleteMany();
//     await prisma.alquiler.deleteMany();
//     await prisma.turno.deleteMany();
//     await prisma.horarioCronograma.deleteMany();
//     await prisma.cancha.deleteMany();
//     await prisma.complejo.deleteMany();
//     await prisma.solicitud.deleteMany();
//     await prisma.administrador.deleteMany();
//     await prisma.usuario.deleteMany();
//     await prisma.domicilio.deleteMany();
//     await prisma.localidad.deleteMany();
//     await prisma.deporte.deleteMany();
//     console.log('✅ Base de datos limpia.');


//     // 1. Crear Localidades
//     console.log('📍 Creando localidades...');
//     const localidadesData = [
//       { nombre: 'La Plata' }, { nombre: 'City Bell' }, { nombre: 'Gonnet' },
//       { nombre: 'Ensenada' }, { nombre: 'Los Hornos' }, { nombre: 'Tolosa' }
//     ];
//     const localidades = await prisma.localidad.createManyAndReturn({ data: localidadesData });
//     const localidadMap = new Map(localidades.map(l => [l.nombre, l.id]));

//     // 2. Crear Deportes
//     console.log('⚽ Creando deportes...');
//     const deportesData = [
//       { nombre: 'Fútbol 5' }, { nombre: 'Fútbol 11' }, { nombre: 'Vóley' },
//       { nombre: 'Básquet' }, { nombre: 'Handball' }, { nombre: 'Tenis' },
//       { nombre: 'Pádel' }, { nombre: 'Hockey' }
//     ];
//     const deportes = await prisma.deporte.createManyAndReturn({ data: deportesData });
//     const deporteMap = new Map(deportes.map(d => [d.nombre, d.id]));

//     // 3. Crear Administrador
//     console.log('👤 Creando administrador...');
//     const hashedAdminPassword = await bcrypt.hash('admin123', 10);
//     const admin = await prisma.administrador.create({
//       data: {
//         correo: 'admin@sistema.com',
//         password: hashedAdminPassword,
//       }
//     });

//     // 4. Crear Usuarios (Clientes y Dueños)
//     console.log('👥 Creando usuarios...');
//     const hashedPassword = await bcrypt.hash('password123', 10);
    
//     // Usuario cliente de prueba
//     const cliente = await prisma.usuario.create({
//       data: {
//         nombre: 'Nacho', apellido: 'Benitez', dni: 40123456, correo: 'nacho.benitez@email.com',
//         password: hashedPassword, telefono: '221-5555555', rol: Rol.CLIENTE,
//       }
//     });

//     // Datos de los dueños
//     const dueniosData = [
//         { nombre: 'Juan', apellido: 'Pérez', dni: 30123456, correo: 'juan.perez@email.com', telefono: '221-6666666' },
//         { nombre: 'María', apellido: 'González', dni: 31123456, correo: 'maria.gonzalez@email.com', telefono: '221-7777777' },
//         { nombre: 'Carlos', apellido: 'Rodríguez', dni: 32123456, correo: 'carlos.rodriguez@email.com', telefono: '221-8888888' },
//         { nombre: 'Ana', apellido: 'Martínez', dni: 33123456, correo: 'ana.martinez@email.com', telefono: '221-9999999' },
//         { nombre: 'Luis', apellido: 'Fernández', dni: 34123456, correo: 'luis.fernandez@email.com', telefono: '221-1111111' },
//         { nombre: 'Carmen', apellido: 'López', dni: 35123456, correo: 'carmen.lopez@email.com', telefono: '221-2222222' },
//         { nombre: 'Roberto', apellido: 'Silva', dni: 36123456, correo: 'roberto.silva@email.com', telefono: '221-3333333' },
//         { nombre: 'Elena', apellido: 'Torres', dni: 37123456, correo: 'elena.torres@email.com', telefono: '221-4444444' },
//         { nombre: 'Diego', apellido: 'Morales', dni: 38123456, correo: 'diego.morales@email.com', telefono: '221-5555555' },
//         { nombre: 'Patricia', apellido: 'Herrera', dni: 39123456, correo: 'patricia.herrera@email.com', telefono: '221-6666666' },
//         { nombre: 'Miguel', apellido: 'Ramírez', dni: 40123457, correo: 'miguel.ramirez@email.com', telefono: '221-7777777' },
//         { nombre: 'Sofía', apellido: 'Vargas', dni: 41123457, correo: 'sofia.vargas@email.com', telefono: '221-8888888' },
//         { nombre: 'Alejandro', apellido: 'Mendoza', dni: 42123457, correo: 'alejandro.mendoza@email.com', telefono: '221-9999999' },
//         { nombre: 'Valeria', apellido: 'Castro', dni: 43123457, correo: 'valeria.castro@email.com', telefono: '221-1010101' },
//         { nombre: 'Ricardo', apellido: 'Flores', dni: 44123457, correo: 'ricardo.flores@email.com', telefono: '221-1111112' },
//         { nombre: 'Claudia', apellido: 'Jiménez', dni: 45123457, correo: 'claudia.jimenez@email.com', telefono: '221-1212121' },
//         { nombre: 'Fernando', apellido: 'Gutiérrez', dni: 46123457, correo: 'fernando.gutierrez@email.com', telefono: '221-1313131' },
//         { nombre: 'Lucía', apellido: 'Romero', dni: 47123457, correo: 'lucia.romero@email.com', telefono: '221-1414141' },
//         { nombre: 'Andrés', apellido: 'Moreno', dni: 48123457, correo: 'andres.moreno@email.com', telefono: '221-1515151' },
//         { nombre: 'Natalia', apellido: 'Ramos', dni: 49123457, correo: 'natalia.ramos@email.com', telefono: '221-1616161' },
//         { nombre: 'Sebastián', apellido: 'Ortega', dni: 50123457, correo: 'sebastian.ortega@email.com', telefono: '221-1717171' },
//         { nombre: 'Gabriela', apellido: 'Delgado', dni: 51123457, correo: 'gabriela.delgado@email.com', telefono: '221-1818181' },
//         { nombre: 'Martín', apellido: 'Aguilar', dni: 52123457, correo: 'martin.aguilar@email.com', telefono: '221-1919191' },
//         { nombre: 'Camila', apellido: 'Vega', dni: 53123457, correo: 'camila.vega@email.com', telefono: '221-2020202' },
//         { nombre: 'Joaquín', apellido: 'Cruz', dni: 54123457, correo: 'joaquin.cruz@email.com', telefono: '221-2121212' },
//         { nombre: 'Isabella', apellido: 'Paredes', dni: 55123457, correo: 'isabella.paredes@email.com', telefono: '221-2222223' },
//         { nombre: 'Emilio', apellido: 'Santana', dni: 56123457, correo: 'emilio.santana@email.com', telefono: '221-2323232' },
//         { nombre: 'Valentina', apellido: 'Navarro', dni: 57123457, correo: 'valentina.navarro@email.com', telefono: '221-2424242' },
//         { nombre: 'Tomás', apellido: 'Hernández', dni: 58123457, correo: 'tomas.hernandez@email.com', telefono: '221-2525252' },
//         { nombre: 'Agustina', apellido: 'Reyes', dni: 59123457, correo: 'agustina.reyes@email.com', telefono: '221-2626262' },
//     ];
    
//     const duenios: Usuario[] = [];
//     // SOLUCIÓN: Usar un bucle 'for...of' en lugar de 'Promise.all' para evitar sobrecargar la base de datos.
//     for (const data of dueniosData) {
//       const duenio = await prisma.usuario.create({
//         data: {
//           ...data,
//           password: hashedPassword,
//           rol: Rol.DUENIO,
//         }
//       });
//       duenios.push(duenio);
//     }

//     // 5. Crear Complejos con sus solicitudes aprobadas
//     console.log('🏢 Creando complejos...');
//     const complejosData = [
//         // SOLUCIÓN: Se agrega 'n' al final de cada CUIT para que sea un BigInt
//         { nombre: 'Complejo El Potrero', ubicacion: 'La Plata', cuit: 30123456781n, usuarioIdx: 0, calle: '13', altura: 456 },
//         { nombre: 'Fútbol City', ubicacion: 'City Bell', cuit: 30123456782n, usuarioIdx: 1, calle: '14', altura: 2345 },
//         { nombre: 'La Redonda FC', ubicacion: 'Ensenada', cuit: 30123456783n, usuarioIdx: 2, calle: 'Av. Bossinga', altura: 567 },
//         { nombre: 'Pase a la Red', ubicacion: 'La Plata', cuit: 30123456784n, usuarioIdx: 3, calle: '50', altura: 1234 },
//         { nombre: 'Estación Fútbol', ubicacion: 'City Bell', cuit: 30123456785n, usuarioIdx: 4, calle: '476', altura: 890 },
//         { nombre: 'Club San Luis', ubicacion: 'La Plata', cuit: 30123456788n, usuarioIdx: 5, calle: '70', altura: 234 },
//         { nombre: 'Club Atenas', ubicacion: 'La Plata', cuit: 30123456780n, usuarioIdx: 6, calle: '13', altura: 1259 },
//         { nombre: 'Club de Tenis La Plata', ubicacion: 'La Plata', cuit: 30123456786n, usuarioIdx: 7, calle: '4', altura: 1700 },
//         { nombre: 'Crystal Padel', ubicacion: 'La Plata', cuit: 30123456787n, usuarioIdx: 8, calle: '19', altura: 456 },
//         { nombre: 'Club Santa Bárbara', ubicacion: 'Gonnet', cuit: 30123456789n, usuarioIdx: 9, calle: 'Camino Gral. Belgrano', altura: 3456 },
//         { nombre: 'Arena Deportiva Central', ubicacion: 'La Plata', cuit: 30123456790n, usuarioIdx: 10, calle: '7', altura: 890 },
//         { nombre: 'Sporting Club La Plata', ubicacion: 'La Plata', cuit: 30123456791n, usuarioIdx: 11, calle: 'Diagonal 74', altura: 567 },
//         { nombre: 'Complejo Deportivo Meridiano', ubicacion: 'City Bell', cuit: 30123456792n, usuarioIdx: 12, calle: '60', altura: 1200 },
//         { nombre: 'Centro Atlético Tolosa', ubicacion: 'Tolosa', cuit: 30123456793n, usuarioIdx: 13, calle: 'Av. 1', altura: 526 },
//         { nombre: 'Polideportivo City Bell', ubicacion: 'City Bell', cuit: 30123456794n, usuarioIdx: 14, calle: '11', altura: 460 },
//         { nombre: 'Club Deportivo Gonnet', ubicacion: 'Gonnet', cuit: 30123456795n, usuarioIdx: 15, calle: 'Camino Centenario', altura: 489 },
//         { nombre: 'Arena Futsal Premium', ubicacion: 'La Plata', cuit: 30123456796n, usuarioIdx: 16, calle: '13', altura: 666 },
//         { nombre: 'Complejo Deportivo Ringuelet', ubicacion: 'La Plata', cuit: 30123456797n, usuarioIdx: 17, calle: '514', altura: 678 },
//         { nombre: 'Centro de Alto Rendimiento', ubicacion: 'La Plata', cuit: 30123456798n, usuarioIdx: 18, calle: '122', altura: 600 },
//         { nombre: 'Sports Center Villa Elvira', ubicacion: 'Ensenada', cuit: 30123456799n, usuarioIdx: 19, calle: '7', altura: 610 },
//         { nombre: 'Megadeportivo La Plata', ubicacion: 'La Plata', cuit: 30123456800n, usuarioIdx: 20, calle: '25 de Mayo', altura: 2500 },
//         { nombre: 'Club Atlético Boca Unidos', ubicacion: 'La Plata', cuit: 30123456801n, usuarioIdx: 21, calle: '115', altura: 490 },
//         { nombre: 'Deportivo San Carlos', ubicacion: 'La Plata', cuit: 30123456802n, usuarioIdx: 22, calle: '137', altura: 440 },
//         { nombre: 'Arena Multideporte', ubicacion: 'La Plata', cuit: 30123456803n, usuarioIdx: 23, calle: '20', altura: 470 },
//         { nombre: 'Complejo Olímpico', ubicacion: 'La Plata', cuit: 30123456804n, usuarioIdx: 24, calle: '60', altura: 250 },
//         { nombre: 'Centro Deportivo Hipódromo', ubicacion: 'City Bell', cuit: 30123456805n, usuarioIdx: 25, calle: '38', altura: 1200 },
//         { nombre: 'Polideportivo República de los Niños', ubicacion: 'Gonnet', cuit: 30123456806n, usuarioIdx: 26, calle: 'Camino Gral. Belgrano', altura: 1200 },
//         { nombre: 'Club Deportivo Almagro', ubicacion: 'La Plata', cuit: 30123456807n, usuarioIdx: 27, calle: '2', altura: 720 },
//         { nombre: 'Arena Sport Complex', ubicacion: 'La Plata', cuit: 30123456808n, usuarioIdx: 28, calle: '13', altura: 320 },
//         { nombre: 'Complejo Deportivo El Trébol', ubicacion: 'La Plata', cuit: 30123456809n, usuarioIdx: 29, calle: '64', altura: 170 },
//     ];
    
//     const complejos: Complejo[] = [];
//     // SOLUCIÓN: Usar un bucle 'for...of' para crear complejos secuencialmente.
//     for (const data of complejosData) {
//       const domicilio = await prisma.domicilio.create({
//         data: {
//           calle: data.calle,
//           altura: data.altura,
//           localidadId: localidadMap.get(data.ubicacion) || localidades[0].id,
//         }
//       });

//       const solicitud = await prisma.solicitud.create({
//         data: {
//           cuit: data.cuit,
//           estado: EstadoSolicitud.APROBADA,
//           usuarioId: duenios[data.usuarioIdx].id,
//           adminId: admin.id,
//         }
//       });

//       const complejo = await prisma.complejo.create({
//         data: {
//           nombre: data.nombre,
//           descripcion: `${data.nombre} - Complejo deportivo de primera categoría`,
//           puntaje: 4.5 + Math.random() * 0.5,
//           domicilioId: domicilio.id,
//           usuarioId: duenios[data.usuarioIdx].id,
//           solicitudId: solicitud.id,
//         }
//       });
//       complejos.push(complejo);
//     }
//     const complejoMap = new Map(complejos.map(c => [c.nombre, c.id]));

//     // 6. Crear Canchas
//     console.log('🏟️ Creando canchas...');
//     const canchasData = [
//       // ... (la data de las canchas es muy larga, la omito por brevedad pero se mantiene igual)
//        { complejoNombre: 'Complejo El Potrero', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de última generación.', puntaje: 4.8 },
//        { complejoNombre: 'Fútbol City', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha de 5 techada con caucho de alta densidad.', puntaje: 4.7 },
//        { complejoNombre: 'La Redonda FC', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'No se suspende por lluvia. Excelente iluminación.', puntaje: 4.2 },
//        { complejoNombre: 'Pase a la Red', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Iluminación LED profesional.', puntaje: 4.6 },
//        { complejoNombre: 'Estación Fútbol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'La clásica de Estación. Siempre impecable.', puntaje: 4.9 },
//        { complejoNombre: 'Arena Deportiva Central', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha principal con tribunas.', puntaje: 4.8 },
//        { complejoNombre: 'Sporting Club La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético profesional.', puntaje: 4.5 },
//        { complejoNombre: 'Complejo Deportivo Meridiano', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha techada anti lluvia.', puntaje: 4.7 },
//        { complejoNombre: 'Arena Futsal Premium', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Piso de futsal profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Megadeportivo La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Instalaciones de primer nivel.', puntaje: 5.0 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha multiuso adaptable.', puntaje: 4.6 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Estándares olímpicos.', puntaje: 4.8 },
//        { complejoNombre: 'Arena Sport Complex', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Tecnología de última generación.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Ambiente familiar y acogedor.', puntaje: 4.4 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Entrenamiento de alto nivel.', puntaje: 4.9 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de calidad.', puntaje: 4.3 },
//        { complejoNombre: 'Estación Fútbol', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural con medidas reglamentarias.', puntaje: 4.9 },
//        { complejoNombre: 'Club San Luis', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha de entrenamiento San Luis.', puntaje: 4.5 },
//        { complejoNombre: 'Megadeportivo La Plata', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo reglamentario FIFA.', puntaje: 5.0 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Estadio con capacidad 5000 personas.', puntaje: 4.8 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped híbrido profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha histórica del club.', puntaje: 4.6 },
//        { complejoNombre: 'Deportivo San Carlos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo de entrenamiento principal.', puntaje: 4.4 },
//        { complejoNombre: 'Club Deportivo Almagro', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural tradicional.', puntaje: 4.5 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo secundario del club.', puntaje: 4.3 },
//        { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo educativo y recreativo.', puntaje: 4.2 },
//        { complejoNombre: 'Centro Deportivo Hipódromo', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Ubicación privilegiada.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Deportivo Ringuelet', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo comunitario.', puntaje: 4.1 },
//        { complejoNombre: 'Club Atenas', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso de parquet flotante profesional.', puntaje: 4.8 },
//        { complejoNombre: 'Polideportivo City Bell', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Cancha cubierta con gradas.', puntaje: 4.6 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso sintético de alta calidad.', puntaje: 4.7 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha adaptable multi-deporte.', puntaje: 4.5 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Instalaciones olímpicas.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Entrenamiento de selecciones.', puntaje: 5.0 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Ambiente familiar.', puntaje: 4.3 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha techada moderna.', puntaje: 4.4 },
//        { complejoNombre: 'Club Atenas', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tablero reglamentario FIBA.', puntaje: 4.7 },
//        { complejoNombre: 'Polideportivo City Bell', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha principal del polideportivo.', puntaje: 4.8 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 3, deporteNombre: 'Básquet', descripcion: 'Piso de maple canadiense.', puntaje: 4.9 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Arena principal con 3000 butacas.', puntaje: 5.0 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Entrenamiento profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha histórica del club.', puntaje: 4.5 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Instalaciones renovadas.', puntaje: 4.6 },
//        { complejoNombre: 'Club Deportivo Almagro', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tradición en básquet.', puntaje: 4.4 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 4, deporteNombre: 'Handball', descripcion: 'Cancha reglamentaria IHF.', puntaje: 4.8 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Instalaciones de elite.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Centro de entrenamiento nacional.', puntaje: 5.0 },
//        { complejoNombre: 'Polideportivo City Bell', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Piso antideslizante.', puntaje: 4.6 },
//        { complejoNombre: 'Club Atenas', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Tradición en handball.', puntaje: 4.5 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Cancha recién inaugurada.', puntaje: 4.7 },
//        { complejoNombre: 'Club de Tenis La Plata', nroCancha: 1, deporteNombre: 'Tenis', descripcion: 'Polvo de ladrillo profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Club de Tenis La Plata', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Excelente drenaje.', puntaje: 4.8 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Cancha central con gradas.', puntaje: 4.7 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Superficie de césped sintético.', puntaje: 4.6 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Entrenamiento de tenistas profesionales.', puntaje: 5.0 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Superficie hard court.', puntaje: 4.8 },
//        { complejoNombre: 'Club San Luis', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Canchas tradicionales de arcilla.', puntaje: 4.5 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Canchas al aire libre.', puntaje: 4.3 },
//        { complejoNombre: 'Arena Sport Complex', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Tecnología de punta.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Ambiente tranquilo.', puntaje: 4.4 },
//        { complejoNombre: 'Crystal Padel', nroCancha: 1, deporteNombre: 'Pádel', descripcion: 'Paredes de blindex.', puntaje: 4.9 },
//        { complejoNombre: 'Crystal Padel', nroCancha: 2, deporteNombre: 'Pádel', descripcion: 'Cancha central.', puntaje: 5.0 },
//        { complejoNombre: 'Club de Tenis La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas techadas.', puntaje: 4.8 },
//        { complejoNombre: 'Arena Sport Complex', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Cristales panorámicos.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Instalaciones premium.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Entrenamiento profesional.', puntaje: 4.8 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Ambiente exclusivo.', puntaje: 4.6 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas al aire libre cubiertas.', puntaje: 4.4 },
//        { complejoNombre: 'Megadeportivo La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Complejo de pádel más grande.', puntaje: 4.7 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas familiares.', puntaje: 4.3 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 5, deporteNombre: 'Pádel', descripcion: 'Diseño moderno.', puntaje: 4.5 },
//        { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas económicas.', puntaje: 4.2 },
//        { complejoNombre: 'Club San Luis', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Césped sintético de agua.', puntaje: 5.0 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 5, deporteNombre: 'Hockey', descripcion: 'Instalaciones de primer nivel.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo reglamentario FIH.', puntaje: 5.0 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo principal con tribunas.', puntaje: 4.8 },
//        { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Tradición en hockey femenino.', puntaje: 4.6 },
//        { complejoNombre: 'Club Deportivo Almagro', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Campo histórico.', puntaje: 4.4 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 4, deporteNombre: 'Hockey', descripcion: 'Césped sintético nuevo.', puntaje: 4.7 },
//        { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Campo educativo.', puntaje: 4.2 },
//     ];
    
//     const canchasCreadas: Cancha[] = [];
//     // SOLUCIÓN: Bucle secuencial para no sobrecargar la BD
//     for (let i = 0; i < canchasData.length; i++) {
//       const data = canchasData[i];
//       const complejoId = complejoMap.get(data.complejoNombre);
//       const deporteId = deporteMap.get(data.deporteNombre);
      
//       if (!complejoId || !deporteId) {
//         console.error(`No se encontró complejo o deporte para: ${data.complejoNombre} - ${data.deporteNombre}`);
//         continue;
//       }
      
//       const cancha = await prisma.cancha.create({
//         data: {
//           nroCancha: 1000 + i, // Número único para evitar conflictos
//           descripcion: data.descripcion,
//           puntaje: data.puntaje,
//           complejoId: complejoId,
//           deporteId: deporteId,
//           image: [`/images/canchas/${data.deporteNombre.toLowerCase().replace(' ', '')}-${i + 1}.jpg`],
//         }
//       });
//       canchasCreadas.push(cancha);
//     }

//     // El resto del script ya usa bucles secuenciales, lo cual es correcto.
//     // 7. Crear Horarios de Cronograma para cada cancha
//     console.log('📅 Creando horarios de cronograma...');
//     const diasSemana = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
//     for (const cancha of canchasCreadas) {
//       for (const dia of diasSemana) {
//         if (dia === DiaSemana.SABADO || dia === DiaSemana.DOMINGO) {
//           await prisma.horarioCronograma.create({
//             data: { horaInicio: new Date('1970-01-01T10:00:00Z'), horaFin: new Date('1970-01-01T12:00:00Z'), diaSemana: dia, canchaId: cancha.id }
//           });
//         }
//         await prisma.horarioCronograma.create({
//           data: { horaInicio: new Date('1970-01-01T16:00:00Z'), horaFin: new Date('1970-01-01T20:00:00Z'), diaSemana: dia, canchaId: cancha.id }
//         });
//         await prisma.horarioCronograma.create({
//           data: { horaInicio: new Date('1970-01-01T20:00:00Z'), horaFin: new Date('1970-01-01T23:00:00Z'), diaSemana: dia, canchaId: cancha.id }
//         });
//       }
//     }

//     // 8. Crear Turnos para las próximas 2 semanas
//     console.log('🕐 Creando turnos...');
//     const hoy = new Date();
//     const turnos: Turno[] = [];
//     for (const cancha of canchasCreadas) {
//       for (let dia = 0; dia < 14; dia++) {
//         const fecha = new Date(hoy);
//         fecha.setDate(fecha.getDate() + dia);
//         fecha.setUTCHours(0, 0, 0, 0); // Normalizar fecha a UTC medianoche
        
//         for (let hora = 10; hora <= 22; hora++) {
//           const precio = 15000 + Math.random() * 20000;
//           const reservado = Math.random() > 0.6;
          
//           const turno = await prisma.turno.create({
//             data: {
//               fecha: fecha,
//               horaInicio: new Date(`1970-01-01T${hora.toString().padStart(2, '0')}:00:00Z`),
//               precio: Math.round(precio / 500) * 500,
//               reservado: reservado,
//               canchaId: cancha.id,
//             }
//           });
//           turnos.push(turno);
//         }
//       }
//     }

//     // 9. Crear algunas reservas/alquileres de ejemplo
//     console.log('📝 Creando alquileres de ejemplo...');
//     const turnosReservados = turnos.filter(t => t.reservado).slice(0, 20); // Aumentado a 20 alquileres
//     for (const turno of turnosReservados) {
//       const horaFin = new Date(turno.horaInicio);
//       horaFin.setUTCHours(horaFin.getUTCHours() + 1);

//       const alquiler = await prisma.alquiler.create({
//         data: {
//           estado: EstadoAlquiler.PAGADO,
//           horaInicio: turno.horaInicio,
//           horaFin: horaFin,
//           clienteId: cliente.id,
//         }
//       });
//       await prisma.turno.update({ where: { id: turno.id }, data: { alquilerId: alquiler.id } });
//       await prisma.pago.create({
//         data: {
//           codigoTransaccion: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//           metodoPago: MetodoPago.CREDITO,
//           monto: turno.precio,
//           alquilerId: alquiler.id,
//         }
//       });
//       if (Math.random() > 0.5) {
//         await prisma.resenia.create({
//           data: {
//             descripcion: 'Excelente cancha, muy bien mantenida. Volveremos!',
//             puntaje: 4 + Math.floor(Math.random() * 2), // Entre 4 y 5
//             alquilerId: alquiler.id,
//           }
//         });
//       }
//     }

//     // 10. Crear solicitudes pendientes
//     console.log('📋 Creando solicitudes pendientes...');
//     const usuariosPendientesData = [
//         { nombre: 'Fernando', apellido: 'Castro', dni: 50123456, correo: 'fernando.castro@email.com', telefono: '221-7777777' },
//         { nombre: 'Silvia', apellido: 'Ruiz', dni: 51123456, correo: 'silvia.ruiz@email.com', telefono: '221-8888888' },
//         { nombre: 'Gabriel', apellido: 'Vega', dni: 52123456, correo: 'gabriel.vega@email.com', telefono: '221-9999999' },
//     ];
//     const usuariosSolicitudesPendientes: Usuario[] = [];
//     for(const data of usuariosPendientesData) {
//         const usuario = await prisma.usuario.create({
//             data: {
//                 ...data,
//                 password: hashedPassword,
//                 rol: Rol.DUENIO,
//             }
//         });
//         usuariosSolicitudesPendientes.push(usuario);
//     }
    
//     const solicitudesPendientesData = [
//       { nombre: 'Distrito Pádel Center', cuit: 30900000001n, usuarioId: usuariosSolicitudesPendientes[0].id },
//       { nombre: 'El Muro Padel', cuit: 30900000002n, usuarioId: usuariosSolicitudesPendientes[1].id },
//       { nombre: 'Club Hípico', cuit: 30900000003n, usuarioId: usuariosSolicitudesPendientes[2].id },
//     ];
//     for (const data of solicitudesPendientesData) {
//       await prisma.solicitud.create({ data });
//     }

//     console.log('✅ Seed completado exitosamente!');
//     // ... (resumen final)

//   } catch (error) {
//     console.error('❌ Error durante el seed:', error);
//     process.exit(1);
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// import { PrismaClient, DiaSemana, Rol, EstadoSolicitud, EstadoAlquiler, MetodoPago, Usuario, Complejo, Cancha, Turno } from '../src/generated/prisma/client';
// import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Iniciando seed de la base de datos...');

//   try {
//     // Limpiar base de datos en orden correcto para evitar errores de constraints
//     console.log('🧹 Limpiando base de datos...');
//     await prisma.pago.deleteMany();
//     await prisma.resenia.deleteMany();
//     await prisma.alquiler.deleteMany();
//     await prisma.turno.deleteMany();
//     await prisma.horarioCronograma.deleteMany();
//     await prisma.cancha.deleteMany();
//     await prisma.complejo.deleteMany();
//     await prisma.solicitud.deleteMany();
//     await prisma.administrador.deleteMany();
//     await prisma.usuario.deleteMany();
//     await prisma.domicilio.deleteMany();
//     await prisma.localidad.deleteMany();
//     await prisma.deporte.deleteMany();
//     console.log('✅ Base de datos limpia.');


//     // 1. Crear Localidades
//     console.log('📍 Creando localidades...');
//     const localidadesData = [
//       { nombre: 'La Plata' }, { nombre: 'City Bell' }, { nombre: 'Gonnet' },
//       { nombre: 'Ensenada' }, { nombre: 'Los Hornos' }, { nombre: 'Tolosa' }
//     ];
//     const localidades = await prisma.localidad.createManyAndReturn({ data: localidadesData });
//     const localidadMap = new Map(localidades.map(l => [l.nombre, l.id]));

//     // 2. Crear Deportes
//     console.log('⚽ Creando deportes...');
//     const deportesData = [
//       { nombre: 'Fútbol 5' }, { nombre: 'Fútbol 11' }, { nombre: 'Vóley' },
//       { nombre: 'Básquet' }, { nombre: 'Handball' }, { nombre: 'Tenis' },
//       { nombre: 'Pádel' }, { nombre: 'Hockey' }
//     ];
//     const deportes = await prisma.deporte.createManyAndReturn({ data: deportesData });
//     const deporteMap = new Map(deportes.map(d => [d.nombre, d.id]));

//     // 3. Crear Administrador
//     console.log('👤 Creando administrador...');
//     const hashedAdminPassword = await bcrypt.hash('admin123', 10);
//     const admin = await prisma.administrador.create({
//       data: {
//         correo: 'admin@sistema.com',
//         password: hashedAdminPassword,
//       }
//     });

//     // 4. Crear Usuarios (Clientes y Dueños)
//     console.log('👥 Creando usuarios...');
//     const hashedPassword = await bcrypt.hash('password123', 10);
    
//     // Usuario cliente de prueba
//     const cliente = await prisma.usuario.create({
//       data: {
//         nombre: 'Nacho', apellido: 'Benitez', dni: 40123456, correo: 'nacho.benitez@email.com',
//         password: hashedPassword, telefono: '221-5555555', rol: Rol.CLIENTE,
//       }
//     });

//     // Datos de los dueños
//     const dueniosData = [
//         { nombre: 'Juan', apellido: 'Pérez', dni: 30123456, correo: 'juan.perez@email.com', telefono: '221-6666666' },
//         { nombre: 'María', apellido: 'González', dni: 31123456, correo: 'maria.gonzalez@email.com', telefono: '221-7777777' },
//         { nombre: 'Carlos', apellido: 'Rodríguez', dni: 32123456, correo: 'carlos.rodriguez@email.com', telefono: '221-8888888' },
//         { nombre: 'Ana', apellido: 'Martínez', dni: 33123456, correo: 'ana.martinez@email.com', telefono: '221-9999999' },
//         { nombre: 'Luis', apellido: 'Fernández', dni: 34123456, correo: 'luis.fernandez@email.com', telefono: '221-1111111' },
//         { nombre: 'Carmen', apellido: 'López', dni: 35123456, correo: 'carmen.lopez@email.com', telefono: '221-2222222' },
//         { nombre: 'Roberto', apellido: 'Silva', dni: 36123456, correo: 'roberto.silva@email.com', telefono: '221-3333333' },
//         { nombre: 'Elena', apellido: 'Torres', dni: 37123456, correo: 'elena.torres@email.com', telefono: '221-4444444' },
//         { nombre: 'Diego', apellido: 'Morales', dni: 38123456, correo: 'diego.morales@email.com', telefono: '221-5555555' },
//         { nombre: 'Patricia', apellido: 'Herrera', dni: 39123456, correo: 'patricia.herrera@email.com', telefono: '221-6666666' },
//         { nombre: 'Miguel', apellido: 'Ramírez', dni: 40123457, correo: 'miguel.ramirez@email.com', telefono: '221-7777777' },
//         { nombre: 'Sofía', apellido: 'Vargas', dni: 41123457, correo: 'sofia.vargas@email.com', telefono: '221-8888888' },
//         { nombre: 'Alejandro', apellido: 'Mendoza', dni: 42123457, correo: 'alejandro.mendoza@email.com', telefono: '221-9999999' },
//         { nombre: 'Valeria', apellido: 'Castro', dni: 43123457, correo: 'valeria.castro@email.com', telefono: '221-1010101' },
//         { nombre: 'Ricardo', apellido: 'Flores', dni: 44123457, correo: 'ricardo.flores@email.com', telefono: '221-1111112' },
//         { nombre: 'Claudia', apellido: 'Jiménez', dni: 45123457, correo: 'claudia.jimenez@email.com', telefono: '221-1212121' },
//         { nombre: 'Fernando', apellido: 'Gutiérrez', dni: 46123457, correo: 'fernando.gutierrez@email.com', telefono: '221-1313131' },
//         { nombre: 'Lucía', apellido: 'Romero', dni: 47123457, correo: 'lucia.romero@email.com', telefono: '221-1414141' },
//         { nombre: 'Andrés', apellido: 'Moreno', dni: 48123457, correo: 'andres.moreno@email.com', telefono: '221-1515151' },
//         { nombre: 'Natalia', apellido: 'Ramos', dni: 49123457, correo: 'natalia.ramos@email.com', telefono: '221-1616161' },
//         { nombre: 'Sebastián', apellido: 'Ortega', dni: 50123457, correo: 'sebastian.ortega@email.com', telefono: '221-1717171' },
//         { nombre: 'Gabriela', apellido: 'Delgado', dni: 51123457, correo: 'gabriela.delgado@email.com', telefono: '221-1818181' },
//         { nombre: 'Martín', apellido: 'Aguilar', dni: 52123457, correo: 'martin.aguilar@email.com', telefono: '221-1919191' },
//         { nombre: 'Camila', apellido: 'Vega', dni: 53123457, correo: 'camila.vega@email.com', telefono: '221-2020202' },
//         { nombre: 'Joaquín', apellido: 'Cruz', dni: 54123457, correo: 'joaquin.cruz@email.com', telefono: '221-2121212' },
//         { nombre: 'Isabella', apellido: 'Paredes', dni: 55123457, correo: 'isabella.paredes@email.com', telefono: '221-2222223' },
//         { nombre: 'Emilio', apellido: 'Santana', dni: 56123457, correo: 'emilio.santana@email.com', telefono: '221-2323232' },
//         { nombre: 'Valentina', apellido: 'Navarro', dni: 57123457, correo: 'valentina.navarro@email.com', telefono: '221-2424242' },
//         { nombre: 'Tomás', apellido: 'Hernández', dni: 58123457, correo: 'tomas.hernandez@email.com', telefono: '221-2525252' },
//         { nombre: 'Agustina', apellido: 'Reyes', dni: 59123457, correo: 'agustina.reyes@email.com', telefono: '221-2626262' },
//     ];
    
//     const duenios: Usuario[] = [];
//     // SOLUCIÓN: Usar un bucle 'for...of' en lugar de 'Promise.all' para evitar sobrecargar la base de datos.
//     for (const data of dueniosData) {
//       const duenio = await prisma.usuario.create({
//         data: {
//           ...data,
//           password: hashedPassword,
//           rol: Rol.DUENIO,
//         }
//       });
//       duenios.push(duenio);
//     }

//     // 5. Crear Complejos con sus solicitudes aprobadas
//     console.log('🏢 Creando complejos...');
//     const complejosData = [
//         // SOLUCIÓN: Se agrega 'n' al final de cada CUIT para que sea un BigInt
//         { nombre: 'Complejo El Potrero', ubicacion: 'La Plata', cuit: 30123456781n, usuarioIdx: 0, calle: '13', altura: 456 },
//         { nombre: 'Fútbol City', ubicacion: 'City Bell', cuit: 30123456782n, usuarioIdx: 1, calle: '14', altura: 2345 },
//         { nombre: 'La Redonda FC', ubicacion: 'Ensenada', cuit: 30123456783n, usuarioIdx: 2, calle: 'Av. Bossinga', altura: 567 },
//         { nombre: 'Pase a la Red', ubicacion: 'La Plata', cuit: 30123456784n, usuarioIdx: 3, calle: '50', altura: 1234 },
//         { nombre: 'Estación Fútbol', ubicacion: 'City Bell', cuit: 30123456785n, usuarioIdx: 4, calle: '476', altura: 890 },
//         { nombre: 'Club San Luis', ubicacion: 'La Plata', cuit: 30123456788n, usuarioIdx: 5, calle: '70', altura: 234 },
//         { nombre: 'Club Atenas', ubicacion: 'La Plata', cuit: 30123456780n, usuarioIdx: 6, calle: '13', altura: 1259 },
//         { nombre: 'Club de Tenis La Plata', ubicacion: 'La Plata', cuit: 30123456786n, usuarioIdx: 7, calle: '4', altura: 1700 },
//         { nombre: 'Crystal Padel', ubicacion: 'La Plata', cuit: 30123456787n, usuarioIdx: 8, calle: '19', altura: 456 },
//         { nombre: 'Club Santa Bárbara', ubicacion: 'Gonnet', cuit: 30123456789n, usuarioIdx: 9, calle: 'Camino Gral. Belgrano', altura: 3456 },
//         { nombre: 'Arena Deportiva Central', ubicacion: 'La Plata', cuit: 30123456790n, usuarioIdx: 10, calle: '7', altura: 890 },
//         { nombre: 'Sporting Club La Plata', ubicacion: 'La Plata', cuit: 30123456791n, usuarioIdx: 11, calle: 'Diagonal 74', altura: 567 },
//         { nombre: 'Complejo Deportivo Meridiano', ubicacion: 'City Bell', cuit: 30123456792n, usuarioIdx: 12, calle: '60', altura: 1200 },
//         { nombre: 'Centro Atlético Tolosa', ubicacion: 'Tolosa', cuit: 30123456793n, usuarioIdx: 13, calle: 'Av. 1', altura: 526 },
//         { nombre: 'Polideportivo City Bell', ubicacion: 'City Bell', cuit: 30123456794n, usuarioIdx: 14, calle: '11', altura: 460 },
//         { nombre: 'Club Deportivo Gonnet', ubicacion: 'Gonnet', cuit: 30123456795n, usuarioIdx: 15, calle: 'Camino Centenario', altura: 489 },
//         { nombre: 'Arena Futsal Premium', ubicacion: 'La Plata', cuit: 30123456796n, usuarioIdx: 16, calle: '13', altura: 666 },
//         { nombre: 'Complejo Deportivo Ringuelet', ubicacion: 'La Plata', cuit: 30123456797n, usuarioIdx: 17, calle: '514', altura: 678 },
//         { nombre: 'Centro de Alto Rendimiento', ubicacion: 'La Plata', cuit: 30123456798n, usuarioIdx: 18, calle: '122', altura: 600 },
//         { nombre: 'Sports Center Villa Elvira', ubicacion: 'Ensenada', cuit: 30123456799n, usuarioIdx: 19, calle: '7', altura: 610 },
//         { nombre: 'Megadeportivo La Plata', ubicacion: 'La Plata', cuit: 30123456800n, usuarioIdx: 20, calle: '25 de Mayo', altura: 2500 },
//         { nombre: 'Club Atlético Boca Unidos', ubicacion: 'La Plata', cuit: 30123456801n, usuarioIdx: 21, calle: '115', altura: 490 },
//         { nombre: 'Deportivo San Carlos', ubicacion: 'La Plata', cuit: 30123456802n, usuarioIdx: 22, calle: '137', altura: 440 },
//         { nombre: 'Arena Multideporte', ubicacion: 'La Plata', cuit: 30123456803n, usuarioIdx: 23, calle: '20', altura: 470 },
//         { nombre: 'Complejo Olímpico', ubicacion: 'La Plata', cuit: 30123456804n, usuarioIdx: 24, calle: '60', altura: 250 },
//         { nombre: 'Centro Deportivo Hipódromo', ubicacion: 'City Bell', cuit: 30123456805n, usuarioIdx: 25, calle: '38', altura: 1200 },
//         { nombre: 'Polideportivo República de los Niños', ubicacion: 'Gonnet', cuit: 30123456806n, usuarioIdx: 26, calle: 'Camino Gral. Belgrano', altura: 1200 },
//         { nombre: 'Club Deportivo Almagro', ubicacion: 'La Plata', cuit: 30123456807n, usuarioIdx: 27, calle: '2', altura: 720 },
//         { nombre: 'Arena Sport Complex', ubicacion: 'La Plata', cuit: 30123456808n, usuarioIdx: 28, calle: '13', altura: 320 },
//         { nombre: 'Complejo Deportivo El Trébol', ubicacion: 'La Plata', cuit: 30123456809n, usuarioIdx: 29, calle: '64', altura: 170 },
//     ];
    
//     const complejos: Complejo[] = [];
//     // SOLUCIÓN: Usar un bucle 'for...of' para crear complejos secuencialmente.
//     for (const data of complejosData) {
//       const domicilio = await prisma.domicilio.create({
//         data: {
//           calle: data.calle,
//           altura: data.altura,
//           localidadId: localidadMap.get(data.ubicacion) || localidades[0].id,
//         }
//       });

//       const solicitud = await prisma.solicitud.create({
//         data: {
//           cuit: data.cuit,
//           estado: EstadoSolicitud.APROBADA,
//           usuarioId: duenios[data.usuarioIdx].id,
//           adminId: admin.id,
//         }
//       });

//       const complejo = await prisma.complejo.create({
//         data: {
//           nombre: data.nombre,
//           descripcion: `${data.nombre} - Complejo deportivo de primera categoría`,
//           puntaje: 4.5 + Math.random() * 0.5,
//           domicilioId: domicilio.id,
//           usuarioId: duenios[data.usuarioIdx].id,
//           solicitudId: solicitud.id,
//         }
//       });
//       complejos.push(complejo);
//     }
//     const complejoMap = new Map(complejos.map(c => [c.nombre, c.id]));

//     // 6. Crear Canchas
//     console.log('🏟️ Creando canchas...');
//     const canchasData = [
//       // ... (la data de las canchas es muy larga, la omito por brevedad pero se mantiene igual)
//        { complejoNombre: 'Complejo El Potrero', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de última generación.', puntaje: 4.8 },
//        { complejoNombre: 'Fútbol City', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha de 5 techada con caucho de alta densidad.', puntaje: 4.7 },
//        { complejoNombre: 'La Redonda FC', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'No se suspende por lluvia. Excelente iluminación.', puntaje: 4.2 },
//        { complejoNombre: 'Pase a la Red', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Iluminación LED profesional.', puntaje: 4.6 },
//        { complejoNombre: 'Estación Fútbol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'La clásica de Estación. Siempre impecable.', puntaje: 4.9 },
//        { complejoNombre: 'Arena Deportiva Central', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha principal con tribunas.', puntaje: 4.8 },
//        { complejoNombre: 'Sporting Club La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético profesional.', puntaje: 4.5 },
//        { complejoNombre: 'Complejo Deportivo Meridiano', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha techada anti lluvia.', puntaje: 4.7 },
//        { complejoNombre: 'Arena Futsal Premium', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Piso de futsal profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Megadeportivo La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Instalaciones de primer nivel.', puntaje: 5.0 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha multiuso adaptable.', puntaje: 4.6 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Estándares olímpicos.', puntaje: 4.8 },
//        { complejoNombre: 'Arena Sport Complex', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Tecnología de última generación.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Ambiente familiar y acogedor.', puntaje: 4.4 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Entrenamiento de alto nivel.', puntaje: 4.9 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de calidad.', puntaje: 4.3 },
//        { complejoNombre: 'Estación Fútbol', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural con medidas reglamentarias.', puntaje: 4.9 },
//        { complejoNombre: 'Club San Luis', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha de entrenamiento San Luis.', puntaje: 4.5 },
//        { complejoNombre: 'Megadeportivo La Plata', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo reglamentario FIFA.', puntaje: 5.0 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Estadio con capacidad 5000 personas.', puntaje: 4.8 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped híbrido profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha histórica del club.', puntaje: 4.6 },
//        { complejoNombre: 'Deportivo San Carlos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo de entrenamiento principal.', puntaje: 4.4 },
//        { complejoNombre: 'Club Deportivo Almagro', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural tradicional.', puntaje: 4.5 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo secundario del club.', puntaje: 4.3 },
//        { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo educativo y recreativo.', puntaje: 4.2 },
//        { complejoNombre: 'Centro Deportivo Hipódromo', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Ubicación privilegiada.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Deportivo Ringuelet', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo comunitario.', puntaje: 4.1 },
//        { complejoNombre: 'Club Atenas', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso de parquet flotante profesional.', puntaje: 4.8 },
//        { complejoNombre: 'Polideportivo City Bell', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Cancha cubierta con gradas.', puntaje: 4.6 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso sintético de alta calidad.', puntaje: 4.7 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha adaptable multi-deporte.', puntaje: 4.5 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Instalaciones olímpicas.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Entrenamiento de selecciones.', puntaje: 5.0 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Ambiente familiar.', puntaje: 4.3 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha techada moderna.', puntaje: 4.4 },
//        { complejoNombre: 'Club Atenas', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tablero reglamentario FIBA.', puntaje: 4.7 },
//        { complejoNombre: 'Polideportivo City Bell', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha principal del polideportivo.', puntaje: 4.8 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 3, deporteNombre: 'Básquet', descripcion: 'Piso de maple canadiense.', puntaje: 4.9 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Arena principal con 3000 butacas.', puntaje: 5.0 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Entrenamiento profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha histórica del club.', puntaje: 4.5 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Instalaciones renovadas.', puntaje: 4.6 },
//        { complejoNombre: 'Club Deportivo Almagro', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tradición en básquet.', puntaje: 4.4 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 4, deporteNombre: 'Handball', descripcion: 'Cancha reglamentaria IHF.', puntaje: 4.8 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Instalaciones de elite.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Centro de entrenamiento nacional.', puntaje: 5.0 },
//        { complejoNombre: 'Polideportivo City Bell', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Piso antideslizante.', puntaje: 4.6 },
//        { complejoNombre: 'Club Atenas', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Tradición en handball.', puntaje: 4.5 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Cancha recién inaugurada.', puntaje: 4.7 },
//        { complejoNombre: 'Club de Tenis La Plata', nroCancha: 1, deporteNombre: 'Tenis', descripcion: 'Polvo de ladrillo profesional.', puntaje: 4.9 },
//        { complejoNombre: 'Club de Tenis La Plata', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Excelente drenaje.', puntaje: 4.8 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Cancha central con gradas.', puntaje: 4.7 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Superficie de césped sintético.', puntaje: 4.6 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Entrenamiento de tenistas profesionales.', puntaje: 5.0 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Superficie hard court.', puntaje: 4.8 },
//        { complejoNombre: 'Club San Luis', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Canchas tradicionales de arcilla.', puntaje: 4.5 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Canchas al aire libre.', puntaje: 4.3 },
//        { complejoNombre: 'Arena Sport Complex', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Tecnología de punta.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Ambiente tranquilo.', puntaje: 4.4 },
//        { complejoNombre: 'Crystal Padel', nroCancha: 1, deporteNombre: 'Pádel', descripcion: 'Paredes de blindex.', puntaje: 4.9 },
//        { complejoNombre: 'Crystal Padel', nroCancha: 2, deporteNombre: 'Pádel', descripcion: 'Cancha central.', puntaje: 5.0 },
//        { complejoNombre: 'Club de Tenis La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas techadas.', puntaje: 4.8 },
//        { complejoNombre: 'Arena Sport Complex', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Cristales panorámicos.', puntaje: 4.7 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Instalaciones premium.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Entrenamiento profesional.', puntaje: 4.8 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Ambiente exclusivo.', puntaje: 4.6 },
//        { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas al aire libre cubiertas.', puntaje: 4.4 },
//        { complejoNombre: 'Megadeportivo La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Complejo de pádel más grande.', puntaje: 4.7 },
//        { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas familiares.', puntaje: 4.3 },
//        { complejoNombre: 'Arena Multideporte', nroCancha: 5, deporteNombre: 'Pádel', descripcion: 'Diseño moderno.', puntaje: 4.5 },
//        { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas económicas.', puntaje: 4.2 },
//        { complejoNombre: 'Club San Luis', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Césped sintético de agua.', puntaje: 5.0 },
//        { complejoNombre: 'Club Santa Bárbara', nroCancha: 5, deporteNombre: 'Hockey', descripcion: 'Instalaciones de primer nivel.', puntaje: 4.9 },
//        { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo reglamentario FIH.', puntaje: 5.0 },
//        { complejoNombre: 'Complejo Olímpico', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo principal con tribunas.', puntaje: 4.8 },
//        { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Tradición en hockey femenino.', puntaje: 4.6 },
//        { complejoNombre: 'Club Deportivo Almagro', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Campo histórico.', puntaje: 4.4 },
//        { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 4, deporteNombre: 'Hockey', descripcion: 'Césped sintético nuevo.', puntaje: 4.7 },
//        { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Campo educativo.', puntaje: 4.2 },
//     ];
    
//     const canchasCreadas: Cancha[] = [];
//     // SOLUCIÓN: Bucle secuencial para no sobrecargar la BD
//     for (let i = 0; i < canchasData.length; i++) {
//       const data = canchasData[i];
//       const complejoId = complejoMap.get(data.complejoNombre);
//       const deporteId = deporteMap.get(data.deporteNombre);
      
//       if (!complejoId || !deporteId) {
//         console.error(`No se encontró complejo o deporte para: ${data.complejoNombre} - ${data.deporteNombre}`);
//         continue;
//       }
      
//       const cancha = await prisma.cancha.create({
//         data: {
//           nroCancha: 1000 + i, // Número único para evitar conflictos
//           descripcion: data.descripcion,
//           puntaje: data.puntaje,
//           complejoId: complejoId,
//           deporteId: deporteId,
//           image: [`/images/canchas/${data.deporteNombre.toLowerCase().replace(' ', '')}-${i + 1}.jpg`],
//         }
//       });
//       canchasCreadas.push(cancha);
//     }

//     // El resto del script ya usa bucles secuenciales, lo cual es correcto.
//     // 7. Crear Horarios de Cronograma para cada cancha
//     console.log('📅 Creando horarios de cronograma...');
//     const diasSemana = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
//     for (const cancha of canchasCreadas) {
//       for (const dia of diasSemana) {
//         if (dia === DiaSemana.SABADO || dia === DiaSemana.DOMINGO) {
//           await prisma.horarioCronograma.create({
//             data: { horaInicio: new Date('1970-01-01T10:00:00Z'), horaFin: new Date('1970-01-01T12:00:00Z'), diaSemana: dia, canchaId: cancha.id }
//           });
//         }
//         await prisma.horarioCronograma.create({
//           data: { horaInicio: new Date('1970-01-01T16:00:00Z'), horaFin: new Date('1970-01-01T20:00:00Z'), diaSemana: dia, canchaId: cancha.id }
//         });
//         await prisma.horarioCronograma.create({
//           data: { horaInicio: new Date('1970-01-01T20:00:00Z'), horaFin: new Date('1970-01-01T23:00:00Z'), diaSemana: dia, canchaId: cancha.id }
//         });
//       }
//     }

//     // 8. Crear Turnos para las próximas 2 semanas
//     console.log('🕐 Creando turnos...');
//     const hoy = new Date();
//     const turnos: Turno[] = [];
//     for (const cancha of canchasCreadas) {
//       for (let dia = 0; dia < 14; dia++) {
//         const fecha = new Date(hoy);
//         fecha.setDate(fecha.getDate() + dia);
//         fecha.setUTCHours(0, 0, 0, 0); // Normalizar fecha a UTC medianoche
        
//         for (let hora = 10; hora <= 22; hora++) {
//           const precio = 15000 + Math.random() * 20000;
//           const reservado = Math.random() > 0.6;
          
//           const turno = await prisma.turno.create({
//             data: {
//               fecha: fecha,
//               horaInicio: new Date(`1970-01-01T${hora.toString().padStart(2, '0')}:00:00Z`),
//               precio: Math.round(precio / 500) * 500,
//               reservado: reservado,
//               canchaId: cancha.id,
//             }
//           });
//           turnos.push(turno);
//         }
//       }
//     }

//     // 9. Crear algunas reservas/alquileres de ejemplo
//     console.log('📝 Creando alquileres de ejemplo...');
//     const turnosReservados = turnos.filter(t => t.reservado).slice(0, 20); // Aumentado a 20 alquileres
//     for (const turno of turnosReservados) {
//       const horaFin = new Date(turno.horaInicio);
//       horaFin.setUTCHours(horaFin.getUTCHours() + 1);

//       const alquiler = await prisma.alquiler.create({
//         data: {
//           estado: EstadoAlquiler.PAGADO,
//           horaInicio: turno.horaInicio,
//           horaFin: horaFin,
//           clienteId: cliente.id,
//         }
//       });
//       await prisma.turno.update({ where: { id: turno.id }, data: { alquilerId: alquiler.id } });
//       await prisma.pago.create({
//         data: {
//           codigoTransaccion: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//           metodoPago: MetodoPago.CREDITO,
//           monto: turno.precio,
//           alquilerId: alquiler.id,
//         }
//       });
//       if (Math.random() > 0.5) {
//         await prisma.resenia.create({
//           data: {
//             descripcion: 'Excelente cancha, muy bien mantenida. Volveremos!',
//             puntaje: 4 + Math.floor(Math.random() * 2), // Entre 4 y 5
//             alquilerId: alquiler.id,
//           }
//         });
//       }
//     }

//     // 10. Crear solicitudes pendientes
//     console.log('📋 Creando solicitudes pendientes...');
//     const usuariosPendientesData = [
//         { nombre: 'Fernando', apellido: 'Castro', dni: 50123456, correo: 'fernando.castro@email.com', telefono: '221-7777777' },
//         { nombre: 'Silvia', apellido: 'Ruiz', dni: 51123456, correo: 'silvia.ruiz@email.com', telefono: '221-8888888' },
//         { nombre: 'Gabriel', apellido: 'Vega', dni: 52123456, correo: 'gabriel.vega@email.com', telefono: '221-9999999' },
//     ];
//     const usuariosSolicitudesPendientes: Usuario[] = [];
//     for(const data of usuariosPendientesData) {
//         const usuario = await prisma.usuario.create({
//             data: {
//                 ...data,
//                 password: hashedPassword,
//                 rol: Rol.DUENIO,
//             }
//         });
//         usuariosSolicitudesPendientes.push(usuario);
//     }
    
//     const solicitudesPendientesData = [
//       { nombre: 'Distrito Pádel Center', cuit: 30900000001n, usuarioId: usuariosSolicitudesPendientes[0].id },
//       { nombre: 'El Muro Padel', cuit: 30900000002n, usuarioId: usuariosSolicitudesPendientes[1].id },
//       { nombre: 'Club Hípico', cuit: 30900000003n, usuarioId: usuariosSolicitudesPendientes[2].id },
//     ];
//     for (const data of solicitudesPendientesData) {
//       await prisma.solicitud.create({ data });
//     }

//     console.log('✅ Seed completado exitosamente!');
//     console.log(`📊 Resumen:
//       - Localidades creadas: ${localidades.length}
//       - Deportes creados: ${deportes.length}
//       - Usuarios creados: ${duenios.length + usuariosSolicitudesPendientes.length + 1} (${duenios.length} dueños de complejos + ${usuariosSolicitudesPendientes.length} con solicitudes pendientes + 1 cliente)
//       - Complejos creados: ${complejos.length}
//       - Canchas creadas: ${canchasCreadas.length}
//       - Turnos creados: ${turnos.length}
//       - Alquileres creados: ${turnosReservados.length}
//     `);

//   } catch (error) {
//     console.error('❌ Error durante el seed:', error);
//     process.exit(1);
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });




import { PrismaClient, DiaSemana, Rol, EstadoSolicitud, EstadoAlquiler, MetodoPago, Usuario, Complejo, Cancha, Turno } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Limpiar base de datos en orden correcto para evitar errores de constraints
    console.log('🧹 Limpiando base de datos...');
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
    console.log('✅ Base de datos limpia.');


    // 1. Crear Localidades
    console.log('📍 Creando localidades...');
    const localidadesData = [
      { nombre: 'La Plata' }, { nombre: 'City Bell' }, { nombre: 'Gonnet' },
      { nombre: 'Ensenada' }, { nombre: 'Los Hornos' }, { nombre: 'Tolosa' }
    ];
    const localidades = await prisma.localidad.createManyAndReturn({ data: localidadesData });
    const localidadMap = new Map(localidades.map(l => [l.nombre, l.id]));

    // 2. Crear Deportes
    console.log('⚽ Creando deportes...');
    const deportesData = [
      { nombre: 'Fútbol 5' }, { nombre: 'Fútbol 11' }, { nombre: 'Vóley' },
      { nombre: 'Básquet' }, { nombre: 'Handball' }, { nombre: 'Tenis' },
      { nombre: 'Pádel' }, { nombre: 'Hockey' }
    ];
    const deportes = await prisma.deporte.createManyAndReturn({ data: deportesData });
    const deporteMap = new Map(deportes.map(d => [d.nombre, d.id]));

    // 3. Crear Administrador
    console.log('👤 Creando administrador...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.administrador.create({
      data: {
        correo: 'admin@sistema.com',
        password: hashedAdminPassword,
      }
    });

    // 4. Crear Usuarios (Clientes y Dueños)
    console.log('👥 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Usuario cliente de prueba
    const cliente = await prisma.usuario.create({
      data: {
        nombre: 'Nacho', apellido: 'Benitez', dni: 40123456, correo: 'nacho.benitez@email.com',
        password: hashedPassword, telefono: '221-5555555', rol: Rol.CLIENTE,
      }
    });

    // Datos de los dueños
    const dueniosData = [
        { nombre: 'Juan', apellido: 'Pérez', dni: 30123456, correo: 'juan.perez@email.com', telefono: '221-6666666' },
        { nombre: 'María', apellido: 'González', dni: 31123456, correo: 'maria.gonzalez@email.com', telefono: '221-7777777' },
        { nombre: 'Carlos', apellido: 'Rodríguez', dni: 32123456, correo: 'carlos.rodriguez@email.com', telefono: '221-8888888' },
        { nombre: 'Ana', apellido: 'Martínez', dni: 33123456, correo: 'ana.martinez@email.com', telefono: '221-9999999' },
        { nombre: 'Luis', apellido: 'Fernández', dni: 34123456, correo: 'luis.fernandez@email.com', telefono: '221-1111111' },
        { nombre: 'Carmen', apellido: 'López', dni: 35123456, correo: 'carmen.lopez@email.com', telefono: '221-2222222' },
        { nombre: 'Roberto', apellido: 'Silva', dni: 36123456, correo: 'roberto.silva@email.com', telefono: '221-3333333' },
        { nombre: 'Elena', apellido: 'Torres', dni: 37123456, correo: 'elena.torres@email.com', telefono: '221-4444444' },
        { nombre: 'Diego', apellido: 'Morales', dni: 38123456, correo: 'diego.morales@email.com', telefono: '221-5555555' },
        { nombre: 'Patricia', apellido: 'Herrera', dni: 39123456, correo: 'patricia.herrera@email.com', telefono: '221-6666666' },
        { nombre: 'Miguel', apellido: 'Ramírez', dni: 40123457, correo: 'miguel.ramirez@email.com', telefono: '221-7777777' },
        { nombre: 'Sofía', apellido: 'Vargas', dni: 41123457, correo: 'sofia.vargas@email.com', telefono: '221-8888888' },
        { nombre: 'Alejandro', apellido: 'Mendoza', dni: 42123457, correo: 'alejandro.mendoza@email.com', telefono: '221-9999999' },
        { nombre: 'Valeria', apellido: 'Castro', dni: 43123457, correo: 'valeria.castro@email.com', telefono: '221-1010101' },
        { nombre: 'Ricardo', apellido: 'Flores', dni: 44123457, correo: 'ricardo.flores@email.com', telefono: '221-1111112' },
        { nombre: 'Claudia', apellido: 'Jiménez', dni: 45123457, correo: 'claudia.jimenez@email.com', telefono: '221-1212121' },
        { nombre: 'Fernando', apellido: 'Gutiérrez', dni: 46123457, correo: 'fernando.gutierrez@email.com', telefono: '221-1313131' },
        { nombre: 'Lucía', apellido: 'Romero', dni: 47123457, correo: 'lucia.romero@email.com', telefono: '221-1414141' },
        { nombre: 'Andrés', apellido: 'Moreno', dni: 48123457, correo: 'andres.moreno@email.com', telefono: '221-1515151' },
        { nombre: 'Natalia', apellido: 'Ramos', dni: 49123457, correo: 'natalia.ramos@email.com', telefono: '221-1616161' },
        { nombre: 'Sebastián', apellido: 'Ortega', dni: 50123457, correo: 'sebastian.ortega@email.com', telefono: '221-1717171' },
        { nombre: 'Gabriela', apellido: 'Delgado', dni: 51123457, correo: 'gabriela.delgado@email.com', telefono: '221-1818181' },
        { nombre: 'Martín', apellido: 'Aguilar', dni: 52123457, correo: 'martin.aguilar@email.com', telefono: '221-1919191' },
        { nombre: 'Camila', apellido: 'Vega', dni: 53123457, correo: 'camila.vega@email.com', telefono: '221-2020202' },
        { nombre: 'Joaquín', apellido: 'Cruz', dni: 54123457, correo: 'joaquin.cruz@email.com', telefono: '221-2121212' },
        { nombre: 'Isabella', apellido: 'Paredes', dni: 55123457, correo: 'isabella.paredes@email.com', telefono: '221-2222223' },
        { nombre: 'Emilio', apellido: 'Santana', dni: 56123457, correo: 'emilio.santana@email.com', telefono: '221-2323232' },
        { nombre: 'Valentina', apellido: 'Navarro', dni: 57123457, correo: 'valentina.navarro@email.com', telefono: '221-2424242' },
        { nombre: 'Tomás', apellido: 'Hernández', dni: 58123457, correo: 'tomas.hernandez@email.com', telefono: '221-2525252' },
        { nombre: 'Agustina', apellido: 'Reyes', dni: 59123457, correo: 'agustina.reyes@email.com', telefono: '221-2626262' },
    ];
    
    const duenios: Usuario[] = [];
    // SOLUCIÓN: Usar un bucle 'for...of' en lugar de 'Promise.all' para evitar sobrecargar la base de datos.
    for (const data of dueniosData) {
      const duenio = await prisma.usuario.create({
        data: {
          ...data,
          password: hashedPassword,
          rol: Rol.DUENIO,
        }
      });
      duenios.push(duenio);
    }

    // 5. Crear Complejos con sus solicitudes aprobadas
    console.log('🏢 Creando complejos...');
    const complejosData = [
        // SOLUCIÓN: Se agrega 'n' al final de cada CUIT para que sea un BigInt
        { nombre: 'Complejo El Potrero', ubicacion: 'La Plata', cuit: 30123456781n, usuarioIdx: 0, calle: '13', altura: 456 },
        { nombre: 'Fútbol City', ubicacion: 'City Bell', cuit: 30123456782n, usuarioIdx: 1, calle: '14', altura: 2345 },
        { nombre: 'La Redonda FC', ubicacion: 'Ensenada', cuit: 30123456783n, usuarioIdx: 2, calle: 'Av. Bossinga', altura: 567 },
        { nombre: 'Pase a la Red', ubicacion: 'La Plata', cuit: 30123456784n, usuarioIdx: 3, calle: '50', altura: 1234 },
        { nombre: 'Estación Fútbol', ubicacion: 'City Bell', cuit: 30123456785n, usuarioIdx: 4, calle: '476', altura: 890 },
        { nombre: 'Club San Luis', ubicacion: 'La Plata', cuit: 30123456788n, usuarioIdx: 5, calle: '70', altura: 234 },
        { nombre: 'Club Atenas', ubicacion: 'La Plata', cuit: 30123456780n, usuarioIdx: 6, calle: '13', altura: 1259 },
        { nombre: 'Club de Tenis La Plata', ubicacion: 'La Plata', cuit: 30123456786n, usuarioIdx: 7, calle: '4', altura: 1700 },
        { nombre: 'Crystal Padel', ubicacion: 'La Plata', cuit: 30123456787n, usuarioIdx: 8, calle: '19', altura: 456 },
        { nombre: 'Club Santa Bárbara', ubicacion: 'Gonnet', cuit: 30123456789n, usuarioIdx: 9, calle: 'Camino Gral. Belgrano', altura: 3456 },
        { nombre: 'Arena Deportiva Central', ubicacion: 'La Plata', cuit: 30123456790n, usuarioIdx: 10, calle: '7', altura: 890 },
        { nombre: 'Sporting Club La Plata', ubicacion: 'La Plata', cuit: 30123456791n, usuarioIdx: 11, calle: 'Diagonal 74', altura: 567 },
        { nombre: 'Complejo Deportivo Meridiano', ubicacion: 'City Bell', cuit: 30123456792n, usuarioIdx: 12, calle: '60', altura: 1200 },
        { nombre: 'Centro Atlético Tolosa', ubicacion: 'Tolosa', cuit: 30123456793n, usuarioIdx: 13, calle: 'Av. 1', altura: 526 },
        { nombre: 'Polideportivo City Bell', ubicacion: 'City Bell', cuit: 30123456794n, usuarioIdx: 14, calle: '11', altura: 460 },
        { nombre: 'Club Deportivo Gonnet', ubicacion: 'Gonnet', cuit: 30123456795n, usuarioIdx: 15, calle: 'Camino Centenario', altura: 489 },
        { nombre: 'Arena Futsal Premium', ubicacion: 'La Plata', cuit: 30123456796n, usuarioIdx: 16, calle: '13', altura: 666 },
        { nombre: 'Complejo Deportivo Ringuelet', ubicacion: 'La Plata', cuit: 30123456797n, usuarioIdx: 17, calle: '514', altura: 678 },
        { nombre: 'Centro de Alto Rendimiento', ubicacion: 'La Plata', cuit: 30123456798n, usuarioIdx: 18, calle: '122', altura: 600 },
        { nombre: 'Sports Center Villa Elvira', ubicacion: 'Ensenada', cuit: 30123456799n, usuarioIdx: 19, calle: '7', altura: 610 },
        { nombre: 'Megadeportivo La Plata', ubicacion: 'La Plata', cuit: 30123456800n, usuarioIdx: 20, calle: '25 de Mayo', altura: 2500 },
        { nombre: 'Club Atlético Boca Unidos', ubicacion: 'La Plata', cuit: 30123456801n, usuarioIdx: 21, calle: '115', altura: 490 },
        { nombre: 'Deportivo San Carlos', ubicacion: 'La Plata', cuit: 30123456802n, usuarioIdx: 22, calle: '137', altura: 440 },
        { nombre: 'Arena Multideporte', ubicacion: 'La Plata', cuit: 30123456803n, usuarioIdx: 23, calle: '20', altura: 470 },
        { nombre: 'Complejo Olímpico', ubicacion: 'La Plata', cuit: 30123456804n, usuarioIdx: 24, calle: '60', altura: 250 },
        { nombre: 'Centro Deportivo Hipódromo', ubicacion: 'City Bell', cuit: 30123456805n, usuarioIdx: 25, calle: '38', altura: 1200 },
        { nombre: 'Polideportivo República de los Niños', ubicacion: 'Gonnet', cuit: 30123456806n, usuarioIdx: 26, calle: 'Camino Gral. Belgrano', altura: 1200 },
        { nombre: 'Club Deportivo Almagro', ubicacion: 'La Plata', cuit: 30123456807n, usuarioIdx: 27, calle: '2', altura: 720 },
        { nombre: 'Arena Sport Complex', ubicacion: 'La Plata', cuit: 30123456808n, usuarioIdx: 28, calle: '13', altura: 320 },
        { nombre: 'Complejo Deportivo El Trébol', ubicacion: 'La Plata', cuit: 30123456809n, usuarioIdx: 29, calle: '64', altura: 170 },
    ];
    
    const complejos: Complejo[] = [];
    // SOLUCIÓN: Usar un bucle 'for...of' para crear complejos secuencialmente.
    for (const data of complejosData) {
      const domicilio = await prisma.domicilio.create({
        data: {
          calle: data.calle,
          altura: data.altura,
          localidadId: localidadMap.get(data.ubicacion) || localidades[0].id,
        }
      });

      const solicitud = await prisma.solicitud.create({
        data: {
          cuit: data.cuit,
          estado: EstadoSolicitud.APROBADA,
          usuarioId: duenios[data.usuarioIdx].id,
          adminId: admin.id,
        }
      });

      const complejo = await prisma.complejo.create({
        data: {
          nombre: data.nombre,
          descripcion: `${data.nombre} - Complejo deportivo de primera categoría`,
          puntaje: 4.5 + Math.random() * 0.5,
          domicilioId: domicilio.id,
          usuarioId: duenios[data.usuarioIdx].id,
          solicitudId: solicitud.id,
        }
      });
      complejos.push(complejo);
    }
    const complejoMap = new Map(complejos.map(c => [c.nombre, c.id]));

    // 6. Crear Canchas
    console.log('🏟️ Creando canchas...');
    const canchasData = [
      // ... (la data de las canchas es muy larga, la omito por brevedad pero se mantiene igual)
       { complejoNombre: 'Complejo El Potrero', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de última generación.', puntaje: 4.8 },
       { complejoNombre: 'Fútbol City', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha de 5 techada con caucho de alta densidad.', puntaje: 4.7 },
       { complejoNombre: 'La Redonda FC', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'No se suspende por lluvia. Excelente iluminación.', puntaje: 4.2 },
       { complejoNombre: 'Pase a la Red', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Iluminación LED profesional.', puntaje: 4.6 },
       { complejoNombre: 'Estación Fútbol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'La clásica de Estación. Siempre impecable.', puntaje: 4.9 },
       { complejoNombre: 'Arena Deportiva Central', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha principal con tribunas.', puntaje: 4.8 },
       { complejoNombre: 'Sporting Club La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético profesional.', puntaje: 4.5 },
       { complejoNombre: 'Complejo Deportivo Meridiano', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha techada anti lluvia.', puntaje: 4.7 },
       { complejoNombre: 'Arena Futsal Premium', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Piso de futsal profesional.', puntaje: 4.9 },
       { complejoNombre: 'Megadeportivo La Plata', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Instalaciones de primer nivel.', puntaje: 5.0 },
       { complejoNombre: 'Arena Multideporte', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Cancha multiuso adaptable.', puntaje: 4.6 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Estándares olímpicos.', puntaje: 4.8 },
       { complejoNombre: 'Arena Sport Complex', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Tecnología de última generación.', puntaje: 4.7 },
       { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Ambiente familiar y acogedor.', puntaje: 4.4 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Entrenamiento de alto nivel.', puntaje: 4.9 },
       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 1, deporteNombre: 'Fútbol 5', descripcion: 'Césped sintético de calidad.', puntaje: 4.3 },
       { complejoNombre: 'Estación Fútbol', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural con medidas reglamentarias.', puntaje: 4.9 },
       { complejoNombre: 'Club San Luis', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha de entrenamiento San Luis.', puntaje: 4.5 },
       { complejoNombre: 'Megadeportivo La Plata', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo reglamentario FIFA.', puntaje: 5.0 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Estadio con capacidad 5000 personas.', puntaje: 4.8 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Césped híbrido profesional.', puntaje: 4.9 },
       { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Cancha histórica del club.', puntaje: 4.6 },
       { complejoNombre: 'Deportivo San Carlos', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo de entrenamiento principal.', puntaje: 4.4 },
       { complejoNombre: 'Club Deportivo Almagro', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Césped natural tradicional.', puntaje: 4.5 },
       { complejoNombre: 'Club Santa Bárbara', nroCancha: 2, deporteNombre: 'Fútbol 11', descripcion: 'Campo secundario del club.', puntaje: 4.3 },
       { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo educativo y recreativo.', puntaje: 4.2 },
       { complejoNombre: 'Centro Deportivo Hipódromo', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Ubicación privilegiada.', puntaje: 4.7 },
       { complejoNombre: 'Complejo Deportivo Ringuelet', nroCancha: 1, deporteNombre: 'Fútbol 11', descripcion: 'Campo comunitario.', puntaje: 4.1 },
       { complejoNombre: 'Club Atenas', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso de parquet flotante profesional.', puntaje: 4.8 },
       { complejoNombre: 'Polideportivo City Bell', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Cancha cubierta con gradas.', puntaje: 4.6 },
       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Piso sintético de alta calidad.', puntaje: 4.7 },
       { complejoNombre: 'Arena Multideporte', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha adaptable multi-deporte.', puntaje: 4.5 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Instalaciones olímpicas.', puntaje: 4.9 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 3, deporteNombre: 'Vóley', descripcion: 'Entrenamiento de selecciones.', puntaje: 5.0 },
       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 1, deporteNombre: 'Vóley', descripcion: 'Ambiente familiar.', puntaje: 4.3 },
       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 2, deporteNombre: 'Vóley', descripcion: 'Cancha techada moderna.', puntaje: 4.4 },
       { complejoNombre: 'Club Atenas', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tablero reglamentario FIBA.', puntaje: 4.7 },
       { complejoNombre: 'Polideportivo City Bell', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha principal del polideportivo.', puntaje: 4.8 },
       { complejoNombre: 'Arena Multideporte', nroCancha: 3, deporteNombre: 'Básquet', descripcion: 'Piso de maple canadiense.', puntaje: 4.9 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Arena principal con 3000 butacas.', puntaje: 5.0 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 4, deporteNombre: 'Básquet', descripcion: 'Entrenamiento profesional.', puntaje: 4.9 },
       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Cancha histórica del club.', puntaje: 4.5 },
       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Instalaciones renovadas.', puntaje: 4.6 },
       { complejoNombre: 'Club Deportivo Almagro', nroCancha: 2, deporteNombre: 'Básquet', descripcion: 'Tradición en básquet.', puntaje: 4.4 },
       { complejoNombre: 'Arena Multideporte', nroCancha: 4, deporteNombre: 'Handball', descripcion: 'Cancha reglamentaria IHF.', puntaje: 4.8 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Instalaciones de elite.', puntaje: 4.9 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 5, deporteNombre: 'Handball', descripcion: 'Centro de entrenamiento nacional.', puntaje: 5.0 },
       { complejoNombre: 'Polideportivo City Bell', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Piso antideslizante.', puntaje: 4.6 },
       { complejoNombre: 'Club Atenas', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Tradición en handball.', puntaje: 4.5 },
       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 3, deporteNombre: 'Handball', descripcion: 'Cancha recién inaugurada.', puntaje: 4.7 },
       { complejoNombre: 'Club de Tenis La Plata', nroCancha: 1, deporteNombre: 'Tenis', descripcion: 'Polvo de ladrillo profesional.', puntaje: 4.9 },
       { complejoNombre: 'Club de Tenis La Plata', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Excelente drenaje.', puntaje: 4.8 },
       { complejoNombre: 'Club Santa Bárbara', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Cancha central con gradas.', puntaje: 4.7 },
       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Superficie de césped sintético.', puntaje: 4.6 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Entrenamiento de tenistas profesionales.', puntaje: 5.0 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 6, deporteNombre: 'Tenis', descripcion: 'Superficie hard court.', puntaje: 4.8 },
       { complejoNombre: 'Club San Luis', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Canchas tradicionales de arcilla.', puntaje: 4.5 },
       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 3, deporteNombre: 'Tenis', descripcion: 'Canchas al aire libre.', puntaje: 4.3 },
       { complejoNombre: 'Arena Sport Complex', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Tecnología de punta.', puntaje: 4.7 },
       { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 2, deporteNombre: 'Tenis', descripcion: 'Ambiente tranquilo.', puntaje: 4.4 },
       { complejoNombre: 'Crystal Padel', nroCancha: 1, deporteNombre: 'Pádel', descripcion: 'Paredes de blindex.', puntaje: 4.9 },
       { complejoNombre: 'Crystal Padel', nroCancha: 2, deporteNombre: 'Pádel', descripcion: 'Cancha central.', puntaje: 5.0 },
       { complejoNombre: 'Club de Tenis La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas techadas.', puntaje: 4.8 },
       { complejoNombre: 'Arena Sport Complex', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Cristales panorámicos.', puntaje: 4.7 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Instalaciones premium.', puntaje: 4.9 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 7, deporteNombre: 'Pádel', descripcion: 'Entrenamiento profesional.', puntaje: 4.8 },
       { complejoNombre: 'Club Santa Bárbara', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Ambiente exclusivo.', puntaje: 4.6 },
       { complejoNombre: 'Sports Center Villa Elvira', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas al aire libre cubiertas.', puntaje: 4.4 },
       { complejoNombre: 'Megadeportivo La Plata', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Complejo de pádel más grande.', puntaje: 4.7 },
       { complejoNombre: 'Club Deportivo Gonnet', nroCancha: 4, deporteNombre: 'Pádel', descripcion: 'Canchas familiares.', puntaje: 4.3 },
       { complejoNombre: 'Arena Multideporte', nroCancha: 5, deporteNombre: 'Pádel', descripcion: 'Diseño moderno.', puntaje: 4.5 },
       { complejoNombre: 'Complejo Deportivo El Trébol', nroCancha: 3, deporteNombre: 'Pádel', descripcion: 'Canchas económicas.', puntaje: 4.2 },
       { complejoNombre: 'Club San Luis', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Césped sintético de agua.', puntaje: 5.0 },
       { complejoNombre: 'Club Santa Bárbara', nroCancha: 5, deporteNombre: 'Hockey', descripcion: 'Instalaciones de primer nivel.', puntaje: 4.9 },
       { complejoNombre: 'Centro de Alto Rendimiento', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo reglamentario FIH.', puntaje: 5.0 },
       { complejoNombre: 'Complejo Olímpico', nroCancha: 8, deporteNombre: 'Hockey', descripcion: 'Campo principal con tribunas.', puntaje: 4.8 },
       { complejoNombre: 'Club Atlético Boca Unidos', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Tradición en hockey femenino.', puntaje: 4.6 },
       { complejoNombre: 'Club Deportivo Almagro', nroCancha: 3, deporteNombre: 'Hockey', descripcion: 'Campo histórico.', puntaje: 4.4 },
       { complejoNombre: 'Centro Atlético Tolosa', nroCancha: 4, deporteNombre: 'Hockey', descripcion: 'Césped sintético nuevo.', puntaje: 4.7 },
       { complejoNombre: 'Polideportivo República de los Niños', nroCancha: 2, deporteNombre: 'Hockey', descripcion: 'Campo educativo.', puntaje: 4.2 },
    ];
    
    const canchasCreadas: Cancha[] = [];
    // SOLUCIÓN: Bucle secuencial para no sobrecargar la BD
    for (let i = 0; i < canchasData.length; i++) {
      const data = canchasData[i];
      const complejoId = complejoMap.get(data.complejoNombre);
      const deporteId = deporteMap.get(data.deporteNombre);
      
      if (!complejoId || !deporteId) {
        console.error(`No se encontró complejo o deporte para: ${data.complejoNombre} - ${data.deporteNombre}`);
        continue;
      }
      
      const cancha = await prisma.cancha.create({
        data: {
          nroCancha: 1000 + i, // Número único para evitar conflictos
          descripcion: data.descripcion,
          puntaje: data.puntaje,
          complejoId: complejoId,
          deporteId: deporteId,
          image: [`/images/canchas/${data.deporteNombre.toLowerCase().replace(' ', '')}-${i + 1}.jpg`],
        }
      });
      canchasCreadas.push(cancha);
    }

    // 7. Crear Horarios de Cronograma para cada cancha
    console.log('📅 Creando horarios de cronograma...');
    const diasSemana = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
    for (const cancha of canchasCreadas) {
      for (const dia of diasSemana) {
        if (dia === DiaSemana.SABADO || dia === DiaSemana.DOMINGO) {
          await prisma.horarioCronograma.create({
            data: { horaInicio: new Date('1970-01-01T10:00:00Z'), horaFin: new Date('1970-01-01T12:00:00Z'), diaSemana: dia, canchaId: cancha.id }
          });
        }
        await prisma.horarioCronograma.create({
          data: { horaInicio: new Date('1970-01-01T16:00:00Z'), horaFin: new Date('1970-01-01T20:00:00Z'), diaSemana: dia, canchaId: cancha.id }
        });
        await prisma.horarioCronograma.create({
          data: { horaInicio: new Date('1970-01-01T20:00:00Z'), horaFin: new Date('1970-01-01T23:00:00Z'), diaSemana: dia, canchaId: cancha.id }
        });
      }
    }

    // 8. Crear Turnos para las próximas 2 semanas
    console.log('🕐 Creando turnos...');
    const hoy = new Date();
    const turnos: Turno[] = [];
    for (const cancha of canchasCreadas) {
      for (let dia = 0; dia < 14; dia++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + dia);
        fecha.setUTCHours(0, 0, 0, 0); // Normalizar fecha a UTC medianoche
        
        for (let hora = 10; hora <= 22; hora++) {
          const precio = 15000 + Math.random() * 20000;
          const reservado = Math.random() > 0.6;
          
          const turno = await prisma.turno.create({
            data: {
              fecha: fecha,
              horaInicio: new Date(`1970-01-01T${hora.toString().padStart(2, '0')}:00:00Z`),
              precio: Math.round(precio / 500) * 500,
              reservado: reservado,
              canchaId: cancha.id,
            }
          });
          turnos.push(turno);
        }
      }
    }

    // 9. Crear algunas reservas/alquileres de ejemplo
    console.log('📝 Creando alquileres de ejemplo...');
    const turnosReservados = turnos.filter(t => t.reservado).slice(0, 20); // Aumentado a 20 alquileres
    for (const turno of turnosReservados) {
      const horaFin = new Date(turno.horaInicio);
      horaFin.setUTCHours(horaFin.getUTCHours() + 1);

      const alquiler = await prisma.alquiler.create({
        data: {
          estado: EstadoAlquiler.PAGADO,
          horaInicio: turno.horaInicio,
          horaFin: horaFin,
          clienteId: cliente.id,
        }
      });
      await prisma.turno.update({ where: { id: turno.id }, data: { alquilerId: alquiler.id } });
      await prisma.pago.create({
        data: {
          codigoTransaccion: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          metodoPago: MetodoPago.CREDITO,
          monto: turno.precio,
          alquilerId: alquiler.id,
        }
      });
      if (Math.random() > 0.5) {
        await prisma.resenia.create({
          data: {
            descripcion: 'Excelente cancha, muy bien mantenida. Volveremos!',
            puntaje: 4 + Math.floor(Math.random() * 2), // Entre 4 y 5
            alquilerId: alquiler.id,
          }
        });
      }
    }

    // 10. Crear solicitudes pendientes
    console.log('📋 Creando solicitudes pendientes...');
    const usuariosPendientesData = [
        { nombre: 'Fernando', apellido: 'Castro', dni: 50123456, correo: 'fernando.castro@email.com', telefono: '221-7777777' },
        { nombre: 'Silvia', apellido: 'Ruiz', dni: 51123456, correo: 'silvia.ruiz@email.com', telefono: '221-8888888' },
        { nombre: 'Gabriel', apellido: 'Vega', dni: 52123456, correo: 'gabriel.vega@email.com', telefono: '221-9999999' },
    ];
    const usuariosSolicitudesPendientes: Usuario[] = [];
    for(const data of usuariosPendientesData) {
        const usuario = await prisma.usuario.create({
            data: {
                ...data,
                password: hashedPassword,
                rol: Rol.DUENIO,
            }
        });
        usuariosSolicitudesPendientes.push(usuario);
    }
    
    const solicitudesPendientesData = [
      { nombre: 'Distrito Pádel Center', cuit: 30900000001n, usuarioId: usuariosSolicitudesPendientes[0].id },
      { nombre: 'El Muro Padel', cuit: 30900000002n, usuarioId: usuariosSolicitudesPendientes[1].id },
      { nombre: 'Club Hípico', cuit: 30900000003n, usuarioId: usuariosSolicitudesPendientes[2].id },
    ];
    for (const data of solicitudesPendientesData) {
      await prisma.solicitud.create({
        data: {
          cuit: data.cuit,
          usuarioId: data.usuarioId,
        }
      });
    }

    console.log('✅ Seed completado exitosamente!');
    console.log(`📊 Resumen:
      - Localidades creadas: ${localidades.length}
      - Deportes creados: ${deportes.length}
      - Usuarios creados: ${duenios.length + usuariosSolicitudesPendientes.length + 1} (${duenios.length} dueños de complejos + ${usuariosSolicitudesPendientes.length} con solicitudes pendientes + 1 cliente)
      - Complejos creados: ${complejos.length}
      - Canchas creadas: ${canchasCreadas.length}
      - Turnos creados: ${turnos.length}
      - Alquileres creados: ${turnosReservados.length}
    `);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

