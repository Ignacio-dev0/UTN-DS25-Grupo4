import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { MapPinIcon, GlobeAltIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/solid';
import { getDeportes, getLocalidades } from '../services/search.js';
import CalendarioPopover from './CalendarioPopover.jsx';

function Buscador() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Inicializar con valores de la URL si existen
  const [localidad, setLocalidad] = useState(searchParams.get('localidad') || '');
  const [deporte, setDeporte] = useState(searchParams.get('deporte') || '');
  const [fecha, setFecha] = useState(searchParams.get('fecha') ? new Date(searchParams.get('fecha')) : new Date());
  const [hora, setHora] = useState(searchParams.get('hora') || '15:00hs');
  
  // Estados para datos del backend
  const [deportes, setDeportes] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fechaFormateada = fecha.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  const horarios = Array.from({ length: 17 }, (_, i) => {
    const hour = 7 + i;
    return `${hour}:00hs`;
  });

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [deportesResponse, localidadesResponse] = await Promise.all([
          getDeportes(),
          getLocalidades()
        ]);

        if (deportesResponse.ok) {
          setDeportes(deportesResponse.deportes);
        } else {
          console.error('Error al cargar deportes:', deportesResponse.error);
        }

        if (localidadesResponse.ok) {
          setLocalidades(localidadesResponse.localidades);
        } else {
          console.error('Error al cargar localidades:', localidadesResponse.error);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (localidad) queryParams.append('localidad', localidad);
    if (deporte) queryParams.append('deporte', deporte);
    if (fecha) queryParams.append('fecha', fecha.toISOString());
    if (hora) queryParams.append('hora', hora);
    
    navigate(`/resultados?${queryParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg flex flex-col md:flex-row items-center p-3 gap-6 w-full max-w-4xl mx-auto mt-8">
      
      {/* --- Menú para LOCALIDAD --- */}
      <Menu as="div" className="relative w-full md:w-auto md:flex-grow">
        <MenuButton className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100">
          <MapPinIcon className="h-6 w-6 text-secondary" />
          <span className="text-gray-700 font-medium whitespace-nowrap">{localidad || 'Buscar Ciudad'}</span>
        </MenuButton>
        <MenuItems anchor="bottom start" className="z-10 mt-2 bg-white rounded-lg shadow-lg w-72 p-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          ) : (
            localidades.map(l => (
              <MenuItem key={l.id}>
                <button 
                  onClick={() => setLocalidad(l.nombre)} 
                  className="w-full text-left p-2 rounded-md hover:bg-gray-100 data-[focus]:bg-gray-200"
                >
                  {l.nombre}
                </button>
              </MenuItem>
            ))
          )}
        </MenuItems>
      </Menu>

      {/* --- Menú para DEPORTE --- */}
      <Menu as="div" className="relative w-full md:w-auto md:flex-grow">
        <MenuButton className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100">
          <GlobeAltIcon className="h-6 w-6 text-secondary" />
          <span className="text-gray-700 font-medium whitespace-nowrap">{deporte || 'Elige deporte'}</span>
        </MenuButton>
        <MenuItems anchor="bottom" className="z-10 mt-2 bg-white rounded-lg shadow-lg w-56 p-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          ) : (
            deportes.map(d => (
              <MenuItem key={d.id}>
                <button 
                  onClick={() => setDeporte(d.nombre)} 
                  className="w-full text-left p-2 rounded-md hover:bg-gray-100 data-[focus]:bg-gray-200"
                >
                  {d.nombre}
                </button>
              </MenuItem>
            ))
          )}
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