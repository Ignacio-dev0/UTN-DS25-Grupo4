import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { getImageUrl, getCanchaImage } from '../config/api.js';

function CanchaCard({ cancha }) {
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  // DEBUG: Ver qué datos llegan
  console.log('CanchaCard - cancha:', cancha);
  console.log('CanchaCard - cronograma:', cancha.cronograma);

  // Fetch available turns for this court (today from current time onwards)
  useEffect(() => {
    const fetchTurnosDisponibles = async () => {
      if (!cancha.id) return;
      
      setLoadingTurnos(true);
      try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Get today's date
        const todayStr = now.toISOString().split('T')[0];
        
        let response = await fetch(`${API_BASE_URL}/turnos/cancha/${cancha.id}?fecha=${todayStr}`);
        let data = await response.json();
        
        // Filter available turns (not reserved) and only future times for today
        let turnosDisponibles = (data.turnos || []).filter(turno => {
          if (turno.reservado) return false;
          
          // Parse the hour from the turn time
          const timeMatch = turno.horaInicio.match(/T(\d{2}):(\d{2})/);
          if (timeMatch) {
            const turnoHour = parseInt(timeMatch[1]);
            const turnoMinute = parseInt(timeMatch[2]);
            
            // Only show turns that are in the future (today)
            return turnoHour > currentHour || (turnoHour === currentHour && turnoMinute > currentMinute);
          }
          return false;
        });
        
        // If no future turns for today, try tomorrow
        if (turnosDisponibles.length === 0) {
          const tomorrow = new Date(now);
          tomorrow.setDate(now.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          
          response = await fetch(`${API_BASE_URL}/turnos/cancha/${cancha.id}?fecha=${tomorrowStr}`);
          if (response.ok) {
            data = await response.json();
            turnosDisponibles = (data.turnos || []).filter(turno => !turno.reservado);
          }
        }
        
        setTurnosHoy(turnosDisponibles);
      } catch (error) {
        console.error('Error fetching turnos:', error);
      } finally {
        setLoadingTurnos(false);
      }
    };

    fetchTurnosDisponibles();
  }, [cancha.id]);
  
  // Generate available hours from today's turns (only future times)
  const generarHorariosDelDia = () => {
    if (turnosHoy.length === 0) {
      // Fallback to cronograma if no turns data available
      if (!cancha.cronograma || cancha.cronograma.length === 0) {
        return [];
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      const diaActual = diasSemana[now.getDay()];
      
      // Filter cronograma for current day and only future hours
      const horariosDelDia = cancha.cronograma
        .filter(cronograma => {
          if (cronograma.diaSemana !== diaActual) return false;
          
          const horaInicio = new Date(cronograma.horaInicio);
          if (isNaN(horaInicio.getTime())) return false;
          
          const cronogramaHour = horaInicio.getUTCHours();
          const cronogramaMinute = horaInicio.getUTCMinutes();
          
          // Only show future times
          return cronogramaHour > currentHour || (cronogramaHour === currentHour && cronogramaMinute > currentMinute);
        })
        .slice(0, 5)
        .map(cronograma => {
          const horaInicio = new Date(cronograma.horaInicio);
          return horaInicio.toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          });
        });

      return horariosDelDia;
    }

    // Use actual available turns for today, show first 5 unique hours (already filtered by time)
    const horariosUnicos = new Set();
    const horariosArray = [];
    
    for (const turno of turnosHoy) {
      // Parse only the time part from the ISO string to avoid timezone issues
      const timeMatch = turno.horaInicio.match(/T(\d{2}):(\d{2})/);
      let horaFormateada;
      
      if (timeMatch) {
        horaFormateada = `${timeMatch[1]}:${timeMatch[2]}`;
      } else {
        // Fallback to Date parsing if regex fails
        const horaInicio = new Date(turno.horaInicio);
        if (isNaN(horaInicio.getTime())) {
          console.warn('Fecha inválida en turno:', turno.horaInicio);
          continue;
        }
        horaFormateada = horaInicio.toLocaleTimeString('es-AR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
      }
      
      // Solo agregar si no existe ya esta hora
      if (!horariosUnicos.has(horaFormateada)) {
        horariosUnicos.add(horaFormateada);
        horariosArray.push(horaFormateada);
        
        // Limitar a 5 horarios únicos
        if (horariosArray.length >= 5) break;
      }
    }
    
    return horariosArray;
  };

  const horariosDisponibles = generarHorariosDelDia();
  
  // Usar el icono del backend directamente
  const deporteIcono = cancha.deporte?.icono || '⚽';

  // Function to calculate the cheapest price from available turns today
  const calcularPrecioMinimo = () => {
    if (turnosHoy.length > 0) {
      // Use actual turn prices for today
      const precios = turnosHoy
        .map(t => t.precio)
        .filter(precio => precio > 0);
      
      return precios.length > 0 ? Math.min(...precios) : null;
    }
    
    // Fallback to cronograma if no turn data available
    if (!cancha.cronograma || cancha.cronograma.length === 0) {
      return null;
    }
    
    const precios = cancha.cronograma
      .map(c => c.precio)
      .filter(precio => precio > 0);
    
    return precios.length > 0 ? Math.min(...precios) : null;
  };

  const precioDesde = calcularPrecioMinimo();
  
  console.log('CanchaCard - turnosHoy:', turnosHoy);
  console.log('CanchaCard - precioDesde:', precioDesde);
  console.log('CanchaCard - loadingTurnos:', loadingTurnos);

  return (
    <Link to={`/reserva/${cancha.id}`} className="block bg-secondary rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group relative">
      <div className="absolute top-3 left-3 z-10 bg-secondary text-accent rounded-full w-12 h-12 flex items-center justify-center shadow-md border-2 border-white">
        <span className="text-2xl">
          {deporteIcono}
        </span>
      </div>
      <div className="relative">
        <img 
          className="bg-accent w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300" 
          src={getImageUrl(cancha.image?.[0]) || getCanchaImage(cancha.id, cancha.deporte?.nombre || 'Fútbol 5', cancha.nroCancha)}
          onError={(e) => {
            // Fallback a imagen por defecto del deporte
            e.target.src = getCanchaImage(cancha.id, cancha.deporte?.nombre || 'Fútbol 5', cancha.nroCancha);
          }}
          alt={`Cancha de ${cancha.deporte?.nombre}`}
        />
        {precioDesde && (
          <div className="absolute top-0 right-0 bg-secondary bg-opacity-60 text-light text-sm font-bold p-2 m-2 rounded-md">
            desde ${precioDesde.toLocaleString('es-AR')}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-light font-lora">{cancha.complejo?.nombre}</h3>
            <div className="flex items-center text-sm flex-shrink-0 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{cancha.puntaje > 0 ? cancha.puntaje.toFixed(1) : 'Nuevo'}</span>
            </div>
        </div>
        <p className="text-sm text-accent flex items-center mt-1">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {cancha.complejo?.domicilio?.localidad?.nombre} - Cancha N°{cancha.nroCancha}
        </p>
        <div className="border-t border-light mt-4 pt-4">
          {horariosDisponibles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {horariosDisponibles.map((hora, index) => (
                <div key={`${cancha.id}-${hora}-${index}`} className="bg-light text-secondary font-semibold py-1 px-3 rounded-md text-sm">
                  {hora}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-accent">
              <p>Horarios disponibles - Consultar</p>
              {cancha.cronograma?.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs">Días: {cancha.cronograma.map(c => c.diaSemana).join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CanchaCard;