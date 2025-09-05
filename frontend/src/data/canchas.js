import { datosComplejos } from './complejos.js';

/**
 * --- NUEVA FUNCIÓN ---
 * Genera un precio para un turno basado en la hora y el precio base de la cancha.
 * @param {string} hora - La hora del turno (ej: "19:00").
 * @param {number} precioDesde - El precio base de la cancha.
 * @returns {number} - Un precio calculado para el turno.
 */
const generarPrecioTurno = (hora, precioDesde) => {
  if (!precioDesde) {
    // Si no hay precio base, devolvemos un precio por defecto.
    return 10000; 
  }

  let precio = precioDesde;
  const horaNumerica = parseInt(hora.split(':')[0], 10);

  // Aumentar el precio en horarios pico (18:00 en adelante)
  if (horaNumerica >= 18) {
    precio *= 1.3; // Aumento del 30%
  }

  // Añadir una pequeña variación aleatoria para que no todos los precios sean iguales
  const variacion = (Math.random() - 0.5) * (precioDesde * 0.1); // Variación del +/- 5% del precio base
  let precioFinal = precio + variacion;

  // Redondear al múltiplo de 500 más cercano para que los precios sean "limpios"
  return Math.round(precioFinal / 500) * 500;
};


const generarGrillaDeTurnosFija = (complejoId, precioDesde) => {
  const complejo = datosComplejos.find(c => c.id === complejoId);
  if (!complejo || !complejo.horarios) return [];

  const diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  const turnosSemanales = [];

  const parseHorarios = (horariosStr) => {
    const rangos = {};
    const partes = horariosStr.toLowerCase().split(' y ');
    partes.forEach(parte => {
        const match = parte.match(/(lunes a viernes|lunes a sábados|lunes a domingos|martes a domingos|miércoles a domingos|todos los días|lunes|martes|miércoles|jueves|viernes|sábado|domingo) de ([\d:]+) a ([\d:]+)/);
        if (!match) return;

        const [_, diaRango, horaInicio, horaFin] = match;
        const startHour = parseInt(horaInicio.split(':')[0], 10);
        let endHour = parseInt(horaFin.split(':')[0], 10);
        if (endHour === 0) endHour = 24;

        const diasAplicables = [];
        switch (diaRango) {
            case 'lunes a viernes': diasAplicables.push(...diasSemana.slice(0, 5)); break;
            case 'lunes a sábados': diasAplicables.push(...diasSemana.slice(0, 6)); break;
            case 'todos los días':
            case 'lunes a domingos': diasAplicables.push(...diasSemana); break;
            case 'martes a domingos': diasAplicables.push(...diasSemana.slice(1)); break;
            case 'miércoles a domingos': diasAplicables.push(...diasSemana.slice(2)); break;
            default: diasAplicables.push(diaRango.toUpperCase()); break;
        }
        diasAplicables.forEach(d => {
            rangos[d] = { start: startHour, end: endHour };
        });
    });
    return rangos;
  };

  const horariosPorDia = parseHorarios(complejo.horarios);

  diasSemana.forEach(dia => {
    if (horariosPorDia[dia]) {
      const { start, end } = horariosPorDia[dia];
      const horasPosibles = [];
      for (let i = start; i < end; i++) {
        horasPosibles.push(`${i}:00`);
      }

      const horariosDelDia = horasPosibles.slice(0, Math.min(9, horasPosibles.length));
      
      // --- LÓGICA RESTAURADA para generar estados aleatorios ---
      const estados = [
        ...Array(Math.ceil(horariosDelDia.length * 0.55)).fill('disponible'),
        ...Array(Math.floor(horariosDelDia.length * 0.45)).fill('reservado')
      ];
      // Se mezclan los estados para que no aparezcan siempre en el mismo orden
      for (let i = estados.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [estados[i], estados[j]] = [estados[j], estados[i]];
      }

      horariosDelDia.forEach((hora, index) => {
        if (estados[index]) {
          // --- MODIFICACIÓN CLAVE: Se agrega la propiedad 'precio' a cada turno ---
          turnosSemanales.push({ 
            dia, 
            hora, 
            estado: estados[index],
            precio: generarPrecioTurno(hora, precioDesde) // Se genera el precio dinámicamente
          });
        }
      });
    }
  });

  return turnosSemanales;
};

export const datosDeportes = [
  {
    id: 1,
    deporte: 'Fútbol 5',
    canchas: [
      // --- MODIFICACIÓN: Se pasa el 'precioDesde' a la función generadora ---
      { id: 101, complejoId: 1, noCancha: 5, descripcion: 'Césped sintético de última generación.', puntaje: 4.8, precioDesde: 25000, imageUrl: '/images/canchas/futbol5-1.jpg', turnos: generarGrillaDeTurnosFija(1, 25000)},
      { id: 102, complejoId: 2, noCancha: 1, descripcion: 'Cancha de 5 techada con caucho de alta densidad.', puntaje: 4.7, precioDesde: 28000, imageUrl: '/images/canchas/futbol5-2.jpg', turnos: generarGrillaDeTurnosFija(2, 28000)},
      { id: 103, complejoId: 3, noCancha: 2, descripcion: 'No se suspende por lluvia. Excelente iluminación.', puntaje: 4.2, precioDesde: 22000, imageUrl: '/images/canchas/futbol5-3.jpg', turnos: generarGrillaDeTurnosFija(3, 22000)},
      { id: 104, complejoId: 4, noCancha: 3, descripcion: 'Iluminación LED profesional.', puntaje: 4.6, precioDesde: 26000, imageUrl: '/images/canchas/futbol5-4.jpg', turnos: generarGrillaDeTurnosFija(4, 26000)},
      { id: 105, complejoId: 1, noCancha: 6, descripcion: 'Cancha auxiliar para entrenamientos.', puntaje: 4.3, precioDesde: 20000, imageUrl: '/images/canchas/futbol5-5.jpg', turnos: generarGrillaDeTurnosFija(1, 20000)},
      { id: 106, complejoId: 2, noCancha: 2, descripcion: 'Césped recién renovado.', puntaje: 4.8, precioDesde: 29000, imageUrl: '/images/canchas/futbol5-6.jpg', turnos: generarGrillaDeTurnosFija(2, 29000)},
      { id: 107, complejoId: 4, noCancha: 4, descripcion: 'Perfecta para torneos.', puntaje: 4.5, precioDesde: 26000, imageUrl: '/images/canchas/futbol5-7.jpg', turnos: generarGrillaDeTurnosFija(4, 26000)},
      { id: 108, complejoId: 6, noCancha: 3, descripcion: 'La clásica de Estación. Siempre impecable.', puntaje: 4.9, precioDesde: 30000, imageUrl: '/images/canchas/futbol5-8.jpg', turnos: generarGrillaDeTurnosFija(6, 30000)},
    ]
  },
  {
    id: 2,
    deporte: 'Fútbol 11',
    canchas: [
        { id: 201, complejoId: 6, noCancha: 1, descripcion: 'Césped natural con medidas reglamentarias.', puntaje: 4.9, precioDesde: 55000, imageUrl: '/images/canchas/futbol11-1.jpg', turnos: generarGrillaDeTurnosFija(6, 55000)},
        { id: 202, complejoId: 7, noCancha: 1, descripcion: 'Ambiente familiar.', puntaje: 4.4, precioDesde: 48000, imageUrl: '/images/canchas/futbol11-2.jpg', turnos: generarGrillaDeTurnosFija(7, 48000)},
        { id: 203, complejoId: 8, noCancha: 1, descripcion: 'Vestuarios completos.', puntaje: 4.6, precioDesde: 49000, imageUrl: '/images/canchas/futbol11-3.jpg', turnos: generarGrillaDeTurnosFija(8, 49000)},
        { id: 204, complejoId: 6, noCancha: 2, descripcion: 'Cancha auxiliar para entrenamientos.', puntaje: 4.3, precioDesde: 45000, imageUrl: '/images/canchas/futbol11-4.jpg', turnos: generarGrillaDeTurnosFija(6, 45000)},
        { id: 205, complejoId: 11, noCancha: 2, descripcion: 'Cancha de entrenamiento San Luis.', puntaje: 4.5, precioDesde: 47000, imageUrl: '/images/canchas/futbol11-5.jpg', turnos: generarGrillaDeTurnosFija(11, 47000)},
        { id: 206, complejoId: 9, noCancha: 4, descripcion: 'Campo de deportes Santa Bárbara.', puntaje: 4.8, precioDesde: 52000, imageUrl: '/images/canchas/futbol11-6.jpg', turnos: generarGrillaDeTurnosFija(9, 52000)},
    ]
  },
  {
    id: 3,
    deporte: 'Vóley',
    canchas: [
        { id: 301, complejoId: 12, noCancha: 1, descripcion: 'Piso de parquet flotante profesional.', puntaje: 4.8, precioDesde: 15000, imageUrl: '/images/canchas/voley-1.jpg', turnos: generarGrillaDeTurnosFija(12, 15000)},
        { id: 302, complejoId: 13, noCancha: 1, descripcion: 'Cancha auxiliar multiuso.', puntaje: 4.2, precioDesde: 12000, imageUrl: '/images/canchas/voley-2.jpg', turnos: generarGrillaDeTurnosFija(13, 12000)},
        { id: 303, complejoId: 14, noCancha: 5, descripcion: 'Instalaciones modernas y bien mantenidas.', puntaje: 4.7, precioDesde: 16000, imageUrl: '/images/canchas/voley-3.jpg', turnos: generarGrillaDeTurnosFija(14, 16000)},
        { id: 304, complejoId: 12, noCancha: 2, descripcion: 'Gimnasio techado multi-deporte.', puntaje: 4.5, precioDesde: 14000, imageUrl: '/images/canchas/voley-4.jpg', turnos: generarGrillaDeTurnosFija(12, 14000)},
        { id: 305, complejoId: 15, noCancha: 1, descripcion: 'Ideal para partidos recreativos.', puntaje: 4.0, imageUrl: '/images/canchas/voley-5.jpg', turnos: generarGrillaDeTurnosFija(15, 10000)},
        { id: 306, complejoId: 16, noCancha: 1, descripcion: 'Playón deportivo al aire libre.', puntaje: 3.9, imageUrl: '/images/canchas/voley-6.jpg', turnos: generarGrillaDeTurnosFija(16, 10000)},
        { id: 307, complejoId: 17, noCancha: 1, descripcion: 'Gimnasio principal del club.', puntaje: 4.9, precioDesde: 17000, imageUrl: '/images/canchas/voley-7.jpg', turnos: generarGrillaDeTurnosFija(17, 17000)},
        { id: 308, complejoId: 18, noCancha: 1, descripcion: 'Especializado en vóley.', puntaje: 4.6, precioDesde: 15500, imageUrl: '/images/canchas/voley-8.jpg', turnos: generarGrillaDeTurnosFija(18, 15500)},
    ],
  },
  {
    id: 4,
    deporte: 'Básquet',
    canchas: [
        { id: 401, complejoId: 19, noCancha: 1, descripcion: 'Parquet y aros rebatibles.', puntaje: 4.7, precioDesde: 20000, imageUrl: '/images/canchas/basquet-1.jpg', turnos: generarGrillaDeTurnosFija(19, 20000)},
        { id: 402, complejoId: 20, noCancha: 1, descripcion: 'El "Dante Demo", un clásico.', puntaje: 4.9, precioDesde: 22000, imageUrl: '/images/canchas/basquet-2.jpg', turnos: generarGrillaDeTurnosFija(20, 22000)},
        { id: 403, complejoId: 21, noCancha: 1, descripcion: 'Cancha remodelada.', puntaje: 4.3, precioDesde: 18000, imageUrl: '/images/canchas/basquet-3.jpg', turnos: generarGrillaDeTurnosFija(21, 18000)},
        { id: 404, complejoId: 22, noCancha: 1, descripcion: 'Cancha techada.', puntaje: 4.5, precioDesde: 19000, imageUrl: '/images/canchas/basquet-4.jpg', turnos: generarGrillaDeTurnosFija(22, 19000)},
        { id: 405, complejoId: 19, noCancha: 2, descripcion: 'Media cancha para tiro.', puntaje: 4.1, precioDesde: 10000, imageUrl: '/images/canchas/basquet-5.jpg', turnos: generarGrillaDeTurnosFija(19, 10000)},
        { id: 406, complejoId: 23, noCancha: 1, descripcion: 'Club de barrio.', puntaje: 4.0, precioDesde: 17000, imageUrl: '/images/canchas/basquet-6.jpg', turnos: generarGrillaDeTurnosFija(23, 17000)},
        { id: 407, complejoId: 24, noCancha: 1, descripcion: 'Buena iluminación.', puntaje: 4.4, precioDesde: 18500, imageUrl: '/images/canchas/basquet-7.jpg', turnos: generarGrillaDeTurnosFija(24, 18500)},
        { id: 408, complejoId: 25, noCancha: 1, descripcion: 'Cancha outdoor.', puntaje: 3.8, precioDesde: 15000, imageUrl: '/images/canchas/basquet-8.jpg', turnos: generarGrillaDeTurnosFija(25, 15000)},
    ],
  },
  {
    id: 5,
    deporte: 'Handball',
    canchas: [
        { id: 501, complejoId: 26, noCancha: 1, descripcion: 'Medidas oficiales.', puntaje: 4.6, precioDesde: 21000, imageUrl: '/images/canchas/handball-1.jpg', turnos: generarGrillaDeTurnosFija(26, 21000)},
        { id: 502, complejoId: 27, noCancha: 1, descripcion: 'Piso sintético de alto impacto.', puntaje: 4.8, precioDesde: 24000, imageUrl: '/images/canchas/handball-2.jpg', turnos: generarGrillaDeTurnosFija(27, 24000)},
        { id: 503, complejoId: 28, noCancha: 1, descripcion: 'Ideal para entrenamientos.', puntaje: 4.3, precioDesde: 19000, imageUrl: '/images/canchas/handball-3.jpg', turnos: generarGrillaDeTurnosFija(28, 19000)},
        { id: 504, complejoId: 29, noCancha: 1, descripcion: 'Club enfocado en handball.', puntaje: 4.5, precioDesde: 22000, imageUrl: '/images/canchas/handball-4.jpg', turnos: generarGrillaDeTurnosFija(29, 22000)},
        { id: 505, complejoId: 26, noCancha: 2, descripcion: 'Cancha auxiliar.', puntaje: 4.1, precioDesde: 18000, imageUrl: '/images/canchas/handball-5.jpg', turnos: generarGrillaDeTurnosFija(26, 18000)},
        { id: 506, complejoId: 30, noCancha: 1, descripcion: 'Ambiente climatizado.', puntaje: 4.4, precioDesde: 23000, imageUrl: '/images/canchas/handball-6.jpg', turnos: generarGrillaDeTurnosFija(30, 23000)},
        { id: 507, complejoId: 31, noCancha: 1, descripcion: 'Alquiler por hora.', puntaje: 4.0, precioDesde: 20000, imageUrl: '/images/canchas/handball-7.jpg', turnos: generarGrillaDeTurnosFija(31, 20000)},
        { id: 508, complejoId: 32, noCancha: 1, descripcion: 'Instalaciones renovadas.', puntaje: 4.2, precioDesde: 21500, imageUrl: '/images/canchas/handball-8.jpg', turnos: generarGrillaDeTurnosFija(32, 21500)},
    ],
  },
    {
    id: 6,
    deporte: 'Tenis',
    canchas: [
      { id: 601, complejoId: 33, noCancha: 1, descripcion: 'Polvo de ladrillo profesional.', puntaje: 4.9, precioDesde: 15000, imageUrl: '/images/canchas/tenis-1.jpg', turnos: generarGrillaDeTurnosFija(33, 15000)},
      { id: 602, complejoId: 34, noCancha: 2, descripcion: 'Cancha de cemento rápida.', puntaje: 4.6, precioDesde: 12000, imageUrl: '/images/canchas/tenis-2.jpg', turnos: generarGrillaDeTurnosFija(34, 12000)},
      { id: 603, complejoId: 35, noCancha: 1, descripcion: 'Entorno arbolado.', puntaje: 4.5, precioDesde: 14000, imageUrl: '/images/canchas/tenis-3.jpg', turnos: generarGrillaDeTurnosFija(35, 14000)},
      { id: 604, complejoId: 36, noCancha: 3, descripcion: 'Complejo con 4 canchas.', puntaje: 4.3, precioDesde: 11000, imageUrl: '/images/canchas/tenis-4.jpg', turnos: generarGrillaDeTurnosFija(36, 11000)},
      { id: 605, complejoId: 33, noCancha: 2, descripcion: 'Excelente drenaje.', puntaje: 4.8, precioDesde: 15000, imageUrl: '/images/canchas/tenis-5.jpg', turnos: generarGrillaDeTurnosFija(33, 15000)},
      { id: 606, complejoId: 37, noCancha: 1, descripcion: 'Cancha techada.', puntaje: 4.1, precioDesde: 17000, imageUrl: '/images/canchas/tenis-6.jpg', turnos: generarGrillaDeTurnosFija(37, 17000)},
      { id: 607, complejoId: 34, noCancha: 3, descripcion: 'Ideal para clases.', puntaje: 4.6, precioDesde: 14500, imageUrl: '/images/canchas/tenis-7.jpg', turnos: generarGrillaDeTurnosFija(34, 14500)},
      { id: 608, complejoId: 38, noCancha: 1, descripcion: 'Ubicación privilegiada.', puntaje: 4.7, precioDesde: 16000, imageUrl: '/images/canchas/tenis-8.jpg', turnos: generarGrillaDeTurnosFija(38, 16000)},
    ],
  },
  {
    id: 7,
    deporte: 'Pádel',
    canchas: [
      { id: 701, complejoId: 39, noCancha: 1, descripcion: 'Paredes de blindex.', puntaje: 4.9, precioDesde: 18000, imageUrl: '/images/canchas/padel-1.jpg', turnos: generarGrillaDeTurnosFija(39, 18000)},
      { id: 702, complejoId: 40, noCancha: 2, descripcion: '3 canchas de cemento.', puntaje: 4.4, precioDesde: 15000, imageUrl: '/images/canchas/padel-2.jpg', turnos: generarGrillaDeTurnosFija(40, 15000)},
      { id: 703, complejoId: 41, noCancha: 1, descripcion: 'Cancha outdoor.', puntaje: 4.2, precioDesde: 14000, imageUrl: '/images/canchas/padel-3.jpg', turnos: generarGrillaDeTurnosFija(41, 14000)},
      { id: 704, complejoId: 42, noCancha: 3, descripcion: 'Complejo 100% techado.', puntaje: 4.6, precioDesde: 17000, imageUrl: '/images/canchas/padel-4.jpg', turnos: generarGrillaDeTurnosFija(42, 17000)},
      { id: 705, complejoId: 39, noCancha: 2, descripcion: 'Cancha central.', puntaje: 5.0, precioDesde: 20000, imageUrl: '/images/canchas/padel-5.jpg', turnos: generarGrillaDeTurnosFija(39, 20000)},
      { id: 706, complejoId: 43, noCancha: 1, descripcion: 'Canchas de cemento.', puntaje: 4.0, precioDesde: 13000, imageUrl: '/images/canchas/padel-6.jpg', turnos: generarGrillaDeTurnosFija(43, 13000)},
      { id: 707, complejoId: 44, noCancha: 1, descripcion: 'Césped sintético y blindex.', puntaje: 4.7, precioDesde: 18500, imageUrl: '/images/canchas/padel-7.jpg', turnos: generarGrillaDeTurnosFija(44, 18500)},
      { id: 708, complejoId: 41, noCancha: 2, descripcion: 'Ideal para torneos.', puntaje: 4.3, precioDesde: 16000, imageUrl: '/images/canchas/padel-8.jpg', turnos: generarGrillaDeTurnosFija(41, 16000)},
    ]
  },
  {
    id: 8,
    deporte: 'Hockey',
    canchas: [
      { id: 801, complejoId: 11, noCancha: 1, descripcion: 'Césped sintético de agua.', puntaje: 5.0, precioDesde: 35000, imageUrl: '/images/canchas/hockey-1.jpg', turnos: generarGrillaDeTurnosFija(11, 35000)},
      { id: 802, complejoId: 45, noCancha: 1, descripcion: 'Instalaciones de primer nivel.', puntaje: 4.9, precioDesde: 38000, imageUrl: '/images/canchas/hockey-2.jpg', turnos: generarGrillaDeTurnosFija(45, 38000)},
      { id: 803, complejoId: 46, noCancha: 1, descripcion: 'Césped sintético de arena.', puntaje: 4.6, precioDesde: 32000, imageUrl: '/images/canchas/hockey-3.jpg', turnos: generarGrillaDeTurnosFija(46, 32000)},
      { id: 804, complejoId: 11, noCancha: 2, descripcion: 'Cancha auxiliar.', puntaje: 4.5, precioDesde: 30000, imageUrl: '/images/canchas/hockey-4.jpg', turnos: generarGrillaDeTurnosFija(11, 30000)},
      { id: 805, complejoId: 45, noCancha: 2, descripcion: 'Cancha de entrenamiento.', puntaje: 4.7, precioDesde: 36000, imageUrl: '/images/canchas/hockey-5.jpg', turnos: generarGrillaDeTurnosFija(45, 36000)},
      { id: 806, complejoId: 47, noCancha: 1, descripcion: 'Cancha principal.', puntaje: 4.4, precioDesde: 33000, imageUrl: '/images/canchas/hockey-6.jpg', turnos: generarGrillaDeTurnosFija(47, 33000)},
      { id: 807, complejoId: 48, noCancha: 1, descripcion: 'Cancha renovada.', puntaje: 4.2, precioDesde: 29000, imageUrl: '/images/canchas/hockey-7.jpg', turnos: generarGrillaDeTurnosFija(48, 29000)},
      { id: 808, complejoId: 49, noCancha: 1, descripcion: 'Cancha de arena.', puntaje: 4.3, precioDesde: 31000, imageUrl: '/images/canchas/hockey-8.jpg', turnos: generarGrillaDeTurnosFija(49, 31000)},
    ],
  },
];

// Ya no es necesario el último bucle forEach porque los precios se generan dinámicamente
// al llamar a generarGrillaDeTurnosFija.