import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function CalendarioTurnos({ turnosDisponibles, onConfirmarReserva, loading = false }) {
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const { isAuthenticated, user } = useAuth(); 
  const navigate = useNavigate();

  // Debug logging para verificar estado de loading
  React.useEffect(() => {
    console.log('[DEBUG CalendarioTurnos] 📊 Recibidos datos:');
    console.log('- Loading state:', loading);
    console.log('- Turnos count:', turnosDisponibles?.length || 0);
    console.log('- TurnosDisponibles es array:', Array.isArray(turnosDisponibles));
    
    // Log detallado SIEMPRE de turnos recibidos
    if (turnosDisponibles && turnosDisponibles.length > 0) {
      console.log('[DEBUG CalendarioTurnos] ✅ Estructura de turnos recibidos:');
      console.log('- Total turnos:', turnosDisponibles.length);
      console.log('- Ejemplo primeros 3 turnos:');
      turnosDisponibles.slice(0, 3).forEach((turno, i) => {
        console.log(`  ${i + 1}. ${JSON.stringify(turno, null, 2)}`);
      });
      
      // Verificar días únicos
      const diasUnicos = [...new Set(turnosDisponibles.map(t => t.dia))];
      console.log('- Días únicos encontrados:', diasUnicos);
      
      // Verificar horas únicas  
      const horasUnicas = [...new Set(turnosDisponibles.map(t => t.hora))];
      console.log('- Horas únicas encontradas:', horasUnicas.slice(0, 5));
      
      // Verificar estados
      const disponibles = turnosDisponibles.filter(t => t.reservado === false || t.estado === 'disponible');
      console.log('- Turnos disponibles:', disponibles.length);
    } else {
      console.log('[DEBUG CalendarioTurnos] ⚠️ NO HAY TURNOS DISPONIBLES o están vacíos');
      console.log('- turnosDisponibles:', turnosDisponibles);
    }
  }, [loading, turnosDisponibles]);

  // Obtener el día y hora actual
  const hoy = React.useMemo(() => new Date(), []);
  const diasSemanaJS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const diaActual = diasSemanaJS[hoy.getDay()]; // Este sigue usando el orden JS (DOMINGO=0)
  const horaActual = hoy.getHours();
  
  // Debug del día actual (solo una vez al montar)
  React.useEffect(() => {
    console.log(`[DEBUG CalendarioTurnos] 📅 Fecha/hora actual:`);
    console.log('- Fecha completa:', hoy.toString());
    console.log('- Día de semana (getDay()):', hoy.getDay());
    console.log('- Día actual calculado:', diaActual);
    console.log('- Hora actual:', horaActual);
  }, [hoy, diaActual, horaActual]);

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
    
    // Debug logging ocasionalmente
    if (Math.random() < 0.1 && hora === '07:00' && dia === 'LUNES') {
      console.log('[DEBUG CalendarioTurnos] Buscando turno para LUNES 07:00:');
      console.log('- Dia buscado:', dia);
      console.log('- Hora buscada:', hora);
      console.log('- Turnos totales:', turnosDisponibles?.length || 0);
      console.log('- Turno encontrado:', turno);
      console.log('- Estructura primeros 3 turnos:');
      turnosDisponibles?.slice(0, 3).forEach((t, i) => {
        console.log(`  ${i + 1}. dia: "${t.dia}", hora: "${t.hora}", id: ${t.id}, estado: ${t.estado || 'sin estado'}`);
      });
    }
    
    return turno;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-center mb-2 text-primary">Turnos Disponibles</h3>
      
      {/* Indicador de semana */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
        <p className="text-sm text-blue-800">
          📅 <strong>Semana actual:</strong> {new Date().toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Los turnos mostrados corresponden a los próximos 7 días
        </p>
      </div>
      
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Cargando turnos disponibles...</p>
          <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-8 gap-1 text-center font-semibold min-w-[800px]">
          <div></div>
          {dias.map(dia => (
            <div key={dia} className="py-2 text-sm md:text-base text-gray-700 relative">
              {dia}
              {/* Indicador visual para el día actual - círculo arriba del día */}
              {dia === diaActual && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
          ))}
          {horas.map(hora => (
            <React.Fragment key={hora}>
              <div className="py-3 px-1 text-gray-600 font-bold">{hora}</div>
              {dias.map(dia => {
                const turno = getTurno(dia, hora);
                let estado = 'no-disponible';
                
                if (turno) {
                  // Usar campo reservado en lugar de estado
                  if (turno.reservado === false || turno.reservado === null || turno.reservado === undefined) {
                    estado = 'disponible';
                  } else if (turno.reservado === true) {
                    estado = 'reservado';
                  }
                  
                  // Debug ocasional para verificar estados
                  if (Math.random() < 0.02 && dia === 'LUNES' && hora === '07:00') {
                    console.log(`[DEBUG CalendarioTurnos] Estado calculado para ${dia} ${hora}:`);
                    console.log('- Turno encontrado:', !!turno);
                    console.log('- turno.reservado:', turno.reservado);
                    console.log('- Estado final:', estado);
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
      )}
      
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
            {/* Solo mostrar botón de reserva para usuarios autenticados de tipo cliente */}
            {isAuthenticated && user && (user.rol === 'player' || user.rol === 'normal') ? (
              <button 
                  onClick={handleConfirmarClick}
                  className="bg-secondary text-light font-bold py-3 px-16 rounded-lg hover:bg-primary transition-all duration-300 disabled:bg-accent disabled:cursor-not-allowed"
                  disabled={turnosSeleccionados.length === 0} 
              >
                Confirmar Reserva
              </button>
            ) : isAuthenticated && user && (user.rol === 'admin' || user.rol === 'owner') ? (
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  {user.rol === 'admin' ? 'Los administradores' : 'Los dueños de complejo'} no pueden realizar reservas
                </p>
                <p className="text-sm text-gray-500">Esta funcionalidad está disponible solo para jugadores</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-2">Debes iniciar sesión para reservar</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-primary text-white font-bold py-3 px-16 rounded-lg hover:bg-secondary transition-all duration-300"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CalendarioTurnos;