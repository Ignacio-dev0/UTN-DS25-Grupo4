import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import MiniCanchaCard from './MiniCanchaCard.jsx';
import FormularioNuevaCancha from './FormularioNuevaCancha.jsx';
import ModalConfirmacion from './ModalConfirmacion.jsx'; 
import { FaTrash, FaEyeSlash, FaEye, FaPencilAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';

function ListaCanchasComplejo({ canchas, onDisable, onDelete, onRecargarCanchas, isEditing }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [accion, setAccion] = useState(''); 
  const [deportes, setDeportes] = useState([]);
  
  // Cargar deportes para mapear IDs correctamente
  useEffect(() => {
    const cargarDeportes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/deportes`);
        if (response.ok) {
          const data = await response.json();
          setDeportes(data.deportes || data || []);
        }
      } catch (error) {
        console.error('Error al cargar deportes:', error);
      }
    };

    cargarDeportes();
  }, []);
  
  // Mostrar todas las canchas (sin limitación de paginación)
  const canchasPaginadas = canchas;

  // Función helper para convertir archivo a base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleGuardarCancha = async (nuevaCancha) => {
    try {
      // Obtener complejoId desde la URL o props
      const complejoId = window.location.pathname.split('/')[2]; // Asumiendo /micomplejo/:id
      
      // Procesar imágenes - convertir archivos a base64
      let imagenesBase64 = [];
      if (nuevaCancha.imagenes && Array.isArray(nuevaCancha.imagenes) && nuevaCancha.imagenes.length > 0) {
        for (let i = 0; i < nuevaCancha.imagenes.length; i++) {
          const file = nuevaCancha.imagenes[i];
          if (file && file instanceof File) {
            try {
              const base64 = await convertFileToBase64(file);
              imagenesBase64.push(base64);
            } catch (error) {
              console.error('Error al convertir imagen a base64:', error);
            }
          }
        }
      }
      
      const canchaData = {
        // nroCancha se genera automáticamente en el backend, no lo enviamos
        nombre: nuevaCancha?.nombre || 'Nueva Cancha', // Nombre de la cancha
        descripcion: nuevaCancha?.descripcion || '', // Descripción opcional
        deporteId: Number(getDeporteIdByName(nuevaCancha?.deporte || 'Fútbol 5')), // Asegurar que sea número
        complejoId: Number(parseInt(complejoId) || 34), // Asegurar que sea número (34 = Megadeportivo La Plata)
        image: imagenesBase64.length > 0 ? imagenesBase64 : [] // Array de strings, puede estar vacío
      };

      // Validar datos antes de enviar
      if (!canchaData.deporteId || !canchaData.complejoId) {
        throw new Error('Faltan datos requeridos para crear la cancha');
      }

      // Validar que los IDs sean números válidos
      if (isNaN(canchaData.deporteId) || isNaN(canchaData.complejoId)) {
        throw new Error('Los IDs deben ser números válidos');
      }

      console.log('Enviando datos de cancha:', canchaData);

      const response = await fetch(`${API_BASE_URL}/canchas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(canchaData),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Cancha creada exitosamente:', result);
        alert('Cancha agregada exitosamente');
        setShowAddForm(false);
        
        // Recargar solo las canchas en lugar de toda la página
        if (onRecargarCanchas) {
          onRecargarCanchas();
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Error al parsear respuesta del servidor:', jsonError);
          errorData = { message: `Error del servidor (${response.status}): ${response.statusText}` };
        }
        console.error('Error del backend:', errorData);
        throw new Error(errorData.message || 'Error al crear la cancha');
      }
    } catch (error) {
      console.error('Error creando cancha:', error);
      
      // Mejor manejo de errores específicos
      let mensajeError = 'Error al crear la cancha';
      
      if (error.message) {
        if (error.message.includes('unique constraint')) {
          mensajeError = 'Ya existe una cancha con ese número. Por favor, intenta con otro nombre.';
        } else if (error.message.includes('foreign key constraint')) {
          mensajeError = 'Error de datos: Complejo o deporte no válido.';
        } else {
          mensajeError += ': ' + error.message;
        }
      }
      
      alert(mensajeError);
    }
  };

  // Función helper para obtener el ID del deporte por nombre
  const getDeporteIdByName = (nombreDeporte) => {
    if (deportes.length > 0) {
      const deporte = deportes.find(d => d.nombre === nombreDeporte);
      if (deporte) {
        return deporte.id;
      }
      
      // Si no encuentra el deporte específico, devolver el primer deporte disponible
      console.warn(`Deporte "${nombreDeporte}" no encontrado, usando primer deporte disponible`);
      return deportes[0]?.id || 60; // 60 es Fútbol 5 por defecto
    }
    
    // Si no hay deportes cargados, devolver un ID por defecto
    console.error('No hay deportes cargados, usando Fútbol 5 por defecto');
    return 60; // Fútbol 5 por defecto
  };
  

  const handleActionClick = (cancha, tipoAccion) => {
    setCanchaSeleccionada(cancha);
    setAccion(tipoAccion);
    setIsModalOpen(true);
  };


  const handleConfirmAction = () => {
    if (!canchaSeleccionada) return;

    if (accion === 'eliminar') {
      onDelete(canchaSeleccionada.id);
    } else if (accion === 'deshabilitar') {
      onDisable(canchaSeleccionada.id);
    }

    setIsModalOpen(false);
    setCanchaSeleccionada(null);
    setAccion('');
  };


  let modalTitle = '';
  let modalMessage = '';
  let confirmText = '';

  if (canchaSeleccionada) {
    if (accion === 'eliminar') {
      modalTitle = 'Confirmar Eliminación';
      modalMessage = `¿Estás seguro de que deseas eliminar la cancha "${canchaSeleccionada.deporte} - N°${canchaSeleccionada.noCancha}"? Esta acción no se puede deshacer.`;
      confirmText = 'Sí, Eliminar';
    } else {
      const esHabilitada = canchaSeleccionada.estado === 'habilitada';
      modalTitle = esHabilitada ? 'Confirmar Deshabilitación' : 'Confirmar Habilitación';
      modalMessage = `¿Estás seguro de que deseas ${esHabilitada ? 'deshabilitar' : 'habilitar'} la cancha "${canchaSeleccionada.deporte} - N°${canchaSeleccionada.noCancha}"?`;
      confirmText = esHabilitada ? 'Sí, Deshabilitar' : 'Sí, Habilitar';
    }
  }

  return (
    <div className="w-full md:w-2/3 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mis Canchas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {canchasPaginadas.map(cancha => (
          <div key={cancha.id} className="relative group">
            <MiniCanchaCard 
              cancha={cancha}
            />
            {isEditing && (
              <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => handleActionClick(cancha, 'deshabilitar')} 
                  className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600" 
                  title={cancha.estado === 'deshabilitada' ? 'Habilitar' : 'Deshabilitar'}
                >
                  {cancha.estado === 'deshabilitada' ? <FaEye /> : <FaEyeSlash />}
                </button>
                <button 
                  onClick={() => handleActionClick(cancha, 'eliminar')} 
                  className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600" 
                  title="Eliminar Cancha"
                >
                  <FaTrash />
                </button>
                <Link to={`/micomplejo/cancha/${cancha.id}/editar`}>
                  <button 
                    className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600" 
                    title="Editar Cancha"
                    onClick={async (e) => {
                      // Validar que la cancha existe antes de navegar
                      try {
                        const response = await fetch(`${API_BASE_URL}/canchas/${cancha.id}`);
                        if (!response.ok) {
                          e.preventDefault();
                          alert('La cancha no se encuentra disponible. Recargando la lista...');
                          onRecargarCanchas();
                          return;
                        }
                      } catch (error) {
                        e.preventDefault();
                        console.error('Error validando cancha:', error);
                        alert('Error al acceder a la cancha. Recargando la lista...');
                        onRecargarCanchas();
                      }
                    }}
                  >
                    <FaPencilAlt />
                  </button>
                </Link>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowAddForm(true)}
          className="border-2 border-dashed border-accent rounded-lg flex flex-col items-center justify-center text-accent hover:bg-accent hover:border-primary hover:text-primary transition-all duration-300 min-h-[220px] aspect-w-1 aspect-h-1"
        >
          <PlusIcon className="w-12 h-12" />
          <span className="mt-2 font-semibold">Agregar Cancha</span>
        </button>
      </div>

      {showAddForm && (
        <FormularioNuevaCancha
          onCerrar={() => setShowAddForm(false)}
          onGuardar={handleGuardarCancha}
        />
      )}

      {isModalOpen && (
        <ModalConfirmacion
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={modalTitle}
          message={modalMessage}
          confirmText={confirmText}
        />
      )}
    </div>
  );
}

export default ListaCanchasComplejo;