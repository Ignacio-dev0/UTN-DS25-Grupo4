import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalConfirmacion from './ModalConfirmacion';
import {TrashIcon} from '@heroicons/react/24/solid';

function ComplejosAprobadosLista({ complejos, onRemove }) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [complejoToRemove, setComplejoToRemove] = useState(null);

  const handleOpenRemoveModal = (complejo) => {
    setComplejoToRemove(complejo);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (complejoToRemove) {
      onRemove(complejoToRemove.id);
    }
    setShowRemoveModal(false);
    setComplejoToRemove(null);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-secondary mb-6">Complejos Aprobados</h2>
      <ul className="space-y-4">
        {complejos.map(complejo => (
          <li key={complejo.id} className="p-4 bg-white rounded-lg flex justify-between items-center border-primary">
            <div>
              <p className="font-semibold text-primary">{complejo.nombreComplejo}</p>
              <p className="text-sm text-secondary">{complejo.ubicacion} - Aprobado el: {complejo.fechaAprobacion}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/micomplejo/${complejo.id}`}>
                <button className="bg-secondary border-primary text-light px-4 py-1 rounded-md text-sm font-medium hover:bg-primary">
                  Ver Detalles
                </button>
              </Link>
              <button 
                onClick={() => handleOpenRemoveModal(complejo)}
                className="text-canchaRed hover:text-canchaRed p-2 rounded-full hover:bg-red-100"
                title="Eliminar de la lista"
              >
                  <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      <ModalConfirmacion
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleConfirmRemove}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar a ${complejoToRemove?.nombreComplejo} de la lista de complejos aprobados?`}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
}

export default ComplejosAprobadosLista;