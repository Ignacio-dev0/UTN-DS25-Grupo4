import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CanchaCard from '../components/CanchaCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api.js';

function ComplejoDetallePage() {
  const { complejoId } = useParams();
  const [complejo, setComplejo] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplejoData = async () => {
      try {
        setLoading(true);
        
        // Obtener información del complejo
        const complejoResponse = await fetch(`${API_BASE_URL}/complejos/${complejoId}`);
        if (!complejoResponse.ok) {
          throw new Error('Error al cargar el complejo');
        }
        const complejoData = await complejoResponse.json();
        setComplejo(complejoData.complejo || complejoData);

        // Obtener canchas del complejo
        const canchasResponse = await fetch(`${API_BASE_URL}/canchas/complejo/${complejoId}`);
        if (!canchasResponse.ok) {
          throw new Error('Error al cargar las canchas');
        }
        const canchasData = await canchasResponse.json();
        const canchasInfo = canchasData.canchas || canchasData || [];
        
        // Las canchas ya vienen con la estructura correcta del backend
        // Solo necesitamos asegurar que tengan los campos necesarios
        const canchasAdaptadas = canchasInfo.map(cancha => ({
          ...cancha,
          // Mantener el objeto deporte completo del backend
          // No sobrescribir, solo asegurar estructura
          puntaje: cancha.puntaje || 4.5, // Puntaje por defecto si no existe
          complejo: complejoData.complejo || complejoData // Referencia al complejo
        }));
        
        setCanchas(canchasAdaptadas);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (complejoId) {
      fetchComplejoData();
    }
  }, [complejoId]);

  if (loading) {
    return <LoadingSpinner message="Cargando información del complejo..." />;
  }

  if (error || !complejo) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Error: {error || 'Complejo no encontrado'}
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-2 mb-4">
          <FaArrowLeft /> Volver al inicio
        </Link>
        <h1 className="text-4xl font-bold font-lora text-primary">{complejo.nombre}</h1>
        {complejo.descripcion && (
          <p className="text-base text-gray-700 mt-3 mb-2">
            {complejo.descripcion}
          </p>
        )}
        <p className="text-lg text-secondary mt-2">
          {complejo.domicilio?.calle} {complejo.domicilio?.altura}, {complejo.domicilio?.localidad?.nombre}
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-secondary mb-6">Nuestras Canchas</h2>
        {canchas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {canchas.map(cancha => (
              <CanchaCard key={cancha.id} cancha={cancha} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Este complejo aún no tiene canchas cargadas.</p>
        )}
      </div>
    </div>
  );
}

export default ComplejoDetallePage;