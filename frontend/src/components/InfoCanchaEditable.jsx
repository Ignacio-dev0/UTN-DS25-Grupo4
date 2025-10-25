import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { FaWifi } from "react-icons/fa";
import { FaChalkboardUser } from "react-icons/fa6";
import { MdRestaurant, MdFamilyRestroom } from "react-icons/md";
import { GiTrophy, GiPartyPopper } from "react-icons/gi";
import { PiTShirtFill, PiCarFill } from "react-icons/pi";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ServicioItemReadOnly = ({ complejoServicio }) => {
  // Extraer el servicio de la estructura ComplejoServicio
  const servicio = complejoServicio?.servicio || complejoServicio;
  
  return (
    <div className="flex items-center text-primary">
      <span className="mr-2">{servicio.icono}</span>
      <span className='font-medium'>{servicio.nombre}</span>
    </div>
  );
};

function InfoCanchaEditable({ cancha, complejo }) {
  // Use the emoji icon directly from the deporte object
  const deporteIcono = cancha?.deporte?.icono || '⚽';

  const position = [
    complejo.lat || -34.9214,
    complejo.lng || -57.9545
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
                {deporteIcono && (
          <div className="text-primary bg-secondary rounded-full p-3 mb-3 flex items-center justify-center">
            <span className="text-3xl">{deporteIcono}</span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold font-lora text-gray-800">
            {complejo.nombre} - Cancha N°{cancha.nroCancha}
          </h2>
          <button className="flex items-center text-sm text-yellow-500 mt-1">
            <StarIcon className="w-4 h-4 mr-1" />
            {cancha.cantidadReseñas > 0 ? (
              <span>{cancha.puntaje.toFixed(1)} ({cancha.cantidadReseñas} Reseñas)</span>
            ) : (
              <span className="text-gray-500">Sin reseñas aún</span>
            )}
          </button>
          {cancha.precioDesde !== undefined && cancha.precioDesde > 0 && (
            <div className="mt-2 text-lg font-semibold text-primary">
              Desde ${cancha.precioDesde.toLocaleString('es-AR')} / hora
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div className="flex flex-col gap-8">
          <div className="bg-accent p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-4">Servicios del Club</h3>
            <p className="text-sm text-gray-600 mb-3 italic">
              Los servicios se configuran a nivel del complejo y se heredan automáticamente.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Array.isArray(complejo?.servicios) && complejo.servicios.map((complejoServicio) => (
                <ServicioItemReadOnly 
                  key={complejoServicio.id || `${complejoServicio.complejoId}-${complejoServicio.servicioId}`}
                  complejoServicio={complejoServicio}
                />
              ))}
              {(!complejo?.servicios || complejo.servicios.length === 0) && (
                <p className="text-gray-500 text-sm">No hay servicios configurados</p>
              )}
            </div>
          </div>
          
          <div className="bg-accent p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-3">Horarios del Club</h3>
            <p className="text-sm text-gray-600 mb-3 italic">
              Los horarios se configuran a nivel del complejo y se heredan automáticamente.
            </p>
            <div className="w-full min-h-[6rem] p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {complejo?.horarios || 'No hay horarios configurados'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-xl font-bold mb-2 text-primary">Ubicación</h3>
          {complejo.domicilio && (
            <p className="text-gray-700 mb-3">
              {complejo.domicilio.calle} {complejo.domicilio.altura}, {complejo.domicilio.localidad?.nombre || 'Localidad'}
            </p>
          )}
          <div className="rounded-lg overflow-hidden border-4 border-accent shadow-lg h-80 lg:h-full">
            <MapContainer 
              center={position} 
              zoom={13} 
              maxZoom={16}
              scrollWheelZoom={false} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={16}
              />
              <Marker position={position}>
                <Popup>
                  <b>{complejo.nombre}</b><br />{complejo.ubicacion}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoCanchaEditable;