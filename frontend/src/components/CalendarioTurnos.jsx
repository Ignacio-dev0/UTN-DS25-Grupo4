import React, { useState } from 'react';


const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const horas = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

function CalendarioTurnos({ turnosDisponibles }) {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const handleSelectTurno = (dia, hora) => {
    if (turnoSeleccionado?.dia === dia && turnoSeleccionado?.hora === hora) {
      setTurnoSeleccionado(null);
    } else {
      setTurnoSeleccionado({ dia, hora });
    }
  };


  const getEstadoTurno = (dia, hora) => {
    const turno = turnosDisponibles.find(t => t.dia.toUpperCase() === dia && t.hora === hora);
    return turno ? turno.estado : 'no-disponible';
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-center">Turnos Disponibles</h3>

      <div className="grid grid-cols-8 gap-1 text-center font-semibold">
        <div></div> 
        {dias.map(dia => <div key={dia} className="py-2 text-gray-700">{dia}</div>)}

        {horas.map(hora => (
          <React.Fragment key={hora}>
            <div className="py-3 px-1 text-gray-600">{hora}</div>
            
            {dias.map(dia => {
              const estado = getEstadoTurno(dia, hora);
              const estaSeleccionado = turnoSeleccionado?.dia === dia && turnoSeleccionado?.hora === hora;

              let clasesBoton = "w-full h-full py-3 rounded-md transition-colors ";
              
              if (estado === 'reservado') {
                clasesBoton += "bg-red-300 cursor-not-allowed";
              } else if (estado === 'disponible') {
                clasesBoton += "bg-accent hover:bg-secondary hover:text-white";
              } else { // 'no-disponible'
                clasesBoton += "bg-gray-100 cursor-not-allowed";
              }

              if (estaSeleccionado) {
                clasesBoton += " ring-4 ring-offset-2 ring-primary";
              }

              return (
                <div key={`${dia}-${hora}`} className="p-1">
                  <button 
                    className={clasesBoton}
                    disabled={estado !== 'disponible'}
                    onClick={() => handleSelectTurno(dia, hora)}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center mt-8">
        {turnoSeleccionado && (
            <p className="mb-4 text-lg">
                Turno seleccionado: <strong>{turnoSeleccionado.dia} a las {turnoSeleccionado.hora}</strong>
            </p>
        )}
        <button 
            className="bg-secondary text-light font-bold py-3 px-16 rounded-lg hover:bg-primary disabled:bg-accent disabled:cursor-not-allowed"
            disabled={!turnoSeleccionado} 
        >
          Confirmar Reserva
        </button>
      </div>
    </div>
  );
}

export default CalendarioTurnos;