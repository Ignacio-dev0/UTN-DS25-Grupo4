import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CanchaCard from '../components/CanchaCard.jsx';
import { FaArrowLeft } from 'react-icons/fa';

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
        const complejoResponse = await fetch(`http://localhost:3000/api/complejos/${complejoId}`);
        if (!complejoResponse.ok) {
          throw new Error('Error al cargar el complejo');
        }
        const complejoData = await complejoResponse.json();
        setComplejo(complejoData.complejo || complejoData);

        // Obtener canchas del complejo
        const canchasResponse = await fetch(`http://localhost:3000/api/canchas/complejo/${complejoId}`);
        if (!canchasResponse.ok) {
          throw new Error('Error al cargar las canchas');
        }
        const canchasData = await canchasResponse.json();
        const canchasInfo = canchasData.canchas || canchasData || [];
        
        // Adaptar las canchas para que tengan la estructura esperada por CanchaCard
        const canchasAdaptadas = canchasInfo.map(cancha => ({
          ...cancha,
          deporte: cancha.deporte?.nombre || 'Fútbol',
          imageUrl: cancha.deporte ? `/images/${cancha.deporte.nombre.toLowerCase().replace(' ', '')}-1.jpg` : '/images/futbol-1.jpg'
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
    return <div className="text-center p-10">Cargando información del complejo...</div>;
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