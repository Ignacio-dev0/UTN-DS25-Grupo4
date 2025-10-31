// backend/prisma/seed_nuevo_esquema.ts
import { PrismaClient, DiaSemana, Rol, EstadoComplejo, EstadoAlquiler, MetodoPago } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed nuevo esquema...');

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
    await prisma.administrador.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.domicilio.deleteMany();
    await prisma.localidad.deleteMany();
    await prisma.deporte.deleteMany();
    await prisma.servicio.deleteMany();

    // 1. Crear 8 Localidades (una por complejo)
    console.log('📍 Creando 8 localidades...');
    const localidadesData = [
      { nombre: 'La Plata' },
      { nombre: 'City Bell' }, 
      { nombre: 'Gonnet' },
      { nombre: 'Ensenada' },
      { nombre: 'Los Hornos' },
      { nombre: 'Tolosa' },
      { nombre: 'Villa Elisa' },
      { nombre: 'Berisso' }
    ];
    const localidades = await prisma.localidad.createManyAndReturn({ data: localidadesData });

    // 2. Crear 8 Deportes
    console.log('⚽ Creando 8 deportes...');
    const deportesData = [
      { nombre: 'Fútbol 5', icono: '⚽' },
      { nombre: 'Fútbol 11', icono: '🥅' },
      { nombre: 'Vóley', icono: '🏐' },
      { nombre: 'Básquet', icono: '🏀' },
      { nombre: 'Handball', icono: '🤾' },
      { nombre: 'Tenis', icono: '🎾' },
      { nombre: 'Pádel', icono: '🎾' },
      { nombre: 'Hockey', icono: '🏑' }
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

    // 4. Crear Administrador del sistema
    console.log('👤 Creando administrador del sistema...');
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
        nombre: 'Admin', apellido: 'Sistema', dni: '11111111', email: 'admin@admin.com',
        password: hashedUserAdminPassword, telefono: '221-0000000', rol: Rol.ADMINISTRADOR,
      }
    });

    // 3 Clientes
    const clientesData = [
      { nombre: 'Nacho', apellido: 'Benitez', dni: '40123456', email: 'nacho.benitez@email.com', telefono: '221-5555555' },
      { nombre: 'María', apellido: 'González', dni: '39876543', email: 'maria.gonzalez@email.com', telefono: '221-5555556' },
      { nombre: 'Carlos', apellido: 'Rodríguez', dni: '41234567', email: 'carlos.rodriguez@email.com', telefono: '221-5555557' }
    ];

    const clientes: any[] = [];
    for (const data of clientesData) {
      const cliente = await prisma.usuario.create({
        data: { ...data, password: hashedPassword, rol: Rol.CLIENTE }
      });
      clientes.push(cliente);
    }

    // 8 Dueños (uno por complejo)
    const dueniosData = [
      { nombre: 'Roberto', apellido: 'Méndez', dni: '30123456', email: 'roberto.mendez@email.com', telefono: '221-6666666' },
      { nombre: 'Ana', apellido: 'Martínez', dni: '29987654', email: 'ana.martinez@email.com', telefono: '221-7777777' },
      { nombre: 'Diego', apellido: 'Fernández', dni: '31456789', email: 'diego.fernandez@email.com', telefono: '221-8888888' },
      { nombre: 'Laura', apellido: 'Sánchez', dni: '32789012', email: 'laura.sanchez@email.com', telefono: '221-9999999' },
      { nombre: 'Jorge', apellido: 'López', dni: '28345678', email: 'jorge.lopez@email.com', telefono: '221-1111111' },
      { nombre: 'Patricia', apellido: 'García', dni: '33567890', email: 'patricia.garcia@email.com', telefono: '221-2222222' },
      { nombre: 'Alejandro', apellido: 'Ruiz', dni: '34678901', email: 'alejandro.ruiz@email.com', telefono: '221-3333333' },
      { nombre: 'Mónica', apellido: 'Torres', dni: '35789012', email: 'monica.torres@email.com', telefono: '221-4444444' }
    ];

    const duenios: any[] = [];
    for (const data of dueniosData) {
      const duenio = await prisma.usuario.create({
        data: { ...data, password: hashedPassword, rol: Rol.DUENIO }
      });
      duenios.push(duenio);
    }

    // 5 Usuarios adicionales para solicitudes pendientes
    const usuariosPendientesData = [
      { nombre: 'Martín', apellido: 'Silva', dni: '39456789', email: 'martin.silva@email.com', telefono: '221-3333334' },
      { nombre: 'Carolina', apellido: 'Pérez', dni: '40567890', email: 'carolina.perez@email.com', telefono: '221-4444445' },
      { nombre: 'Rodrigo', apellido: 'Gómez', dni: '41678901', email: 'rodrigo.gomez@email.com', telefono: '221-5555559' },
      { nombre: 'Lucía', apellido: 'Ramírez', dni: '42789012', email: 'lucia.ramirez@email.com', telefono: '221-6666668' },
      { nombre: 'Sebastián', apellido: 'Moreno', dni: '43890123', email: 'sebastian.moreno@email.com', telefono: '221-7777779' }
    ];

    const usuariosPendientes: any[] = [];
    for (const data of usuariosPendientesData) {
      const usuario = await prisma.usuario.create({
        data: { ...data, password: hashedPassword, rol: Rol.DUENIO }
      });
      usuariosPendientes.push(usuario);
    }

    // 6. Crear 8 Domicilios (uno por complejo)
    console.log('🏠 Creando 8 domicilios...');
    const direcciones = [
      { calle: 'Calle 1', altura: 1234, localidadId: localidades[0].id },
      { calle: 'Avenida 60', altura: 2567, localidadId: localidades[1].id },
      { calle: 'Diagonal 74', altura: 890, localidadId: localidades[2].id },
      { calle: 'Calle 122', altura: 3456, localidadId: localidades[3].id },
      { calle: 'Avenida 7', altura: 1890, localidadId: localidades[4].id },
      { calle: 'Calle 50', altura: 2134, localidadId: localidades[5].id },
      { calle: 'Avenida 13', altura: 987, localidadId: localidades[6].id },
      { calle: 'Calle 32', altura: 1567, localidadId: localidades[7].id }
    ];

    const domicilios: any[] = [];
    for (const direccion of direcciones) {
      const domicilio = await prisma.domicilio.create({ data: direccion });
      domicilios.push(domicilio);
    }

    // 7. Crear 8 Complejos APROBADOS
    console.log('📋 Creando 8 complejos aprobados...');
    
    const complejosData = [
      { nombre: 'Megadeportivo La Plata', descripcion: 'Complejo deportivo de primer nivel', puntaje: 4.8, cuit: '20301234567', horarios: 'Lunes a Domingo: 07:00 - 23:00' },
      { nombre: 'Centro Deportivo City Bell', descripcion: 'Instalaciones modernas en City Bell', puntaje: 4.7, cuit: '20299876543', horarios: 'Lunes a Domingo: 08:00 - 22:00' },
      { nombre: 'Club Deportivo Gonnet', descripcion: 'Club familiar en Gonnet', puntaje: 4.5, cuit: '20314567890', horarios: 'Martes a Domingo: 09:00 - 21:00' },
      { nombre: 'Complejo Ensenada Sport', descripcion: 'Moderno complejo en Ensenada', puntaje: 4.6, cuit: '20327890123', horarios: 'Lunes a Domingo: 07:00 - 23:00' },
      { nombre: 'Deportivo Los Hornos', descripcion: 'Complejo tradicional Los Hornos', puntaje: 4.4, cuit: '20283456789', horarios: 'Lunes a Domingo: 08:00 - 22:00' },
      { nombre: 'Arena Tolosa', descripcion: 'Complejo moderno Tolosa', puntaje: 4.7, cuit: '20335678901', horarios: 'Lunes a Domingo: 07:00 - 23:00' },
      { nombre: 'Villa Elisa Sports', descripcion: 'Centro deportivo Villa Elisa', puntaje: 4.5, cuit: '20346789012', horarios: 'Lunes a Domingo: 08:00 - 22:00' },
      { nombre: 'Berisso Athletic Club', descripcion: 'Club atlético Berisso', puntaje: 4.3, cuit: '20357890123', horarios: 'Miércoles a Lunes: 09:00 - 21:00' }
    ];

    const complejos: any[] = [];
    for (let i = 0; i < complejosData.length; i++) {
      const data = complejosData[i];
      
      // Crear complejo APROBADO (sin imagen por ahora, se asignará después)
      const complejo = await prisma.complejo.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          puntaje: data.puntaje,
          cuit: data.cuit,
          image: null, // Se asignará después
          horarios: data.horarios,
          domicilioId: domicilios[i].id,
          usuarioId: duenios[i].id,
          estado: EstadoComplejo.APROBADO,
          administradorId: adminSistema.id,
        }
      });
      complejos.push(complejo);
    }

    // 8. Crear 5 complejos PENDIENTES (sin aprobar aún)
    console.log('📝 Creando 5 complejos pendientes...');
    
    const complejosPendientesData = [
      { nombre: 'Complejo Pendiente 1', cuit: '20301234568', localidadIndex: 0, descripcion: 'Complejo en revisión', puntaje: 0, horarios: 'Por definir' },
      { nombre: 'Complejo Pendiente 2', cuit: '20301234569', localidadIndex: 1, descripcion: 'Complejo en revisión', puntaje: 0, horarios: 'Por definir' },
      { nombre: 'Complejo Pendiente 3', cuit: '20301234570', localidadIndex: 2, descripcion: 'Complejo en revisión', puntaje: 0, horarios: 'Por definir' },
      { nombre: 'Complejo Pendiente 4', cuit: '20301234571', localidadIndex: 3, descripcion: 'Complejo en revisión', puntaje: 0, horarios: 'Por definir' },
      { nombre: 'Complejo Pendiente 5', cuit: '20301234572', localidadIndex: 4, descripcion: 'Complejo en revisión', puntaje: 0, horarios: 'Por definir' }
    ];

    for (let i = 0; i < complejosPendientesData.length; i++) {
      const data = complejosPendientesData[i];
      // Crear domicilio para el complejo pendiente
      const domicilioPendiente = await prisma.domicilio.create({ 
        data: { 
          calle: 'Pendiente ' + (i+1), 
          altura: 1000 + i, 
          localidadId: localidades[data.localidadIndex].id 
        } 
      });
      
      await prisma.complejo.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          puntaje: data.puntaje,
          cuit: data.cuit,
          image: null,
          horarios: data.horarios,
          domicilioId: domicilioPendiente.id,
          usuarioId: usuariosPendientes[i].id,
          estado: EstadoComplejo.PENDIENTE,
        }
      });
    }

    // 9. Asignar servicios a complejos de forma variada
    console.log('🔧 Asignando servicios a complejos...');
    
    const serviciosAsignaciones = [
      [0, 1, 2, 3, 4, 6, 7, 9], // Complejo 1 - Premium
      [0, 1, 2, 4, 5, 6, 8, 11], // Complejo 2 - Moderno
      [1, 2, 6, 9, 10], // Complejo 3 - Básico
      [0, 1, 2, 3, 5, 6, 7], // Complejo 4 - Completo
      [1, 2, 6, 10], // Complejo 5 - Tradicional
      [0, 1, 2, 6, 9], // Complejo 6 - Estándar
      [1, 2, 3, 6, 10, 11], // Complejo 7 - Familiar
      [2, 6, 9, 10] // Complejo 8 - Básico
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

    // 10. Crear 64 Canchas (8 complejos × 8 canchas = 1 cancha por deporte por complejo)
    console.log('🏟️ Creando 64 canchas (8 por complejo, una por deporte)...');
    
    const canchas: any[] = [];
    let nroCanchaGlobal = 1001;
    let imagenIndex = 1;
    
    // Mapeo de deportes a nombres de archivos de imagen
    const deporteImagenMap: { [key: string]: string[] } = {
      'Fútbol 5': ['futbol5_01.jpg', 'futbol5_02.jpg', 'futbol5_03.jpg', 'futbol5_04.jpg', 'futbol5_05.jpg', 'futbol5_06.jpg', 'futbol5_07.jpg', 'futbol5_08.jpg'],
      'Fútbol 11': ['futbol11_01.jpg', 'futbol11_02.jpg', 'futbol11_03.jpg', 'futbol11_04.jpg', 'futbol11_05.jpg', 'futbol11_06.jpg', 'futbol11_07.jpg', 'futbol11_08.jpg'],
      'Vóley': ['voley_01.jpg', 'voley_02.jpg', 'voley_03.jpg', 'voley_04.jpg', 'voley_05.jpg', 'voley_06.jpg', 'voley_07.jpg', 'voley_08.jpg'],
      'Básquet': ['basquet_01.jpg', 'basquet_02.jpg', 'basquet_03.jpg', 'basquet_04.jpg', 'basquet_05.jpg', 'basquet_06.jpg', 'basquet_07.jpg', 'basquet_08.jpg'],
      'Handball': ['handball_01.jpg', 'handball_02.jpg', 'handball_03.jpg', 'handball_04.jpg', 'handball_05.jpg', 'handball_06.jpg', 'handball_07.jpg', 'handball_08.jpg'],
      'Tenis': ['tenis_01.jpg', 'tenis_02.jpg', 'tenis_03.jpg', 'tenis_04.jpg', 'tenis_05.jpg', 'tenis_06.jpg', 'tenis_07.jpg', 'tenis_08.jpg'],
      'Pádel': ['padel_01.jpg', 'padel_02.jpg', 'padel_03.jpg', 'padel_04.jpg', 'padel_05.jpg', 'padel_06.jpg', 'padel_07.jpg', 'padel_08.jpg'],
      'Hockey': ['hockey_01.jpg', 'hockey_02.jpg', 'hockey_03.jpg', 'hockey_04.jpg', 'hockey_05.jpg', 'hockey_06.jpg', 'hockey_07.jpg', 'hockey_08.jpg']
    };
    
    for (let compIndex = 0; compIndex < complejos.length; compIndex++) {
      const complejo = complejos[compIndex];
      
      // Crear una cancha para cada deporte
      for (let deporteIndex = 0; deporteIndex < deportes.length; deporteIndex++) {
        const deporte = deportes[deporteIndex];
        const puntaje = Math.random() * (5 - 4) + 4; // Entre 4.0 y 5.0
        
        const descripciones = [
          `Cancha de ${deporte.nombre} con césped sintético de última generación`,
          `Cancha de ${deporte.nombre} techada con iluminación LED profesional`,
          `Cancha de ${deporte.nombre} al aire libre con excelente mantenimiento`,
          `Cancha de ${deporte.nombre} premium con superficie profesional`,
          `Cancha de ${deporte.nombre} en perfectas condiciones`,
          `Cancha de ${deporte.nombre} moderna con tecnología de punta`,
          `Cancha de ${deporte.nombre} tradicional bien cuidada`,
          `Cancha de ${deporte.nombre} de competición oficial`
        ];
        
        // Asignar imagen única del deporte correspondiente
        const imagenesDeporte = deporteImagenMap[deporte.nombre];
        const imagenCancha = imagenesDeporte[compIndex]; // Usa el índice del complejo para que sea única
        
        const cancha = await prisma.cancha.create({
          data: {
            nroCancha: nroCanchaGlobal,
            descripcion: descripciones[Math.floor(Math.random() * descripciones.length)],
            puntaje: parseFloat(puntaje.toFixed(1)),
            image: [imagenCancha], // Solo una imagen por cancha
            complejoId: complejo.id,
            deporteId: deporte.id,
          }
        });
        
        canchas.push(cancha);
        nroCanchaGlobal++;
      }
    }

    // Actualizar complejos con imagen de una de sus canchas
    console.log('🖼️ Asignando imágenes a complejos...');
    for (let i = 0; i < complejos.length; i++) {
      const complejo = complejos[i];
      // Encontrar la primera cancha de fútbol 5 del complejo para usar su imagen
      const canchaFutbol5 = canchas.find(c => 
        c.complejoId === complejo.id && 
        c.deporteId === deportes.find(d => d.nombre === 'Fútbol 5')?.id
      );
      
      if (canchaFutbol5 && canchaFutbol5.image.length > 0) {
        await prisma.complejo.update({
          where: { id: complejo.id },
          data: { image: canchaFutbol5.image[0] }
        });
      }
    }

    // 11. Crear Cronogramas con horarios puntuales para todas las canchas
    console.log('⏰ Creando cronogramas con horarios puntuales...');
    
    const diasSemana = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];
    const horariosCompletos = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]; // 17 horarios
    
    for (const cancha of canchas) {
      const complejo = complejos.find(c => c.id === cancha.complejoId);
      if (!complejo) continue;
      
      // Determinar horarios según el complejo
      let horariosCancha: number[] = [];
      if (complejo.horarios.includes('07:00 - 23:00')) {
        horariosCancha = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]; // 17 horarios
      } else if (complejo.horarios.includes('08:00 - 22:00')) {
        horariosCancha = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // 15 horarios
      } else if (complejo.horarios.includes('09:00 - 21:00')) {
        horariosCancha = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]; // 13 horarios
      } else {
        horariosCancha = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]; // Default
      }
      
      for (const dia of diasSemana) {
        for (const hora of horariosCancha) {
          let precio: number;
          
          // Pricing según horario
          if (hora >= 7 && hora <= 11) {
            precio = Math.floor(Math.random() * (15000 - 10000) + 10000); // Mañana
          } else if (hora >= 12 && hora <= 17) {
            precio = Math.floor(Math.random() * (20000 - 15000) + 15000); // Tarde
          } else {
            precio = Math.floor(Math.random() * (25000 - 20000) + 20000); // Noche
          }
          
          await prisma.horarioCronograma.create({
            data: {
              horaInicio: new Date(`1970-01-01T${hora.toString().padStart(2, '0')}:00:00Z`),
              horaFin: new Date(`1970-01-01T${(hora + 1).toString().padStart(2, '0')}:00:00Z`),
              diaSemana: dia,
              precio: precio,
              canchaId: cancha.id,
            }
          });
        }
      }
    }

    // 12. Crear turnos disponibles para los próximos 7 días (reducido a ~5000)
    console.log('🎯 Creando turnos disponibles (aprox. 7 días)...');
    
    const cronogramas = await prisma.horarioCronograma.findMany();
    const hoy = new Date();
    const turnosData = [];
    
    // MODIFICADO: de 14 a 7 días para reducir a la mitad los turnos
    for (let dia = 0; dia < 7; dia++) { 
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + dia);
      
      const diaSemanaActual = Object.values(DiaSemana)[fecha.getDay() === 0 ? 6 : fecha.getDay() - 1];
      const cronogramasDelDia = cronogramas.filter(c => c.diaSemana === diaSemanaActual);
      
      for (const cronograma of cronogramasDelDia) {
        // 75% de probabilidad de crear el turno
        if (Math.random() > 0.25) {
          turnosData.push({
            fecha: fecha,
            horaInicio: cronograma.horaInicio,
            precio: cronograma.precio,
            reservado: false,
            canchaId: cronograma.canchaId,
          });
        }
      }
    }

    // Crear turnos en lotes de 100
    for (let i = 0; i < turnosData.length; i += 100) {
      const batch = turnosData.slice(i, i + 100);
      await prisma.turno.createMany({
        data: batch
      });
      console.log(`   Creados ${Math.min(i + 100, turnosData.length)} de ${turnosData.length} turnos...`);
    }

    // 13. Marcar 25% de turnos como ocupados
    console.log('📅 Marcando 25% de turnos como ocupados...');
    
    const todosLosTurnos = await prisma.turno.findMany({ where: { reservado: false } });
    const turnosAOcupar = Math.floor(todosLosTurnos.length * 0.25);
    
    // Seleccionar turnos aleatorios para ocupar
    const turnosSeleccionados = [];
    const turnosDisponibles = [...todosLosTurnos];
    
    for (let i = 0; i < turnosAOcupar; i++) {
      const indiceRandom = Math.floor(Math.random() * turnosDisponibles.length);
      const turnoRandom = turnosDisponibles.splice(indiceRandom, 1)[0];
      const clienteRandom = clientes[Math.floor(Math.random() * clientes.length)];
      turnosSeleccionados.push({
        turnoId: turnoRandom.id,
        clienteId: clienteRandom.id
      });
    }

    // Actualizar turnos en lotes
    await prisma.turno.updateMany({
      where: {
        id: { in: turnosSeleccionados.map(t => t.turnoId) }
      },
      data: { reservado: true }
    });

    // Crear alquileres en lotes de 50 (secuencialmente para evitar sobrecarga de pool)
    for (let i = 0; i < turnosSeleccionados.length; i += 50) {
      const batch = turnosSeleccionados.slice(i, i + 50);
      
      for (const turno of batch) { // Bucle secuencial
        await prisma.alquiler.create({ // Espera a que cada creación termine
          data: {
            estado: EstadoAlquiler.FINALIZADO,
            clienteId: turno.clienteId,
            turnos: {
              connect: [{ id: turno.turnoId }]
            }
          }
        });
      }
      
      console.log(`   Procesados ${Math.min(i + 50, turnosSeleccionados.length)} de ${turnosSeleccionados.length} alquileres...`);
    }

        // 14. Crear 10 reseñas por cancha (640 reseñas total)
    console.log('⭐ Creando 10 reseñas por cancha (640 total)...');
    
    const comentariosPositivos = [
      'Excelente cancha, muy bien mantenida y buena atención al cliente',
      'Instalaciones de primera calidad, iluminación perfecta para jugar',
      'Muy buen estado del césped sintético, experiencia increíble',
      'Vestuarios limpios y amplios, muy recomendable el lugar',
      'Perfecto para jugar con amigos, ambiente familiar y cálido',
      'Precio justo por la calidad ofrecida, volveremos pronto',
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

    // Crear datos para reseñas en lotes
    const reseniasData = [];
    const turnosReseniasData: any[] = [];
    const alquileresData = [];

    let totalResenias = 0;
    for (const cancha of canchas) {
      for (let i = 0; i < 10; i++) {
        // Crear fecha aleatoria en el pasado (últimos 90 días)
        const fechaAleatoria = new Date(hoy);
        fechaAleatoria.setDate(hoy.getDate() - Math.floor(Math.random() * 90));
        
        // Datos del turno
        const horaAleatoria = Math.floor(Math.random() * 17) + 7; // Entre 7 y 23
        const precioAleatorio = Math.floor(Math.random() * (25000 - 10000) + 10000);
        const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
        
        turnosReseniasData.push({
          fecha: fechaAleatoria,
          horaInicio: new Date(`1970-01-01T${horaAleatoria.toString().padStart(2, '0')}:00:00Z`),
          precio: precioAleatorio,
          reservado: true,
          canchaId: cancha.id,
        });

        totalResenias++;
      }
    }

    // Crear turnos para reseñas en lotes
    for (let i = 0; i < turnosReseniasData.length; i += 100) {
      const batch = turnosReseniasData.slice(i, i + 100);
      await prisma.turno.createMany({ data: batch });
      console.log(`   Creados ${Math.min(i + 100, turnosReseniasData.length)} de ${turnosReseniasData.length} turnos para reseñas...`);
    }

    // Obtener los turnos creados para las reseñas
    const turnosParaResenias = await prisma.turno.findMany({
      where: {
        reservado: true,
        fecha: {
          lt: hoy
        }
      },
      orderBy: { id: 'desc' },
      take: totalResenias
    });

    // Crear alquileres y reseñas (secuencialmente para evitar sobrecarga de pool)
    for (let i = 0; i < turnosParaResenias.length; i += 50) {
      const batch = turnosParaResenias.slice(i, i + 50);
      
      const alquileresCreados = [];
      // Crear alquileres para este lote (secuencialmente)
      for (const turno of batch) {
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
        alquileresCreados.push(alquiler);
      }
      
      // Crear reseñas para este lote (secuencialmente)
      for (const alquiler of alquileresCreados) {
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
      
      console.log(`   Procesadas ${Math.min(i + 50, turnosParaResenias.length)} de ${turnosParaResenias.length} reseñas...`);
    }

    console.log('✅ Seed nuevo esquema completado exitosamente!');
    console.log(`📊 Datos creados:`);
    console.log(`   - ${localidades.length} localidades`);
    console.log(`   - ${deportes.length} deportes`);
    console.log(`   - ${servicios.length} servicios`);
    console.log(`   - 1 administrador del sistema`);
    console.log(`   - 1 usuario administrador`);
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${duenios.length} dueños de complejos`);
    console.log(`   - ${usuariosPendientes.length} usuarios con solicitudes pendientes`);
    console.log(`   - ${complejos.length} complejos deportivos aprobados`);
    console.log(`   - 5 solicitudes pendientes`);
    console.log(`   - ${canchas.length} canchas (8 por complejo, una por deporte)`);
    console.log(`   - 640 reseñas (10 por cancha)`);
    console.log(`   - Cronogramas con horarios puntuales (7:00-23:00)`);
    console.log(`   - Turnos disponibles (7 días) con 25% ocupados`);
    console.log(`   - 64 imágenes únicas asignadas`);

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

