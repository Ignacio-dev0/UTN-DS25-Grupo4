import React from 'react';

/**
 * Overlay de "Guardando cambios..." con spinner circular
 * Similar al de MiComplejoPage pero como componente reutilizable
 */
function SavingOverlay({ message = "Guardando cambios..." }) {
  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
        <p className="text-gray-700 font-semibold text-lg">{message}</p>
      </div>
    </div>
  );
}

export default SavingOverlay;
