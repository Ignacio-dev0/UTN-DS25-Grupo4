import React, { useState, useEffect } from 'react';
import SolicitudDetalle from '../components/SolicitudDetalle.jsx';
import ListaSolicitudes from '../components/ListaSolicitudes.jsx';
import ComplejosAprobadosLista from '../components/ComplejosAprobadosLista.jsx';
import GestionDeportes from '../components/GestionDeportes.jsx';
import GestionLocalidades from '../components/GestionLocalidades.jsx';
import GestionUsuarios from '../components/GestionUsuarios.jsx';
import GestionAdministradores from '../components/GestionAdministradores.jsx';
import GestionResenas from '../components/GestionResenas.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { API_BASE_URL } from '../config/api.js';function AdminPage() {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [complejosAprobados, setComplejosAprobados] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingComplejos, setLoadingComplejos] = useState(false);

  // Cargar solicitudes desde el backend
  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/solicitudes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const solicitudesPendientes = (data.solicitudes || data || [])
          .filter(s => s.estado === 'PENDIENTE')
          .map(solicitud => ({
            // Estructura original para compatibilidad
            id: solicitud.id,
            cuit: solicitud.cuit,
            estado: solicitud.estado,
            // Datos transformados para el componente SolicitudDetalle
            // ✅ solicitud ES el complejo, no tiene .complejo anidado
            nombreComplejo: solicitud.nombre || `Complejo de ${solicitud.usuario?.nombre || 'Usuario'} ${solicitud.usuario?.apellido || ''}`,
            calle: solicitud.domicilio?.calle || 'No especificado',
            altura: solicitud.domicilio?.altura || 'No especificado',
            imagen: solicitud.image || null,
            // Información adicional del usuario
            usuarioNombre: `${solicitud.usuario?.nombre || ''} ${solicitud.usuario?.apellido || ''}`.trim() || 'Usuario sin nombre',
            usuarioCorreo: solicitud.usuario?.email || 'Sin correo',
            usuarioTelefono: solicitud.usuario?.telefono || 'Sin teléfono',
            localidad: solicitud.domicilio?.localidad?.nombre || 'No especificado'
          }));
        setSolicitudes(solicitudesPendientes);
        setSolicitudSeleccionada(solicitudesPendientes[0] || null);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar complejos (aprobados y rechazados)
  const fetchComplejos = async () => {
    try {
      console.log('📥 Iniciando carga de complejos...');
      setLoadingComplejos(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/complejos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Datos recibidos del backend:', data);
        // Filtrar solo APROBADOS y RECHAZADOS (excluir PENDIENTES que están en solicitudes)
        const complejosFiltrados = (data.complejos || data || [])
          .filter(c => c.estado === 'APROBADO' || c.estado === 'RECHAZADO' || c.estado === 'OCULTO');
        console.log('✅ Complejos filtrados y cargados:', complejosFiltrados);
        setComplejosAprobados(complejosFiltrados);
      }
    } catch (error) {
      console.error('❌ Error cargando complejos:', error);
    } finally {
      setLoadingComplejos(false);
    }
  };

  const handleApprove = async (solicitudId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'APROBADO' }),
      });

      if (response.ok) {
        alert('Solicitud aprobada correctamente');
        // Recargar datos
        fetchSolicitudes();
        if (activeTab === 'complejos') {
          fetchComplejos();
        }
      } else {
        alert('Error al aprobar solicitud');
      }
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      alert('Error al aprobar solicitud');
    }
  };
  
  const handleDecline = async (solicitudId) => {
    if (!confirm('¿Estás seguro de rechazar esta solicitud?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'RECHAZADO' }),
      });

      if (response.ok) {
        alert('Solicitud rechazada correctamente');
        fetchSolicitudes();
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`Error al rechazar solicitud: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      alert('Error al rechazar solicitud');
    }
  };
  
  const handleRemoveApproved = async (complejoId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este complejo?")) return;
    
    try {
      setLoadingComplejos(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/complejos/${complejoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Complejo eliminado correctamente');
        fetchComplejos();
      } else {
        alert('Error al eliminar complejo');
        setLoadingComplejos(false);
      }
    } catch (error) {
      console.error('Error eliminando complejo:', error);
      alert('Error al eliminar complejo');
      setLoadingComplejos(false);
    }
  };

  const handleToggleVisibility = async (complejo) => {
    console.log('👁️  Toggle visibility para complejo:', { id: complejo.id, estadoActual: complejo.estado });
    const nuevoEstado = complejo.estado === 'OCULTO' ? 'APROBADO' : 'OCULTO';
    const accion = nuevoEstado === 'OCULTO' ? 'ocultar' : 'mostrar';
    console.log('➡️  Nuevo estado:', nuevoEstado);
    
    if (!window.confirm(`¿Estás seguro de que quieres ${accion} el complejo "${complejo.nombre}"?\n\nEsto ${accion === 'ocultar' ? 'ocultará' : 'mostrará'} también todas sus canchas.`)) return;
    
    try {
      setLoadingComplejos(true);
      const token = localStorage.getItem('token');
      
      // Actualizar estado del complejo
      console.log('🔄 Actualizando complejo en backend...');
      const response = await fetch(`${API_BASE_URL}/complejos/${complejo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        console.log('✅ Complejo actualizado en backend');
        
        // Calcular nuevo estado de las canchas ANTES de usarlo
        const nuevaActiva = nuevoEstado === 'APROBADO'; // true si se muestra, false si se oculta
        
        // Obtener las canchas del complejo para actualizar su estado (incluyendo inactivas)
        const canchasResponse = await fetch(`${API_BASE_URL}/canchas?complejoId=${complejo.id}&incluirInactivas=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (canchasResponse.ok) {
          const canchasData = await canchasResponse.json();
          const canchas = canchasData.canchas || canchasData || [];
          console.log(`🎾 Canchas encontradas:`, canchas.map(c => ({ id: c.id, activa: c.activa })));
          console.log(`🔄 Actualizando ${canchas.length} canchas a activa=${nuevaActiva}...`);
          
          // Actualizar cada cancha del complejo
          const updatePromises = canchas.map(async (cancha) => {
            console.log(`  📝 Actualizando cancha ${cancha.id} de activa=${cancha.activa} a activa=${nuevaActiva}`);
            const response = await fetch(`${API_BASE_URL}/canchas/${cancha.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ activa: nuevaActiva })
            });
            
            if (response.ok) {
              console.log(`  ✅ Cancha ${cancha.id} actualizada`);
            } else {
              console.log(`  ❌ Error actualizando cancha ${cancha.id}`);
            }
            
            return response;
          });

          await Promise.all(updatePromises);
          console.log('✅ Todas las canchas procesadas');
        }

        console.log('🔄 Recargando lista de complejos...');
        alert(`Complejo ${accion === 'ocultar' ? 'ocultado' : 'mostrado'} correctamente junto con sus canchas`);
        await fetchComplejos();
        console.log('✅ Lista de complejos recargada');
      } else {
        alert(`Error al ${accion} complejo`);
        setLoadingComplejos(false);
      }
    } catch (error) {
      console.error(`Error ${accion}ndo complejo:`, error);
      alert(`Error al ${accion} complejo`);
      setLoadingComplejos(false);
    }
  };
  
  // Cargar datos al cambiar de tab
  useEffect(() => {
    if (activeTab === 'solicitudes') {
      fetchSolicitudes();
    } else if (activeTab === 'complejos') {
      fetchComplejos();
    }
  }, [activeTab]);

  const getTabClass = (tabName) => {
    return `px-3 py-2 font-medium text-sm rounded-md transition-colors flex items-center ${
      activeTab === tabName
        ? 'bg-secondary text-light'
        : 'text-gray-600 hover:bg-accent hover:text-gray-800' 
    }`;
  };

  return (
    <div className=" max-w-7xl mx-auto rounded-lg relative z-10">
      <div className="border-b border-gray-200 p-4">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button onClick={() => setActiveTab('solicitudes')} className={getTabClass('solicitudes')}>
              Solicitudes 
              {solicitudes.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {solicitudes.length}
                </span>
              )}
          </button>
          <button onClick={() => setActiveTab('complejos')} className={getTabClass('complejos')}>
              Gestión Complejos
            </button>
            <button onClick={() => setActiveTab('deportes')} className={getTabClass('deportes')}>
              Deportes
            </button>
            <button onClick={() => setActiveTab('localidades')} className={getTabClass('localidades')}>
              Localidades
            </button>
            <button onClick={() => setActiveTab('usuarios')} className={getTabClass('usuarios')}>
              Usuarios
            </button>
            <button onClick={() => setActiveTab('administradores')} className={getTabClass('administradores')}>
              Gestión Administradores
            </button>
            <button onClick={() => setActiveTab('resenas')} className={getTabClass('resenas')}>
              Reseñas
            </button>
        </nav>
      </div>
      <div>
        {activeTab === 'solicitudes' && (
          <div className="flex">
            {loading ? (
              <div className="w-full">
                <LoadingSpinner message="Cargando solicitudes..." />
              </div>
            ) : (
              <>
                <SolicitudDetalle 
                  solicitud={solicitudSeleccionada}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                />
                <ListaSolicitudes 
                  solicitudes={solicitudes}
                  onSelect={setSolicitudSeleccionada} 
                  solicitudActiva={solicitudSeleccionada}
                />
              </>
            )}
          </div>
        )}
        
        {activeTab === 'complejos' && (
          loadingComplejos ? (
            <LoadingSpinner message="Cargando complejos..." />
          ) : (
            <ComplejosAprobadosLista 
              complejos={complejosAprobados}
              onRemove={handleRemoveApproved}
              onToggleVisibility={handleToggleVisibility}
            />
          )
        )}

        {activeTab === 'deportes' && (
          <GestionDeportes />
        )}

        {activeTab === 'localidades' && (
          <GestionLocalidades />
        )}

        {activeTab === 'usuarios' && (
          <GestionUsuarios />
        )}

        {activeTab === 'administradores' && (
          <GestionAdministradores />
        )}

        {activeTab === 'resenas' && (
          <GestionResenas />
        )}
        
      </div>
    </div>
  );
}

export default AdminPage;