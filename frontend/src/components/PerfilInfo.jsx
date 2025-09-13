import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CheckIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/solid';
import { getLocalidades } from '../services/search.js';

// Función para calcular el nivel del usuario basado en turnos finalizados
const calcularNivelUsuario = (turnosFinalizados) => {
  if (turnosFinalizados >= 100) return "Leyenda del Deporte";
  if (turnosFinalizados >= 50) return "Maestro de las Canchas";
  if (turnosFinalizados >= 25) return "Veterano Experimentado";
  if (turnosFinalizados >= 15) return "Jugador Avanzado";
  if (turnosFinalizados >= 10) return "Deportista Dedicado";
  if (turnosFinalizados >= 5) return "Jugador Entusiasta";
  if (turnosFinalizados >= 1) return "Deportista Novato";
  return "Jugador Apasionado";
};

const EditableField = ({ isEditing, value, onChange, name, icon }) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        {icon}
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-2 py-1 bg-white border border-primary rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-secondary">
      {icon}
      <span>{value}</span>
    </div>
  );
};

const EditableLocalidadField = ({ isEditing, value, onChange, name, icon, localidades }) => {
  console.log('EditableLocalidadField render:', { isEditing, value, name, localidades: localidades?.length });
  
  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        {icon}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-2 py-1 bg-white border border-primary rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Seleccionar localidad...</option>
          {localidades.map((localidad) => (
            <option key={localidad.id} value={localidad.nombre}>
              {localidad.nombre}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-secondary">
      {icon}
      <span>{value || 'Sin localidad'}</span>
    </div>
  );
};

function PerfilInfo({ usuario, onSave, turnosFinalizados = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(usuario);
  const [localidades, setLocalidades] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditedData(usuario);
  }, [usuario]);

  // Cargar localidades cuando el componente se monta
  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        console.log('Cargando localidades...');
        const response = await getLocalidades();
        console.log('Respuesta localidades:', response);
        if (response.ok) {
          console.log('Localidades cargadas:', response.localidades);
          setLocalidades(response.localidades);
        } else {
          console.error('Error en respuesta de localidades:', response.error);
        }
      } catch (error) {
        console.error('Error al cargar localidades:', error);
      }
    };
    
    cargarLocalidades();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Guardando datos desde PerfilInfo:', editedData);
    onSave(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(usuario);
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar tamaño del archivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es muy grande. Por favor selecciona una imagen menor a 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Guardar la imagen real como base64
        setEditedData(prev => ({ 
          ...prev, 
          profileImageUrl: reader.result, // Mostrar la imagen seleccionada
          profileImageData: reader.result, // Usar la misma imagen para enviar al backend
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full md:w-1/3 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Mi Perfil</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="text-primary hover:text-green-400" title="Guardar Cambios">
                <CheckIcon className="w-6 h-6" />
              </button>
              <button onClick={handleCancel} className="text-primary hover:text-red-400" title="Cancelar Edición">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-secondary hover:text-primary" title="Editar Perfil">
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        {/* Imagen de Perfil Editable */}
        <div className="relative mb-4">
          <img
            src={editedData.profileImageUrl}
            alt="Foto de perfil"
            className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={handleImageClick}
          />
          {isEditing && (
            <div 
              onClick={handleImageClick}
              className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            >
              <CameraIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }}
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
        />

        {/* Nombre Editable */}
        {isEditing ? (
          <input
            type="text"
            name="nombre"
            value={editedData.nombre}
            onChange={handleChange}
            className="text-2xl font-bold text-primary font-lora text-center bg-white border border-primary rounded-md mb-2 w-full"
          />
        ) : (
          <h3 className="text-2xl font-bold text-primary font-lora">{usuario.nombre}</h3>
        )}

        <p className="text-md text-secondary mb-6">{calcularNivelUsuario(turnosFinalizados)}</p>
        
        <div className="space-y-4 self-start w-full">
          {/* Email (no editable) */}
          <div className="flex items-center gap-3 text-secondary">
            <EnvelopeIcon className="w-5 h-5" />
            <span>{usuario.email}</span>
          </div>
          
          <EditableField 
            isEditing={isEditing}
            value={editedData.telefono}
            onChange={handleChange}
            name="telefono"
            icon={<PhoneIcon className="w-5 h-5" />}
          />

          <EditableLocalidadField 
            isEditing={isEditing}
            value={editedData.direccion}
            onChange={handleChange}
            name="direccion"
            icon={<MapPinIcon className="w-5 h-5" />}
            localidades={localidades}
          />
        </div>
      </div>
    </div>
  );
}

export default PerfilInfo;