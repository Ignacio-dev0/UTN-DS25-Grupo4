import React, { useState, useEffect } from 'react';
import { FaTrash, FaPause, FaPlay } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';

const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function CalendarioEdicionTurnos({ turnos, onTurnosChange, canchaId, onPrecioDesdeChange }) {
  const [guardandoCambios, setGuardandoCambios] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null); // { turno, dia, hora }
  const [horariosDeshabilitados, setHorariosDeshabilitados] = useState([]); // Lista de horarios deshabilitados permanentemente
  
  // Debug: Ver cuando se re-renderiza con nuevos turnos
  console.log("🔄 CalendarioEdicionTurnos renderizado con", turnos.length, "turnos");
  
  // Helper para obtener headers con JWT
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };
  
  // Función para recalcular el precio "desde" localmente
  const recalcularPrecioDesdeLocal = (turnosActualizados) => {
    const turnosDisponibles = turnosActualizados.filter(t => !t.reservado && !t.alquilerId);
    if (turnosDisponibles.length > 0) {
      const precioMinimo = Math.min(...turnosDisponibles.map(t => t.precio));
      if (onPrecioDesdeChange) {
        onPrecioDesdeChange(precioMinimo);
      }
    }
  };
  
  // Cargar horarios deshabilitados al montar el componente
  useEffect(() => {
    const cargarHorariosDeshabilitados = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/horarios-deshabilitados/cancha/${canchaId}`);
        if (response.ok) {
          const data = await response.json();
          setHorariosDeshabilitados(data.horariosDeshabilitados || []);
        }
      } catch (error) {
        console.error('Error al cargar horarios deshabilitados:', error);
      }
    };

    if (canchaId) {
      cargarHorariosDeshabilitados();
    }
  }, [canchaId]);
  
  // El dueño puede ver 8 días: hoy (0) hasta día 7
  const maxDias = 7; // hoy + 7 días = 8 días totales
  
  // Calcular las 8 fechas a mostrar (de hoy hasta día+7)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const calcularFechas8Dias = () => {
    const fechas = [];
    for (let i = 0; i <= maxDias; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };

  const fechas8Dias = calcularFechas8Dias();
  
  // Extraer los días de la semana para las 8 fechas
  // IMPORTANTE: Sin acentos para que coincida con los turnos formateados
  const diasSemanaMostrar = fechas8Dias.map(fecha => {
    const diaJS = fecha.getDay(); // 0=Dom, 1=Lun, etc.
    const diasArray = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return diasArray[diaJS];
  });
  
  // Mapeo para mostrar días con acentos en el UI
  const diasConAcentos = {
    'DOMINGO': 'DOMINGO',
    'LUNES': 'LUNES',
    'MARTES': 'MARTES',
    'MIERCOLES': 'MIÉRCOLES',
    'JUEVES': 'JUEVES',
    'VIERNES': 'VIERNES',
    'SABADO': 'SÁBADO'
  };
  
  // Para el renderizado, usar las 8 fechas calculadas
  const fechasSemanaActual = fechas8Dias;
  const dias = diasSemanaMostrar;

  // Funciones de navegación - ELIMINADAS (el dueño solo ve estos 8 días fijos)
  // No hay navegación anterior/siguiente

  // Editar precio de un turno específico
  const handleEditarPrecio = async (dia, hora) => {
    const turnoExistente = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);    // No permitir editar turnos ocupados por usuarios
    if (turnoExistente && turnoExistente.alquilerId && turnoExistente.alquilerId !== null) {
      alert("No se puede modificar un turno ocupado por un usuario");
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
      // ✅ ACTUALIZACIÓN INSTANTÁNEA: Actualizar estado local PRIMERO (optimistic update)
      const turnosActualizados = turnos.map(t => 
        t.id === turnoExistente.id 
          ? { ...t, precio: nuevoPrecio }
          : t
      );
      onTurnosChange(turnosActualizados);
      console.log("✅ Precio actualizado localmente (optimistic):", nuevoPrecio);
      console.log("📊 Turnos después de actualizar:", turnosActualizados.filter(t => t.id === turnoExistente.id));
      
      // Recalcular precio "desde" localmente
      recalcularPrecioDesdeLocal(turnosActualizados);
      
      // Luego actualizar en BD en segundo plano
      await actualizarTurnoEnBD(turnoExistente.id, { precio: nuevoPrecio });
      
      // Mostrar mensaje de éxito DESPUÉS de guardar
      console.log("💬 Mostrando alerta de éxito...");
      setTimeout(() => {
        alert(`✅ Precio actualizado exitosamente a $${nuevoPrecio.toLocaleString('es-AR')}`);
        console.log("💬 Alerta mostrada");
      }, 100);
    } else {
      // Crear nuevo turno con actualización optimista
      
      // 1. Actualizar estado local inmediatamente (optimistic update)
      const turnoTemporal = {
        id: `temp-${Date.now()}`, // ID temporal hasta que se sincronice con BD
        dia: dia,
        hora: hora,
        precio: nuevoPrecio,
        reservado: false, // Nuevo turno debe estar disponible
        alquilerId: null,
        deshabilitado: false,
        fecha: new Date().toISOString() // Fecha temporal
      };
      
      const turnosConNuevo = [...turnos, turnoTemporal];
      onTurnosChange(turnosConNuevo);
      console.log("✅ Turno agregado localmente (optimistic):", turnoTemporal);
      
      // Recalcular precio "desde" localmente con el nuevo turno
      recalcularPrecioDesdeLocal(turnosConNuevo);
      
      // 2. Crear turno en la base de datos en segundo plano
      try {
        const nuevoTurnoCreado = await crearTurnoEnBD(canchaId, dia, hora, nuevoPrecio);
        console.log("✅ Turno creado en BD:", nuevoTurnoCreado);
        
        // 3. Actualizar el turno temporal con los datos reales de la BD
        const turnosActualizados = turnosConNuevo.map(turno => 
          turno.id === turnoTemporal.id ? {
            ...turno,
            id: nuevoTurnoCreado.id,
            fecha: nuevoTurnoCreado.fecha
          } : turno
        );
        
        onTurnosChange(turnosActualizados);
        console.log("✅ Turno sincronizado con BD");
        
        // Mostrar mensaje de éxito
        alert(`✅ Turno creado exitosamente con precio $${nuevoPrecio.toLocaleString('es-AR')}`);
        
      } catch (error) {
        console.error("❌ Error al crear turno:", error);
        
        // Manejo específico para errores de cancha inexistente
        if (error.message.includes('Foreign key constraint') || 
            error.message.includes('cancha') || 
            error.message.includes('not found')) {
          alert(`❌ Error: La cancha con ID ${canchaId} no existe en la base de datos. Por favor, verifica que estés editando una cancha válida.`);
        } else {
          alert(`❌ Error al crear turno: ${error.message}`);
        }
        return;
      }
    }

    // Para turnos existentes, la actualización ya se hizo directamente en BD y localmente
    // Para turnos nuevos, se usa actualización optimista
  };

  // Toggle estado del turno (disponible/ocupado/deshabilitado manualmente por dueño)
  const handleToggleEstado = async (e, dia, hora) => {
    e.preventDefault();
    e.stopPropagation();
    
    const turno = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
    if (!turno) return;

    // Cambiar el estado: 
    // - Si está ocupado por usuario -> no se puede cambiar
    // - Si está disponible -> ocupar manualmente 
    // - Si está ocupado manualmente -> liberar
    if (turno.alquilerId && turno.alquilerId !== null) {
      const confirmar = confirm("¿Estás seguro de que quieres dar de baja esta reserva de usuario? Esta acción no se puede deshacer.");
      if (!confirmar) return;
      
      // Dar de baja reserva de usuario (convertir a disponible)
      const nuevoEstado = { reservado: false, alquilerId: null };
      
      try {
        await actualizarTurnoEnBD(turno.id, nuevoEstado);
        
        const turnosActualizados = turnos.map(t => 
          t.id === turno.id 
            ? { ...t, ...nuevoEstado }
            : t
        );
        onTurnosChange(turnosActualizados);
        alert("Reserva de usuario dada de baja exitosamente");
      } catch (error) {
        console.error('Error al dar de baja reserva:', error);
        alert('Error al dar de baja la reserva');
      }
    } else {
      // Toggle entre disponible y ocupado manualmente
      const nuevoEstadoReservado = !turno.reservado;
      
      try {
        await actualizarTurnoEnBD(turno.id, { reservado: nuevoEstadoReservado });
        
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
    }
  };

  // Toggle deshabilitar/habilitar turno temporalmente
  const handleToggleDeshabilitadoTemporal = async (e, dia, hora) => {
    e.preventDefault();
    e.stopPropagation();
    
    const turno = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
    if (!turno) {
      console.error('❌ No se encontró turno para', dia, hora);
      return;
    }

    // Validar que el turno NO esté reservado por un usuario
    if (turno.reservado || turno.alquilerId) {
      alert('❌ No se puede modificar un turno reservado por un usuario.\n\nDebe esperar a que finalice la reserva.');
      return;
    }

    console.log('🔄 Toggle temporal:', { turno, estadoActual: turno.deshabilitado });

    const nuevoEstadoDeshabilitado = !turno.deshabilitado;
    const endpoint = nuevoEstadoDeshabilitado ? 'deshabilitar' : 'habilitar';
    
    try {
      setGuardandoCambios(true);
      
      const response = await fetch(`${API_BASE_URL}/turnos/${turno.id}/${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al ${endpoint} turno`);
      }

      await response.json();
      
      // Actualizar localmente
      const turnosActualizados = turnos.map(t => 
        t.id === turno.id 
          ? { ...t, deshabilitado: nuevoEstadoDeshabilitado }
          : t
      );
      
      console.log('✅ Turnos actualizados:', {
        turnoModificado: turnosActualizados.find(t => t.id === turno.id),
        totalTurnos: turnosActualizados.length
      });
      
      onTurnosChange(turnosActualizados);
      
      setGuardandoCambios(false);
      
      const accion = nuevoEstadoDeshabilitado ? 'deshabilitado' : 'habilitado';
      alert(`✅ Turno ${accion} temporalmente\n\n${dia} a las ${hora}`);
      
    } catch (error) {
      console.error(`Error al ${endpoint} turno:`, error);
      setGuardandoCambios(false);
      alert(`Error al ${endpoint} el turno. Inténtalo de nuevo.`);
    }
  };

  // Función para crear turno en la base de datos
  const crearTurnoEnBD = async (canchaId, dia, hora, precio) => {
    try {
      const response = await fetch(`${API_BASE_URL}/turnos/individual`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          canchaId: canchaId,
          dia: dia,
          hora: hora,
          precio: precio
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Manejo específico para diferentes tipos de errores
        if (response.status === 500 && errorData.error === 'Error interno del servidor') {
          throw new Error(`La cancha con ID ${canchaId} no existe. Por favor verifica que la cancha sea válida.`);
        }
        
        // Si el turno ya existe, recargar datos para sincronizar
        if (response.status === 400 && (
          errorData.error === 'Ya existe un turno en ese horario' || 
          errorData.error === 'Ya existe un turno con esos datos'
        )) {
          console.log('⚠️ Turno ya existe, recargando datos...');
          // Recargar turnos desde la BD para sincronizar
          try {
            const reloadResponse = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}`);
            if (reloadResponse.ok) {
              const turnosData = await reloadResponse.json();
              
              const obtenerDiaSemana = (fechaISO) => {
                const fecha = new Date(fechaISO);
                const diasSemanaBD = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
                return diasSemanaBD[fecha.getUTCDay()];
              };
              
              const formatearHora = (horaISO) => {
                const fecha = new Date(horaISO);
                const horas = fecha.getUTCHours().toString().padStart(2, '0');
                const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
                const horaFormateada = `${horas}:${minutos}`;
                console.log(`🕐 FORMATEAR HORA 2: ${horaISO} -> ${horaFormateada}`);
                return horaFormateada;
              };
              
              // FILTRAR SOLO TURNOS DE LA SEMANA ACTUAL (desde hoy hasta +6 días)  
              const hoy = new Date();
              const inicioSemana = new Date(hoy);
              inicioSemana.setHours(0, 0, 0, 0);
              
              const finSemana = new Date(hoy);
              finSemana.setDate(hoy.getDate() + 6);
              finSemana.setHours(23, 59, 59, 999);

              const turnosEstaSemana = (turnosData.turnos || turnosData || []).filter(turno => {
                if (!turno || !turno.fecha) return false; // Validar que el turno y fecha existan
                const fechaTurno = new Date(turno.fecha);
                return fechaTurno >= inicioSemana && fechaTurno <= finSemana;
              });

              const turnosFormateados = turnosEstaSemana.map(turno => ({
                id: turno.id,
                dia: obtenerDiaSemana(turno.fecha),
                hora: formatearHora(turno.horaInicio),
                precio: turno.precio,
                reservado: turno.reservado,
                alquilerId: turno.alquilerId,
                fecha: turno.fecha
              }));
              
              onTurnosChange(turnosFormateados);
              
              // Encontrar el turno que ya existe y actualizarlo con el nuevo precio
              const turnoExistente = turnosFormateados.find(t => 
                String(t.dia).toUpperCase() === dia && t.hora === hora
              );
              
              if (turnoExistente) {
                console.log('🔄 Turno encontrado, actualizando precio a:', precio);
                await actualizarTurnoEnBD(turnoExistente.id, { precio });
                
                // Actualizar estado local con el nuevo precio
                const turnosConPrecioActualizado = turnosFormateados.map(t =>
                  t.id === turnoExistente.id ? { ...t, precio } : t
                );
                onTurnosChange(turnosConPrecioActualizado);
                recalcularPrecioDesdeLocal(turnosConPrecioActualizado);
                
                alert(`✅ Precio del turno actualizado a $${precio.toLocaleString('es-AR')}`);
              } else {
                alert(`El turno de ${dia} a las ${hora} ya existe. Se ha actualizado la vista.`);
              }
              
              return; // No lanzar error, solo informar
            }
          } catch (reloadError) {
            console.error('Error recargando turnos:', reloadError);
          }
        }
        
        throw new Error(errorData.error || `Error al crear turno (${response.status})`);
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
        headers: getAuthHeaders(),
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

  // Función para eliminar turno
  const handleEliminarTurno = async (e, dia, hora) => {
    e.preventDefault();
    e.stopPropagation();
    
    const turno = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
    if (!turno || !turno.id) {
      alert("No se puede eliminar: turno no encontrado");
      return;
    }

    // No permitir eliminar turnos ocupados por usuarios
    if (turno.alquilerId && turno.alquilerId !== null) {
      alert("No se puede eliminar un turno ocupado por un usuario");
      return;
    }

    // Abrir modal de confirmación
    setModalEliminar({ turno, dia, hora });
  };

  const confirmarEliminarTemporal = async () => {
    const { turno, dia, hora } = modalEliminar;
    
    try {
      // Si el turno tiene ID temporal, solo eliminarlo localmente
      if (String(turno.id).startsWith('temp-')) {
        const turnosActualizados = turnos.filter(t => t.id !== turno.id);
        onTurnosChange(turnosActualizados);
        setModalEliminar(null);
        alert(`✅ Turno temporal eliminado.\n\nEste turno no se guardó en la base de datos.`);
        return;
      }
      
      setGuardandoCambios(true);
      
      // 1. Deshabilitar el horario permanentemente en el cronograma
      // Normalizar el día (sin acentos) para que coincida con el enum del backend
      const diaNormalizado = dia
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos
      
      const responseHorario = await fetch(`${API_BASE_URL}/horarios-deshabilitados`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          canchaId: canchaId,
          dia: diaNormalizado,
          hora: hora,
          motivo: 'Deshabilitado manualmente por el dueño'
        })
      });

      if (!responseHorario.ok) {
        const errorData = await responseHorario.json();
        console.error('Error al deshabilitar horario:', errorData);
        // Continuar con la eliminación aunque falle el deshabilitar
      } else {
        const horarioData = await responseHorario.json();
        console.log('✅ Horario deshabilitado permanentemente:', horarioData);
        
        // Actualizar la lista local de horarios deshabilitados
        setHorariosDeshabilitados(prev => [...prev, horarioData.horarioDeshabilitado]);
      }
      
      // 2. Eliminar el turno actual de la BD
      const responseTurno = await fetch(`${API_BASE_URL}/turnos/individual/${turno.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!responseTurno.ok) {
        throw new Error('Error al eliminar turno');
      }

      // 3. Actualizar localmente removiendo el turno
      const turnosActualizados = turnos.filter(t => t.id !== turno.id);
      onTurnosChange(turnosActualizados);
      
      setModalEliminar(null);
      setGuardandoCambios(false);
      
      alert(`✅ Turno de ${dia} ${hora} eliminado permanentemente.\n\nEste horario ya NO se generará automáticamente.\n\nPara reactivarlo, ve a "Gestión de Horarios Deshabilitados".`);
    } catch (error) {
      console.error('❌ Error al eliminar turno:', error);
      setGuardandoCambios(false);
      setModalEliminar(null);
      alert('Error al eliminar el turno. Inténtalo de nuevo.');
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
      
      {/* Información de rango visible */}
      <div className="bg-accent border border-primary rounded-lg p-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">
            Próximos 8 Días
          </p>
          <p className="text-sm text-secondary">
            {fechasSemanaActual[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} - {fechasSemanaActual[7].toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <p className="text-xs text-secondary text-center mt-2">
          Como dueño puedes ver y editar un día más que el cliente para preparar precios
        </p>
      </div>
      
      <div className="mb-10 p-4 bg-accent border border-primary rounded-lg">
        <h4 className="font-semibold text-primary mb-2">📝 Instrucciones:</h4>
        <ul className="text-sm text-primary space-y-1 mb-3">
          <li>• <strong>Cambiar precio:</strong> Clic en cualquier horario</li>
          <li>• <strong>Deshabilitar/Habilitar:</strong> Clic derecho en el círculo de estado</li>
          <li>• Los cambios se guardan automáticamente y se ven en ReservaPage</li>
        </ul>
        
        {/* Leyenda de colores */}
        <div className="border-t border-primary pt-2">
          <p className="text-xs font-semibold text-primary mb-1">Leyenda de colores:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Finalizado (pasado)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span>Sin turno</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-9 gap-1 text-center font-semibold min-w-[900px]">
          <div></div>
          {dias.map((dia, index) => {
            const fechaDia = fechasSemanaActual[index];
            const esFechaActual = fechaDia.toDateString() === hoy.toDateString();
            const fechaKey = `${fechaDia.getDate()}-${fechaDia.getMonth()}`; // Key única usando fecha
            
            return (
              <div key={fechaKey} className="py-2 text-gray-700 text-sm md:text-base relative">
                <div className={`${esFechaActual ? 'font-bold text-primary' : ''}`}>
                  {diasConAcentos[dia] || dia}
                </div>
                <div className={`text-xs ${esFechaActual ? 'text-primary font-bold' : 'text-gray-500'}`}>
                  {fechaDia.getDate()}/{fechaDia.getMonth() + 1}
                </div>
                {/* Indicador visual para el día actual */}
                {esFechaActual && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}
          {horas.map(hora => (
            <React.Fragment key={hora}>
              <div className="py-3 px-1 text-gray-600 font-bold">{hora}</div>
              {dias.map((dia, index) => {
                const fechaDia = fechasSemanaActual[index];
                const fechaKey = `${fechaDia.getDate()}-${fechaDia.getMonth()}`; // Key única
                const turno = turnos.find(t => String(t.dia).toUpperCase() === dia && t.hora === hora);
                
                // Determinar el estado del turno
                let estadoTurno, clasesBoton, esEditable;
                
                // Determinar si el turno ya pasó
                // Priorizar el campo yaPaso del backend si está disponible en el turno
                let esPasado;
                if (turno && typeof turno.yaPaso === 'boolean') {
                  // Usar el campo del backend si está disponible
                  esPasado = turno.yaPaso;
                } else {
                  // Calcular localmente si no viene del backend
                  // Un turno está pasado si:
                  // 1. La fecha es anterior a hoy, O
                  // 2. Es hoy pero la hora ya pasó
                  const hoyInicio = new Date();
                  hoyInicio.setHours(0, 0, 0, 0);
                  
                  const fechaDiaInicio = new Date(fechaDia);
                  fechaDiaInicio.setHours(0, 0, 0, 0);
                  
                  const esHoy = fechaDiaInicio.getTime() === hoyInicio.getTime();
                  const horaActual = new Date().getHours();
                  const horaTurno = parseInt(hora.split(':')[0]);
                  
                  // Un turno está pasado solo si la hora ya finalizó (no si está en curso)
                  esPasado = fechaDiaInicio < hoyInicio || (esHoy && horaTurno < horaActual);
                }
                
                // Normalizar el día para comparar con horarios deshabilitados (sin tildes)
                const diaNormalizado = dia
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "");
                
                // Verificar si este horario está deshabilitado permanentemente
                const estaDeshabilitadoPermanentemente = horariosDeshabilitados.some(
                  h => h.dia === diaNormalizado && h.hora === hora
                );
                
                if (turno && esPasado) {
                  // Turno finalizado (pasado) - SOLO si el turno existe
                  estadoTurno = 'finalizado';
                  clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-white font-bold bg-gray-400";
                  esEditable = false;
                } else if (estaDeshabilitadoPermanentemente) {
                  // Horario deshabilitado permanentemente - no se muestra nada, no es clickeable
                  estadoTurno = 'deshabilitado-permanente';
                  clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-gray-500 font-bold bg-gray-300 opacity-40 cursor-not-allowed";
                  esEditable = false;
                } else if (turno) {
                  // PRIMERO: Verificar si está deshabilitado temporalmente (prioridad máxima)
                  if (turno.deshabilitado) {
                    estadoTurno = 'deshabilitado-temporal';
                    clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-white font-bold bg-orange-500";
                    esEditable = true; // Se puede editar para habilitarlo de nuevo
                  } else if (turno.alquilerId && turno.alquilerId !== null) {
                    // Ocupado por un usuario - se puede dar de baja
                    estadoTurno = 'ocupado';
                    clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-white font-bold bg-red-300";
                    esEditable = true;
                  } else if (turno.reservado) {
                    // Ocupado manualmente por el dueño - se puede liberar
                    estadoTurno = 'ocupado';
                    clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-white font-bold bg-red-300";
                    esEditable = true;
                  } else {
                    // Disponible - se puede ocupar manualmente
                    estadoTurno = 'disponible';
                    clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-white font-bold bg-accent hover:bg-secondary";
                    esEditable = true;
                  }
                } else {
                  // Sin turno definido - mostrar botón + para crear
                  estadoTurno = 'sin-turno';
                  clasesBoton = "w-full h-full py-3 rounded-md transition-colors duration-200 relative text-gray-400 font-bold bg-gray-200 hover:bg-gray-300";
                  esEditable = true;
                }

                return (
                  <div key={`${fechaKey}-${hora}`} className="p-1">
                    <button 
                      className={clasesBoton}
                      onClick={() => esEditable ? handleEditarPrecio(dia, hora) : null}
                      disabled={!esEditable}
                      title={
                        esPasado ? "Turno finalizado - No editable" :
                        estadoTurno === 'deshabilitado-temporal' ? "Deshabilitado temporalmente - Clic en ▶️ para habilitar" :
                        estadoTurno === 'deshabilitado-permanente' ? "Horario deshabilitado permanentemente - No se generan turnos automáticamente" :
                        estadoTurno === 'ocupado' ? "Ocupado - Clic para dar de baja" :
                        estadoTurno === 'disponible' ? "Disponible - Clic para ocupar/editar" :
                        "Sin turno - Clic para crear"
                      }
                    >
                      {/* Mostrar contenido según el estado */}
                      {turno ? (
                        <>
                          ${(turno.precio / 1000).toFixed(0)}k
                        </>
                      ) : 
                       estadoTurno === 'deshabilitado-permanente' ? '🚫' :
                       '+'}
                      
                      {/* Indicadores visuales */}
                      {esPasado && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs bg-gray-400 bg-opacity-100 px-1 rounded">FINALIZADO</span>
                        </div>
                      )}
                      
                      {turno && esEditable && !esPasado && (
                        <>
                          <div 
                            onClick={(e) => handleToggleEstado(e, dia, hora)}
                            className={`absolute top-1 right-1 h-4 w-4 rounded-full cursor-pointer ${
                              estadoTurno === 'reservado' ? 'bg-blue-600' :
                              estadoTurno === 'ocupado' ? 'bg-red-400' :
                              'bg-green-500'
                            }`}
                            title={
                              estadoTurno === 'reservado' ? 'Reservado por usuario - Clic para dar de baja' :
                              estadoTurno === 'ocupado' ? 'Ocupado manualmente - Clic para liberar' :
                              'Disponible - Clic para ocupar manualmente'
                            }
                          />
                          <div 
                            onClick={(e) => {
                              // No permitir toggle si está reservado
                              if (turno.reservado || turno.alquilerId) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleToggleDeshabilitadoTemporal(e, dia, hora);
                            }}
                            className={`absolute bottom-1 right-1 h-5 w-5 rounded flex items-center justify-center ${
                              (turno.reservado || turno.alquilerId) 
                                ? 'cursor-not-allowed opacity-50' 
                                : 'hover:bg-orange-500 cursor-pointer'
                            }`}
                            title={
                              (turno.reservado || turno.alquilerId)
                                ? '❌ No se puede modificar - Turno reservado por usuario'
                                : turno.deshabilitado 
                                  ? 'Deshabilitado temporalmente - Clic para habilitar' 
                                  : 'Disponible - Clic para deshabilitar temporalmente'
                            }
                          >
                            {turno.deshabilitado ? (
                              <FaPlay className="text-xs text-white" />
                            ) : (
                              <FaPause className="text-xs text-white" />
                            )}
                          </div>
                          <div 
                            onClick={(e) => {
                              // La validación ya está en handleEliminarTurno, pero prevenir visualmente
                              if (turno.reservado || turno.alquilerId) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleEliminarTurno(e, dia, hora);
                            }}
                            className={`absolute top-1 left-1 h-4 w-4 rounded flex items-center justify-center ${
                              (turno.reservado || turno.alquilerId)
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-canchaRed cursor-pointer'
                            }`}
                            title={
                              (turno.reservado || turno.alquilerId)
                                ? '❌ No se puede eliminar - Turno reservado por usuario'
                                : 'Eliminar turno permanentemente'
                            }
                          >
                            <FaTrash className="text-white text-xs" />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Eliminar Turno
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>{modalEliminar.dia}</strong> a las <strong>{modalEliminar.hora}</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Precio: <strong>${modalEliminar.turno.precio.toLocaleString('es-AR')}</strong>
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ Eliminación Permanente
                </p>
                <p className="text-xs text-yellow-700">
                  Este horario se deshabilitará <strong>permanentemente</strong> en el cronograma. 
                  No se generará automáticamente hasta que lo reactives desde "Gestión de Horarios".
                </p>
              </div>
              
              <p className="text-xs text-gray-500">
                Si solo quieres deshabilitar temporalmente, usa el botón de pausa en lugar de eliminar.
              </p>
            </div>

            <div className="space-y-3">
              {/* Confirmar eliminación */}
              <button
                onClick={confirmarEliminarTemporal}
                disabled={guardandoCambios}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {guardandoCambios ? (
                  <>
                    <span className="animate-spin">⏳</span> Eliminando...
                  </>
                ) : (
                  <>
                    <FaTrash className="text-white" /> Eliminar Permanentemente
                  </>
                )}
              </button>

              {/* Cancelar */}
              <button
                onClick={() => setModalEliminar(null)}
                disabled={guardandoCambios}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarioEdicionTurnos;