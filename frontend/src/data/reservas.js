export let misReservas = [
    { id: 1, userId: 1, complejoId: 1, canchaId: 101, complejo: 'Complejo El Potrero', cancha: 'Cancha N°5', fecha: '2025-06-25', hora: '20:00', estado: 'Finalizada', reseñada: false },
    { id: 2, userId: 1, complejoId: 2, canchaId: 102, complejo: 'Fútbol City', cancha: 'Cancha N°1', fecha: '2025-07-12', hora: '21:00', estado: 'Confirmada', reseñada: false },
    { id: 3, userId: 1, complejoId: 33, canchaId: 601, complejo: 'Club de Tenis La Plata', cancha: 'Cancha N°1', fecha: '2025-07-15', hora: '10:00', estado: 'Pendiente', reseñada: false },
    { id: 4, userId: 1, complejoId: 45, canchaId: 802, complejo: 'Club Santa Bárbara', cancha: 'Hockey', fecha: '2025-06-20', hora: '18:00', estado: 'Cancelada', reseñada: false },
    { id: 5, userId: 1, complejoId: 601, canchaId: 601, complejo: 'Club de Tenis La Plata', cancha: 'Cancha N°1', fecha: '2025-06-18', hora: '11:00', estado: 'Finalizada', reseñada: true },
];

export const crearReserva = (turno, cancha, complejo) => {
  const mockUser = { id: 1, nombre: 'Nacho Benitez' }; 
  const nuevaReserva = {
    id: misReservas.length + 1,
    userId: mockUser.id,
    canchaId: cancha.id,
    complejoId: complejo.id,
    complejo: complejo.nombre,
    cancha: `Cancha N°${cancha.noCancha}`,
    fecha: `Próximo ${turno.dia}`, 
    hora: turno.hora,
    estado: 'Pendiente',
    reseñada: false, // Por defecto, una nueva reserva no está reseñada
  };
  misReservas.push(nuevaReserva);
};