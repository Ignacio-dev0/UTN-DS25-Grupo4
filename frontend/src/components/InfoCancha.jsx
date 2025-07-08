import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { FaWifi, FaFutbol, FaHockeyPuck, FaRegFutbol } from "react-icons/fa";
import { FaChalkboardUser } from "react-icons/fa6";
import { IoIosBasketball } from "react-icons/io";
import { MdSportsVolleyball, MdSportsHandball, MdSportsTennis, MdRestaurant, MdFamilyRestroom, MdSportsHockey } from "react-icons/md";
import { GiTennisRacket, GiTrophy, GiPartyPopper } from "react-icons/gi";
import { PiTShirtFill, PiCarFill } from "react-icons/pi";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const deporteIconMap = {
  'Fútbol 5': <FaFutbol />,
  'Fútbol 11': <FaRegFutbol />,
  'Vóley': <MdSportsVolleyball />,
  'Básquet': <IoIosBasketball />,
  'Handball': <MdSportsHandball />,
  'Tenis': <MdSportsTennis />,
  'Pádel': <GiTennisRacket />,
  'Hockey': <FaHockeyPuck />,
};

const serviciosIconMap = {
  'Estacionamiento': <PiCarFill />,
  'Vestuarios': <PiTShirtFill />,
  'Buffet': <MdRestaurant />,
  'Parrillas': <MdFamilyRestroom />,
  'Wi-Fi': <FaWifi />,
  'Kiosco': <MdRestaurant />,
  'Clases': <FaChalkboardUser />,
  'Confitería': <MdRestaurant />,
  'Club House': <MdFamilyRestroom />,
  'Pro-Shop': <PiTShirtFill />,
  'Tienda': <PiTShirtFill />,
  'Quincho': <MdFamilyRestroom />,
  'Cumpleaños': <GiPartyPopper />,
  'Escuelita deportiva': <FaChalkboardUser />,
  'Torneos': <GiTrophy />,
  'Restaurante': <MdRestaurant />,
};

const ServicioItem = ({ servicio }) => {
  const icono = serviciosIconMap[servicio] || <StarIcon className="w-5 h-5 text-secondary" />;
  return (
    <div className="flex items-center gap-3">
      <span className="text-secondary text-2xl">{icono}</span>
      <span className="font-medium text-primary">{servicio}</span>
    </div>
  );
};

function InfoCancha({ cancha, complejo, deporte }) {
  const deporteIcono = deporteIconMap[deporte] || null;

  const position = [
    complejo.lat || -34.9214,
    complejo.lng || -57.9545
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        {deporteIcono && (
          <div className="bg-secondary text-accent rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
            <span className="text-3xl">{deporteIcono}</span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold font-lora text-gray-800">
            {complejo.nombre} - Cancha N°{cancha.noCancha}
          </h2>
          <button className="flex items-center text-sm text-yellow-500 mt-1">
            <StarIcon className="w-4 h-4 mr-1" />
            {/* Lógica condicional para mostrar puntaje o mensaje de "Sin reseñas" */}
            {cancha.cantidadReseñas > 0 ? (
              <span>{cancha.puntaje.toFixed(1)} ({cancha.cantidadReseñas} Reseñas)</span>
            ) : (
              <span className="text-gray-500">Sin reseñas aún</span>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div className="flex flex-col gap-8">
          <div className="bg-accent p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-4">Servicios del Club</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {(complejo.servicios || []).map((servicio, index) => (
                <ServicioItem key={index} servicio={servicio} />
              ))}
            </div>
          </div>
          <div className="bg-accent p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-3">Horarios del Club</h3>
            <p className="text-primary font-medium whitespace-pre-line">
              {complejo.horarios || 'No especificado'}
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-bold mb-2 text-primary">Ubicación</h3>
          <div className="rounded-lg overflow-hidden border-4 border-accent shadow-lg h-80 lg:h-full">
            <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

export default InfoCancha;