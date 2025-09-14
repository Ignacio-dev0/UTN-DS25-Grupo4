import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function CalendarioTurnos({ turnosDisponibles, onConfirmarReserva }) {
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const { isAuthenticated } = useAuth(); 
  const navigate = useNavigate();

  // Obtener el día y hora actual
  const hoy = new Date();
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const diaActual = diasSemana[hoy.getDay()];
  const horaActual = hoy.getHours();

  // Función para verificar si un horario es para la próxima semana
  const esSiguienteSemana = (dia, hora) => {
    const diaIndex = dias.indexOf(dia);
    const diaActualIndex = dias.indexOf(diaActual);
    const horaNumero = parseInt(hora.split(':')[0]);
    
    // Si es el mismo día y la hora ya pasó, es para la siguiente semana
    if (dia === diaActual && horaNumero <= horaActual) {
      return true;
    }
    
    // Si es un día anterior al actual, es para la siguiente semana
    if (diaIndex < diaActualIndex) {
      return true;
    }
    
    return false;
  };
  const handleSelectTurno = (dia, hora) => {
    const turno = getTurno(dia, hora);
    if (turno && turno.estado === 'disponible') {
      const turnoData = { dia, hora, precio: turno.precio, turnoId: turno.id };
      const yaSeleccionado = turnosSeleccionados.find(t => t.dia === dia && t.hora === hora);
      
      if (yaSeleccionado) {
        // Deseleccionar turno
        setTurnosSeleccionados(prev => prev.filter(t => !(t.dia === dia && t.hora === hora)));
      } else {
        // Seleccionar turno - permitir múltiples para turnos consecutivos
        setTurnosSeleccionados(prev => [...prev, turnoData]);
        setReservaConfirmada(false);
      }
    }
  };

  const handleConfirmarClick = () => {
    // Primero, verificamos si el usuario está logueado
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para poder reservar.");
      navigate('/login');
      return;
    }
    
    // Si está logueado, continuamos con la reserva
    const exito = onConfirmarReserva(turnosSeleccionados);
    if (exito) {
      setReservaConfirmada(true);
      setTimeout(() => {
        setReservaConfirmada(false);
        setTurnosSeleccionados([]);
      }, 5000);
    }
  };

  const getTurno = (dia, hora) => {
    const turno = turnosDisponibles?.find(t => t.dia === dia && t.hora === hora);
    // Debug logging
    if (hora === '07:00' && dia === 'LUNES') {
      console.log('Debug - Buscando turno para LUNES 07:00:', {
        dia, 
        hora, 
        turnosTotal: turnosDisponibles?.length,
        turnoEncontrado: turno,
        primerosDosTurnos: turnosDisponibles?.slice(0, 2)
      });
    }
    return turno;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-center mb-4 text-primary">Turnos Disponibles</h3>
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-8 gap-1 text-center font-semibold min-w-[800px]">
          <div></div>
          {dias.map(dia => (
            <div key={dia} className="py-2 text-sm md:text-base text-gray-700">
              {dia}
            </div>
          ))}
          {horas.map(hora => (
            <React.Fragment key={hora}>
              <div className="py-3 px-1 text-gray-600 font-bold">{hora}</div>
              {dias.map(dia => {
                const turno = getTurno(dia, hora);
                let estado = 'no-disponible';
                
                if (turno) {
                  if (turno.estado === 'disponible') {
                    estado = 'disponible';
                  } else if (turno.estado === 'reservado') {
                    estado = 'reservado';
                  }
                }
                
                const estaSeleccionado = turnosSeleccionados.some(t => t.dia === dia && t.hora === hora);
                
                let clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 ";
                if (estado === 'no-disponible') {
                  clasesBoton += "bg-gray-200 cursor-not-allowed opacity-50";
                } else if (estado === 'reservado') {
                  clasesBoton += "bg-red-200 cursor-not-allowed opacity-75";
                } else if (estado === 'disponible') {
                  clasesBoton += "bg-accent hover:bg-secondary hover:text-white";
                }
                
                if (estaSeleccionado) {
                  clasesBoton += " ring-4 ring-offset-2 ring-primary bg-secondary text-white";
                }

                return (
                  <div key={`${dia}-${hora}`} className="p-1">
                    <button 
                      className={clasesBoton}
                      disabled={estado !== 'disponible'}
                      onClick={() => estado === 'disponible' && handleSelectTurno(dia, hora)}
                      aria-label={`Seleccionar turno ${dia} a las ${hora}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        {estado === 'disponible' && turno && (
                          <>
                            <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                            <span className="text-xs font-bold">${(turno.precio / 1000).toFixed(0)}k</span>
                          </>
                        )}
                        {estado === 'reservado' && (
                          <>
                            <div className="w-3 h-3 bg-red-500 rounded-full mb-1"></div>
                            <span className="text-xs text-red-700 font-bold">Ocupado</span>
                          </>
                        )}
                        {estado === 'no-disponible' && (
                          <span className="text-xs text-gray-500 font-bold">-</span>
                        )}
                      </div>
                    </button>
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
                <p>Tu{turnosSeleccionados.length > 1 ? 's turnos están' : ' turno está'} pendiente{turnosSeleccionados.length > 1 ? 's' : ''} de confirmación.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {turnosSeleccionados.length > 0 && (
                <div className="mb-4 text-lg text-primary">
                    {turnosSeleccionados.length === 1 ? (
                        <p>Turno seleccionado: <strong>{turnosSeleccionados[0].dia} a las {turnosSeleccionados[0].hora} hs</strong></p>
                    ) : (
                        <p>Turnos seleccionados ({turnosSeleccionados.length}):</p>
                    )}
                    
                    {turnosSeleccionados.length > 1 && (
                        <div className="text-sm space-y-1 mt-2">
                            {turnosSeleccionados
                                .sort((a, b) => {
                                    const diaA = dias.indexOf(a.dia);
                                    const diaB = dias.indexOf(b.dia);
                                    if (diaA !== diaB) return diaA - diaB;
                                    return horas.indexOf(a.hora) - horas.indexOf(b.hora);
                                })
                                .map((turno, idx) => (
                                    <p key={idx}>• {turno.dia} a las {turno.hora} hs</p>
                                ))
                            }
                        </div>
                    )}
                    
                    {turnosSeleccionados.some(turno => esSiguienteSemana(turno.dia, turno.hora)) && (
                      <p className="text-sm text-orange-600 font-bold">Algunos turnos son para la próxima semana</p>
                    )}
                    
                    <p className="font-bold text-2xl text-secondary mt-1">
                        Precio total: ${turnosSeleccionados.reduce((total, turno) => total + (turno.precio || 0), 0).toLocaleString('es-AR')}
                    </p>
                </div>
            )}
            <button 
                onClick={handleConfirmarClick}
                className="bg-secondary text-light font-bold py-3 px-16 rounded-lg hover:bg-primary transition-all duration-300 disabled:bg-accent disabled:cursor-not-allowed"
                disabled={turnosSeleccionados.length === 0} 
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