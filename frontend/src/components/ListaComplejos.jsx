// src/components/ListaComplejos.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalConfirmacion from './ModalConfirmacion';
import { TrashIcon, FaBan } from '@heroicons/react/24/solid';

function ListaComplejos({ complejos, onRemove }) {
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

  // Ordenar los complejos por fecha de aprobación (más recientes primero)
  const complejosOrdenados = [...complejos].sort((a, b) => new Date(b.fechaAprobacion) - new Date(a.fechaAprobacion));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-secondary mb-6">Complejos Activos</h2>
      <ul className="space-y-4">
        {complejosOrdenados.map(complejo => (
          <li key={complejo.id} className="p-4 bg-white rounded-lg flex justify-between items-center border-primary shadow-md">
            <div>
              <p className="font-semibold text-primary text-lg">{complejo.nombreComplejo}</p>
              <p className="text-sm text-secondary">Aprobado el: {new Date(complejo.fechaAprobacion).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/micomplejo/${complejo.id}`}>
                <button className="bg-secondary border-primary text-light px-4 py-2 rounded-md text-sm font-medium hover:bg-primary transition-colors">
                  Ver Detalles
                </button>
              </Link>
              <button 
                // onClick={() => handleSuspend(complejo)}
                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100"
                title="Suspender Complejo"
              >
                  <FaBan className="w-6 h-6" />
              </button>
              <button 
                onClick={() => handleOpenRemoveModal(complejo)}
                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100"
                title="Eliminar Complejo"
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
        message={`¿Estás seguro de que deseas eliminar a ${complejoToRemove?.nombreComplejo} de la lista de complejos? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
      />
    </div>
  );
}

export default ListaComplejos;