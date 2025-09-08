import React, { useState, useEffect } from 'react';
import SolicitudDetalle from '../components/SolicitudDetalle.jsx';
import ListaSolicitudes from '../components/ListaSolicitudes.jsx';
import ComplejosAprobadosLista from '../components/ComplejosAprobadosLista.jsx'; 
import GestionDeportes from '../components/GestionDeportes.jsx';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [complejosAprobados, setComplejosAprobados] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar solicitudes desde el backend
  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/solicitudes');
      if (response.ok) {
        const data = await response.json();
        const solicitudesPendientes = (data.solicitudes || data || []).filter(s => s.estado === 'PENDIENTE');
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
      const response = await fetch('http://localhost:3000/api/complejos');
      if (response.ok) {
        const data = await response.json();
        setComplejosAprobados(data.complejos || data || []);
      }
    } catch (error) {
      console.error('Error cargando complejos:', error);
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
        fetchComplejosAprobados();
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
      const response = await fetch(`http://localhost:3000/api/complejos/${complejoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Complejo eliminado correctamente');
        fetchComplejosAprobados();
      } else {
        alert('Error al eliminar complejo');
      }
    } catch (error) {
      console.error('Error eliminando complejo:', error);
      alert('Error al eliminar complejo');
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
              <div className="p-8 text-center w-full">
                <p>Cargando solicitudes...</p>
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
          loading ? (
            <div className="p-8 text-center">
              <p>Cargando complejos...</p>
            </div>
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