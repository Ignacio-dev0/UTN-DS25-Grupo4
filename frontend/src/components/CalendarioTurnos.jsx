import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const horas = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function CalendarioTurnos({ turnosDisponibles, onConfirmarReserva }) {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);

  const handleSelectTurno = (dia, hora) => {
    if (turnoSeleccionado?.dia === dia && turnoSeleccionado?.hora === hora) {
      setTurnoSeleccionado(null);
    } else {
      setTurnoSeleccionado({ dia, hora });
      setReservaConfirmada(false);
    }
  };

  const handleConfirmarClick = () => {
    const exito = onConfirmarReserva(turnoSeleccionado);
    if (exito) {
      setReservaConfirmada(true);
      setTimeout(() => {
        setReservaConfirmada(false);
        setTurnoSeleccionado(null);
      }, 5000);
    }
  };

  const getEstadoTurno = (dia, hora) => {
    const turno = turnosDisponibles.find(t => t.dia.toUpperCase() === dia && t.hora === hora);
    return turno ? turno.estado : 'no-disponible';
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-center text-primary">Turnos Disponibles</h3>
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-8 gap-1 text-center font-semibold min-w-[800px]">
          <div></div>
          {dias.map(dia => <div key={dia} className="py-2 text-gray-700 text-sm md:text-base">{dia}</div>)}
          {horas.map(hora => (
            <React.Fragment key={hora}>
              <div className="py-3 px-1 text-gray-600 font-bold">{hora}</div>
              {dias.map(dia => {
                const estado = getEstadoTurno(dia, hora);
                const estaSeleccionado = turnoSeleccionado?.dia === dia && turnoSeleccionado?.hora === hora;
                let clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 ";
                if (estado === 'reservado') {
                  clasesBoton += "bg-red-200 cursor-not-allowed opacity-50";
                } else if (estado === 'disponible') {
                  clasesBoton += "bg-accent hover:bg-secondary hover:text-white";
                } else {
                  clasesBoton += "bg-gray-200 cursor-not-allowed opacity-50";
                }
                if (estaSeleccionado) {
                  clasesBoton += " ring-4 ring-offset-2 ring-primary bg-secondary";
                }
                return (
                  <div key={`${dia}-${hora}`} className="p-1">
                    <button 
                      className={clasesBoton}
                      disabled={estado !== 'disponible'}
                      onClick={() => handleSelectTurno(dia, hora)}
                      aria-label={`Seleccionar turno ${dia} a las ${hora}`}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="text-center mt-8 min-h-[100px] flex flex-col justify-center items-center">
        {reservaConfirmada ? (
          <div className="bg-accent border-l-4 border-secondary text-primary p-4 rounded-md shadow-lg w-full max-w-lg" role="alert">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 mr-3"/>
              <div>
                <p className="font-bold text-lg">¡Reserva Pendiente!</p>
                <p>Tu turno para el <strong>{turnoSeleccionado?.dia} a las {turnoSeleccionado?.hora}</strong> está pendiente de confirmación.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {turnoSeleccionado && (
                <p className="mb-4 text-lg text-primary">
                    Turno seleccionado: <strong>{turnoSeleccionado.dia} a las {turnoSeleccionado.hora} hs</strong>
                </p>
            )}
            <button 
                onClick={handleConfirmarClick}
                className="bg-secondary text-light font-bold py-3 px-16 rounded-lg hover:bg-primary transition-all duration-300 disabled:bg-accent disabled:cursor-not-allowed"
                disabled={!turnoSeleccionado} 
            >
              Confirmar Reserva
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CalendarioTurnos;
