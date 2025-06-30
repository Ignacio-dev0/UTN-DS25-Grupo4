import React, { useState } from 'react';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import MiniCanchaCard from './MiniCanchaCard.jsx';

function ListaCanchasComplejo({ canchas }) {
  const [currentPage, setCurrentPage] = useState(0);
  const CANCHAS_POR_PAGINA = 6;

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

  return (
    <div className="w-full md:w-2/3 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Mis Canchas</h2>
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
        {canchasPaginadas.length > 0 ? (
          canchasPaginadas.map(cancha => (
            <MiniCanchaCard key={cancha.id} cancha={cancha} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Este complejo aún no tiene canchas registradas.</p>
        )}
      </div>
    </div>
  );
}

export default ListaCanchasComplejo;