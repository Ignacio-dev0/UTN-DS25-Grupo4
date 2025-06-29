import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const diasSemana = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];

function CalendarioPopover({ fechaSeleccionada, onFechaChange, close }) {
  const [fechaVisible, setFechaVisible] = useState(fechaSeleccionada || new Date());

  const primerDiaDelMes = new Date(fechaVisible.getFullYear(), fechaVisible.getMonth(), 1);
  const diasEnMes = new Date(fechaVisible.getFullYear(), fechaVisible.getMonth() + 1, 0).getDate();

  let diaInicio = primerDiaDelMes.getDay();
  if (diaInicio === 0) diaInicio = 6; 
  else diaInicio -= 1; 

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); 

  const cambiarMes = (incremento) => {
    setFechaVisible(prevFecha => new Date(prevFecha.getFullYear(), prevFecha.getMonth() + incremento, 1));
  };

  const handleSeleccionarDia = (dia) => {
    const nuevaFecha = new Date(fechaVisible.getFullYear(), fechaVisible.getMonth(), dia);
    onFechaChange(nuevaFecha);
    close(); 
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => cambiarMes(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="font-bold text-lg text-gray-800">
          {fechaVisible.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
        </div>
        <button onClick={() => cambiarMes(1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-500">
        {diasSemana.map(dia => <div key={dia} className="font-medium">{dia}</div>)}
        {Array.from({ length: diaInicio }).map((_, i) => <div key={`empty-${i}`}></div>)}
        {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
          const fechaActual = new Date(fechaVisible.getFullYear(), fechaVisible.getMonth(), dia);
          const estaSeleccionado = fechaSeleccionada && fechaActual.getTime() === fechaSeleccionada.getTime();
          
          const limiteSuperior = new Date(hoy);
          limiteSuperior.setDate(hoy.getDate() + 7);
          const deshabilitado = fechaActual < hoy || fechaActual >= limiteSuperior;

          let clasesBoton = "w-9 h-9 rounded-full flex items-center justify-center transition-colors ";
          if (estaSeleccionado) {
            clasesBoton += "bg-primary text-white font-bold";
          } else if (deshabilitado) {
            clasesBoton += "text-light cursor-not-allowed";
          } else {
            clasesBoton += "hover:bg-accent";
          }
          
          return (
            <button key={dia} disabled={deshabilitado} onClick={() => handleSeleccionarDia(dia)} className={clasesBoton}>
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarioPopover;