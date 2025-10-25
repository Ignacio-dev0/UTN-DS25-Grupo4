import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import ModalLocalidad from './ModalLocalidad';
import ModalConfirmacion from './ModalConfirmacion';
import LoadingSpinner from './LoadingSpinner';

import { API_BASE_URL } from '../config/api.js';

function GestionLocalidades() {
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalLocalidadOpen, setIsModalLocalidadOpen] = useState(false);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState(null);

  // Helper para obtener headers con JWT
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Cargar localidades desde el backend
  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/localidades`);
        if (response.ok) {
          const data = await response.json();
          setLocalidades(data.localidades || data || []);
        } else {
          console.error('Error al cargar localidades');
        }
      } catch (error) {
        console.error('Error cargando localidades:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarLocalidades();
  }, []);

  const handleOpenModalLocalidad = (localidad = null) => {
    setLocalidadSeleccionada(localidad);
    setIsModalLocalidadOpen(true);
  };

  const handleCloseModalLocalidad = () => {
    setIsModalLocalidadOpen(false);
    setLocalidadSeleccionada(null);
  };

  const handleSaveLocalidad = async (localidadGuardada) => {
    try {
      let response;
      
      if (localidadGuardada.id) {
        // Actualizar localidad existente
        response = await fetch(`${API_BASE_URL}/localidades/${localidadGuardada.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            nombre: localidadGuardada.nombre
          }),
        });
      } else {
        // Crear nueva localidad
        response = await fetch(`${API_BASE_URL}/localidades`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            nombre: localidadGuardada.nombre
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        
        if (localidadGuardada.id) {
          // Actualizar localidad en la lista
          setLocalidades(prev => prev.map(l => 
            l.id === localidadGuardada.id 
              ? { ...l, nombre: localidadGuardada.nombre } 
              : l
          ));
          alert('Localidad actualizada exitosamente');
        } else {
          // Agregar nueva localidad a la lista
          const nuevaLocalidad = data.localidad || data;
          setLocalidades(prev => [...prev, nuevaLocalidad]);
          alert('Localidad creada exitosamente');
        }
        
        handleCloseModalLocalidad();
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.message || 'Error al guardar localidad');
      }
    } catch (error) {
      console.error('Error guardando localidad:', error);
      alert('Error al guardar localidad');
    }
  };

  const handleDeleteLocalidad = (localidad) => {
    console.log('handleDeleteLocalidad llamado con:', localidad);
    console.log('Estado actual isModalEliminarOpen:', isModalEliminarOpen);
    setLocalidadSeleccionada(localidad);
    setIsModalEliminarOpen(true);
    console.log('Modal de eliminación debería abrirse ahora');
    console.log('Nuevo estado debería ser: isModalEliminarOpen = true');
  };

  const handleConfirmarEliminar = async () => {
    if (!localidadSeleccionada) {
      alert('No hay localidad seleccionada');
      return;
    }

    try {
      console.log('Eliminando localidad:', localidadSeleccionada.id);
      const response = await fetch(`${API_BASE_URL}/localidades/${localidadSeleccionada.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Localidad eliminada:', result);
        
        // Actualizar lista local
        setLocalidades(prev => prev.filter(l => l.id !== localidadSeleccionada.id));
        setIsModalEliminarOpen(false);
        setLocalidadSeleccionada(null);
        alert('Localidad eliminada exitosamente');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(errorData.error || errorData.message || 'Error al eliminar localidad');
      }
    } catch (error) {
      console.error('Error eliminando localidad:', error);
      alert('Error de conexión al eliminar localidad');
    } finally {
      setIsModalEliminarOpen(false);
      setLocalidadSeleccionada(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaMapMarkerAlt /> Gestión de Localidades
        </h2>
        <LoadingSpinner message="Cargando localidades..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Título y botón separados */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <FaMapMarkerAlt /> Gestión de Localidades
        </h2>
        <button
          onClick={() => handleOpenModalLocalidad()}
          className="bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Agregar Localidad
        </button>
      </div>

      {/* Lista de localidades */}
      {localidades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay localidades registradas</p>
          <p className="text-gray-400 text-sm mt-2">Haz clic en "Agregar Localidad" para crear la primera</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localidades.map((localidad) => (
            <div
              key={localidad.id}
              className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {localidad.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {localidad.id}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModalLocalidad(localidad)}
                    className="text-primary hover:text-white hover:bg-primary p-2 rounded-full transition-colors shadow-md"
                    title="Editar localidad"
                    type="button"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Botón eliminar presionado para:', localidad.nombre);
                      handleDeleteLocalidad(localidad);
                    }}
                    className="text-canchaRed hover:text-white hover:bg-canchaRed p-2 rounded-full transition-colors shadow-md"
                    title="Eliminar localidad"
                    type="button"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar localidad */}
      {isModalLocalidadOpen && (
        <ModalLocalidad
          isOpen={isModalLocalidadOpen}
          localidadActual={localidadSeleccionada}
          onSave={handleSaveLocalidad}
          onClose={handleCloseModalLocalidad}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {isModalEliminarOpen && (
        <>
          {console.log('Renderizando ModalConfirmacion - isModalEliminarOpen:', isModalEliminarOpen, 'localidadSeleccionada:', localidadSeleccionada)}
          <ModalConfirmacion
            isOpen={isModalEliminarOpen}
            title="Eliminar Localidad"
            message={`¿Estás seguro de que deseas eliminar la localidad "${localidadSeleccionada?.nombre}"? Esta acción no se puede deshacer.`}
            onConfirm={handleConfirmarEliminar}
            onClose={() => setIsModalEliminarOpen(false)}
            confirmText="Eliminar"
            cancelText="Cancelar"
          />
        </>
      )}
    </div>
  );
}

export default GestionLocalidades;
