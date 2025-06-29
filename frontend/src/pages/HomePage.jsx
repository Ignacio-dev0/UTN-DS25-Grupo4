// src/pages/HomePage.jsx

import React, { useState, useMemo } from 'react';
import CanchaCard from '../components/CanchaCard.jsx';
import Buscador from '../components/Buscador.jsx';
import FiltroDeporte from '../components/FiltroDeporte.jsx';
import FaqSection from '../components/FaqSection.jsx';
import { datosDeportes } from '../data/canchas.js';

function HomePage() {
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('Populares');

  const canchasMostradas = useMemo(() => {
    if (deporteSeleccionado === 'Populares') {
      return datosDeportes
        .filter(deporte => deporte.canchas && deporte.canchas.length > 0)
        .map(deporte => {
          const mejorCancha = deporte.canchas.reduce((mejor, actual) =>
            (actual.puntaje > mejor.puntaje) ? actual : mejor
          );
          return { ...mejorCancha, deporte: deporte.deporte };
        });
    }
    
    const deporteFiltrado = datosDeportes.find(d => d.deporte === deporteSeleccionado);
    if (deporteFiltrado) {
      return deporteFiltrado.canchas.map(cancha => ({
        ...cancha,
        deporte: deporteFiltrado.deporte
      }));
    }
    return [];
  }, [deporteSeleccionado]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      <div className="space-y-12">
        <Buscador />
        <hr className="border-t border-secondary opacity-50" />
        
        <FiltroDeporte 
          deporteSeleccionado={deporteSeleccionado}
          onSelectDeporte={setDeporteSeleccionado} 
        />

        <section>
          <h2 className="text-3xl font-bold font-cinzel text-light mb-6 text-center">
            {deporteSeleccionado}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {canchasMostradas.map(cancha => (
              <CanchaCard 
                key={cancha.id} 
                cancha={cancha}
              />
            ))}
          </div>
        </section>

        <hr className="border-t border-secondary opacity-50" />
        
        <FaqSection />
      </div>
    </div>
  );
}

export default HomePage;