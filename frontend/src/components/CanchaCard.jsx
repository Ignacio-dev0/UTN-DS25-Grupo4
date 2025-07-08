import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { datosComplejos } from '../data/complejos.js';
import { FaFutbol, FaHockeyPuck, FaRegFutbol } from "react-icons/fa";
import { IoIosBasketball } from "react-icons/io";
import { MdSportsVolleyball, MdSportsHandball, MdSportsTennis } from "react-icons/md";
import { GiTennisRacket } from "react-icons/gi";

const iconMap = {
  'Fútbol 5': <FaFutbol />,
  'Fútbol 11': <FaRegFutbol />,
  'Vóley': <MdSportsVolleyball />,
  'Básquet': <IoIosBasketball />,
  'Handball': <MdSportsHandball />,
  'Tenis': <MdSportsTennis />,
  'Pádel': <GiTennisRacket />, 
  'Hockey': <FaHockeyPuck />,
};

function CanchaCard({ cancha }) {
  const complejo = datosComplejos.find(c => c.id === cancha.complejoId);

  if (!complejo) return null; 

  const horariosDisponibles = cancha.turnos?.filter(t => t.estado === 'disponible').slice(0, 5).map(t => t.hora) || [];
  const deporteIconFinal = iconMap[cancha.deporte] || null;

  return (
    <Link to={`/reserva/${cancha.id}`} className="block bg-secondary rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group relative">
      <div className="absolute top-3 left-3 z-10 bg-secondary text-accent rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-white">
        <span className="text-2xl">
          {deporteIconFinal}
        </span>
      </div>
      <div className="relative">
        <img className="bg-accent w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" src={cancha.imageUrl || `https://via.placeholder.com/400x300?text=${complejo.nombre}`}/>
        {cancha.precioDesde && (
          <div className="absolute top-0 right-0 bg-secondary bg-opacity-60 text-light text-sm font-bold p-2 m-2 rounded-md">
            desde ${cancha.precioDesde.toLocaleString('es-AR')}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-light font-lora">{complejo.nombre}</h3>
            <div className="flex items-center text-sm flex-shrink-0 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{cancha.puntaje > 0 ? cancha.puntaje.toFixed(1) : 'Nuevo'}</span>
            </div>
        </div>
        <p className="text-sm text-accent flex items-center mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {complejo.ubicacion} - Cancha N°{cancha.noCancha}
        </p>
        <div className="border-t border-light mt-4 pt-4">
          {horariosDisponibles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {horariosDisponibles.map(hora => (
                <div key={hora} className="bg-light text-secondary font-semibold py-1 px-3 rounded-md text-sm">
                  {hora}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-accent">Sin turnos próximos.</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CanchaCard;