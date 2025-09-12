import React from 'react';

function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
