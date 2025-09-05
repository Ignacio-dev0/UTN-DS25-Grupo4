import React, { useState } from 'react';
import { mockSolicitudes, mockComplejosAprobados } from '../data/solicitudes.js';
import SolicitudDetalle from '../components/SolicitudDetalle.jsx';
import ListaSolicitudes from '../components/ListaSolicitudes.jsx';
import ComplejosAprobadosLista from '../components/ComplejosAprobadosLista.jsx'; 
import GestionDeportes from '../components/GestionDeportes.jsx';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);
  const [complejosAprobados, setComplejosAprobados] = useState(mockComplejosAprobados);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(solicitudes[0] || null);

  const handleApprove = (solicitudId) => {
    const solicitudAprobada = solicitudes.find(s => s.id === solicitudId);
    if (!solicitudAprobada) return;

    const nuevoComplejo = {
      id: complejosAprobados.length + 100, 
      nombreComplejo: solicitudAprobada.nombreComplejo,
      ubicacion: 'Ubicación a definir',
      adminEmail: `admin@${solicitudAprobada.nombreComplejo.toLowerCase().replace(/\s/g, '')}.com`,
      fechaAprobacion: new Date().toISOString().slice(0, 10),
    };

    setComplejosAprobados(prev => [nuevoComplejo, ...prev]);
    const nuevasSolicitudes = solicitudes.filter(s => s.id !== solicitudId);
    setSolicitudes(nuevasSolicitudes);

    setSolicitudSeleccionada(nuevasSolicitudes[0] || null);
  };
  
  const handleDecline = (solicitudId) => {
    const nuevasSolicitudes = solicitudes.filter(s => s.id !== solicitudId);
    setSolicitudes(nuevasSolicitudes);
    setSolicitudSeleccionada(nuevasSolicitudes[0] || null);
  };
  
  const handleRemoveApproved = (complejoId) => {
      if (window.confirm("¿Estás seguro de que quieres eliminar este complejo de la lista de aprobados?")) {
          setComplejosAprobados(prev => prev.filter(c => c.id !== complejoId));
      }
  };
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
          </div>
        )}
        
        {activeTab === 'aprobados' && (
          <ComplejosAprobadosLista 
            complejos={complejosAprobados}
            onRemove={handleRemoveApproved}
          />
        )}

        {activeTab === 'deportes' && (
          <GestionDeportes />
        )}
        
      </div>
    </div>
  );
}

export default AdminPage;