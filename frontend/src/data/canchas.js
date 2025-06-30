const generarTurnos = () => {
  const turnos = [];
  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const horas = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  let turnosPosibles = [];
  dias.forEach(dia => {
    horas.forEach(hora => {
      turnosPosibles.push({ dia, hora });
    });
  });

  turnosPosibles.sort(() => 0.5 - Math.random());
  for (let i = 0; i < 16; i++) {
    if(turnosPosibles[i]) {
        turnos.push({
          ...turnosPosibles[i],
          estado: i < 8 ? 'reservado' : 'disponible',
        });
    }
  }

  return turnos;
};


export const datosDeportes = [
  {
    id: 1,
    deporte: 'Fútbol 5',
    canchas: [
      { id: 101, complejoId: 1, noCancha: 5, descripcion: 'Césped sintético de última generación.', puntaje: 4.8, precioDesde: 25000, imageUrl: '/images/canchas/futbol5-1.jpg', turnos: generarTurnos()},
      { id: 102, complejoId: 2, noCancha: 1, descripcion: 'Cancha de 5 techada con caucho de alta densidad.', puntaje: 4.7, precioDesde: 28000, imageUrl: '/images/canchas/futbol5-2.jpg', turnos: generarTurnos()},
      { id: 103, complejoId: 3, noCancha: 2, descripcion: 'No se suspende por lluvia. Excelente iluminación.', puntaje: 4.2, precioDesde: 22000, imageUrl: '/images/canchas/futbol5-3.jpg', turnos: generarTurnos()},
      { id: 104, complejoId: 4, noCancha: 3, descripcion: 'Iluminación LED profesional.', puntaje: 4.6, precioDesde: 26000, imageUrl: '/images/canchas/futbol5-4.jpg', turnos: generarTurnos()},
      { id: 105, complejoId: 1, noCancha: 6, descripcion: 'Cancha auxiliar para entrenamientos.', puntaje: 4.3, precioDesde: 20000, imageUrl: '/images/canchas/futbol5-5.jpg', turnos: generarTurnos()},
      { id: 106, complejoId: 2, noCancha: 2, descripcion: 'Césped recién renovado.', puntaje: 4.8, precioDesde: 29000, imageUrl: '/images/canchas/futbol5-6.jpg', turnos: generarTurnos()},
      { id: 107, complejoId: 4, noCancha: 4, descripcion: 'Perfecta para torneos.', puntaje: 4.5, precioDesde: 26000, imageUrl: '/images/canchas/futbol5-7.jpg', turnos: generarTurnos()},
      { id: 108, complejoId: 6, noCancha: 3, descripcion: 'La clásica de Estación. Siempre impecable.', puntaje: 4.9, precioDesde: 30000, imageUrl: '/images/canchas/futbol5-8.jpg', turnos: generarTurnos()},
    ]
  },
  {
    id: 2,
    deporte: 'Fútbol 11',
    canchas: [
        { id: 201, complejoId: 6, noCancha: 1, descripcion: 'Césped natural con medidas reglamentarias.', puntaje: 4.9, precioDesde: 55000, imageUrl: '/images/canchas/futbol11-1.jpg', turnos: generarTurnos()},
        { id: 202, complejoId: 7, noCancha: 1, descripcion: 'Ambiente familiar.', puntaje: 4.4, precioDesde: 48000, imageUrl: '/images/canchas/futbol11-2.jpg', turnos: generarTurnos()},
        { id: 203, complejoId: 8, noCancha: 1, descripcion: 'Vestuarios completos.', puntaje: 4.6, precioDesde: 49000, imageUrl: '/images/canchas/futbol11-3.jpg', turnos: generarTurnos()},
        { id: 204, complejoId: 6, noCancha: 2, descripcion: 'Cancha auxiliar para entrenamientos.', puntaje: 4.3, precioDesde: 45000, imageUrl: '/images/canchas/futbol11-4.jpg', turnos: generarTurnos()},
        { id: 205, complejoId: 11, noCancha: 2, descripcion: 'Cancha de entrenamiento San Luis.', puntaje: 4.5, precioDesde: 47000, imageUrl: '/images/canchas/futbol11-5.jpg', turnos: generarTurnos()},
        { id: 206, complejoId: 9, noCancha: 4, descripcion: 'Campo de deportes Santa Bárbara.', puntaje: 4.8, precioDesde: 52000, imageUrl: '/images/canchas/futbol11-6.jpg', turnos: generarTurnos()},
    ]
  },
  {
    id: 3,
    deporte: 'Vóley',
    canchas: [
        { id: 301, complejoId: 12, noCancha: 1, descripcion: 'Piso de parquet flotante profesional.', puntaje: 4.8, precioDesde: 15000, imageUrl: '/images/canchas/voley-1.jpg', turnos: generarTurnos()},
        { id: 302, complejoId: 13, noCancha: 1, descripcion: 'Cancha auxiliar multiuso.', puntaje: 4.2, precioDesde: 12000, imageUrl: '/images/canchas/voley-2.jpg', turnos: generarTurnos()},
        { id: 303, complejoId: 14, noCancha: 5, descripcion: 'Instalaciones modernas y bien mantenidas.', puntaje: 4.7, precioDesde: 16000, imageUrl: '/images/canchas/voley-3.jpg', turnos: generarTurnos()},
        { id: 304, complejoId: 12, noCancha: 2, descripcion: 'Gimnasio techado multi-deporte.', puntaje: 4.5, precioDesde: 14000, imageUrl: '/images/canchas/voley-4.jpg', turnos: generarTurnos()},
        { id: 305, complejoId: 15, noCancha: 1, descripcion: 'Ideal para partidos recreativos.', puntaje: 4.0, imageUrl: '/images/canchas/voley-5.jpg', turnos: generarTurnos()},
        { id: 306, complejoId: 16, noCancha: 1, descripcion: 'Playón deportivo al aire libre.', puntaje: 3.9, imageUrl: '/images/canchas/voley-6.jpg', turnos: generarTurnos()},
        { id: 307, complejoId: 17, noCancha: 1, descripcion: 'Gimnasio principal del club.', puntaje: 4.9, precioDesde: 17000, imageUrl: '/images/canchas/voley-7.jpg', turnos: generarTurnos()},
        { id: 308, complejoId: 18, noCancha: 1, descripcion: 'Especializado en vóley.', puntaje: 4.6, precioDesde: 15500, imageUrl: '/images/canchas/voley-8.jpg', turnos: generarTurnos()},
    ],
  },
  {
    id: 4,
    deporte: 'Básquet',
    canchas: [
        { id: 401, complejoId: 19, noCancha: 1, descripcion: 'Parquet y aros rebatibles.', puntaje: 4.7, precioDesde: 20000, imageUrl: '/images/canchas/basquet-1.jpg', turnos: generarTurnos()},
        { id: 402, complejoId: 20, noCancha: 1, descripcion: 'El "Dante Demo", un clásico.', puntaje: 4.9, precioDesde: 22000, imageUrl: '/images/canchas/basquet-2.jpg', turnos: generarTurnos()},
        { id: 403, complejoId: 21, noCancha: 1, descripcion: 'Cancha remodelada.', puntaje: 4.3, precioDesde: 18000, imageUrl: '/images/canchas/basquet-3.jpg', turnos: generarTurnos()},
        { id: 404, complejoId: 22, noCancha: 1, descripcion: 'Cancha techada.', puntaje: 4.5, precioDesde: 19000, imageUrl: '/images/canchas/basquet-4.jpg', turnos: generarTurnos()},
        { id: 405, complejoId: 19, noCancha: 2, descripcion: 'Media cancha para tiro.', puntaje: 4.1, precioDesde: 10000, imageUrl: '/images/canchas/basquet-5.jpg', turnos: generarTurnos()},
        { id: 406, complejoId: 23, noCancha: 1, descripcion: 'Club de barrio.', puntaje: 4.0, precioDesde: 17000, imageUrl: '/images/canchas/basquet-6.jpg', turnos: generarTurnos()},
        { id: 407, complejoId: 24, noCancha: 1, descripcion: 'Buena iluminación.', puntaje: 4.4, precioDesde: 18500, imageUrl: '/images/canchas/basquet-7.jpg', turnos: generarTurnos()},
        { id: 408, complejoId: 25, noCancha: 1, descripcion: 'Cancha outdoor.', puntaje: 3.8, precioDesde: 15000, imageUrl: '/images/canchas/basquet-8.jpg', turnos: generarTurnos()},
    ],
  },
  {
    id: 5,
    deporte: 'Handball',
    canchas: [
        { id: 501, complejoId: 26, noCancha: 1, descripcion: 'Medidas oficiales.', puntaje: 4.6, precioDesde: 21000, imageUrl: '/images/canchas/handball-1.jpg', turnos: generarTurnos()},
        { id: 502, complejoId: 27, noCancha: 1, descripcion: 'Piso sintético de alto impacto.', puntaje: 4.8, precioDesde: 24000, imageUrl: '/images/canchas/handball-2.jpg', turnos: generarTurnos()},
        { id: 503, complejoId: 28, noCancha: 1, descripcion: 'Ideal para entrenamientos.', puntaje: 4.3, precioDesde: 19000, imageUrl: '/images/canchas/handball-3.jpg', turnos: generarTurnos()},
        { id: 504, complejoId: 29, noCancha: 1, descripcion: 'Club enfocado en handball.', puntaje: 4.5, precioDesde: 22000, imageUrl: '/images/canchas/handball-4.jpg', turnos: generarTurnos()},
        { id: 505, complejoId: 26, noCancha: 2, descripcion: 'Cancha auxiliar.', puntaje: 4.1, precioDesde: 18000, imageUrl: '/images/canchas/handball-5.jpg', turnos: generarTurnos()},
        { id: 506, complejoId: 30, noCancha: 1, descripcion: 'Ambiente climatizado.', puntaje: 4.4, precioDesde: 23000, imageUrl: '/images/canchas/handball-6.jpg', turnos: generarTurnos()},
        { id: 507, complejoId: 31, noCancha: 1, descripcion: 'Alquiler por hora.', puntaje: 4.0, precioDesde: 20000, imageUrl: '/images/canchas/handball-7.jpg', turnos: generarTurnos()},
        { id: 508, complejoId: 32, noCancha: 1, descripcion: 'Instalaciones renovadas.', puntaje: 4.2, precioDesde: 21500, imageUrl: '/images/canchas/handball-8.jpg', turnos: generarTurnos()},
    ],
  },
    {
    id: 6,
    deporte: 'Tenis',
    canchas: [
      { id: 601, complejoId: 33, noCancha: 1, descripcion: 'Polvo de ladrillo profesional.', puntaje: 4.9, precioDesde: 15000, imageUrl: '/images/canchas/tenis-1.jpg', turnos: generarTurnos()},
      { id: 602, complejoId: 34, noCancha: 2, descripcion: 'Cancha de cemento rápida.', puntaje: 4.6, precioDesde: 12000, imageUrl: '/images/canchas/tenis-2.jpg', turnos: generarTurnos()},
      { id: 603, complejoId: 35, noCancha: 1, descripcion: 'Entorno arbolado.', puntaje: 4.5, precioDesde: 14000, imageUrl: '/images/canchas/tenis-3.jpg', turnos: generarTurnos()},
      { id: 604, complejoId: 36, noCancha: 3, descripcion: 'Complejo con 4 canchas.', puntaje: 4.3, precioDesde: 11000, imageUrl: '/images/canchas/tenis-4.jpg', turnos: generarTurnos()},
      { id: 605, complejoId: 33, noCancha: 2, descripcion: 'Excelente drenaje.', puntaje: 4.8, precioDesde: 15000, imageUrl: '/images/canchas/tenis-5.jpg', turnos: generarTurnos()},
      { id: 606, complejoId: 37, noCancha: 1, descripcion: 'Cancha techada.', puntaje: 4.1, precioDesde: 17000, imageUrl: '/images/canchas/tenis-6.jpg', turnos: generarTurnos()},
      { id: 607, complejoId: 34, noCancha: 3, descripcion: 'Ideal para clases.', puntaje: 4.6, precioDesde: 14500, imageUrl: '/images/canchas/tenis-7.jpg', turnos: generarTurnos()},
      { id: 608, complejoId: 38, noCancha: 1, descripcion: 'Ubicación privilegiada.', puntaje: 4.7, precioDesde: 16000, imageUrl: '/images/canchas/tenis-8.jpg', turnos: generarTurnos()},
    ],
  },
  {
    id: 7,
    deporte: 'Pádel',
    canchas: [
      { id: 701, complejoId: 39, noCancha: 1, descripcion: 'Paredes de blindex.', puntaje: 4.9, precioDesde: 18000, imageUrl: '/images/canchas/padel-1.jpg', turnos: generarTurnos()},
      { id: 702, complejoId: 40, noCancha: 2, descripcion: '3 canchas de cemento.', puntaje: 4.4, precioDesde: 15000, imageUrl: '/images/canchas/padel-2.jpg', turnos: generarTurnos()},
      { id: 703, complejoId: 41, noCancha: 1, descripcion: 'Cancha outdoor.', puntaje: 4.2, precioDesde: 14000, imageUrl: '/images/canchas/padel-3.jpg', turnos: generarTurnos()},
      { id: 704, complejoId: 42, noCancha: 3, descripcion: 'Complejo 100% techado.', puntaje: 4.6, precioDesde: 17000, imageUrl: '/images/canchas/padel-4.jpg', turnos: generarTurnos()},
      { id: 705, complejoId: 39, noCancha: 2, descripcion: 'Cancha central.', puntaje: 5.0, precioDesde: 20000, imageUrl: '/images/canchas/padel-5.jpg', turnos: generarTurnos()},
      { id: 706, complejoId: 43, noCancha: 1, descripcion: 'Canchas de cemento.', puntaje: 4.0, precioDesde: 13000, imageUrl: '/images/canchas/padel-6.jpg', turnos: generarTurnos()},
      { id: 707, complejoId: 44, noCancha: 1, descripcion: 'Césped sintético y blindex.', puntaje: 4.7, precioDesde: 18500, imageUrl: '/images/canchas/padel-7.jpg', turnos: generarTurnos()},
      { id: 708, complejoId: 41, noCancha: 2, descripcion: 'Ideal para torneos.', puntaje: 4.3, precioDesde: 16000, imageUrl: '/images/canchas/padel-8.jpg', turnos: generarTurnos()},
    ]
  },
  {
    id: 8,
    deporte: 'Hockey',
    canchas: [
      { id: 801, complejoId: 11, noCancha: 1, descripcion: 'Césped sintético de agua.', puntaje: 5.0, precioDesde: 35000, imageUrl: '/images/canchas/hockey-1.jpg', turnos: generarTurnos()},
      { id: 802, complejoId: 45, noCancha: 1, descripcion: 'Instalaciones de primer nivel.', puntaje: 4.9, precioDesde: 38000, imageUrl: '/images/canchas/hockey-2.jpg', turnos: generarTurnos()},
      { id: 803, complejoId: 46, noCancha: 1, descripcion: 'Césped sintético de arena.', puntaje: 4.6, precioDesde: 32000, imageUrl: '/images/canchas/hockey-3.jpg', turnos: generarTurnos()},
      { id: 804, complejoId: 11, noCancha: 2, descripcion: 'Cancha auxiliar.', puntaje: 4.5, precioDesde: 30000, imageUrl: '/images/canchas/hockey-4.jpg', turnos: generarTurnos()},
      { id: 805, complejoId: 45, noCancha: 2, descripcion: 'Cancha de entrenamiento.', puntaje: 4.7, precioDesde: 36000, imageUrl: '/images/canchas/hockey-5.jpg', turnos: generarTurnos()},
      { id: 806, complejoId: 47, noCancha: 1, descripcion: 'Cancha principal.', puntaje: 4.4, precioDesde: 33000, imageUrl: '/images/canchas/hockey-6.jpg', turnos: generarTurnos()},
      { id: 807, complejoId: 48, noCancha: 1, descripcion: 'Cancha renovada.', puntaje: 4.2, precioDesde: 29000, imageUrl: '/images/canchas/hockey-7.jpg', turnos: generarTurnos()},
      { id: 808, complejoId: 49, noCancha: 1, descripcion: 'Cancha de arena.', puntaje: 4.3, precioDesde: 31000, imageUrl: '/images/canchas/hockey-8.jpg', turnos: generarTurnos()},
    ],
  },
];
