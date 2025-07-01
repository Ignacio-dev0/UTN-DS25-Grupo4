import React, { useState } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import MiniCanchaCard from './MiniCanchaCard.jsx';
import FormularioNuevaCancha from './FormularioNuevaCancha.jsx';

function ListaCanchasComplejo({ canchas }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const CANCHAS_POR_PAGINA = 5;

  const totalPages = Math.ceil(canchas.length / CANCHAS_POR_PAGINA);

  const canchasPaginadas = canchas.slice(
    currentPage * CANCHAS_POR_PAGINA,
    (currentPage + 1) * CANCHAS_POR_PAGINA
  );

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 0));
  };

  const handleGuardarCancha = (nuevaCancha) => {
    console.log('Guardando nueva cancha:', nuevaCancha);
    setMostrarModal(false);
  };

  return (
    <div className="w-full md:w-2/3 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mis Canchas</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {canchasPaginadas.map(cancha => (
          <MiniCanchaCard key={cancha.id} cancha={cancha} />
        ))}
        <button
          onClick={() => setMostrarModal(true)}
          className="border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-accent hover:bg-accent hover:border-primary hover:text-primary transition-all duration-300 min-h-[220px] aspect-w-1 aspect-h-1"
        >
          <PlusIcon className="w-12 h-12" />
          <span className="mt-2 font-semibold">Agregar Cancha</span>
        </button>
      </div>
      {mostrarModal && (
        <FormularioNuevaCancha
          onCerrar={() => setMostrarModal(false)}
          onGuardar={handleGuardarCancha}
        />
      )}
    </div>
  );
}

export default ListaCanchasComplejo;
