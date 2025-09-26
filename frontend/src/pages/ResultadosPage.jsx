import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Buscador from '../components/Buscador.jsx';
import CanchaCard from '../components/CanchaCard.jsx';
import { getCanchas } from '../services/search.js';

function ResultadosPage() {
  const [searchParams] = useSearchParams();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const localidadQuery = searchParams.get('localidad');
  const deporteQuery = searchParams.get('deporte');
  const fechaQuery = searchParams.get('fecha');
  const horaQuery = searchParams.get('hora');

  useEffect(() => {
    const cargarCanchas = async () => {
      try {
        setLoading(true);
        const response = await getCanchas();
        
        if (response.ok) {
          let canchasFiltradas = response.canchas;

          // Filtrar por deporte
          if (deporteQuery) {
            canchasFiltradas = canchasFiltradas.filter(cancha => 
              cancha.deporte?.nombre === deporteQuery
            );
          }

          // Filtrar por localidad
          if (localidadQuery) {
            canchasFiltradas = canchasFiltradas.filter(cancha => 
              cancha.complejo?.domicilio?.localidad?.nombre === localidadQuery
            );
          }

          // TODO: Implementar filtros de fecha y hora cuando estén disponibles en el backend

          setCanchas(canchasFiltradas);
        } else {
          setError(response.error);
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Buscando canchas...</p>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {canchas.length > 0 ? (
                  canchas.map(cancha => (
                    <CanchaCard key={cancha.id} cancha={cancha} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600 text-lg">No se encontraron canchas con esos criterios.</p>
                    <p className="text-gray-500 mt-2">Intenta modificar tus filtros de búsqueda.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultadosPage;