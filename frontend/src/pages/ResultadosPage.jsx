import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Buscador from '../components/Buscador.jsx';
import CanchaCard from '../components/CanchaCard.jsx';
import { datosDeportes } from '../data/canchas.js';
import { datosComplejos } from '../data/complejos.js';

function ResultadosPage() {
  const [searchParams] = useSearchParams();

  const ciudadQuery = searchParams.get('ciudad');
  const deporteQuery = searchParams.get('deporte');
  const fechaQuery = searchParams.get('fecha');
  const horaQuery = searchParams.get('hora');

  const canchasEncontradas = useMemo(() => {
    const todasLasCanchas = datosDeportes.flatMap(deporte =>
      deporte.canchas.map(cancha => ({
        ...cancha,
        deporte: deporte.deporte
      }))
    );

    let canchasFiltradas = todasLasCanchas;

    if (deporteQuery) {
      canchasFiltradas = canchasFiltradas.filter(cancha => cancha.deporte === deporteQuery);
    }

    if (ciudadQuery) {
      const complejosEnCiudad = datosComplejos
        .filter(c => c.ubicacion.toLowerCase().includes(ciudadQuery.toLowerCase()))
        .map(c => c.id);

      canchasFiltradas = canchasFiltradas.filter(cancha =>
        complejosEnCiudad.includes(cancha.complejoId)
      );
    }

    if (fechaQuery && horaQuery) {
      const fechaBusqueda = new Date(fechaQuery);
      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      const diaBusqueda = diasSemana[fechaBusqueda.getDay()];
      const horaBusqueda = horaQuery.replace('hs', '');

      canchasFiltradas = canchasFiltradas.filter(cancha => {
        return cancha.turnos.some(turno => 
          turno.dia.toUpperCase() === diaBusqueda &&
          turno.hora === horaBusqueda &&
          turno.estado === 'disponible'
        );
      });
    }

    return canchasFiltradas;
  }, [ciudadQuery, deporteQuery, fechaQuery, horaQuery]);

  return (
    <div className=" min-h-screen ">
      <div className=" pb-4">
        <div className="container mx-auto">
          <Buscador />
        </div>
      </div>
      <div className="container mx-auto mt-6 pb-16">
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {canchasEncontradas.length} clubes encontrados
            {ciudadQuery && ` en ${ciudadQuery}`}
            {deporteQuery && ` para ${deporteQuery}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {canchasEncontradas.length > 0 ? (
              canchasEncontradas.map(cancha => (
                <CanchaCard key={cancha.id} cancha={cancha} />
              ))
            ) : (
              <p>No se encontraron canchas con esos criterios.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultadosPage;