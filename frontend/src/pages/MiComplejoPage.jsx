import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import ComplejoInfo from '../components/ComplejoInfo.jsx';
import ListaCanchasComplejo from '../components/ListaCanchasComplejo.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 

function MiComplejoPage() {
  const { complejoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [infoDelComplejo, setInfoDelComplejo] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [ultimosAlquileres, setUltimosAlquileres] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autorización antes de cargar datos
  useEffect(() => {
    const verificarAcceso = async () => {
      if (!isAuthenticated) {
        navigate('/');
        return;
      }

      // Para administradores, permitir acceso directo
      if (user?.rol === 'admin') {
        return; // Los admins pueden acceder a cualquier complejo
      }

      // Para dueños, verificar que tengan una solicitud aprobada
      if (user?.rol === 'owner') {
        try {
          const response = await fetch(`http://localhost:3000/api/admin/solicitudes?usuarioId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            const solicitud = data.solicitudes?.find(s => s.usuarioId === user.id);
            
            if (!solicitud || solicitud.estado !== 'APROBADA') {
              navigate('/estado-solicitud');
              return;
            }

            // Verificar que el complejoId corresponde al usuario
            if (solicitud.complejo?.id !== parseInt(complejoId)) {
              navigate('/estado-solicitud');
              return;
            }
          }
        } catch (error) {
          console.error('Error verificando acceso:', error);
          navigate('/estado-solicitud');
        }
      } else {
        // Si no es admin ni owner, redirigir
        navigate('/');
      }
    };

    verificarAcceso();
  }, [isAuthenticated, user, complejoId, navigate]);
  
  // Función para recargar solo las canchas
  const recargarCanchas = useCallback(async () => {
    try {
      console.log('🔄 Recargando canchas para complejo:', complejoId);
      // Usar el endpoint específico para canchas por complejo
      const canchasResponse = await fetch(`http://localhost:3000/api/canchas/complejo/${complejoId}`);
      if (canchasResponse.ok) {
        const canchasData = await canchasResponse.json();
        console.log('✅ Canchas cargadas del backend:', canchasData);
        const canchasConEstado = (canchasData.canchas || []).map(cancha => ({
          ...cancha,
          activa: cancha.activa !== false,
          estado: (cancha.activa !== false) ? 'habilitada' : 'deshabilitada',
          // Mantener el objeto deporte completo para tener acceso al icono
          deporte: cancha.deporte || { nombre: 'No especificado', icono: '⚽' }
        }));
        console.log('📊 Canchas procesadas:', canchasConEstado);
        setCanchas(canchasConEstado);
      } else {
        console.error('❌ Error en la respuesta de canchas:', canchasResponse.status);
        setCanchas([]);
      }
    } catch (error) {
      console.error('❌ Error recargando canchas:', error);
      setCanchas([]);
    }
  }, [complejoId]);
  
  // Cargar datos del complejo desde el backend
  useEffect(() => {
    const fetchAlquileres = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/alquileres/complejo/${complejoId}`);
        if (response.ok) {
          const data = await response.json();
          const alquileresCompletos = data.alquileres || data || [];
          
          // Calcular el total de ingresos de todos los alquileres
          const totalIngresos = alquileresCompletos.reduce((suma, alquiler) => {
            const turno = alquiler.turnos?.[0]; // Obtener el primer turno
            return suma + (turno?.precio || 0);
          }, 0);
          
          // Formatear solo los últimos 5 para mostrar en la lista
          const alquileresFormateados = alquileresCompletos
            .slice(0, 5) // Solo los últimos 5
            .map(alquiler => {
              const turno = alquiler.turnos?.[0]; // Obtener el primer turno
              return {
                id: alquiler.id,
                cancha: `Cancha N°${turno?.cancha?.nroCancha || 'N/A'}`,
                fecha: turno?.fecha ? new Date(turno.fecha).toLocaleDateString('es-AR') : 'N/A',
                total: turno?.precio || 0
              };
            });
          setUltimosAlquileres(alquileresFormateados);
          
          // Actualizar el balance del complejo
          setInfoDelComplejo(prev => prev ? { ...prev, balance: totalIngresos } : null);
        } else {
          setUltimosAlquileres([]);
        }
      } catch (error) {
        console.error('Error cargando alquileres:', error);
        setUltimosAlquileres([]);
      }
    };

    const fetchComplejoData = async () => {
      try {
        setLoading(true);
        
        // Obtener información del complejo con relaciones incluidas
        const complejoResponse = await fetch(`http://localhost:3000/api/complejos/${complejoId}`);
        if (!complejoResponse.ok) {
          throw new Error('Error al cargar el complejo');
        }
        const complejoData = await complejoResponse.json();
        const complejo = complejoData.complejo || complejoData;
        
        // Solo verificar estado si no es admin
        if (user?.rol !== 'admin') {
          if (complejo.activo === false || complejo.solicitud?.estado !== 'APROBADA') {
            setError('El complejo no está disponible o está suspendido');
            return;
          }
        }
        
        setInfoDelComplejo(complejo);

        // Cargar servicios del complejo - ahora usando IDs
        const serviciosResponse = await fetch(`http://localhost:3000/api/servicios`);
        if (serviciosResponse.ok) {
          const serviciosData = await serviciosResponse.json();
          const serviciosIdsDelComplejo = serviciosData.servicios
            .filter(servicio => 
              servicio.complejos.some(cs => cs.complejoId === parseInt(complejoId) && cs.disponible)
            )
            .map(servicio => servicio.id);
          
          // Agregar servicios al complejo (ahora como IDs)
          setInfoDelComplejo(prev => ({
            ...prev,
            servicios: serviciosIdsDelComplejo
          }));
        }

        // Obtener canchas del complejo
        await recargarCanchas();
        
        // Cargar alquileres del complejo
        await fetchAlquileres();
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (complejoId) {
      fetchComplejoData();
    }
  }, [complejoId, user?.rol, recargarCanchas]);

  // Recargar datos cuando la página recobre el foco (útil cuando volvemos de editar una cancha)
  useEffect(() => {
    const handleFocus = () => {
      if (complejoId && !loading) {
        console.log('Recargando canchas por focus del window');
        recargarCanchas();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [complejoId, loading, recargarCanchas]);

  // Recargar datos cuando cambia la ubicación (útil cuando navegamos de vuelta)
  useEffect(() => {
    if (location.pathname === `/micomplejo/${complejoId}` && !loading) {
      console.log('Recargando canchas por cambio de location');
      recargarCanchas();
      
      // Si viene con state indicando que debe recargar
      if (location.state?.shouldReload) {
        console.log('Recarga forzada por state');
        setTimeout(() => {
          recargarCanchas();
        }, 100);
      }
    }
  }, [location.pathname, location.state, complejoId, loading, recargarCanchas]);

    const handleToggleEdit = async () => {
    if(isEditing) {
      try {
        // Preparar datos para actualizar - servicios ya vienen como IDs
        const datosParaActualizar = {
          nombre: infoDelComplejo.nombre?.trim() || "",
          descripcion: infoDelComplejo.descripcion?.trim() || "",
          image: infoDelComplejo.image || null,
          horarios: infoDelComplejo.horarios?.trim() || "",
          servicios: infoDelComplejo.servicios || []
        };
        
        console.log('Datos a enviar:', datosParaActualizar);
        
        const response = await fetch(`http://localhost:3000/api/complejos/${complejoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosParaActualizar),
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log("Datos del complejo guardados correctamente:", responseData);
          alert('Información del complejo actualizada correctamente');
          
          // Actualizar el estado local con los datos guardados
          setInfoDelComplejo(prev => ({
            ...prev,
            ...datosParaActualizar
          }));
        } else {
          const errorData = await response.json();
          console.error('Error del backend:', errorData);
          throw new Error(errorData.message || 'Error al actualizar el complejo');
        }
      } catch (error) {
        console.error('Error guardando datos del complejo:', error);
        alert('Error al guardar los cambios: ' + error.message);
      }
    }
    setIsEditing(!isEditing);
  };
  
  const handleDeleteCancha = async (canchaId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCanchas(prevCanchas => prevCanchas.filter(cancha => cancha.id !== canchaId));
        alert('Cancha eliminada correctamente');
      } else {
        throw new Error('Error al eliminar la cancha');
      }
    } catch (error) {
      console.error('Error eliminando cancha:', error);
      alert('Error al eliminar la cancha');
    }
  };

  const handleDisableCancha = async (canchaId) => {
    const cancha = canchas.find(c => c.id === canchaId);
    const nuevaActiva = !cancha.activa;
    
    try {
      const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activa: nuevaActiva }),
      });
      
      if (response.ok) {
        setCanchas(prevCanchas =>
          prevCanchas.map(cancha =>
            cancha.id === canchaId
              ? { ...cancha, activa: nuevaActiva, estado: nuevaActiva ? 'habilitada' : 'deshabilitada' }
              : cancha
          )
        );
        alert(`Cancha ${nuevaActiva ? 'habilitada' : 'deshabilitada'} correctamente`);
      } else {
        throw new Error('Error al actualizar el estado de la cancha');
      }
    } catch (error) {
      console.error('Error actualizando estado de cancha:', error);
      alert('Error al cambiar el estado de la cancha');
    }
  };

  // Crear turnos para una cancha específica
  const crearTurnos = async (canchaId, turnos) => {
    try {
      const promises = turnos.map(turno => 
        fetch('http://localhost:3000/api/turnos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...turno,
            canchaId: parseInt(canchaId)
          }),
        })
      );

      const responses = await Promise.all(promises);
      const failed = responses.filter(r => !r.ok);
      
      if (failed.length === 0) {
        alert(`${turnos.length} turnos creados correctamente`);
      } else {
        alert(`Se crearon ${responses.length - failed.length} de ${turnos.length} turnos`);
      }
    } catch (error) {
      console.error('Error creando turnos:', error);
      alert('Error al crear turnos');
    }
  };

  // Generar turnos automáticamente para los próximos 7 días
  const generarTurnosAutomaticos = async (canchaId) => {
    if (!confirm('¿Generar turnos automáticamente para los próximos 7 días (9:00 a 22:00)?')) return;
    
    const turnos = [];
    const hoy = new Date();
    
    for (let dia = 1; dia <= 7; dia++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + dia);
      
      for (let hora = 9; hora <= 21; hora++) {
        turnos.push({
          fecha: fecha.toISOString().split('T')[0],
          hora: `${hora.toString().padStart(2, '0')}:00`,
          precio: 15000 // Precio base, puede ser configurable
        });
      }
    }
    
    await crearTurnos(canchaId, turnos);
  };


  let puedeVerLaPagina = false;

  if (isAuthenticated && infoDelComplejo) {
    if (user.rol === 'admin') {
      puedeVerLaPagina = true;
    } 
    else if (user.rol === 'owner' && parseInt(user.id) === parseInt(infoDelComplejo.usuarioId)) {
      puedeVerLaPagina = true;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del complejo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8 rounded-lg relative z-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/admin" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-secondary">
            Volver al panel de administración
          </Link>
        </div>
      </div>
    );
  }

  if (!puedeVerLaPagina) {
    return (
      <div className="max-w-5xl mx-auto p-8 rounded-lg relative z-10">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h2 className="text-xl font-bold mb-2">Acceso denegado</h2>
          <p>No tienes permisos para ver este complejo.</p>
          <Link to="/admin" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-secondary">
            Volver al panel de administración
          </Link>
        </div>
      </div>
    );
  }

  console.log('Debug acceso:', {
    isAuthenticated,
    userRole: user?.rol, // Corregir: usar 'rol' en lugar de 'role'
    userId: user?.id,
    complejoUsuarioId: infoDelComplejo?.usuarioId,
    puedeVer: puedeVerLaPagina
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 rounded-lg shadow-2xl relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (error || !infoDelComplejo) {
    return (
        <div className="max-w-7xl mx-auto p-8 rounded-lg shadow-2xl relative z-10">
            <h1 className="text-2xl font-bold text-red-600">
              Error: {error || 'Complejo no encontrado'}
            </h1>
        </div>
    );
  }


  if (!puedeVerLaPagina) {
    return (
      <div className="text-center p-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="mt-2 text-gray-700">No tenés los permisos necesarios para gestionar este complejo.</p>
        <Link to="/" className="mt-4 inline-block bg-primary text-light px-4 py-2 rounded-md">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 rounded-lg relative z-10">
      <h1 className="text-3xl font-bold font-lora text-gray-800 border-b border-gray-200 pb-4 mb-4">
        Mi Complejo
      </h1>
      <div className="flex flex-col md:flex-row -mx-4">
        <ComplejoInfo 
          complejo={infoDelComplejo} 
          alquileres={ultimosAlquileres}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onComplejoChange={setInfoDelComplejo}
        />
        <ListaCanchasComplejo 
          canchas={canchas} 
          onDelete={handleDeleteCancha}
          onDisable={handleDisableCancha}
          onGenerarTurnos={generarTurnosAutomaticos}
          onRecargarCanchas={recargarCanchas}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default MiComplejoPage;