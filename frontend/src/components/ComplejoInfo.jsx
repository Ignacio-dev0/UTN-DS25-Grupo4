import React from 'react';

function ComplejoInfo({ complejo }) {
  if (!complejo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="w-full md:w-1/3 p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{complejo.nombre}</h2>
      
      <div className="bg-accent -100 p-4 rounded-lg mb-4">
        <p className="text-xs text-primary">Cuenta en pesos</p>
        <p className="text-3xl font-bold text-primary">${complejo.balance.toLocaleString('es-AR')}</p>
      </div>

      <div className="bg-accent h-64 rounded-lg flex items-center justify-center">
        <span className="text-primary text-4xl">X</span>
      </div>
    </div>
  );
}

export default ComplejoInfo;