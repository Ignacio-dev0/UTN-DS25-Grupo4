import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
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

function MiniCanchaCard({ cancha, onAction, isEditing }) {
  const deporteIcono = iconMap[cancha.deporte] || null;

  const cardClasses = `block rounded-lg shadow-lg overflow-hidden transition-all duration-300 group relative ${
    cancha.estado === 'deshabilitada' 
    ? 'bg-gray-300'
    : 'bg-secondary hover:shadow-2xl transform hover:-translate-y-1'
  }`;

  return (
    <div className={cardClasses}>
      <Link to={`/reserva/${cancha.id}`} className={cancha.estado === 'deshabilitada' ? 'pointer-events-none' : ''}>
        {deporteIcono && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-accent rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2 border-white">
            <span className="text-xl">{deporteIcono}</span>
          </div>
        )}
        <div className="relative">
          <img 
            className={`bg-accent w-full h-40 object-cover ${cancha.estado !== 'deshabilitada' ? 'transform group-hover:scale-105' : ''} transition-transform duration-300`} 
            src={cancha.imageUrl || `https://via.placeholder.com/400x300?text=Cancha ${cancha.noCancha}`} 
            alt={`Cancha ${cancha.noCancha}`}
          />
          {cancha.estado === 'deshabilitada' && (
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          )}
        </div>
      </Link>
      
      {isEditing && (
        <button 
          onClick={() => onAction(cancha)}
          className="absolute top-2 right-2 z-20 bg-primary bg-opacity-50 text-white rounded-full p-1 hover:bg-canchaRed transition-colors"
          title="Gestionar cancha"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
      
      <div className={`p-4 ${cancha.estado === 'deshabilitada' ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-light font-lora">Cancha N°{cancha.noCancha}</h3>
            <div className="flex items-center text-sm flex-shrink-0 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{cancha.puntaje?.toFixed(1)}</span>
            </div>
        </div>
        <p className="text-sm text-accent mt-1 truncate">{cancha.descripcion}</p>
      </div>
    </div>
  );
}

export default MiniCanchaCard;