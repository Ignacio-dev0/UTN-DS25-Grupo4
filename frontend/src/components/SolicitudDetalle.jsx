import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getImageUrl, getPlaceholderImage } from '../config/api.js';

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
      
      <div className="bg-accent h-64 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
        {solicitud.imagen ? (
          <img 
            src={getImageUrl(solicitud.imagen) || getPlaceholderImage('Complejo')}
            alt={`Imagen de ${solicitud.nombreComplejo}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getPlaceholderImage('Complejo');
            }}
          />
        ) : (
          <p className="text-primary">Sin imagen del complejo</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InfoTag label="Calle" value={solicitud.calle} />
        <InfoTag label="Altura" value={solicitud.altura} />
        <InfoTag label="CUIT" value={solicitud.cuit} />
        <InfoTag label="Localidad" value={solicitud.localidad} />
      </div>

      {/* Información del usuario solicitante */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Información del Solicitante</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoTag label="Nombre" value={solicitud.usuarioNombre} />
          <InfoTag label="Correo" value={solicitud.usuarioCorreo} />
          <InfoTag label="Teléfono" value={solicitud.usuarioTelefono} />
          <InfoTag label="CUIT Empresa" value={solicitud.cuit} />
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