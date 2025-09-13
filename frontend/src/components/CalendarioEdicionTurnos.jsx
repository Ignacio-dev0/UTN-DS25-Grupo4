import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api.js';

const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function CalendarioEdicionTurnos({ turnos, onTurnosChange, canchaId }) {
  const [guardandoCambios, setGuardandoCambios] = useState(false);

  // Editar precio de un turno específico
  const handleEditarPrecio = async (dia, hora) => {
    const turnoExistente = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
    
    // No permitir editar turnos reservados por usuarios
    if (turnoExistente && turnoExistente.alquilerId && turnoExistente.alquilerId !== null) {
      alert("No se puede modificar un turno reservado por un usuario");
      return;
    }
    
    const precioActual = turnoExistente ? turnoExistente.precio : '';
    
    const nuevoPrecioStr = prompt(`💰 Precio para ${dia} a las ${hora}:`, precioActual);
    if (nuevoPrecioStr === null) return;
    
    const nuevoPrecio = parseInt(nuevoPrecioStr, 10);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
      alert("Por favor, ingrese un precio válido.");
      return;
    }

    // Si existe el turno, actualizarlo en la base de datos
    if (turnoExistente && turnoExistente.id) {
      await actualizarTurnoEnBD(turnoExistente.id, { precio: nuevoPrecio });
    } else {
      // Crear nuevo turno en la base de datos
      try {
        const nuevoTurnoCreado = await crearTurnoEnBD(canchaId, dia, hora, nuevoPrecio);
        console.log("✅ Turno creado exitosamente:", nuevoTurnoCreado);
        
        // Recargar turnos desde la base de datos para obtener el turno con ID correcto
        const response = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}`);
        if (response.ok) {
          const turnosData = await response.json();
          
          // Formatear turnos igual que en EditarCanchaPage
          const obtenerDiaSemana = (fechaISO) => {
            const fecha = new Date(fechaISO);
            const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
            return diasSemana[fecha.getDay()];
          };
          
          const formatearHora = (horaISO) => {
            const fecha = new Date(horaISO);
            return fecha.toTimeString().slice(0, 5);
          };
          
          const turnosFormateados = (turnosData.turnos || turnosData || []).map(turno => ({
            id: turno.id,
            dia: obtenerDiaSemana(turno.fecha),
            hora: formatearHora(turno.horaInicio),
            precio: turno.precio,
            reservado: turno.reservado,
            alquilerId: turno.alquilerId,
            fecha: turno.fecha
          }));
          
          onTurnosChange(turnosFormateados);
          console.log("✅ Turnos actualizados desde BD");
        }
        
      } catch (error) {
        console.error("❌ Error al crear turno:", error);
        alert(`Error al crear turno: ${error.message}`);
        return;
      }
    }

    // Actualizar localmente para mostrar el cambio inmediatamente
    if (turnoExistente) {
      const nuevosTurnos = turnos.map(t => 
        String(t.dia).toUpperCase() === dia && t.hora === hora ? { ...t, precio: nuevoPrecio } : t
      );
      onTurnosChange(nuevosTurnos);
    }
    // Si se creó un turno nuevo, la actualización ya se hizo recargando desde BD
  };

  // Toggle estado del turno (disponible/deshabilitado manualmente)
    const handleToggleEstado = async (e, dia, hora) => {
    e.preventDefault();
    e.stopPropagation();
    
    const turno = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
    if (!turno) return;

    // No permitir editar turnos reservados por usuarios
    if (turno.alquilerId && turno.alquilerId !== null) {
      alert("No se puede modificar un turno reservado por un usuario");
      return;
    }

    // Cambiar el estado: reservado=false significa disponible, reservado=true significa deshabilitado
    const nuevoEstadoReservado = !turno.reservado;
    
    try {
      await actualizarTurnoEnBD(turno.id, { reservado: nuevoEstadoReservado });
      
      // Actualizar el estado usando la función de callback del padre
      const turnosActualizados = turnos.map(t => 
        t.id === turno.id 
          ? { ...t, reservado: nuevoEstadoReservado }
          : t
      );
      onTurnosChange(turnosActualizados);
    } catch (error) {
      console.error('Error al actualizar estado del turno:', error);
      alert('Error al actualizar el estado del turno');
    }
  };

  // Función para crear turno en la base de datos
  const crearTurnoEnBD = async (canchaId, dia, hora, precio) => {
    try {
      const response = await fetch(`${API_BASE_URL}/turnos/individual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canchaId: canchaId,
          dia: dia,
          hora: hora,
          precio: precio
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear turno');
      }
      
      const result = await response.json();
      console.log('✅ Turno creado en BD:', result);
      return result.turno;
    } catch (error) {
      console.error('❌ Error al crear turno:', error);
      throw error;
    }
  };

  // Función para actualizar turno en la base de datos
  const actualizarTurnoEnBD = async (turnoId, cambios) => {
    try {
      setGuardandoCambios(true);
      const response = await fetch(`${API_BASE_URL}/turnos/individual/${turnoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cambios),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar turno');
      }
      
      console.log('✅ Turno actualizado en BD');
    } catch (error) {
      console.error('❌ Error al actualizar turno:', error);
      alert('Error al guardar el cambio. Inténtalo de nuevo.');
    } finally {
      setGuardandoCambios(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-primary">⚡ Editor Manual de Turnos</h3>
        {guardandoCambios && (
          <div className="text-sm text-blue-600">💾 Guardando cambios...</div>
        )}
      </div>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">📝 Instrucciones:</h4>
        <ul className="text-sm text-yellow-700 space-y-1 mb-3">
          <li>• <strong>Cambiar precio:</strong> Clic en cualquier horario</li>
          <li>• <strong>Deshabilitar/Habilitar:</strong> Clic derecho en el círculo de estado</li>
          <li>• Los cambios se guardan automáticamente y se ven en ReservaPage</li>
        </ul>
        
        {/* Leyenda de colores */}
        <div className="border-t border-yellow-300 pt-2">
          <p className="text-xs font-semibold text-yellow-800 mb-1">Leyenda de colores:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-accent rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>Ocupado (manual)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Reservado por usuario</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Sin turno</span>
            </div>
          </div>
        </div>
      </div>
      
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
                let esEditable = true;

                if (turno) {
                  if (turno.alquilerId && turno.alquilerId !== null) {
                    // Reservado por un usuario - no editable
                    clasesBoton += "bg-blue-500 text-white";
                    esEditable = false;
                  } else if (turno.reservado) {
                    // Ocupado manualmente por el dueño - editable
                    clasesBoton += "bg-red-400 text-white";
                  } else {
                    // Disponible - editable
                    clasesBoton += "bg-accent hover:bg-secondary";
                  }
                } else {
                  clasesBoton += "bg-gray-200 hover:bg-gray-300 text-gray-400";
                }

                return (
                  <div key={`${dia}-${hora}`} className="p-1">
                    <button 
                      className={clasesBoton}
                      onClick={() => esEditable ? handleEditarPrecio(dia, hora) : null}
                      disabled={!esEditable}
                      title={turno?.alquilerId && turno.alquilerId !== null ? "Reservado por usuario - No editable" : ""}
                    >
                      {turno ? `$${(turno.precio / 1000).toFixed(0)}k` : '+'}
                      
                      {turno && esEditable && (
                        <div 
                          onClick={(e) => handleToggleEstado(e, dia, hora)}
                          className={`absolute top-1 right-1 h-4 w-4 rounded-full cursor-pointer ${!turno.reservado ? 'bg-green-500' : 'bg-red-500'}`}
                          title={`${!turno.reservado ? 'Disponible - Clic para deshabilitar' : 'Deshabilitado - Clic para habilitar'}`}
                        />
                      )}
                      
                      {turno && turno.alquilerId && turno.alquilerId !== null && (
                        <div 
                          className="absolute top-1 right-1 h-4 w-4 rounded-full bg-blue-600"
                          title="Reservado por usuario"
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