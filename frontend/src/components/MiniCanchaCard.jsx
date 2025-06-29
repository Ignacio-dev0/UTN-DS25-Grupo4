import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { datosComplejos } from '../data/complejos.js';
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

function MiniCanchaCard({ cancha }) {
  const complejo = datosComplejos.find(c => c.id === cancha.complejoId);
  const deporteIcono = iconMap[cancha.deporte] || null;

  if (!complejo) return null;

  return (
    <Link to={`/reserva/${cancha.id}`} className="block bg-secondary rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group relative">
      {deporteIcono && (
        <div className="absolute top-3 left-3 z-10 bg-primary text-accent rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2 border-white">
          <span className="text-xl">{deporteIcono}</span>
        </div>
      )}

      <div className="relative">
        <img className="bg-accent w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-300" src={cancha.imageUrl || `https://via.placeholder.com/400x300?text=Cancha ${cancha.noCancha}`} />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-light font-lora">Cancha N°{cancha.noCancha}</h3>
            <div className="flex items-center text-sm flex-shrink-0 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{cancha.puntaje?.toFixed(1)}</span>
            </div>
        </div>
        <p className="text-sm text-accent mt-1 truncate">{cancha.descripcion}</p>
      </div>
    </Link>
  );
}

export default MiniCanchaCard;