// src/data/solicitudes.js
export const mockSolicitudes = [
  {
    id: 1,
    nombreComplejo: 'Distrito Pádel Center',
    cuit: '30-12345678-9',
    calle: '532',
    altura: '1575',
    descripcion: 'Complejo nuevo con 3 canchas de pádel de blindex y césped sintético.',
    reembolso: '80%',
    horario: 'Lunes a Domingos de 09:00 a 23:00',
    status: 'pendiente',
  },
  { id: 2, nombreComplejo: 'El Muro Padel', cuit: '30-87654321-0', status: 'pendiente' },
  { id: 3, nombreComplejo: 'Club Hípico', cuit: '30-11223344-5', status: 'pendiente' },
  { id: 4, nombreComplejo: 'Fútbol City', cuit: '30-55667788-9', status: 'pendiente' },
  { id: 5, nombreComplejo: 'La Redonda FC', cuit: '30-99887766-5', status: 'pendiente' },
  { id: 6, nombreComplejo: 'Club Atenas', cuit: '30-22334455-6', status: 'pendiente' },
  { id: 7, nombreComplejo: 'Smash Point', cuit: '30-66778899-1', status: 'pendiente' },
];

export const mockComplejosAprobados = [
  {
    id: 901,
    nombreComplejo: 'La Meca Fútbol',
    ubicacion: 'La Plata',
    adminEmail: 'contacto@lameca.com',
    fechaAprobacion: '2025-05-20',
  },
  {
    id: 902,
    nombreComplejo: 'City Bell Tenis Club',
    ubicacion: 'City Bell',
    adminEmail: 'admin@citybelltenis.com',
    fechaAprobacion: '2025-04-11',
  },
  {
    id: 903,
    nombreComplejo: 'El Galpón Padel',
    ubicacion: 'Gonnet',
    adminEmail: 'reservas@elgalpon.com',
    fechaAprobacion: '2025-03-01',
  },
];
