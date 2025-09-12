import React from 'react';

const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function CalendarioEdicionTurnos({ turnos, onTurnosChange }) {
  
  const handleTurnoClick = (dia, hora) => {
    const turnoExistente = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
    const precioActual = turnoExistente ? turnoExistente.precio : '';
    
    const nuevoPrecioStr = prompt(`Establecer precio para ${dia} a las ${hora} hs:`, precioActual);
    if (nuevoPrecioStr === null) return;
    
    const nuevoPrecio = parseInt(nuevoPrecioStr, 10);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
      alert("Por favor, ingrese un precio válido.");
      return;
    }

    let nuevosTurnos;
    if (turnoExistente) {
      nuevosTurnos = turnos.map(t => 
        String(t.dia).toUpperCase() === dia && t.hora === hora ? { ...t, precio: nuevoPrecio } : t
      );
    } else {
      const nuevoTurno = { dia, hora, estado: 'disponible', precio: nuevoPrecio };
      nuevosTurnos = [...turnos, nuevoTurno];
    }
    onTurnosChange(nuevosTurnos);
  };

  const handleToggleEstado = (e, dia, hora) => {
    e.preventDefault();
    e.stopPropagation();

    const nuevosTurnos = turnos.map(t =>
      t.dia.toUpperCase() === dia && t.hora === hora
        ? { ...t, estado: t.estado === 'disponible' ? 'reservado' : 'disponible' }
        : t
    );
    onTurnosChange(nuevosTurnos);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-center text-primary">Editor de Turnos y Precios</h3>
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-8 gap-1 text-center font-semibold min-w-[800px]">
          <div></div>
          {dias.map(dia => <div key={dia} className="py-2 text-gray-700 text-sm md:text-base">{dia}</div>)}
          {horas.map(hora => (
            <React.Fragment key={hora}>
              <div className="py-3 px-1 text-gray-600 font-bold">{hora}</div>
              {dias.map(dia => {
                const turno = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
                let clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-white font-bold ";

                if (turno) {
                  clasesBoton += turno.estado === 'disponible' ? "bg-accent hover:bg-secondary" : "bg-red-200 text-red-500 opacity-70";
                } else {
                  clasesBoton += "bg-gray-200 hover:bg-gray-300 text-gray-400";
                }

                return (
                  <div key={`${dia}-${hora}`} className="p-1">
                    <button 
                      className={clasesBoton}
                      onClick={() => handleTurnoClick(dia, hora)}
                    >
                      {turno ? `$${(turno.precio / 1000).toFixed(0)}k` : '+'}
                      
                      {turno && (
                        <div 
                          onClick={(e) => handleToggleEstado(e, dia, hora)}
                          className={`absolute top-1 right-1 h-4 w-4 rounded-full cursor-pointer ${turno.estado === 'disponible' ? 'bg-green-500' : 'bg-red-500'}`}
                          title={`Marcar como ${turno.estado === 'disponible' ? 'Reservado' : 'Disponible'}`}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarioEdicionTurnos;