import React from 'react';

function InfoCanchaEditable({ cancha, onCanchaChange }) {
  const handleChange = (e) => {
    onCanchaChange({ [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-primary mb-2">Información de la Cancha</h3>
      <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Deporte</label>
          <input 
            type="text"
            name="deporte"
            value={cancha.deporte}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Número / Nombre de Cancha</label>
          <input 
            type="text"
            name="noCancha"
            value={cancha.noCancha}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="descripcion"
            value={cancha.descripcion}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

export default InfoCanchaEditable;