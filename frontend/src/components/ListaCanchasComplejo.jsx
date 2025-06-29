import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import MiniCanchaCard from './MiniCanchaCard.jsx';

function ListaCanchasComplejo({ canchas }) {
  return (
    <div className="w-full md:w-2/3 p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Canchas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {canchas.length > 0 ? (
          canchas.map(cancha => (
            <MiniCanchaCard key={cancha.id} cancha={cancha} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Este complejo aún no tiene canchas registradas.</p>
        )}
      </div>

      {canchas.length > 6 && (
          <div className="flex justify-end mt-4">
            <button className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors">
              <ArrowRightIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        )
      }
    </div>
  );
}

export default ListaCanchasComplejo;