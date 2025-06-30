import React from 'react';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { FaFutbol, FaHockeyPuck } from "react-icons/fa";
import { IoIosBasketball } from "react-icons/io";
import { MdSportsVolleyball, MdSportsHandball, MdSportsTennis } from "react-icons/md";
import { GiTennisRacket } from "react-icons/gi";

const iconMap = {
  'Fútbol 5': <FaFutbol />,
  'Fútbol 11': <FaFutbol />,
  'Vóley': <MdSportsVolleyball />,
  'Básquet': <IoIosBasketball />,
  'Handball': <MdSportsHandball />,
  'Tenis': <MdSportsTennis />,
  'Pádel': <GiTennisRacket />,
  'Hockey': <FaHockeyPuck />,
};

function InfoCancha({ cancha, complejo, deporte }) {
  const deporteIcono = iconMap[deporte] || null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-2">
        {deporteIcono && (
          <div className="bg-secondary text-accent rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 border-2 border-white">
            <span className="text-3xl">{deporteIcono}</span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold font-lora text-gray-800">
            {complejo.nombre} - Cancha N°{cancha.noCancha}
          </h2>
          <button className="flex items-center text-sm text-yellow-500 mt-1">
            <StarIcon className="w-4 h-4 mr-1" />
            <span>{cancha.puntaje.toFixed(1)} (Reseña)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Servicios</h3>
          <div className="bg-accent p-4 rounded-lg h-32">
             <p className="text-primary">Placeholder para lista de servicios...</p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Ubicación</h3>
          <div className="bg-accent p-4 rounded-lg h-32 flex items-center justify-center">
            <MapPinIcon className="w-8 h-8 text-primary" />
             <p className="text-primary ml-2">{complejo.ubicacion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoCancha;