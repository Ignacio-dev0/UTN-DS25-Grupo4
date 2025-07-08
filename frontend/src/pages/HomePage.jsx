import React, { useState, useMemo } from 'react';
import CanchaCard from '../components/CanchaCard.jsx';
import Buscador from '../components/Buscador.jsx';
import FiltroDeporte from '../components/FiltroDeporte.jsx';
import FaqSection from '../components/FaqSection.jsx';
import { datosDeportes } from '../data/canchas.js';
import { calcularInfoReseñas } from '../utils/calculos.js'; // Importamos la función

function HomePage() {
  const [deporteSeleccionado, setDeporteSeleccionado] = useState('Populares');
  const canchasMostradas = useMemo(() => {
    const canchasConPuntaje = datosDeportes.flatMap(deporte => 
      deporte.canchas.map(cancha => {
        const infoReseñas = calcularInfoReseñas(cancha.id);
        return {
          ...cancha,
          puntaje: infoReseñas.promedio, 
          cantidadReseñas: infoReseñas.cantidad,
          deporte: deporte.deporte,
        };
      })
    );

    if (deporteSeleccionado === 'Populares') {
      return canchasConPuntaje.sort((a, b) => b.puntaje - a.puntaje).slice(0, 8);
    }
    
    return canchasConPuntaje.filter(c => c.deporte === deporteSeleccionado);
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
          <h2 className="text-3xl font-bold font-lora text-primary mb-6 text-center">
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