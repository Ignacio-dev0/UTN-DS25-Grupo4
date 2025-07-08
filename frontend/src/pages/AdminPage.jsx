import React, { useState } from 'react';
import { mockSolicitudes, mockComplejosAprobados } from '../data/solicitudes.js';
import SolicitudDetalle from '../components/SolicitudDetalle.jsx';
import ListaSolicitudes from '../components/ListaSolicitudes.jsx';
import ComplejosAprobadosLista from '../components/ComplejosAprobadosLista.jsx'; 

function AdminPage() {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);
  const [complejosAprobados, setComplejosAprobados] = useState(mockComplejosAprobados);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(solicitudes[0] || null);

  const handleApprove = (solicitudId) => {
    const solicitudAprobada = solicitudes.find(s => s.id === solicitudId);
    if (!solicitudAprobada) return;

    const nuevoComplejo = {
      id: complejosAprobados.length + 100, // Un ID único
      nombreComplejo: solicitudAprobada.nombreComplejo,
      ubicacion: 'Ubicación a definir', // Se podría tomar de la solicitud
      adminEmail: `admin@${solicitudAprobada.nombreComplejo.toLowerCase().replace(/\s/g, '')}.com`,
      fechaAprobacion: new Date().toISOString().slice(0, 10), // Fecha de hoy
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

  return (
    <div className=" max-w-7xl mx-auto rounded-lg relative z-10">
      <div className="border-b border-gray-200 p-4">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'solicitudes'
                ? 'bg-secondary text-light'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Solicitudes {solicitudes.length > 0 && `(${solicitudes.length})`}
          </button>
          <button
            onClick={() => setActiveTab('aprobados')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'aprobados'
                ? 'bg-secondary text-light'
                : 'text-secondary hover:text-gray-700'
            }`}
          >
            Complejos Aprobados
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
      </div>
    </div>
  );
}

export default AdminPage;