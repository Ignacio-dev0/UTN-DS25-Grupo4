import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import ModalDeporte from './ModalDeporte';
import ModalConfirmacion from './ModalConfirmacion';

function GestionDeportes() {
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalDeporteOpen, setIsModalDeporteOpen] = useState(false);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [deporteSeleccionado, setDeporteSeleccionado] = useState(null);

  // Cargar deportes desde el backend
  useEffect(() => {
    const cargarDeportes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/deportes`);
        if (response.ok) {
          const data = await response.json();
          setDeportes(data.deportes || data || []);
        } else {
          console.error('Error al cargar deportes');
        }
      } catch (error) {
        console.error('Error cargando deportes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDeportes();
  }, []);

  const handleOpenModalDeporte = (deporte = null) => {
    setDeporteSeleccionado(deporte);
    setIsModalDeporteOpen(true);
  };

  const handleCloseModalDeporte = () => {
    setIsModalDeporteOpen(false);
    setDeporteSeleccionado(null);
  };

  const handleSaveDeporte = async (deporteGuardado) => {
    try {
      let response;
      
      if (deporteGuardado.id) {
        // Actualizar deporte existente
        response = await fetch(`${API_BASE_URL}/deportes/${deporteGuardado.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: deporteGuardado.nombre,
            icono: deporteGuardado.icono 
          }),
        });
      } else {
        // Crear nuevo deporte
        response = await fetch(`${API_BASE_URL}/deportes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: deporteGuardado.nombre,
            icono: deporteGuardado.icono 
          }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        const deporteActualizado = result.deporte || result;

        if (deporteGuardado.id) {
          // Actualizar en la lista
          setDeportes(deportes.map(d => 
            d.id === deporteGuardado.id ? deporteActualizado : d
          ));
        } else {
          // Agregar a la lista
          setDeportes([...deportes, deporteActualizado]);
        }
        
        handleCloseModalDeporte();
        alert('Deporte guardado exitosamente');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el deporte');
      }
    } catch (error) {
      console.error('Error guardando deporte:', error);
      alert('Error al guardar el deporte: ' + error.message);
    }
  };

  const handleOpenModalEliminar = (deporte) => {
    setDeporteSeleccionado(deporte);
    setIsModalEliminarOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!deporteSeleccionado) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/deportes/${deporteSeleccionado.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeportes(deportes.filter(d => d.id !== deporteSeleccionado.id));
        alert('Deporte eliminado exitosamente');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el deporte');
      }
    } catch (error) {
      console.error('Error eliminando deporte:', error);
      alert('Error al eliminar el deporte: ' + error.message);
    } finally {
      setIsModalEliminarOpen(false);
      setDeporteSeleccionado(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-secondary mb-6">Gestión de Deportes</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando deportes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-secondary mb-6">Gestión de Deportes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <button 
              onClick={() => handleOpenModalDeporte()}
              className="group aspect-square border-2 border-dashed rounded-full flex flex-col items-center justify-center text-accent hover:bg-accent hover:text-primary transition-colors duration-300"
          >
              <FaPlus className="h-12 w-12" />
              <span className="mt-2 font-semibold">Agregar Deporte</span>
          </button>
          
          {deportes.map(deporte => (
              <div key={deporte.id} className="group relative aspect-square bg-white shadow-lg rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  <div className="text-primary text-4xl">{deporte.icono || '⚽'}</div>
                  <span className="mt-2 text-xl font-bold text-gray-800 transition-transform duration-300 group-hover:scale-110">{deporte.nombre}</span>
                  
                  <div className="absolute inset-0 bg-primary bg-opacity-70 rounded-full flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => handleOpenModalDeporte(deporte)} className="text-white p-3 rounded-full hover:bg-yellow-500 transition-colors" title="Editar">
                          <FaPencilAlt size={22} />
                      </button>
                      <button onClick={() => handleOpenModalEliminar(deporte)} className="text-white p-3 rounded-full hover:bg-red-600 transition-colors" title="Eliminar">
                          <FaTrash size={22} />
                      </button>
                  </div>
              </div>
          ))}
      </div>
      
      <ModalDeporte 
        isOpen={isModalDeporteOpen}
        onClose={handleCloseModalDeporte}
        onSave={handleSaveDeporte}
        deporteActual={deporteSeleccionado}
      />

      {isModalEliminarOpen && (
        <ModalConfirmacion
          isOpen={isModalEliminarOpen}
          onClose={() => setIsModalEliminarOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el deporte "${deporteSeleccionado?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Sí, Eliminar"
        />
      )}
    </div>
  );
}

export default GestionDeportes;