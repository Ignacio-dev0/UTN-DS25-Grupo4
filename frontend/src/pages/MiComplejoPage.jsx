import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { datosDeportes } from '../data/canchas.js';
import { datosComplejos } from '../data/complejos.js';
import ComplejoInfo from '../components/ComplejoInfo.jsx';
import ListaCanchasComplejo from '../components/ListaCanchasComplejo.jsx';
import { useAuth } from '../context/AuthContext.jsx'; 

function MiComplejoPage() {
  const { complejoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [infoDelComplejo, setInfoDelComplejo] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const complejoEncontrado = datosComplejos.find(c => c.id === parseInt(complejoId));
    setInfoDelComplejo(complejoEncontrado ? { ...complejoEncontrado } : null);

    const canchasEncontradas = datosDeportes
      .flatMap(deporte => 
        deporte.canchas.map(cancha => ({ ...cancha, deporte: deporte.deporte, estado: 'habilitada' }))
      ) 
      .filter(cancha => cancha.complejoId === parseInt(complejoId));
    setCanchas(canchasEncontradas);
  }, [complejoId]);

  const handleToggleEdit = () => {
    if(isEditing) {
      console.log("Guardando datos del complejo:", infoDelComplejo);
    }
    setIsEditing(!isEditing);
  };
  
  const handleDeleteCancha = (canchaId) => {

    setCanchas(prevCanchas => prevCanchas.filter(cancha => cancha.id !== canchaId));
  };
  const handleDisableCancha = (canchaId) => {
    setCanchas(prevCanchas =>
      prevCanchas.map(cancha =>
        cancha.id === canchaId
          ? { ...cancha, estado: cancha.estado === 'habilitada' ? 'deshabilitada' : 'habilitada' }
          : cancha
      )
    );
  };
  const ultimosAlquileres = [
    { id: 1, cancha: 'Cancha N°5', fecha: '29/06/2025', total: 28000 },
    { id: 2, cancha: 'Cancha N°1', fecha: '29/06/2025', total: 30000 },
  ];


  let puedeVerLaPagina = false;

  if (isAuthenticated) {

    if (user.role === 'admin') {
      puedeVerLaPagina = true;
    } 
    else if (user.role === 'owner' && user.id === parseInt(complejoId)) {
      puedeVerLaPagina = true;
    }
  }

  if (!infoDelComplejo) {
    return (
        <div className="max-w-7xl mx-auto p-8 rounded-lg shadow-2xl relative z-10">
            <h1 className="text-2xl font-bold text-red-600">Error: Complejo no encontrado</h1>
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
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default MiComplejoPage;