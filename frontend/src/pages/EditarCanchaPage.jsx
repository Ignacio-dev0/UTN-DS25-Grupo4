import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

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
        const canchaResponse = await fetch(`http://localhost:3000/api/canchas/${canchaId}`);
        if (!canchaResponse.ok) {
          throw new Error('Error al cargar la cancha');
        }
        const canchaData = await canchaResponse.json();
        const canchaInfo = canchaData.cancha || canchaData;
        
        // Cargar cronograma existente
        let cronogramaExistente = [];
        try {
          const cronogramaResponse = await fetch(`http://localhost:3000/api/cronograma/cancha/${canchaId}`);
          if (cronogramaResponse.ok) {
            const cronogramaData = await cronogramaResponse.json();
            cronogramaExistente = cronogramaData.cronograma.map(item => {
              const horaInicio = new Date(`1970-01-01T${item.horaInicio}`);
              const hora = horaInicio.toLocaleTimeString('es-AR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
              
              return {
                dia: item.diaSemana,
                hora,
                precio: item.precio,
                estado: 'disponible'
              };
            });
          }
        } catch (cronogramaError) {
          console.warn('No se pudo cargar cronograma existente:', cronogramaError);
        }

        // Transformar turnos del formato de API al formato esperado por el componente (si los hay)
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
        
        // Usar cronograma si no hay turnos específicos
        const turnosFinales = turnosTransformados.length > 0 ? turnosTransformados : cronogramaExistente;
        
        setCancha({
          ...canchaInfo,
          otrasImagenes: canchaInfo.otrasImagenes || [],
          turnos: turnosFinales
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
      
      // Preparar array de imágenes completo
      let imagenes = [];
      
      // Imagen principal
      let imagenPrincipal = cancha.image?.[0];
      if (cancha.imageData) {
        imagenPrincipal = cancha.imageData;
      } else if (cancha.imageUrl?.startsWith('data:')) {
        imagenPrincipal = cancha.imageUrl;
      } else if (!imagenPrincipal) {
        imagenPrincipal = '/images/canchas/futbol5-1.jpg'; // Imagen por defecto
      }
      
      imagenes.push(imagenPrincipal);
      
      // Agregar imágenes adicionales (thumbnails)
      if (cancha.otrasImagenes && cancha.otrasImagenes.length > 0) {
        cancha.otrasImagenes.forEach(imagen => {
          if (imagen && imagen.trim() !== '') {
            imagenes.push(imagen);
          }
        });
      }
      
      // Guardar cambios en la cancha con todas las imágenes
      const canchaResponse = await fetch(`http://localhost:3000/api/canchas/${canchaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nroCancha: parseInt(cancha.nroCancha),
          descripcion: cancha.descripcion || '',
          image: imagenes, // Array completo de imágenes
          deporteId: cancha.deporteId
        }),
      });
      
      if (!canchaResponse.ok) {
        const errorData = await canchaResponse.text();
        console.error('Error response:', errorData);
        throw new Error('Error al guardar la cancha');
      }

      // Guardar cronograma si hay turnos configurados
      if (cancha.turnos && cancha.turnos.length > 0) {
        console.log("Guardando cronograma:", cancha.turnos);
        
        const cronogramaResponse = await fetch(`http://localhost:3000/api/cronograma/cancha/${canchaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cronograma: cancha.turnos
          }),
        });
        
        if (!cronogramaResponse.ok) {
          const errorData = await cronogramaResponse.json().catch(() => 
            cronogramaResponse.text().catch(() => 'Error desconocido')
          );
          console.error('Error al guardar cronograma:', errorData);
          throw new Error(`Error al guardar cronograma: ${JSON.stringify(errorData)}`);
        }
        
        const cronogramaData = await cronogramaResponse.json();
        console.log("Cronograma guardado exitosamente", cronogramaData);
        
        // Mostrar información sobre turnos generados
        if (cronogramaData.turnosGenerados) {
          console.log(`Turnos generados automáticamente: ${cronogramaData.turnosGenerados}`);
        }
      }
      
      alert("Cancha y cronograma guardados exitosamente. ¡Los turnos disponibles se han actualizado automáticamente!");
      navigate(`/micomplejo/${cancha.complejoId}`);
      
    } catch (error) {
      console.error('Error guardando:', error);
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
        />
      </div>
    </div>
  );
}

export default EditarCanchaPage;