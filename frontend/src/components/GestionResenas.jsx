import React, { useState, useEffect } from 'react';
import { StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner.jsx';
import { API_BASE_URL } from '../config/api.js';

const StarRating = ({ puntaje }) => {
  const estrellas = [];
  for (let i = 1; i <= 5; i++) {
    estrellas.push(
      <StarIcon 
        key={i} 
        className={`w-4 h-4 ${i <= puntaje ? 'text-yellow-400' : 'text-gray-300'}`} 
      />
    );
  }
  return <div className="flex">{estrellas}</div>;
};

function GestionResenas() {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  const fetchResenas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resenas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reseñas recibidas:', data);
        setResenas(data.resenas || []);
      } else {
        console.error('Error al cargar reseñas:', response.status);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (resenaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setEliminando(resenaId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/resenas/${resenaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Reseña eliminada correctamente');
        // Actualizar la lista removiendo la reseña eliminada
        setResenas(resenas.filter(r => r.id !== resenaId));
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar reseña: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error eliminando reseña:', error);
      alert('Error al eliminar reseña');
    } finally {
      setEliminando(null);
    }
  };

  useEffect(() => {
    fetchResenas();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando reseñas..." />;
  }

  if (resenas.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No hay reseñas registradas en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Reseñas</h2>
        <p className="text-gray-600 mt-1">Total: {resenas.length} reseñas</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cancha / Complejo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentario
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resenas.map((resena) => {
                const cliente = resena.alquiler?.cliente;
                const turno = resena.alquiler?.turnos?.[0];
                const cancha = turno?.cancha;
                const complejo = cancha?.complejo;
                const deporte = cancha?.deporte;

                return (
                  <tr key={resena.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {cliente?.image ? (
                          <img 
                            src={cliente.image} 
                            alt={`${cliente.nombre} ${cliente.apellido}`}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-gray-500 font-bold">
                              {cliente?.nombre?.[0]}{cliente?.apellido?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cliente?.nombre} {cliente?.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {deporte?.nombre} - {complejo?.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        Alquiler #{resena.alquilerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating puntaje={resena.puntaje} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-md line-clamp-2">
                        {resena.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEliminar(resena.id)}
                        disabled={eliminando === resena.id}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                          eliminando === resena.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {eliminando === resena.id ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Eliminar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionResenas;
