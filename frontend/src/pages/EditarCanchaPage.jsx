import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';

import GaleriaFotosEditable from '../components/GaleriaFotosEditable.jsx';
import InfoCanchaEditable from '../components/InfoCanchaEditable';
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
        const canchaResponse = await fetch(`${API_BASE_URL}/canchas/${canchaId}`);
        if (!canchaResponse.ok) {
          throw new Error('Error al cargar la cancha');
        }
        const canchaData = await canchaResponse.json();
        const canchaInfo = canchaData.cancha || canchaData;
        
        // Cargar turnos reales (como en ReservaPage)
        const turnosResponse = await fetch(`${API_BASE_URL}/turnos/cancha/${canchaId}`);
        if (!turnosResponse.ok) throw new Error('Error al cargar turnos');
        const turnosData = await turnosResponse.json();
        
        // Función auxiliar para obtener el día de la semana en español
        const obtenerDiaSemana = (fecha) => {
          const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
          const fechaObj = new Date(fecha);
          return diasSemana[fechaObj.getDay()];
        };

        // Función auxiliar para formatear hora desde ISO string
        const formatearHora = (horaISO) => {
          const fecha = new Date(horaISO);
          return fecha.toTimeString().slice(0, 5); // Formato HH:mm
        };
        
        // Formatear turnos reales (igual que en ReservaPage)
        const turnosFormateados = (turnosData.turnos || turnosData || []).map(turno => ({
          id: turno.id,
          dia: obtenerDiaSemana(turno.fecha),
          hora: formatearHora(turno.horaInicio),
          precio: turno.precio,
          reservado: turno.reservado, // Mantener el campo reservado como booleano
          alquilerId: turno.alquilerId, // Para distinguir entre ocupado manualmente vs reservado por usuario
          fecha: turno.fecha
        }));
        
        // Separar imagen principal de otras imágenes
        const imageArray = canchaInfo.image || [];
        const imagenPrincipal = imageArray.length > 0 ? imageArray[0] : null;
        const otrasImagenes = imageArray.length > 1 ? imageArray.slice(1) : [];
        
        console.log("📸 Imágenes cargadas:", { imagenPrincipal, otrasImagenes });
        
        setCancha({
          ...canchaInfo,
          imageUrl: imagenPrincipal, // Imagen principal
          otrasImagenes: otrasImagenes, // Resto de imágenes
          turnos: turnosFormateados
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
      console.log("🔄 Iniciando guardado de cancha...");
      
      // Guardar solo la información básica de la cancha
      console.log("Guardando información básica de la cancha...");
      
      // Combinar imagen principal con otras imágenes
      const todasLasImagenes = [];
      
      // Agregar imagen principal si existe
      if (cancha.imageUrl) {
        todasLasImagenes.push(cancha.imageUrl);
      } else if (cancha.image && cancha.image.length > 0) {
        todasLasImagenes.push(cancha.image[0]);
      }
      
      // Agregar otras imágenes
      if (cancha.otrasImagenes && cancha.otrasImagenes.length > 0) {
        todasLasImagenes.push(...cancha.otrasImagenes);
      }
      
      console.log("📸 Enviando imágenes:", todasLasImagenes);
      
      const canchaResponse = await fetch(`${API_BASE_URL}/canchas/${canchaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nroCancha: parseInt(cancha.nroCancha),
          descripcion: cancha.descripcion,
          image: todasLasImagenes, // Enviar todas las imágenes en el array image
          deporteId: cancha.deporteId,
        }),
      });

      if (!canchaResponse.ok) {
        throw new Error('Error al guardar la información de la cancha');
      }
      console.log("✅ Información básica guardada");

      // Solo mostrar mensaje y redirigir - sin tocar cronograma
      alert("✅ ¡Cancha guardada exitosamente!");
      
      // Navegar de vuelta
      setTimeout(() => {
        navigate(`/micomplejo/${cancha.complejoId}`, { 
          replace: true,
          state: { shouldReload: true, timestamp: Date.now() }
        });
      }, 500);
      
    } catch (error) {
      console.error('❌ Error guardando:', error);
      alert('❌ Error al guardar los cambios: ' + error.message);
    }
  };  if (loading) {
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
              value={`Cancha N° ${cancha.nroCancha}`}
              onChange={(e) => setCancha({...cancha, nroCancha: e.target.value.replace('Cancha N° ', '')})}
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
          imageUrl={cancha.image?.[0]} 
          otrasImagenes={cancha.otrasImagenes || []} 
          setCancha={setCancha} 
        />
        <InfoCanchaEditable 
          cancha={cancha} 
          complejo={complejo} 
          deporte={cancha.deporte} 
        />
        <CalendarioEdicionTurnos 
          turnos={cancha.turnos} 
          onTurnosChange={(nuevosTurnos) => setCancha({...cancha, turnos: nuevosTurnos})} 
          canchaId={cancha.id}
        />
      </div>
    </div>
  );
}

export default EditarCanchaPage;