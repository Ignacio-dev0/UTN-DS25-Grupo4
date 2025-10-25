import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

// Mapeo de días con acentos para display
const diasConAcentos = {
  'DOMINGO': 'DOMINGO',
  'LUNES': 'LUNES',
  'MARTES': 'MARTES',
  'MIERCOLES': 'MIÉRCOLES',
  'JUEVES': 'JUEVES',
  'VIERNES': 'VIERNES',
  'SABADO': 'SÁBADO'
};

function CalendarioTurnos({ turnosDisponibles, onConfirmarReserva }) {
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const { isAuthenticated, user } = useAuth(); 
  const navigate = useNavigate();

  // Debug: Analizar los turnos que llegan
  useEffect(() => {
    if (turnosDisponibles && turnosDisponibles.length > 0) {
      console.log('[DEBUG CalendarioTurnos] 📊 Análisis de turnos recibidos:');
      console.log('- Total turnos:', turnosDisponibles.length);
      
      // Agrupar por día
      const turnosPorDia = {};
      turnosDisponibles.forEach(turno => {
        if (!turnosPorDia[turno.dia]) {
          turnosPorDia[turno.dia] = [];
        }
        turnosPorDia[turno.dia].push(turno);
      });
      
      console.log('- Turnos por día:', Object.keys(turnosPorDia).map(dia => `${dia}: ${turnosPorDia[dia].length}`).join(', '));
      
      // Verificar si faltan días
      const diasEsperados = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      const diasFaltantes = diasEsperados.filter(dia => !turnosPorDia[dia]);
      if (diasFaltantes.length > 0) {
        console.log('⚠️ DÍAS FALTANTES:', diasFaltantes.join(', '));
      }
      
      // Mostrar algunos ejemplos de cada estado
      const disponibles = turnosDisponibles.filter(t => t.estado === 'disponible').length;
      const ocupados = turnosDisponibles.filter(t => t.estado === 'ocupado').length;
      const deshabilitados = turnosDisponibles.filter(t => t.estado === 'deshabilitado').length;
      const finalizados = turnosDisponibles.filter(t => t.estado === 'finalizado').length;
      console.log(`- Estados: ${disponibles} disponibles, ${ocupados} ocupados, ${deshabilitados} deshabilitados, ${finalizados} finalizados`);
      
      // Debug: ANÁLISIS ESPECÍFICO DEL SÁBADO
      const turnosSabado = turnosDisponibles.filter(t => t.dia === 'SABADO');
      if (turnosSabado.length > 0) {
        console.log('\n🔍 ANÁLISIS ESPECÍFICO DEL SÁBADO:');
        console.log('- Total turnos SÁBADO:', turnosSabado.length);
        
        // Mostrar TODOS los turnos del sábado con sus fechas completas
        turnosSabado.slice(0, 5).forEach(t => {
          console.log(`  � SÁBADO ${t.hora}:`);
          console.log(`     - fecha (string): "${t.fecha}"`);
          console.log(`     - fechaCompleta: ${t.fechaCompleta}`);
          console.log(`     - horaCompleta: ${t.horaCompleta}`);
          console.log(`     - estado: ${t.estado}`);
          console.log(`     - reservado: ${t.reservado}, alquilerId: ${t.alquilerId}`);
        });
        
        // Ver estados del sábado
        const sabadoDisponibles = turnosSabado.filter(t => t.estado === 'disponible').length;
        const sabadoFinalizados = turnosSabado.filter(t => t.estado === 'finalizado').length;
        const sabadoOcupados = turnosSabado.filter(t => t.estado === 'ocupado').length;
        console.log(`  Estados: ${sabadoDisponibles} disponibles, ${sabadoFinalizados} finalizados, ${sabadoOcupados} ocupados`);
      }
      
      // Debug: Verificar turnos por día con sus fechas
      const turnosPorDiaConFecha = {};
      turnosDisponibles.forEach(turno => {
        if (!turnosPorDiaConFecha[turno.dia]) {
          turnosPorDiaConFecha[turno.dia] = [];
        }
        turnosPorDiaConFecha[turno.dia].push(turno.fecha);
      });
      console.log('\n📅 Fechas de turnos por día:');
      Object.keys(turnosPorDiaConFecha).forEach(dia => {
        const fechasUnicas = [...new Set(turnosPorDiaConFecha[dia])];
        console.log(`  ${dia}: ${fechasUnicas.join(', ')}`);
      });
      
      // NUEVO: Verificar qué horas tienen turnos
      const horasUnicas = [...new Set(turnosDisponibles.map(t => t.hora))].sort();
      console.log('\n- Horas con turnos:', horasUnicas.join(', '));
      console.log('- Total horas únicas:', horasUnicas.length);
    }
  }, [turnosDisponibles]);

  // Obtener el día y hora actual
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  // Calcular los 7 días a mostrar (empezando desde hoy)
  const calcular7Dias = () => {
    const fechaBase = new Date();
    fechaBase.setHours(0, 0, 0, 0);
    
    const diasCalculados = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaBase);
      fecha.setDate(fechaBase.getDate() + i);
      
      const diaKey = diasSemana[fecha.getDay()];
      const diaDisplay = diasConAcentos[diaKey] || diaKey;
      const diaNumero = fecha.getDate();
      const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
      
      diasCalculados.push({
        key: diaKey,
        display: diaDisplay,
        fecha: `${diaNumero}/${mes}`,
        esHoy: i === 0
      });
    }
    
    return diasCalculados;
  };

  const diasAMostrar = calcular7Dias();

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
    return turno;
  };

  // USAR RANGO COMPLETO DE HORAS (igual que en CalendarioEdicionTurnos)
  const horasDisponibles = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-center mb-4 text-primary">Turnos Disponibles</h3>
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-8 gap-1 text-center font-semibold min-w-[800px]">
          <div></div>
          {diasAMostrar.map(({ key, display, fecha, esHoy }) => (
            <div key={key} className="py-2 text-sm md:text-base text-gray-700 relative">
              <div className="font-bold">{display}</div>
              <div className="text-xs text-gray-500">{fecha}</div>
              {/* Indicador visual para el día actual - círculo arriba del día */}
              {esHoy && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
          ))}
          {horasDisponibles.map(hora => (
            <React.Fragment key={hora}>
              <div className="py-3 px-1 text-gray-600 font-bold">{hora}</div>
              {diasAMostrar.map(({ key: dia }) => {
                const turno = getTurno(dia, hora);
                let estado = 'no-disponible';
                
                // Verificar si la hora ya pasó (incluso sin turno creado)
                const esPasado = (() => {
                  const ahora = new Date();
                  const diaIndex = diasSemana.indexOf(dia);
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  
                  // Calcular la fecha del día en cuestión
                  const diasDesdeHoy = diaIndex - hoy.getDay();
                  const fechaDia = new Date(hoy);
                  fechaDia.setDate(hoy.getDate() + (diasDesdeHoy < 0 ? diasDesdeHoy + 7 : diasDesdeHoy));
                  
                  // Si es un día anterior a hoy, es pasado
                  if (fechaDia < hoy) {
                    return true;
                  }
                  
                  // Si es hoy, verificar la hora
                  if (fechaDia.getTime() === hoy.getTime()) {
                    const [horaInt] = hora.split(':').map(Number);
                    return horaInt < ahora.getHours();
                  }
                  
                  return false;
                })();
                
                if (turno) {
                  if (turno.estado === 'disponible') {
                    estado = 'disponible';
                  } else if (turno.estado === 'finalizado') {
                    // Los turnos finalizados (pasados) se muestran como "Finalizado" en gris oscuro
                    estado = 'finalizado';
                  } else if (turno.estado === 'deshabilitado') {
                    // Turnos deshabilitados temporalmente se muestran en naranja
                    estado = 'deshabilitado';
                  } else if (turno.estado === 'reservado' || turno.estado === 'ocupado') {
                    // Cualquier turno que esté reservado u ocupado se muestra como "Ocupado"
                    estado = 'reservado';
                  }
                }
                // Si no hay turno creado (independiente de si la hora pasó o no), 
                // se muestra como 'no-disponible' (gris claro)
                
                const estaSeleccionado = turnosSeleccionados.some(t => t.dia === dia && t.hora === hora);
                
                let clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 ";
                if (estado === 'no-disponible') {
                  clasesBoton += "bg-gray-200 cursor-not-allowed opacity-50";
                } else if (estado === 'finalizado') {
                  clasesBoton += "bg-gray-400 cursor-not-allowed opacity-75";
                } else if (estado === 'deshabilitado') {
                  clasesBoton += "bg-orange-400 cursor-not-allowed opacity-75";
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
                            <span className="text-xs font-bold">${turno.precio.toLocaleString('es-AR')}</span>
                          </>
                        )}
                        {estado === 'finalizado' && (
                          <>
                            <div className="w-3 h-3 bg-gray-600 rounded-full mb-1"></div>
                            <span className="text-xs text-gray-700 font-bold">Finalizado</span>
                          </>
                        )}
                        {estado === 'deshabilitado' && (
                          <>
                            <div className="w-3 h-3 bg-orange-500 rounded-full mb-1"></div>
                            <span className="text-xs text-orange-700 font-bold">TEMP</span>
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
                                    // Ordenar por día (usando diasAMostrar para orden cronológico)
                                    const diaA = diasAMostrar.findIndex(d => d.key === a.dia);
                                    const diaB = diasAMostrar.findIndex(d => d.key === b.dia);
                                    if (diaA !== diaB) return diaA - diaB;
                                    return horasDisponibles.indexOf(a.hora) - horasDisponibles.indexOf(b.hora);
                                })
                                .map((turno, idx) => (
                                    <p key={idx}>• {turno.dia} a las {turno.hora} hs</p>
                                ))
                            }
                        </div>
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