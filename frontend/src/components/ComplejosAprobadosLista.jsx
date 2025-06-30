import React from 'react';
import { Link } from 'react-router-dom';

function ComplejosAprobadosLista({ complejos }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Complejos Aprobados</h2>
      <ul className="space-y-4">
        {complejos.map(complejo => (
          <li key={complejo.id} className="p-4 bg-accent rounded-lg flex justify-between items-center border-primary">
            <div>
              <p className="font-semibold text-primary">{complejo.nombreComplejo}</p>
              <p className="text-sm text-secondary">{complejo.ubicacion} - Aprobado el: {complejo.fechaAprobacion}</p>
            </div>
            <Link to={`/micomplejo/${complejo.id}`}>
              <button className="bg-primary border-primary text-light px-4 py-1 rounded-md text-sm font-medium hover:bg-secondary hover:border-secondary">
                Ver Detalles
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComplejosAprobadosLista;