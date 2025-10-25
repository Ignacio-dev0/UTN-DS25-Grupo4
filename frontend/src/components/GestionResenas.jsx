import React, { useState, useEffect, useMemo } from 'react';
import { StarIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/solid';
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
  
  // Estados para filtros y búsqueda
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [busquedaCanchaComplejo, setBusquedaCanchaComplejo] = useState('');
  const [ordenPuntaje, setOrdenPuntaje] = useState('desc'); // 'asc' o 'desc' o 'none'

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

  // Filtrar y ordenar reseñas
  const resenasFiltradas = useMemo(() => {
    let resultado = [...resenas];

    // Filtro por texto en comentario (descripción)
    if (busquedaTexto.trim()) {
      resultado = resultado.filter(resena =>
        resena.descripcion?.toLowerCase().includes(busquedaTexto.toLowerCase())
      );
    }

    // Filtro por usuario (nombre o apellido)
    if (busquedaUsuario.trim()) {
      resultado = resultado.filter(resena => {
        const cliente = resena.alquiler?.cliente;
        const nombreCompleto = `${cliente?.nombre || ''} ${cliente?.apellido || ''}`.toLowerCase();
        return nombreCompleto.includes(busquedaUsuario.toLowerCase());
      });
    }

    // Filtro por cancha/complejo
    if (busquedaCanchaComplejo.trim()) {
      resultado = resultado.filter(resena => {
        const turno = resena.alquiler?.turnos?.[0];
        const cancha = turno?.cancha;
        const complejo = cancha?.complejo;
        const deporte = cancha?.deporte;
        const textoCancha = `${deporte?.nombre || ''} ${complejo?.nombre || ''}`.toLowerCase();
        return textoCancha.includes(busquedaCanchaComplejo.toLowerCase());
      });
    }

    // Ordenar por puntaje
    if (ordenPuntaje !== 'none') {
      resultado.sort((a, b) => {
        if (ordenPuntaje === 'desc') {
          return b.puntaje - a.puntaje; // Mayor a menor
        } else {
          return a.puntaje - b.puntaje; // Menor a mayor
        }
      });
    }

    return resultado;
  }, [resenas, busquedaTexto, busquedaUsuario, busquedaCanchaComplejo, ordenPuntaje]);

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusquedaTexto('');
    setBusquedaUsuario('');
    setBusquedaCanchaComplejo('');
    setOrdenPuntaje('desc');
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = busquedaTexto || busquedaUsuario || busquedaCanchaComplejo || ordenPuntaje !== 'desc';

  if (loading) {
    return <LoadingSpinner message="Cargando reseñas..." />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Reseñas</h2>
        <p className="text-gray-600 mt-1">
          Mostrando {resenasFiltradas.length} de {resenas.length} reseñas
        </p>
      </div>

      {/* Sección de Búsqueda y Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</h3>
          </div>
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda en comentario */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar en comentario
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar texto..."
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaTexto && (
                <button
                  onClick={() => setBusquedaTexto('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda por usuario */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar usuario
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre o apellido..."
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaUsuario && (
                <button
                  onClick={() => setBusquedaUsuario('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda por cancha/complejo */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar cancha/complejo
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre de cancha..."
                value={busquedaCanchaComplejo}
                onChange={(e) => setBusquedaCanchaComplejo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaCanchaComplejo && (
                <button
                  onClick={() => setBusquedaCanchaComplejo('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Ordenar por puntaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por puntaje
            </label>
            <select
              value={ordenPuntaje}
              onChange={(e) => setOrdenPuntaje(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="desc">Mayor a menor (⭐⭐⭐⭐⭐ → ⭐)</option>
              <option value="asc">Menor a mayor (⭐ → ⭐⭐⭐⭐⭐)</option>
              <option value="none">Sin ordenar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje si no hay resultados */}
      {resenasFiltradas.length === 0 && resenas.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            No se encontraron reseñas con los filtros aplicados.
          </p>
          <button
            onClick={limpiarFiltros}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Mensaje si no hay reseñas en el sistema */}
      {resenas.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No hay reseñas registradas en el sistema.</p>
        </div>
      )}

      {/* Tabla de reseñas */}
      {resenasFiltradas.length > 0 && (
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
                {resenasFiltradas.map((resena) => {
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
      )}
    </div>
  );
}

export default GestionResenas;
