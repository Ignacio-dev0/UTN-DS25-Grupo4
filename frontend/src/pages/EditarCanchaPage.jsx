import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datosDeportes } from '../data/canchas.js';
import { datosComplejos } from '../data/complejos.js';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

import GaleriaFotosEditable from '../components/GaleriaFotosEditable.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioEdicionTurnos from '../components/CalendarioEdicionTurnos.jsx';

const getCanchaById = (id) => {
    for (const deporte of datosDeportes) {
        const cancha = deporte.canchas.find(c => c.id === parseInt(id));
        if (cancha) {
            return { ...cancha, deporte: deporte.deporte };
        }
    }
    return null;
}

function EditarCanchaPage() {
  const { canchaId } = useParams();
  const navigate = useNavigate();
  
  const [cancha, setCancha] = useState(null);
  const [complejo, setComplejo] = useState(null);

  useEffect(() => {
    const canchaEncontrada = getCanchaById(canchaId);
    if (canchaEncontrada) {
      if (!canchaEncontrada.otrasImagenes) {
        canchaEncontrada.otrasImagenes = [];
      }
      setCancha({ ...canchaEncontrada, turnos: canchaEncontrada.turnos || [] });
      setComplejo(datosComplejos.find(c => c.id === canchaEncontrada.complejoId));
    }
  }, [canchaId]);

  const handleSave = () => {
    console.log("Guardando cancha:", cancha);
    alert("Cancha guardada exitosamente (simulación)");
    navigate(`/micomplejo/${cancha.complejoId}`);
  };

  if (!cancha || !complejo) {
    return <div className="text-center p-10">Cargando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 rounded-lg relative z-10">
      <div className="flex justify-between items-center border-b pb-4 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline flex items-center gap-2 mb-2">
              <FaArrowLeft /> Volver
            </button>
            <input 
              type="text"
              value={`Cancha N° ${cancha.noCancha}`}
              onChange={(e) => setCancha({...cancha, noCancha: e.target.value.replace('Cancha N° ', '')})}
              className="text-3xl font-bold font-lora text-gray-800 bg-transparent focus:outline-none focus:border-b-2 focus:border-primary"
            />
          </div>
          <button onClick={handleSave} className="bg-primary text-light font-bold py-2 px-6 rounded-md hover:bg-secondary transition-colors flex items-center gap-2">
              <FaSave />
              Guardar Cambios
          </button>
      </div>

      <div className="space-y-12">
        <GaleriaFotosEditable 
          imageUrl={cancha.imageUrl} 
          otrasImagenes={cancha.otrasImagenes} 
          setCancha={setCancha} 
        />
        <InfoCancha cancha={cancha} complejo={complejo} deporte={cancha.deporte} />
        <CalendarioEdicionTurnos 
          turnos={cancha.turnos} 
          onTurnosChange={(nuevosTurnos) => setCancha({...cancha, turnos: nuevosTurnos})} 
        />
      </div>
    </div>
  );
}

export default EditarCanchaPage;