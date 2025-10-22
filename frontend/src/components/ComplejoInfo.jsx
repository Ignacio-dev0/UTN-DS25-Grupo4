import React, { useRef, useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, CameraIcon } from '@heroicons/react/24/solid';
import { FaWifi } from "react-icons/fa";
import { FaChalkboardUser } from "react-icons/fa6";
import { MdRestaurant, MdFamilyRestroom } from "react-icons/md";
import { GiTrophy, GiPartyPopper } from "react-icons/gi";
import { PiTShirtFill, PiCarFill } from "react-icons/pi";
import ServiciosSelector from './ServiciosSelector';
import { API_BASE_URL } from '../config/api.js';

const ServicioItem = ({ servicioData, todosLosServicios }) => {
  // Handle both formats: direct service object or service ID
  let servicio;
  
  if (typeof servicioData === 'object' && servicioData.servicio) {
    // New format: servicioData has a 'servicio' property with the actual service
    servicio = servicioData.servicio;
  } else if (typeof servicioData === 'number') {
    // Old format: servicioData is just an ID
    servicio = todosLosServicios.find(s => s.id === servicioData);
  } else {
    // Direct service object
    servicio = servicioData;
  }
  
  if (!servicio) return null;
  
  return (
    <div className="flex items-center text-primary">
      <span className="mr-2 text-2xl">{servicio.icono}</span>
      <span className='font-medium'>{servicio.nombre}</span>
    </div>
  );
};

function ComplejoInfo({ complejo, alquileres = [], isEditing, onToggleEdit, onComplejoChange }) {
  const fileInputRef = useRef(null);
  const [todosLosServicios, setTodosLosServicios] = useState([]);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/servicios`);
        if (response.ok) {
          const data = await response.json();
          setTodosLosServicios(data.servicios);
        }
      } catch (error) {
        console.error('Error cargando servicios:', error);
      }
    };

    cargarServicios();
  }, []);

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
      // Validar tamaño del archivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 5MB.');
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Comprimir la imagen
        compressImage(reader.result, (compressedImage) => {
          onComplejoChange({ ...complejo, image: compressedImage });
        });
      };
      reader.onerror = () => {
        alert('Error al leer el archivo. Por favor intenta con otra imagen.');
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (base64Str, callback) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Reducir aún más el tamaño máximo
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      // Calcular nuevas dimensiones manteniendo la proporción
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Mejorar la calidad del redimensionamiento
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Comprimir más agresivamente a JPEG con 70% de calidad
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      
      // Verificar el tamaño final
      const sizeInKB = (compressedBase64.length * 0.75) / 1024;
      console.log(`📸 Imagen comprimida: ${sizeInKB.toFixed(2)} KB`);
      
      if (sizeInKB > 500) {
        console.warn('⚠️ La imagen sigue siendo grande. Considere usar una imagen más pequeña.');
      }
      
      callback(compressedBase64);
    };
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
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-800 mr-3">{complejo.nombre}</h2>
            <span className="text-yellow-500 text-lg">
              {'★'.repeat(Math.floor(complejo.puntaje || 0))}{'☆'.repeat(5 - Math.floor(complejo.puntaje || 0))}
            </span>
            <span className="text-sm text-gray-600 ml-2">({(complejo.puntaje || 0).toFixed(1)})</span>
          </div>
        )}
        <button onClick={onToggleEdit} className="text-secondary hover:text-green-400 ml-4" title={isEditing ? "Finalizar Edición" : "Editar Complejo"}>
          {isEditing ? <CheckIcon className="w-6 h-6" /> : <PencilIcon className="w-5 h-5 text-secondary hover:text-primary" />}
        </button>
      </div>

      {/* Campo de descripción - movido después de horarios */}
      
      <div className="bg-accent p-4 rounded-lg mb-4">
        <p className="text-xs text-primary">Cuenta en pesos</p>
        <p className="text-3xl font-bold text-primary">${(complejo.balance || 0).toLocaleString('es-AR')}</p>
      </div>

      <div className="relative bg-accent h-64 rounded-lg flex items-center justify-center mb-6">
        <img 
          src={
            complejo.image && complejo.image.startsWith('data:image')
              ? complejo.image  // Solo usar si es base64 válido
              : "/canchaYa.png" // Usar placeholder para todo lo demás
          } 
          alt={`Imagen de ${complejo.nombre}`} 
          className={`w-full h-full object-cover rounded-lg ${isEditing ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
          loading="lazy"
          onError={(e) => {
            // Silenciosamente usar placeholder si falla
            e.target.onerror = null; // Prevenir loop infinito
            e.target.src = "/canchaYa.png";
          }}
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
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Descripción</h3>
              <textarea
                name="descripcion"
                value={complejo.descripcion || ''}
                onChange={handleInputChange}
                placeholder="Descripción del complejo..."
                rows="3"
                className="w-full p-2 border rounded-md text-sm resize-none"
              />
            </div>
          </>
        ) : (
          <>
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Servicios</h3>
              <div className="grid grid-cols-2 gap-3">
                {(complejo.servicios || []).map((servicioData, index) => (
                  <ServicioItem 
                    key={servicioData.id || servicioData.servicioId || index} 
                    servicioData={servicioData} 
                    todosLosServicios={todosLosServicios} 
                  />
                ))}
              </div>
            </div>
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Horarios de Atención</h3>
              <p className="text-gray-800 text-sm whitespace-pre-line">{complejo.horarios}</p>
            </div>
            {complejo.descripcion && (
              <div className="bg-accent p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-800 text-sm whitespace-pre-line">{complejo.descripcion}</p>
              </div>
            )}
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