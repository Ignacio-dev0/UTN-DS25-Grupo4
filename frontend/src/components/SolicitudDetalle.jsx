import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const InfoTag = ({ label, value }) => (
  <div className="bg-accent rounded-lg px-4 py-2">
    <p className="text-xs text-primary">{label}</p>
    <p className="font-semibold text-primary">{value || 'No especificado'}</p>
  </div>
);

function SolicitudDetalle({ solicitud, onApprove, onDecline }) {
  if (!solicitud) {
    return <div className="flex-1 p-8 text-center text-gray-500">Selecciona una solicitud para ver los detalles o no hay más solicitudes pendientes.</div>;
  }

  return (
    <div className="flex-1 p-8 border-r border-accent">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{solicitud.nombreComplejo}</h2>
      
      <div className="bg-accent h-64 rounded-lg flex items-center justify-center mb-6">
        <p className="text-primary">Imagen del complejo</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <InfoTag label="Calle" value={solicitud.calle} />
        <InfoTag label="Altura" value={solicitud.altura} />
        <InfoTag label="Porc. Reembolso" value={solicitud.reembolso} />
        <InfoTag label="Horario" value={solicitud.horario} />
        <InfoTag label="CUIT" value={solicitud.cuit} />
        <div className="col-span-2">
            <InfoTag label="Descripción" value={solicitud.descripcion} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => onDecline(solicitud.id)}
          className="flex items-center gap-2 bg-red-100 text-red-700 font-bold py-3 px-6 rounded-full hover:bg-red-200 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
          <span>Rechazar</span>
        </button>
        <button 
          onClick={() => onApprove(solicitud.id)}
          className="flex items-center gap-2 bg-green-100 text-green-700 font-bold py-3 px-6 rounded-full hover:bg-green-200 transition-colors"
        >
          <CheckIcon className="w-6 h-6" />
          <span>Aprobar</span>
        </button>
      </div>
    </div>
  );
}

export default SolicitudDetalle;