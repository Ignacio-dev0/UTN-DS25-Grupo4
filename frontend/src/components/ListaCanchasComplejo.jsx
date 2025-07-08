import React, { useState } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import MiniCanchaCard from './MiniCanchaCard.jsx';
import FormularioNuevaCancha from './FormularioNuevaCancha.jsx';
import ModalGestionCancha from './ModalGestionCancha.jsx';

function ListaCanchasComplejo({ canchas, onDisable, onDelete, isEditing }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const CANCHAS_POR_PAGINA = 5;
  const canchasPaginadas = canchas.slice(0, CANCHAS_POR_PAGINA);

  const handleGuardarCancha = (nuevaCancha) => {
    console.log('Guardando nueva cancha:', nuevaCancha);
    setShowAddForm(false);
  };
  
  const handleCardAction = (cancha) => {
    setCanchaSeleccionada(cancha); 
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (canchaId) => {
    if (window.confirm('¿Estás SEGURO de que quieres eliminar esta cancha? Esta acción no se puede deshacer.')) {
        onDelete(canchaId);
    }
  };

  return (
    <div className="w-full md:w-2/3 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mis Canchas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {canchasPaginadas.map(cancha => (
          <MiniCanchaCard 
            key={cancha.id} 
            cancha={cancha}
            onAction={handleCardAction}
            isEditing={isEditing}
          />
        ))}
        <button
          onClick={() => setShowAddForm(true)}
          className="border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-accent hover:bg-accent hover:border-primary hover:text-primary transition-all duration-300 min-h-[220px] aspect-w-1 aspect-h-1"
        >
          <PlusIcon className="w-12 h-12" />
          <span className="mt-2 font-semibold">Agregar Cancha</span>
        </button>
      </div>

      {showAddForm && (
        <FormularioNuevaCancha
          onCerrar={() => setShowAddForm(false)}
          onGuardar={handleGuardarCancha}
        />
      )}

      {isModalOpen && (
        <ModalGestionCancha
          cancha={canchaSeleccionada}
          onClose={() => setIsModalOpen(false)}
          onDisable={onDisable}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default ListaCanchasComplejo;