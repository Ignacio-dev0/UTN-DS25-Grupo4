import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaUserShield } from 'react-icons/fa';
import ModalAdministrador from './ModalAdministrador';
import ModalConfirmacion from './ModalConfirmacion';
import LoadingSpinner from './LoadingSpinner';
import { API_BASE_URL } from '../config/api.js';

function GestionAdministradores() {
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalAdministradorOpen, setIsModalAdministradorOpen] = useState(false);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [administradorSeleccionado, setAdministradorSeleccionado] = useState(null);

  // Helper para obtener headers con JWT
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Cargar administradores desde el backend
  const cargarAdministradores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/administradores`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Administradores cargados:', data);
        setAdministradores(data.administradores || data || []);
      } else {
        console.error('Error al cargar administradores');
        alert('Error al cargar la lista de administradores');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al cargar administradores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAdministradores();
  }, [cargarAdministradores]);

  const handleOpenModalAdministrador = (administrador = null) => {
    setAdministradorSeleccionado(administrador);
    setIsModalAdministradorOpen(true);
  };

  const handleSaveAdministrador = async (data) => {
    try {
      const url = administradorSeleccionado
        ? `${API_BASE_URL}/administradores/${administradorSeleccionado.id}`
        : `${API_BASE_URL}/administradores`;

      const method = administradorSeleccionado ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert(administradorSeleccionado 
          ? 'Administrador actualizado correctamente' 
          : 'Administrador creado correctamente'
        );
        setIsModalAdministradorOpen(false);
        setAdministradorSeleccionado(null);
        cargarAdministradores();
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.message || 'Error al guardar administrador');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al guardar administrador');
    }
  };

  const handleDeleteAdministrador = (administrador) => {
    setAdministradorSeleccionado(administrador);
    setIsModalEliminarOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/administradores/${administradorSeleccionado.id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        alert('Administrador eliminado correctamente');
        setIsModalEliminarOpen(false);
        setAdministradorSeleccionado(null);
        cargarAdministradores();
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.message || 'Error al eliminar administrador');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al eliminar administrador');
    } finally {
      setIsModalEliminarOpen(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <FaUserShield /> Administradores
        </h2>
        <button
          onClick={() => handleOpenModalAdministrador()}
          className="bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Nuevo Administrador
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando administradores..." />
      ) : administradores.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaUserShield className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay administradores registrados</p>
          <p className="text-gray-400 text-sm mt-2">Haz clic en "Nuevo Administrador" para agregar uno</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {administradores.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-gray-700 font-medium">{admin.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {admin.rol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModalAdministrador(admin)}
                        className="text-primary hover:text-white hover:bg-primary p-2 rounded-full transition-colors shadow-md"
                        title="Editar administrador"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleDeleteAdministrador(admin)}
                        className="text-canchaRed hover:text-white hover:bg-canchaRed p-2 rounded-full transition-colors shadow-md"
                        title="Eliminar administrador"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar administrador */}
      {isModalAdministradorOpen && (
        <ModalAdministrador
          isOpen={isModalAdministradorOpen}
          administradorActual={administradorSeleccionado}
          onSave={handleSaveAdministrador}
          onClose={() => {
            setIsModalAdministradorOpen(false);
            setAdministradorSeleccionado(null);
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {isModalEliminarOpen && (
        <ModalConfirmacion
          isOpen={isModalEliminarOpen}
          title="Eliminar Administrador"
          message={`¿Estás seguro de que deseas eliminar al administrador "${administradorSeleccionado?.email}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmarEliminar}
          onClose={() => setIsModalEliminarOpen(false)}
          confirmText="Eliminar"
        />
      )}
    </div>
  );
}

export default GestionAdministradores;
