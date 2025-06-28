// Reseñas de ejemplo
export const reseñasMock = [
  { usuario: "Usuario 1", comentario: "Muy buena cancha, excelente césped." },
  { usuario: "Usuario 2", comentario: "El lugar estaba limpio y bien iluminado." },
  { usuario: "Usuario 3", comentario: "El personal fue muy amable." },
  { usuario: "Usuario 4", comentario: "Fácil de reservar y buena ubicación." },
  { usuario: "Usuario 5", comentario: "Volvería sin dudas." }
];

export function generarTurnosPorSemana() {
  const dias = [];
  const hoy = new Date();

  for (let i = 0; i < 7; i++) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() + i);

    const fecha = dia.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });

    const turnos = [];
    for (let hora = 10; hora < 22; hora++) {
      turnos.push(`${hora.toString().padStart(2, '0')}:00`);
      turnos.push(`${hora.toString().padStart(2, '0')}:30`);
    }

    dias.push({
      dia: fecha.charAt(0).toUpperCase() + fecha.slice(1), // Capitalizar
      turnos
    });
  }

  return dias;
}

export const turnosMock = generarTurnosPorSemana();

// Datos de la cancha y complejo
export const canchaMock = {

  complejo: "Complejo La Cancha",
  descripcion: "Cancha de césped sintético con vestuarios, baños y estacionamiento.",
  ubicacion: "https://via.placeholder.com/400x200?text=Ubicacion+del+Complejo",
  fotos: [
    "https://via.placeholder.com/300x200?text=Foto+1",
    "https://via.placeholder.com/300x200?text=Foto+2",
    "https://via.placeholder.com/300x200?text=Foto+3",
    "https://via.placeholder.com/300x200?text=Foto+4"
  ]
};

