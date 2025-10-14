import React, { useState, useMemo, useEffect } from 'react';
import CanchaCard from '../components/CanchaCard.jsx';
import Buscador from '../components/Buscador.jsx';
import FiltroDeporte from '../components/FiltroDeporte.jsx';
import FaqSection from '../components/FaqSection.jsx';
import { useCanchas } from '../hooks/useApi-simple.js';
import { useDeportes } from '../hooks/useApi-simple.js';
import { calcularInfoReseñasEnLotes } from '../utils/calculos.js';


function HomePage() {
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('Populares');
  const [canchasConReseñas, setCanchasConReseñas] = useState([]);
  
  // Hooks originales individuales
  const { canchas, loading: loadingCanchas, error: errorCanchas } = useCanchas();
  const { deportes, loading: loadingDeportes, error: errorDeportes } = useDeportes();
  
  // Estados derivados para compatibilidad
  const loading = loadingCanchas || loadingDeportes;
  const error = errorCanchas || errorDeportes;
  

  // Cargar cantidad de reseñas de forma optimizada usando la nueva función de lotes
  useEffect(() => {
    const cargarCantidadReseñas = async () => {
      if (!canchas || canchas.length === 0) {
        setCanchasConReseñas([]);
        return;
      }
      
      // Inicializar con las canchas tal como vienen del backend
      setCanchasConReseñas(canchas);
      
      try {
        // Usar la nueva función optimizada de lotes
        const canchaIds = canchas.map(cancha => cancha.id);
        const resultadosReseñas = await calcularInfoReseñasEnLotes(canchaIds, 3); // Lotes de 3
        
        // Combinar los resultados con las canchas
        const canchasConReseñasActualizadas = canchas.map(cancha => {
          const infoReseñas = resultadosReseñas[cancha.id];
          return {
            ...cancha,
            cantidadReseñas: infoReseñas ? infoReseñas.cantidadResenas : 0,
          };
        });
        
        setCanchasConReseñas(canchasConReseñasActualizadas);
      } catch (error) {
        console.error('Error cargando reseñas en lotes:', error);
        // En caso de error, usar las canchas sin información de reseñas
        setCanchasConReseñas(canchas);
      }
    };
    
    cargarCantidadReseñas();
  }, [canchas]);

  const canchasMostradas = useMemo(() => {
    if (!canchasConReseñas || canchasConReseñas.length === 0) return [];

    if (deporteSeleccionado === 'Populares') {
      // Group courts by sport and get the highest-rated court for each sport
      const canchasPorDeporte = {};
      
      canchasConReseñas.forEach(cancha => {
        const deporteNombre = cancha.deporte?.nombre;
        if (!deporteNombre) return;
        
        if (!canchasPorDeporte[deporteNombre] || 
            canchasPorDeporte[deporteNombre].puntaje < cancha.puntaje) {
          canchasPorDeporte[deporteNombre] = cancha;
        }
      });
      
      return Object.values(canchasPorDeporte)
        .sort((a, b) => b.puntaje - a.puntaje);
    }



    const canchasFiltradas = canchasConReseñas.filter(cancha => {
      return cancha.deporte?.nombre === deporteSeleccionado;
    });
    
    
    return canchasFiltradas;
  }, [canchasConReseñas, deporteSeleccionado]);

  // Estados de carga
  if (loading) {
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
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar datos</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            El sistema intentó usar el endpoint optimizado y fallback automático.
          </p>
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
            {canchasMostradas.map((cancha, index) => (
              <CanchaCard key={cancha.id} cancha={cancha} index={index} />
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
