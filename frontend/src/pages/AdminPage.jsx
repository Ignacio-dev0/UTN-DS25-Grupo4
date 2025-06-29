import React, { useState } from 'react';
import { mockSolicitudes, mockComplejosAprobados } from '../data/solicitudes.js';
import SolicitudDetalle from '../components/SolicitudDetalle.jsx';
import ListaSolicitudes from '../components/ListaSolicitudes.jsx';
import ComplejosAprobadosLista from '../components/ComplejosAprobadosLista.jsx'; 

function AdminPage() {
  // Estado para la pestaña activa ('solicitudes' o 'aprobados')
  const [activeTab, setActiveTab] = useState('solicitudes');
  // Estados para manejar las listas y la selección
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);
  const [complejosAprobados, setComplejosAprobados] = useState(mockComplejosAprobados);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(solicitudes[0]);

  return (
    <div className=" max-w-7xl mx-auto rounded-lg relative z-10">
      <div className="border-b border-gray-200 p-4">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'solicitudes'
                ? 'bg-primary text-light'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Solicitudes
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
            <SolicitudDetalle solicitud={solicitudSeleccionada} />
            <ListaSolicitudes 
              solicitudes={solicitudes.filter(s => s.id !== solicitudSeleccionada?.id)}
              onSelect={setSolicitudSeleccionada} 
              solicitudActiva={solicitudSeleccionada}
            />
          </div>
        )}
        
        {activeTab === 'aprobados' && (
          <ComplejosAprobadosLista complejos={complejosAprobados} />
        )}
      </div>
    </div>
  );
}

export default AdminPage;