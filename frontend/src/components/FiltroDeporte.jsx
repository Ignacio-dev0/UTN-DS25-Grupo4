import React, { useState } from 'react';
import { AdjustmentsHorizontalIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { datosDeportes } from '../data/canchas.js';
import { FaStar, FaFutbol, FaHockeyPuck, FaRegFutbol } from "react-icons/fa";
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
  'Pádel': <GiTennisRacket />, // Usamos el de tenis como sustituto cercano
  'Hockey': <FaHockeyPuck />,
};

function FiltroDeporte({ deporteSeleccionado, onSelectDeporte }) {
  return (
    <div className="flex justify-between items-center w-full max-w-5xl mx-auto py-4">
      <div className="flex items-center space-x-6 overflow-x-auto pb-2">
        <button 
          onClick={() => onSelectDeporte('Populares')}
          className={`flex flex-col items-center text-primary hover:text-primary w-20 transition-colors group ${deporteSeleccionado === 'Populares' ? 'font-bold' : ''}`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 transition-colors ${deporteSeleccionado === 'Populares' ? 'bg-primary text-light' : 'bg-accent text-secondary group-hover:bg-white'}`}>
            <FaStar className="w-6 h-6" />
          </div>
          <span className="text-sm whitespace-nowrap">Populares</span>
        </button>

        {datosDeportes.map((deporte) => (
          <button 
            key={deporte.id}
            onClick={() => onSelectDeporte(deporte.deporte)}
            className={`flex flex-col items-center text-gray-700 hover:text-black w-20 transition-colors group ${deporteSeleccionado === deporte.deporte ? 'font-bold' : ''}`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 transition-colors ${deporteSeleccionado === deporte.deporte ? 'bg-primary text-light' : 'bg-accent text-secondary group-hover:bg-white'}`}>
              <span className="text-2xl">{iconMap[deporte.deporte]}</span>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">{deporte.deporte}</span>
          </button>
        ))}
        <button className="text-secondary p-2 rounded-full hover:bg-accent self-center">
            <ArrowRightIcon className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
}

export default FiltroDeporte;