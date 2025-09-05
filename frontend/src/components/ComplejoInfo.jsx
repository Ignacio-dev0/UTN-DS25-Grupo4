import React, { useRef } from 'react';
import { PencilIcon, CheckIcon, CameraIcon } from '@heroicons/react/24/solid';
import { FaWifi } from "react-icons/fa";
import { FaChalkboardUser } from "react-icons/fa6";
import { MdRestaurant, MdFamilyRestroom } from "react-icons/md";
import { GiTrophy, GiPartyPopper } from "react-icons/gi";
import { PiTShirtFill, PiCarFill } from "react-icons/pi";
import ServiciosSelector from './ServiciosSelector';

const serviciosIconMap = {
  'Estacionamiento': <PiCarFill />, 'Vestuarios': <PiTShirtFill />, 'Buffet': <MdRestaurant />,
  'Parrillas': <MdFamilyRestroom />, 'Wi-Fi': <FaWifi />, 'Kiosco': <GiPartyPopper />,
  'Torneos': <GiTrophy />, 'Escuelita': <FaChalkboardUser />,
};

const ServicioItem = ({ servicio }) => {
  const Icono = serviciosIconMap[servicio];
  return (
    <div className="flex items-center text-primary">
      {Icono && React.cloneElement(Icono, { className: "w-6 h-6 mr-3" })}
      <span className='font-medium'>{servicio}</span>
    </div>
  );
};

function ComplejoInfo({ complejo, alquileres = [], isEditing, onToggleEdit, onComplejoChange }) {
  const fileInputRef = useRef(null);

  if (!complejo) {
    return <div>Cargando...</div>;
  }

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onComplejoChange({ ...complejo, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleInputChange = (e) => {
    onComplejoChange({ ...complejo, [e.target.name]: e.target.value });
  };

  const handleServiciosChange = (nuevosServicios) => {
    onComplejoChange({ ...complejo, servicios: nuevosServicios });
  };

  return (
    <div className="w-full md:w-1/3 p-4">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            name="nombre"
            value={complejo.nombre}
            onChange={handleInputChange}
            className="text-xl font-bold text-gray-800 w-full border-b-2 border-primary focus:outline-none bg-transparent"
          />
        ) : (
          <h2 className="text-xl font-bold text-gray-800">{complejo.nombre}</h2>
        )}
        <button onClick={onToggleEdit} className="text-secondary hover:text-green-400 ml-4" title={isEditing ? "Finalizar Edición" : "Editar Complejo"}>
          {isEditing ? <CheckIcon className="w-6 h-6" /> : <PencilIcon className="w-5 h-5 text-secondary hover:text-primary" />}
        </button>
      </div>
      
      <div className="bg-accent p-4 rounded-lg mb-4">
        <p className="text-xs text-primary">Cuenta en pesos</p>
        <p className="text-3xl font-bold text-primary">${complejo.balance.toLocaleString('es-AR')}</p>
      </div>

      <div className="relative bg-accent h-64 rounded-lg flex items-center justify-center mb-6">
        <img 
          src={complejo.logoUrl || "/images/placeholder.png"} 
          alt={`Imagen de ${complejo.nombre}`} 
          className={`w-full h-full object-cover rounded-lg ${isEditing ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
        />
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-light rounded-lg pointer-events-none">
            <CameraIcon className="w-8 h-8 mr-2" />
            <span>Cambiar Imagen</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      
      <div className="space-y-4">
        {isEditing ? (
          <>
            <ServiciosSelector 
              serviciosSeleccionados={complejo.servicios}
              onServiciosChange={handleServiciosChange}
            />
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Horarios de Atención</h3>
              <textarea 
                name="horarios"
                value={complejo.horarios}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 border rounded-md text-sm"
                placeholder="Ej: Lunes a Viernes de 10:00 a 23:00..."
              />
            </div>
          </>
        ) : (
          <>
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Servicios</h3>
              <div className="grid grid-cols-2 gap-3">
                {(complejo.servicios || []).map(servicio => (
                  <ServicioItem key={servicio} servicio={servicio} />
                ))}
              </div>
            </div>
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Horarios de Atención</h3>
              <p className="text-gray-800 text-sm whitespace-pre-line">{complejo.horarios}</p>
            </div>
          </>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Últimos Alquileres</h3>
          <div className="space-y-3">
            {alquileres.map(alquiler => (
              <div key={alquiler.id} className="bg-secondary text-light p-3 rounded-lg flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold">{alquiler.cancha}</p>
                  <p className="text-accent text-xs">{alquiler.fecha}</p>
                </div>
                <p className="font-semibold">${alquiler.total.toLocaleString('es-AR')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplejoInfo;