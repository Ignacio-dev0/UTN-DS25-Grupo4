import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

import GaleriaFotosEditable from '../components/GaleriaFotosEditable.jsx';
import InfoCancha from '../components/InfoCancha.jsx';
import CalendarioEdicionTurnos from '../components/CalendarioEdicionTurnos.jsx';

function EditarCanchaPage() {
  const { canchaId } = useParams();
  const navigate = useNavigate();
  
  const [cancha, setCancha] = useState(null);
  const [complejo, setComplejo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCanchaData = async () => {
      try {
        setLoading(true);
        
        // Obtener información completa de la cancha
        const canchaResponse = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
        if (!canchaResponse.ok) {
          throw new Error('Error al cargar la cancha');
        }
        const canchaData = await canchaResponse.json();
        const canchaInfo = canchaData.cancha || canchaData;
        
        // Transformar turnos del formato de API al formato esperado por el componente
        const turnosTransformados = (canchaInfo.turnos || []).map(turno => {
          const fecha = new Date(turno.fecha);
          const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
          const dia = dias[fecha.getDay()];
          
          const horaInicio = new Date(turno.horaInicio);
          const hora = horaInicio.toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          
          return {
            ...turno,
            dia,
            hora,
            estado: turno.reservado ? 'reservado' : 'disponible'
          };
        });
        
        setCancha({
          ...canchaInfo,
          otrasImagenes: canchaInfo.otrasImagenes || [],
          turnos: turnosTransformados
        });
        setComplejo(canchaInfo.complejo);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (canchaId) {
      fetchCanchaData();
    }
  }, [canchaId]);

  const handleSave = async () => {
    try {
      console.log("Guardando cancha:", cancha);
      
      const response = await fetch(`http://localhost:3000/api/canchas/${canchaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: cancha.nombre,
          activa: cancha.activa,
          // Agregar otros campos que se puedan editar
        }),
      });
      
      if (response.ok) {
        alert("Cancha guardada exitosamente");
        navigate(`/micomplejo/${cancha.complejoId}`);
      } else {
        throw new Error('Error al guardar la cancha');
      }
    } catch (error) {
      console.error('Error guardando cancha:', error);
      alert('Error al guardar los cambios');
    }
  };

  if (loading) {
    return <div className="text-center p-10">Cargando...</div>;
  }

  if (error || !cancha || !complejo) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Error: {error || 'Cancha no encontrada'}
        </h1>
      </div>
    );
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