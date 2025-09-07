import React, { useState, useMemo } from 'react';
import CanchaCard from '../components/CanchaCard.jsx';
import Buscador from '../components/Buscador.jsx';
import FiltroDeporte from '../components/FiltroDeporte.jsx';
import FaqSection from '../components/FaqSection.jsx';
import { useCanchas, useDeportes } from '../hooks/useApi-simple.js';
import { calcularInfoReseñas } from '../utils/calculos.js';

function HomePage() {
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('Populares');
  
  // Usar hooks del backend en lugar de datos mock
  const { canchas, loading: loadingCanchas, error: errorCanchas } = useCanchas();
  const { deportes, loading: loadingDeportes, error: errorDeportes } = useDeportes();
  
  const canchasMostradas = useMemo(() => {
    if (!canchas || canchas.length === 0) return [];
    
    const canchasConPuntaje = canchas.map(cancha => {
      const infoReseñas = calcularInfoReseñas(cancha.id);
      return {
        ...cancha,
        puntaje: cancha.puntaje || infoReseñas.promedio, 
        cantidadReseñas: infoReseñas.cantidad,
      };
    });

    if (deporteSeleccionado === 'Populares') {
      return canchasConPuntaje.sort((a, b) => b.puntaje - a.puntaje).slice(0, 8);
    }

    const canchasFiltradas = canchasConPuntaje.filter(cancha => 
      cancha.deporte?.nombre === deporteSeleccionado
    );
    
    return canchasFiltradas;
  }, [canchas, deporteSeleccionado]);

  // Estados de carga
  if (loadingCanchas || loadingDeportes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary text-lg font-semibold">Cargando canchas...</p>
        </div>
      </div>
    );
  }

  // Estados de error
  if (errorCanchas || errorDeportes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar datos</h2>
          <p className="text-gray-600">{errorCanchas || errorDeportes}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Encuentra tu cancha ideal
          </h1>
          <p className="text-xl mb-8 text-accent">
            Reserva canchas de fútbol, básquet, tenis y más en La Plata
          </p>
          <Buscador />
        </div>
      </section>

      {/* Filtros Section */}
      <section className="py-8  border-b">
        <div className="container mx-auto px-4">
          <FiltroDeporte 
            deportes={deportes || []}
            deporteSeleccionado={deporteSeleccionado}
            onSelectDeporte={setDeporteSeleccionado}
          />
        </div>
      </section>

      {/* Canchas Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-primary">
              {deporteSeleccionado === 'Populares' ? 'Canchas Populares' : `Canchas de ${deporteSeleccionado}`}
            </h2>
            <span className="text-secondary font-semibold">
              {canchasMostradas.length} canchas disponibles
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {canchasMostradas.map(cancha => (
              <CanchaCard key={cancha.id} cancha={cancha} />
            ))}
          </div>
          
          {canchasMostradas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No se encontraron canchas para el deporte seleccionado.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />
    </div>
  );
}

export default HomePage;
