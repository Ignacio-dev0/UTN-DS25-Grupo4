import React, { useState, useEffect } from 'react';
import SolicitudDetalle from '../components/SolicitudDetalle.jsx';
import ListaSolicitudes from '../components/ListaSolicitudes.jsx';
import ComplejosAprobadosLista from '../components/ComplejosAprobadosLista.jsx'; 
import GestionDeportes from '../components/GestionDeportes.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function AdminPage() {
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
      const response = await fetch('http://localhost:3000/api/admin/solicitudes');
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
            nombreComplejo: solicitud.complejo?.nombre || `Complejo de ${solicitud.usuario?.nombre || 'Usuario'} ${solicitud.usuario?.apellido || ''}`,
            calle: solicitud.complejo?.domicilio?.calle || 'No especificado',
            altura: solicitud.complejo?.domicilio?.altura || 'No especificado',
            imagen: solicitud.complejo?.image || null,
            // Información adicional del usuario
            usuarioNombre: `${solicitud.usuario?.nombre || ''} ${solicitud.usuario?.apellido || ''}`.trim() || 'Usuario sin nombre',
            usuarioCorreo: solicitud.usuario?.correo || 'Sin correo',
            usuarioTelefono: solicitud.usuario?.telefono || 'Sin teléfono',
            localidad: solicitud.complejo?.domicilio?.localidad?.nombre || 'No especificado'
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

  // Cargar complejos aprobados
  const fetchComplejosAprobados = async () => {
    try {
      setLoadingComplejos(true);
      const response = await fetch('http://localhost:3000/api/complejos/aprobados');
      if (response.ok) {
        const data = await response.json();
        console.log('Complejos aprobados recibidos:', data); // Debug
        setComplejosAprobados(data.complejos || data || []);
      }
    } catch (error) {
      console.error('Error cargando complejos:', error);
    } finally {
      setLoadingComplejos(false);
    }
  };

  const handleApprove = async (solicitudId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'APROBADA' }),
      });

      if (response.ok) {
        alert('Solicitud aprobada correctamente');
        // Recargar datos
        fetchSolicitudes();
        if (activeTab === 'aprobados') {
          fetchComplejosAprobados();
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
      const response = await fetch(`http://localhost:3000/api/admin/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'RECHAZADA' }),
      });

      if (response.ok) {
        alert('Solicitud rechazada correctamente');
        fetchSolicitudes();
      } else {
        alert('Error al rechazar solicitud');
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
      const response = await fetch(`http://localhost:3000/api/complejos/${complejoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Complejo eliminado correctamente');
        fetchComplejosAprobados();
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
  
  // Cargar datos al cambiar de tab
  useEffect(() => {
    if (activeTab === 'solicitudes') {
      fetchSolicitudes();
    } else if (activeTab === 'aprobados') {
      fetchComplejosAprobados();
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
          <button onClick={() => setActiveTab('aprobados')} className={getTabClass('aprobados')}>
              Complejos Aprobados
            </button>
            <button onClick={() => setActiveTab('deportes')} className={getTabClass('deportes')}>
              Deportes
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
        
        {activeTab === 'aprobados' && (
          loadingComplejos ? (
            <LoadingSpinner message="Cargando complejos..." />
          ) : (
            <ComplejosAprobadosLista 
              complejos={complejosAprobados}
              onRemove={handleRemoveApproved}
            />
          )
        )}

        {activeTab === 'deportes' && (
          <GestionDeportes />
        )}
        
      </div>
    </div>
  );
}

export default AdminPage;