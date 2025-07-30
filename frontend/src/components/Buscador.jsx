import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { MapPinIcon, GlobeAltIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/solid';
import { datosDeportes } from '../data/canchas.js';
import CalendarioPopover from './CalendarioPopover.jsx';

function Buscador() {
  const navigate = useNavigate();
  const [ciudad, setCiudad] = useState('');
  const [deporte, setDeporte] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState('15:00hs');
  const fechaFormateada = fecha.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  const horarios = Array.from({ length: 15 }, (_, i) => {
    const hour = 8 + i;
    return `${hour}:00hs`;
  });

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (ciudad) queryParams.append('ciudad', ciudad);
    if (deporte) queryParams.append('deporte', deporte);
    if (fecha) queryParams.append('fecha', fecha.toISOString());
    if (hora) queryParams.append('hora', hora);
    
    navigate(`/resultados?${queryParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg flex flex-col md:flex-row items-center p-3 gap-6 w-full max-w-4xl mx-auto mt-8">
      
      {/* --- Popover para CIUDAD --- */}
      <Popover className="relative w-full md:w-auto md:flex-grow">
        <PopoverButton className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100">
          <MapPinIcon className="h-6 w-6 text-secondary" />
          <span className="text-gray-700 font-medium whitespace-nowrap">{ciudad || 'Buscar Ciudad'}</span>
        </PopoverButton>
        <PopoverPanel anchor="bottom start" className="z-10 mt-2 bg-white rounded-lg shadow-lg w-72 p-4 space-y-4">
          <input 
            type="text"
            placeholder="Ingresa una ciudad..."
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </PopoverPanel>
      </Popover>

      {/* --- Menú para DEPORTE --- */}
      <Menu as="div" className="relative w-full md:w-auto md:flex-grow">
        <MenuButton className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100">
          <GlobeAltIcon className="h-6 w-6 text-secondary" />
          <span className="text-gray-700 font-medium whitespace-nowrap">{deporte || 'Elige deporte'}</span>
        </MenuButton>
        <MenuItems anchor="bottom" className="z-10 mt-2 bg-white rounded-lg shadow-lg w-56 p-2 max-h-60 overflow-y-auto">
          {datosDeportes.map(d => (
             <MenuItem key={d.id}>
              <button onClick={() => setDeporte(d.deporte)} className="w-full text-left p-2 rounded-md hover:bg-gray-100 data-[focus]:bg-gray-200">
                {d.deporte}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      {/* --- Popover para FECHA --- */}
       <Popover className="relative w-full md:w-auto">
        {({ close }) => ( 
          <>
            <PopoverButton className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100">
              <CalendarDaysIcon className="h-6 w-6 text-secondary" />
              <span className="text-gray-700 font-medium whitespace-nowrap">{fechaFormateada}</span>
            </PopoverButton>
            <PopoverPanel anchor="bottom" className="z-10 mt-2">
              <CalendarioPopover 
                fechaSeleccionada={fecha} 
                onFechaChange={setFecha}
                close={close} 
              />
            </PopoverPanel>
          </>
        )}
      </Popover>

      {/* --- Menú para HORA --- */}
      <Menu as="div" className="relative w-full md:w-auto">
        <MenuButton className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100">
            <ClockIcon className="h-6 w-6 text-secondary" />
            <span className="text-gray-700 font-medium">{hora}</span>
        </MenuButton>
                <MenuItems anchor="bottom end" className="z-10 mt-2 bg-white rounded-lg shadow-lg w-32 p-1 max-h-64 overflow-y-auto">
            {horarios.map(h => (
              <MenuItem key={h}>
                  <button onClick={() => setHora(h)} className="w-full text-center p-2 rounded-md hover:bg-gray-100 data-[focus]:bg-gray-200">
                    {h}
                  </button>
              </MenuItem>
            ))}
        </MenuItems>

      </Menu>
      
      {/* --- Botón de Búsqueda --- */}
      <button onClick={handleSearch} className="bg-secondary text-light font-bold py-3 px-6 rounded-lg hover:bg-primary transition-colors w-full md:w-auto">
        Buscar
      </button>

    </div>
  );
}

export default Buscador;