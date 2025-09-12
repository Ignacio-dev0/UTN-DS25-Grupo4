// backend/prisma/seed_nuevo.ts
import { PrismaClient, DiaSemana, Rol, EstadoSolicitud, EstadoAlquiler, MetodoPago } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo de la base de datos...');

  try {
    // Limpiar base de datos en orden correcto
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

    // 1. Crear Localidades
    console.log('📍 Creando localidades...');
    const localidadesData = [
      { nombre: 'La Plata' }, { nombre: 'City Bell' }, { nombre: 'Gonnet' }, { nombre: 'Ensenada' },
      { nombre: 'Los Hornos' }, { nombre: 'Tolosa' }, { nombre: 'Villa Elisa' }, { nombre: 'Berisso' },
      { nombre: 'Ringuelet' }, { nombre: 'Manuel B. Gonnet' }, { nombre: 'Arturo Seguí' }, { nombre: 'Villa Elvira' }
    ];
    const localidades = await prisma.localidad.createManyAndReturn({ data: localidadesData });

    // 2. Crear Deportes
    console.log('⚽ Creando deportes...');
    const deportesData = [
      { nombre: 'Fútbol 5', icono: '⚽' }, { nombre: 'Fútbol 11', icono: '🥅' }, { nombre: 'Vóley', icono: '🏐' },
      { nombre: 'Básquet', icono: '🏀' }, { nombre: 'Handball', icono: '🤾' }, { nombre: 'Tenis', icono: '🎾' },
      { nombre: 'Pádel', icono: '🎾' }, { nombre: 'Hockey', icono: '🏑' }
    ];
    const deportes = await prisma.deporte.createManyAndReturn({ data: deportesData });

    // 3. Crear Servicios
    console.log('🛠️ Creando servicios...');
    const serviciosData = [
      { nombre: 'WiFi Gratuito', descripcion: 'Conexión a internet inalámbrica', icono: '📶' },
      { nombre: 'Estacionamiento', descripcion: 'Lugar para estacionar vehículos', icono: '🅿️' },
      { nombre: 'Vestuarios', descripcion: 'Espacios para cambio de ropa y ducha', icono: '🚿' },
      { nombre: 'Cafetería', descripcion: 'Servicio de comidas y bebidas', icono: '☕' },
      { nombre: 'Seguridad 24hs', descripcion: 'Vigilancia las 24 horas', icono: '🔒' },
      { nombre: 'Aire Acondicionado', descripcion: 'Climatización en espacios cerrados', icono: '❄️' },
      { nombre: 'Iluminación LED', descripcion: 'Iluminación moderna y eficiente', icono: '💡' },
      { nombre: 'Alquiler de Equipos', descripcion: 'Alquiler de equipamiento deportivo', icono: '⚽' },
      { nombre: 'Primeros Auxilios', descripcion: 'Botiquín y atención médica básica', icono: '🏥' },
      { nombre: 'Música Ambiental', descripcion: 'Sistema de audio para ambiente', icono: '🎵' },
      { nombre: 'Parrilla', descripcion: 'Zona de parrilla para eventos', icono: '🔥' },
      { nombre: 'Duchas Calientes', descripcion: 'Duchas con agua caliente', icono: '🚿' }
    ];
    const servicios = await prisma.servicio.createManyAndReturn({ data: serviciosData });

    // 4. Crear Administrador
    console.log('👤 Creando administrador...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminSistema = await prisma.administrador.create({
      data: {
        email: 'admin@sistema.com',
        password: hashedAdminPassword,
      }
    });

    // 5. Crear Usuarios
    console.log('👥 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedUserAdminPassword = await bcrypt.hash('admin', 10);

    // Usuario administrador
    const adminUser = await prisma.usuario.create({
      data: {
        nombre: 'Admin', apellido: 'Sistema', dni: '11111111', correo: 'admin@admin.com',
        password: hashedUserAdminPassword, telefono: '221-0000000', rol: Rol.ADMINISTRADOR,
      }
    });

    // 3 Clientes
    const clientesData = [
      { nombre: 'Nacho', apellido: 'Benitez', dni: '40123456', correo: 'nacho.benitez@email.com', telefono: '221-5555555' },
      { nombre: 'María', apellido: 'González', dni: '39876543', correo: 'maria.gonzalez@email.com', telefono: '221-5555556' },
      { nombre: 'Carlos', apellido: 'Rodríguez', dni: '41234567', correo: 'carlos.rodriguez@email.com', telefono: '221-5555557' }
    ];

    const clientes: any[] = [];
    for (const data of clientesData) {
      const cliente = await prisma.usuario.create({
        data: { ...data, password: hashedPassword, rol: Rol.CLIENTE }
      });
      clientes.push(cliente);
    }

    // 19 Dueños (14 para complejos aprobados + 5 para solicitudes pendientes)
    const dueniosData = [
      { nombre: 'Roberto', apellido: 'Méndez', dni: '30123456', correo: 'roberto.mendez@email.com', telefono: '221-6666666' },
      { nombre: 'Ana', apellido: 'Martínez', dni: '29987654', correo: 'ana.martinez@email.com', telefono: '221-7777777' },
      { nombre: 'Diego', apellido: 'Fernández', dni: '31456789', correo: 'diego.fernandez@email.com', telefono: '221-8888888' },
      { nombre: 'Laura', apellido: 'Sánchez', dni: '32789012', correo: 'laura.sanchez@email.com', telefono: '221-9999999' },
      { nombre: 'Jorge', apellido: 'López', dni: '28345678', correo: 'jorge.lopez@email.com', telefono: '221-1111111' },
      { nombre: 'Patricia', apellido: 'García', dni: '33567890', correo: 'patricia.garcia@email.com', telefono: '221-2222222' },
      { nombre: 'Alejandro', apellido: 'Ruiz', dni: '34678901', correo: 'alejandro.ruiz@email.com', telefono: '221-3333333' },
      { nombre: 'Mónica', apellido: 'Torres', dni: '35789012', correo: 'monica.torres@email.com', telefono: '221-4444444' },
      { nombre: 'Fernando', apellido: 'Castro', dni: '27890123', correo: 'fernando.castro@email.com', telefono: '221-5555558' },
      { nombre: 'Silvia', apellido: 'Morales', dni: '36901234', correo: 'silvia.morales@email.com', telefono: '221-6666667' },
      { nombre: 'Ricardo', apellido: 'Herrera', dni: '26012345', correo: 'ricardo.herrera@email.com', telefono: '221-7777778' },
      { nombre: 'Claudia', apellido: 'Vega', dni: '37123456', correo: 'claudia.vega@email.com', telefono: '221-8888889' },
      { nombre: 'Gustavo', apellido: 'Romero', dni: '25234567', correo: 'gustavo.romero@email.com', telefono: '221-9999990' },
      { nombre: 'Valeria', apellido: 'Jiménez', dni: '38345678', correo: 'valeria.jimenez@email.com', telefono: '221-1111112' },
      // Usuarios adicionales para solicitudes pendientes
      { nombre: 'Martín', apellido: 'Silva', dni: '39456789', correo: 'martin.silva@email.com', telefono: '221-3333334' },
      { nombre: 'Carolina', apellido: 'Pérez', dni: '40567890', correo: 'carolina.perez@email.com', telefono: '221-4444445' },
      { nombre: 'Rodrigo', apellido: 'Gómez', dni: '41678901', correo: 'rodrigo.gomez@email.com', telefono: '221-5555559' },
      { nombre: 'Lucía', apellido: 'Ramírez', dni: '42789012', correo: 'lucia.ramirez@email.com', telefono: '221-6666668' },
      { nombre: 'Sebastián', apellido: 'Moreno', dni: '43890123', correo: 'sebastian.moreno@email.com', telefono: '221-7777779' }
    ];

    const duenios: any[] = [];
    for (const data of dueniosData) {
      const duenio = await prisma.usuario.create({
        data: { ...data, password: hashedPassword, rol: Rol.DUENIO }
      });
      duenios.push(duenio);
    }

    // 6. Crear Domicilios para los 14 complejos
    console.log('🏠 Creando domicilios...');
    const direcciones = [
      { calle: 'Calle 1', altura: 1234, localidadId: localidades[0].id },
      { calle: 'Avenida 60', altura: 2567, localidadId: localidades[1].id },
      { calle: 'Diagonal 74', altura: 890, localidadId: localidades[2].id },
      { calle: 'Calle 122', altura: 3456, localidadId: localidades[3].id },
      { calle: 'Avenida 7', altura: 1890, localidadId: localidades[4].id },
      { calle: 'Calle 50', altura: 2134, localidadId: localidades[5].id },
      { calle: 'Avenida 13', altura: 987, localidadId: localidades[6].id },
      { calle: 'Calle 32', altura: 1567, localidadId: localidades[7].id },
      { calle: 'Diagonal 113', altura: 2890, localidadId: localidades[8].id },
      { calle: 'Avenida 25', altura: 3201, localidadId: localidades[9].id },
      { calle: 'Calle 90', altura: 1456, localidadId: localidades[10].id },
      { calle: 'Avenida 44', altura: 2789, localidadId: localidades[11].id },
      { calle: 'Calle 15', altura: 3567, localidadId: localidades[0].id },
      { calle: 'Diagonal 80', altura: 1234, localidadId: localidades[1].id }
    ];

    const domicilios: any[] = [];
    for (const direccion of direcciones) {
      const domicilio = await prisma.domicilio.create({ data: direccion });
      domicilios.push(domicilio);
    }

    // 7. Crear 14 Complejos APROBADOS
    console.log('📋 Creando 14 complejos aprobados...');
    
    const complejosData = [
      { nombre: 'Megadeportivo La Plata', descripcion: 'Complejo deportivo de primer nivel con múltiples canchas y servicios completos', puntaje: 4.8, cuit: '20301234567', image: 'complejo1.jpg', horarios: 'Lunes a Domingo: 06:00 - 23:00' },
      { nombre: 'Centro de Alto Rendimiento', descripcion: 'Instalaciones profesionales para entrenamiento y competencias de alto nivel', puntaje: 4.9, cuit: '20299876543', image: 'complejo2.jpg', horarios: 'Lunes a Domingo: 06:00 - 23:00' },
      { nombre: 'Club Deportivo Gonnet', descripcion: 'Club familiar con ambiente cálido y canchas bien mantenidas', puntaje: 4.5, cuit: '20314567890', image: 'complejo3.jpg', horarios: 'Martes a Domingo: 09:00 - 22:00' },
      { nombre: 'Complejo Ensenada Sport', descripcion: 'Moderno complejo con tecnología de punta y canchas sintéticas', puntaje: 4.7, cuit: '20327890123', image: 'complejo4.jpg', horarios: 'Lunes a Domingo: 07:00 - 23:00' },
      { nombre: 'Deportivo Los Hornos', descripcion: 'Complejo tradicional con excelente ubicación y precios accesibles', puntaje: 4.3, cuit: '20283456789', image: 'complejo5.jpg', horarios: 'Lunes a Domingo: 09:00 - 22:00' },
      { nombre: 'Arena Tolosa', descripcion: 'Complejo moderno con canchas de última generación', puntaje: 4.6, cuit: '20335678901', image: 'complejo6.jpg', horarios: 'Martes a Domingo: 08:00 - 23:00' },
      { nombre: 'Villa Elisa Sports', descripcion: 'Centro deportivo con enfoque en deportes de equipo', puntaje: 4.4, cuit: '20346789012', image: 'complejo7.jpg', horarios: 'Lunes a Domingo: 10:00 - 22:00' },
      { nombre: 'Berisso Fútbol Club', descripcion: 'Club histórico con tradición en fútbol y otros deportes', puntaje: 4.2, cuit: '20357890123', image: 'complejo8.jpg', horarios: 'Miércoles a Lunes: 15:00 - 23:00' },
      { nombre: 'Ringuelet Deportes', descripcion: 'Complejo familiar con servicios integrales', puntaje: 4.5, cuit: '20278901234', image: 'complejo9.jpg', horarios: 'Lunes a Domingo: 08:00 - 22:00' },
      { nombre: 'Gonnet Premium', descripcion: 'Instalaciones premium con servicios de lujo', puntaje: 4.8, cuit: '20369012345', image: 'complejo10.jpg', horarios: 'Lunes a Domingo: 07:00 - 23:00' },
      { nombre: 'Seguí Sport Center', descripcion: 'Centro deportivo integral con múltiples disciplinas', puntaje: 4.6, cuit: '20251234567', image: 'complejo11.jpg', horarios: 'Martes a Domingo: 09:00 - 23:00' },
      { nombre: 'Villa Elvira Athletic', descripcion: 'Complejo atlético con pistas y canchas profesionales', puntaje: 4.7, cuit: '20372345678', image: 'complejo12.jpg', horarios: 'Lunes a Domingo: 06:00 - 22:00' },
      { nombre: 'Deportivo Central', descripcion: 'Ubicación céntrica con todas las comodidades', puntaje: 4.4, cuit: '20263456789', image: 'complejo13.jpg', horarios: 'Lunes a Domingo: 08:00 - 23:00' },
      { nombre: 'Elite Sports Complex', descripcion: 'Complejo de élite con las mejores instalaciones de la región', puntaje: 4.9, cuit: '20384567890', image: 'complejo14.jpg', horarios: 'Lunes a Domingo: 06:00 - 23:00' }
    ];

    const complejos: any[] = [];
    for (let i = 0; i < complejosData.length; i++) {
      const data = complejosData[i];
      
      // Crear solicitud aprobada
      const solicitud = await prisma.solicitud.create({
        data: {
          cuit: data.cuit,
          estado: EstadoSolicitud.APROBADA,
          usuarioId: duenios[i].id,
          adminId: adminSistema.id,
        }
      });

      // Crear complejo
      const complejo = await prisma.complejo.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          puntaje: data.puntaje,
          cuit: data.cuit,
          image: data.image,
          horarios: data.horarios,
          domicilioId: domicilios[i].id,
          usuarioId: duenios[i].id,
          solicitudId: solicitud.id,
        }
      });
      complejos.push(complejo);
    }

    // 8. Crear solicitudes PENDIENTES para los usuarios adicionales
    console.log('📝 Creando solicitudes pendientes...');
    
    const solicitudesPendientes = [
      { cuit: '20301234568', nombre: 'Complejo Nuevo 1', usuarioIndex: 14 }, // Martín Silva
      { cuit: '20301234569', nombre: 'Centro Deportivo Sur', usuarioIndex: 15 }, // Carolina Pérez  
      { cuit: '20301234570', nombre: 'Arena del Este', usuarioIndex: 16 }, // Rodrigo Gómez
      { cuit: '20301234571', nombre: 'Deportivo Norte', usuarioIndex: 17 }, // Lucía Ramírez
      { cuit: '20301234572', nombre: 'Club Oeste', usuarioIndex: 18 }  // Sebastián Moreno
    ];

    for (const solicitudData of solicitudesPendientes) {
      await prisma.solicitud.create({
        data: {
          cuit: solicitudData.cuit,
          estado: EstadoSolicitud.PENDIENTE,
          usuarioId: duenios[solicitudData.usuarioIndex].id,
        }
      });
    }

    // 9. Asignar servicios a complejos de forma variada
    console.log('🔧 Asignando servicios a complejos...');
    
    const serviciosAsignaciones = [
      [0, 1, 2, 3, 4, 6, 7, 9], // Complejo 1 - Premium
      [0, 1, 2, 4, 5, 6, 8, 11], // Complejo 2 - Alto rendimiento
      [1, 2, 6, 9, 10], // Complejo 3 - Familiar básico
      [0, 1, 2, 3, 5, 6, 7], // Complejo 4 - Moderno
      [1, 2, 6, 10], // Complejo 5 - Tradicional
      [0, 1, 2, 6, 9], // Complejo 6 - Moderno básico
      [1, 2, 3, 6, 10, 11], // Complejo 7 - Deportivo
      [2, 6, 9, 10], // Complejo 8 - Club histórico
      [0, 1, 2, 6, 9, 11], // Complejo 9 - Familiar integral
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Complejo 10 - Premium completo
      [0, 1, 2, 6, 8, 11], // Complejo 11 - Sport center
      [1, 2, 4, 6, 8, 11], // Complejo 12 - Athletic
      [0, 1, 2, 3, 6, 9], // Complejo 13 - Central
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // Complejo 14 - Elite completo
    ];

    for (let i = 0; i < complejos.length; i++) {
      const serviciosIndices = serviciosAsignaciones[i];
      for (const servicioIndex of serviciosIndices) {
        await prisma.complejoServicio.create({
          data: {
            complejoId: complejos[i].id,
            servicioId: servicios[servicioIndex].id
          }
        });
      }
    }

    // 10. Crear 80 Canchas distribuidas en los 14 complejos
    console.log('🏟️ Creando 80 canchas...');
    
    const canchas: any[] = [];
    const canchasPorComplejo = [8, 7, 6, 6, 5, 5, 6, 5, 6, 7, 5, 6, 4, 4]; // Total: 80 canchas
    
    let nroCanchaGlobal = 1001;
    
    for (let compIndex = 0; compIndex < complejos.length; compIndex++) {
      const complejo = complejos[compIndex];
      const cantidadCanchas = canchasPorComplejo[compIndex];
      
      for (let canchaIndex = 0; canchaIndex < cantidadCanchas; canchaIndex++) {
        const deporteIndex = Math.floor(Math.random() * deportes.length);
        const puntaje = Math.random() * (5 - 4) + 4; // Entre 4.0 y 5.0
        
        const descripciones = [
          'Cancha con césped sintético de última generación',
          'Cancha techada con iluminación LED profesional',
          'Cancha al aire libre con excelente mantenimiento',
          'Cancha premium con superficie profesional',
          'Cancha familiar en perfectas condiciones',
          'Cancha moderna con tecnología de punta',
          'Cancha tradicional bien cuidada',
          'Cancha de competición oficial'
        ];
        
        // Generar múltiples imágenes por cancha
        const numeroImagenes = Math.floor(Math.random() * 3) + 2; // Entre 2 y 4 imágenes
        const imagenes: string[] = [];
        for (let imgIndex = 0; imgIndex < numeroImagenes; imgIndex++) {
          if (imgIndex === 0) {
            imagenes.push(`cancha_${deportes[deporteIndex].nombre.toLowerCase().replace(' ', '_')}_${nroCanchaGlobal}.jpg`);
          } else {
            imagenes.push(`cancha_${deportes[deporteIndex].nombre.toLowerCase().replace(' ', '_')}_${nroCanchaGlobal}_thumb${imgIndex}.jpg`);
          }
        }
        
        const cancha = await prisma.cancha.create({
          data: {
            nroCancha: nroCanchaGlobal,
            descripcion: descripciones[Math.floor(Math.random() * descripciones.length)],
            puntaje: parseFloat(puntaje.toFixed(1)),
            image: imagenes,
            complejoId: complejo.id,
            deporteId: deportes[deporteIndex].id,
          }
        });
        
        canchas.push(cancha);
        nroCanchaGlobal++;
      }
    }

    // 11. Crear Cronogramas para todas las canchas con HORARIOS PUNTUALES
    console.log('⏰ Creando cronogramas con horarios puntuales...');
    
    const diasSemana = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
    
    for (const cancha of canchas) {
      for (const dia of diasSemana) {
        // Horarios de mañana temprano (6:00 - 9:00) - Solo para algunos complejos
        if (Math.random() > 0.4) { // 60% tienen horarios matutinos tempranos
          const precioMadrugada = Math.floor(Math.random() * (14000 - 10000) + 10000);
          
          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T06:00:00Z'),
              horaFin: new Date('1970-01-01T07:00:00Z'),
              diaSemana: dia,
              precio: precioMadrugada,
              canchaId: cancha.id,
            }
          });

          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T07:00:00Z'),
              horaFin: new Date('1970-01-01T08:00:00Z'),
              diaSemana: dia,
              precio: precioMadrugada + 500,
              canchaId: cancha.id,
            }
          });

          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T08:00:00Z'),
              horaFin: new Date('1970-01-01T09:00:00Z'),
              diaSemana: dia,
              precio: precioMadrugada + 1000,
              canchaId: cancha.id,
            }
          });
        }

        // Horarios de mañana (9:00 - 13:00) - TODOS LOS COMPLEJOS
        const precioManana = Math.floor(Math.random() * (16000 - 12000) + 12000);
        
        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T09:00:00Z'),
            horaFin: new Date('1970-01-01T10:00:00Z'),
            diaSemana: dia,
            precio: precioManana,
            canchaId: cancha.id,
          }
        });

        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T10:00:00Z'),
            horaFin: new Date('1970-01-01T11:00:00Z'),
            diaSemana: dia,
            precio: precioManana,
            canchaId: cancha.id,
          }
        });

        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T11:00:00Z'),
            horaFin: new Date('1970-01-01T12:00:00Z'),
            diaSemana: dia,
            precio: precioManana + 500,
            canchaId: cancha.id,
          }
        });

        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T12:00:00Z'),
            horaFin: new Date('1970-01-01T13:00:00Z'),
            diaSemana: dia,
            precio: precioManana + 1000,
            canchaId: cancha.id,
          }
        });

        // Horarios de tarde (14:00 - 18:00) - TODOS LOS COMPLEJOS
        const precioTarde = Math.floor(Math.random() * (21000 - 17000) + 17000);
        
        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T14:00:00Z'),
            horaFin: new Date('1970-01-01T15:00:00Z'),
            diaSemana: dia,
            precio: precioTarde,
            canchaId: cancha.id,
          }
        });

        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T15:00:00Z'),
            horaFin: new Date('1970-01-01T16:00:00Z'),
            diaSemana: dia,
            precio: precioTarde,
            canchaId: cancha.id,
          }
        });

        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T16:00:00Z'),
            horaFin: new Date('1970-01-01T17:00:00Z'),
            diaSemana: dia,
            precio: precioTarde + 1000,
            canchaId: cancha.id,
          }
        });

        await prisma.horarioCronograma.create({
          data: {
            horaInicio: new Date('1970-01-01T17:00:00Z'),
            horaFin: new Date('1970-01-01T18:00:00Z'),
            diaSemana: dia,
            precio: precioTarde + 1500,
            canchaId: cancha.id,
          }
        });

        // Horarios de noche (19:00 - 23:00) - Para canchas con iluminación
        if (Math.random() > 0.15) { // 85% de las canchas tienen iluminación nocturna
          const precioNoche = Math.floor(Math.random() * (26000 - 22000) + 22000);
          
          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T19:00:00Z'),
              horaFin: new Date('1970-01-01T20:00:00Z'),
              diaSemana: dia,
              precio: precioNoche,
              canchaId: cancha.id,
            }
          });

          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T20:00:00Z'),
              horaFin: new Date('1970-01-01T21:00:00Z'),
              diaSemana: dia,
              precio: precioNoche,
              canchaId: cancha.id,
            }
          });

          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T21:00:00Z'),
              horaFin: new Date('1970-01-01T22:00:00Z'),
              diaSemana: dia,
              precio: precioNoche + 1000,
              canchaId: cancha.id,
            }
          });

          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date('1970-01-01T22:00:00Z'),
              horaFin: new Date('1970-01-01T23:00:00Z'),
              diaSemana: dia,
              precio: precioNoche - 1000,
              canchaId: cancha.id,
            }
          });
        }
      }
    }

    // 12. Crear turnos disponibles para los próximos 14 días con mejor distribución
    console.log('🎯 Creando turnos disponibles con horarios puntuales...');
    
    const cronogramas = await prisma.horarioCronograma.findMany();
    const hoy = new Date();
    
    for (let dia = 0; dia < 14; dia++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + dia);
      
      const diaSemanaActual = Object.values(DiaSemana)[fecha.getDay() === 0 ? 6 : fecha.getDay() - 1];
      const cronogramasDelDia = cronogramas.filter(c => c.diaSemana === diaSemanaActual);
      
      for (const cronograma of cronogramasDelDia) {
        // 60% de probabilidad de crear el turno (para simular buena disponibilidad)
        if (Math.random() > 0.4) {
          await prisma.turno.create({
            data: {
              fecha: fecha,
              horaInicio: cronograma.horaInicio,
              precio: cronograma.precio,
              reservado: false,
              canchaId: cronograma.canchaId,
            }
          });
        }
      }
    }

    // 13. Crear alquileres y reseñas (aproximadamente 5 reseñas por cancha)
    console.log('📅 Creando alquileres y reseñas...');
    
    const comentariosPositivos = [
      'Excelente cancha, muy bien mantenida y buena atención al cliente',
      'Instalaciones de primera calidad, iluminación perfecta para jugar',
      'Muy buen estado del césped sintético, experiencia increíble',
      'Vestuarios limpios y amplios, muy recomendable el lugar',
      'Perfecto para jugar con amigos, ambiente familiar y cálido',
      'Cancha en perfectas condiciones, precio justo para la calidad',
      'Excelente servicio, personal muy amable y atento',
      'Instalaciones modernas con todos los servicios necesarios',
      'Muy buena ubicación y fácil acceso, estacionamiento amplio',
      'Calidad premium a precio accesible, definitivamente volveremos',
      'Canchas profesionales con tecnología de última generación',
      'Ambiente seguro y bien cuidado, ideal para toda la familia',
      'Superficie de juego excelente, pelotas y arcos en buen estado',
      'Atención personalizada y horarios muy convenientes',
      'Instalaciones limpias y modernas, muy satisfecho con el servicio'
    ];

    const alquileres: any[] = [];
    const totalResenias = Math.floor(canchas.length * 5.2); // Aproximadamente 5 reseñas por cancha
    
    for (let i = 0; i < totalResenias; i++) {
      // Seleccionar una cancha aleatoria
      const canchaAleatoria = canchas[Math.floor(Math.random() * canchas.length)];
      
      // Crear fecha aleatoria en el pasado (últimos 60 días)
      const fechaAleatoria = new Date(hoy);
      fechaAleatoria.setDate(hoy.getDate() - Math.floor(Math.random() * 60));
      
      // Usar horarios puntuales para turnos pasados
      const horariosDisponibles = [
        new Date('1970-01-01T09:00:00Z'),
        new Date('1970-01-01T10:00:00Z'),
        new Date('1970-01-01T11:00:00Z'),
        new Date('1970-01-01T14:00:00Z'),
        new Date('1970-01-01T15:00:00Z'),
        new Date('1970-01-01T16:00:00Z'),
        new Date('1970-01-01T19:00:00Z'),
        new Date('1970-01-01T20:00:00Z'),
        new Date('1970-01-01T21:00:00Z')
      ];
      
      const horarioAleatorio = horariosDisponibles[Math.floor(Math.random() * horariosDisponibles.length)];
      const precioAleatorio = Math.floor(Math.random() * (25000 - 15000) + 15000);
      
      const turno = await prisma.turno.create({
        data: {
          fecha: fechaAleatoria,
          horaInicio: horarioAleatorio,
          precio: precioAleatorio,
          reservado: true,
          canchaId: canchaAleatoria.id,
        }
      });

      // Crear alquiler
      const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
      
      const alquiler = await prisma.alquiler.create({
        data: {
          estado: EstadoAlquiler.FINALIZADO,
          clienteId: clienteAleatorio.id,
          turnos: {
            connect: [{ id: turno.id }]
          }
        }
      });
      
      alquileres.push(alquiler);

      // Crear reseña para este alquiler
      const puntajeResenia = Math.floor(Math.random() * 2) + 4; // Entre 4 y 5 estrellas
      const comentarioAleatorio = comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];
      
      await prisma.resenia.create({
        data: {
          descripcion: comentarioAleatorio,
          puntaje: puntajeResenia,
          alquilerId: alquiler.id,
        }
      });
    }

    // 14. Crear algunos alquileres futuros (sin reseñas)
    console.log('📋 Creando alquileres futuros...');
    
    const turnosFuturos = await prisma.turno.findMany({
      where: {
        fecha: {
          gte: hoy
        },
        reservado: false
      },
      take: 20 // Tomar 20 turnos futuros
    });

    for (let i = 0; i < Math.min(15, turnosFuturos.length); i++) {
      const turno = turnosFuturos[i];
      const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
      
      // Marcar turno como reservado
      await prisma.turno.update({
        where: { id: turno.id },
        data: { reservado: true }
      });

      // Crear alquiler futuro
      await prisma.alquiler.create({
        data: {
          estado: Math.random() > 0.5 ? EstadoAlquiler.PROGRAMADO : EstadoAlquiler.PAGADO,
          clienteId: clienteAleatorio.id,
          turnos: {
            connect: [{ id: turno.id }]
          }
        }
      });
    }

    console.log('✅ Seed completo exitoso!');
    console.log(`📊 Datos creados:`);
    console.log(`   - ${localidades.length} localidades`);
    console.log(`   - ${deportes.length} deportes`);
    console.log(`   - ${servicios.length} servicios`);
    console.log(`   - 1 administrador del sistema`);
    console.log(`   - 1 usuario administrador`);
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${duenios.length} dueños de complejos`);
    console.log(`   - ${complejos.length} complejos deportivos aprobados`);
    console.log(`   - 5 solicitudes pendientes de aprobación`);
    console.log(`   - ${canchas.length} canchas`);
    console.log(`   - ${totalResenias} reseñas distribuidas`);
    console.log(`   - Cronogramas completos con horarios puntuales`);
    console.log(`   - Turnos disponibles para los próximos 14 días`);
    console.log(`   - Servicios asignados a todos los complejos`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
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
