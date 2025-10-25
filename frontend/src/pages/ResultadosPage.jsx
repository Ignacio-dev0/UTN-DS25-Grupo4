import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '../config/api.js';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Buscador from '../components/Buscador.jsx';
import CanchaCard from '../components/CanchaCard.jsx';
import { getCanchasConFiltros } from '../services/search.js';

const CANCHAS_POR_PAGINA = 8;

function ResultadosPage() {
  const [searchParams] = useSearchParams();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const localidadQuery = searchParams.get('localidad');
  const deporteQuery = searchParams.get('deporte');
  const fechaQuery = searchParams.get('fecha');
  const horaQuery = searchParams.get('hora');

  useEffect(() => {
    const cargarCanchas = async () => {
      try {
        setLoading(true);
        setPaginaActual(1); // Resetear a página 1 cuando cambian los filtros
        
        // Preparar filtros para enviar al backend
        const filtros = {};
        if (deporteQuery) filtros.deporte = deporteQuery;
        if (localidadQuery) filtros.localidad = localidadQuery;
        if (fechaQuery) filtros.fecha = fechaQuery;
        if (horaQuery) filtros.hora = horaQuery;
        
        console.log('Aplicando filtros:', filtros);
        
        const response = await getCanchasConFiltros(filtros);
        
        console.log('🔍 [ResultadosPage] Response completa:', response);
        console.log('🔍 [ResultadosPage] response.ok:', response.ok);
        console.log('🔍 [ResultadosPage] response.canchas:', response.canchas);
        console.log('🔍 [ResultadosPage] response.canchas.length:', response.canchas?.length);
        
        if (response.ok) {
          setCanchas(response.canchas);
          console.log('✅ [ResultadosPage] Canchas actualizadas en estado, total:', response.canchas.length);
        } else {
          setError(response.error);
          console.error('❌ [ResultadosPage] Error en response:', response.error);
        }
      } catch (err) {
        setError('Error al cargar las canchas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarCanchas();
  }, [localidadQuery, deporteQuery, fechaQuery, horaQuery]);

  // Calcular paginación
  const totalPaginas = Math.ceil(canchas.length / CANCHAS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * CANCHAS_POR_PAGINA;
  const indiceFin = indiceInicio + CANCHAS_POR_PAGINA;
  const canchasPaginadas = canchas.slice(indiceInicio, indiceFin);

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pb-4">
        <div className="container mx-auto">
          <Buscador />
        </div>
      </div>
      <div className="container mx-auto mt-6 pb-16">
        <div className="mt-6 space-y-4">
          {loading ? (
            <LoadingSpinner message="Buscando canchas..." />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800">
                {canchas.length} clubes encontrados
                {localidadQuery && ` en ${localidadQuery}`}
                {deporteQuery && ` para ${deporteQuery}`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
                {canchasPaginadas.length > 0 ? (
                  canchasPaginadas.map(cancha => (
                    <CanchaCard key={cancha.id} cancha={cancha} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600 text-lg">No se encontraron canchas con esos criterios.</p>
                    <p className="text-gray-500 mt-2">Intenta modificar tus filtros de búsqueda.</p>
                  </div>
                )}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={irAPaginaAnterior}
                    disabled={paginaActual === 1}
                    className={`p-2 rounded-full transition-all ${
                      paginaActual === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white shadow-lg hover:bg-gray-100 active:bg-gray-200 border-2 border-secondary'
                    }`}
                    aria-label="Página anterior"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-700">
                      Página {paginaActual} de {totalPaginas}
                    </span>
                  </div>

                  <button
                    onClick={irAPaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                    className={`p-2 rounded-full transition-all ${
                      paginaActual === totalPaginas
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white shadow-lg hover:bg-gray-100 active:bg-gray-200 border-2 border-secondary'
                    }`}
                    aria-label="Página siguiente"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultadosPage;