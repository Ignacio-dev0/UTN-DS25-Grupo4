import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import ModalUsuario from './ModalUsuario';
import ModalConfirmacion from './ModalConfirmacion';
import { API_BASE_URL } from '../config/api.js';

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalUsuarioOpen, setIsModalUsuarioOpen] = useState(false);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [imagenesError, setImagenesError] = useState(new Set()); // Trackear imágenes que fallaron

  // Función para manejar errores de imagen
  const handleImageError = (usuario) => {
    console.log('Error cargando imagen para usuario:', usuario.id);
    setImagenesError(prev => new Set([...prev, usuario.id]));
  };

  // Componente para mostrar la imagen o avatar del usuario
  const UsuarioAvatar = ({ usuario }) => {
    const imageUrl = getUsuarioImageUrl(usuario);
    const hasImageError = imagenesError.has(usuario.id);
    const initials = `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`.toUpperCase() || 'U';

    if (!imageUrl || hasImageError) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={`${usuario.nombre || 'Usuario'} ${usuario.apellido || ''}`}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
        onError={() => handleImageError(usuario)}
      />
    );
  };
  const getUsuarioImageUrl = (usuario) => {
    // Para usuarios dueños, intentar usar la imagen del complejo si existe
    if (usuario.rol === 'DUENIO' && usuario.complejo?.image) {
      return usuario.complejo.image.startsWith('http') 
        ? `${usuario.complejo.image}?t=${Date.now()}` 
        : `${API_BASE_URL}${usuario.complejo.image}?t=${Date.now()}`;
    }
    
    // Para otros usuarios o dueños sin complejo, usar su imagen personal
    if (usuario.image) {
      return usuario.image.startsWith('http') 
        ? `${usuario.image}?t=${Date.now()}` 
        : `${API_BASE_URL}${usuario.image}?t=${Date.now()}`;
    }
    
    return null;
  };

  // Cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/usuarios`);
      if (response.ok) {
        const data = await response.json();
        console.log('Usuarios cargados:', data);
        setUsuarios(data.usuarios || data || []);
      } else {
        console.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleOpenModalUsuario = (usuario = null) => {
    setUsuarioSeleccionado(usuario);
    setIsModalUsuarioOpen(true);
  };

  const handleCloseModalUsuario = () => {
    setIsModalUsuarioOpen(false);
    setUsuarioSeleccionado(null);
  };

  const handleSaveUsuario = async (usuarioGuardado, isFormData = false) => {
    try {
      let response;
      
      if (usuarioGuardado.id || (isFormData && usuarioGuardado.get('id'))) {
        // Actualizar usuario existente
        const userId = isFormData ? usuarioGuardado.get('id') : usuarioGuardado.id;
        
        if (isFormData) {
          // Para FormData (con imagen)
          response = await fetch(`${API_BASE_URL}/usuarios/${userId}/update-with-image`, {
            method: 'PUT',
            body: usuarioGuardado,
          });
        } else {
          // Para JSON (sin imagen)
          response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioGuardado),
          });
        }
      } else {
        // Crear nuevo usuario
        if (isFormData) {
          // Para FormData (con imagen)
          response = await fetch(`${API_BASE_URL}/usuarios/register-with-image`, {
            method: 'POST',
            body: usuarioGuardado,
          });
        } else {
          // Para JSON (sin imagen)
          response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioGuardado),
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        const newUser = data.usuario || data.user || data;
        
        console.log('Usuario guardado exitosamente:', newUser);
        
        // Cerrar modal inmediatamente
        handleCloseModalUsuario();
        
        // Recargar la lista completa para asegurar que se muestren todos los cambios
        await cargarUsuarios();
        
        alert((usuarioGuardado.id || (isFormData && usuarioGuardado.get('id'))) ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.message || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error al guardar usuario');
    }
  };

  const handleDeleteUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setIsModalEliminarOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!usuarioSeleccionado) return;

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioSeleccionado.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsuarios(prev => prev.filter(u => u.id !== usuarioSeleccionado.id));
        setIsModalEliminarOpen(false);
        setUsuarioSeleccionado(null);
        alert('Usuario eliminado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar usuario');
    } finally {
      setIsModalEliminarOpen(false);
      setUsuarioSeleccionado(null);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    if (filtroRol === 'todos') return true;
    return usuario.rol === filtroRol;
  });

  const getRolBadge = (rol) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800',
      owner: 'bg-blue-100 text-blue-800',
      player: 'bg-green-100 text-green-800'
    };
    
    const roleNames = {
      admin: 'Administrador',
      owner: 'Dueño',
      player: 'Jugador'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleStyles[rol] || 'bg-gray-100 text-gray-800'}`}>
        {roleNames[rol] || rol}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Gestión de Usuarios</h2>
            <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Filtro por rol */}
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos los roles</option>
              <option value="ADMINISTRADOR">Administradores</option>
              <option value="DUENIO">Dueños</option>
              <option value="CLIENTE">Clientes</option>
            </select>
            
            <button
              onClick={() => handleOpenModalUsuario()}
              className="bg-secondary hover:bg-accent text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Agregar Usuario
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
            <p className="text-gray-400 text-sm mt-2">Haz clic en "Agregar Usuario" para crear el primero</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Complejo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">DNI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teléfono</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UsuarioAvatar usuario={usuario} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {usuario.nombre || 'Sin nombre'} {usuario.apellido || 'Sin apellido'}
                          </p>
                          <p className="text-sm text-gray-500">ID: {usuario.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{usuario.correo}</td>
                    <td className="py-3 px-4">{getRolBadge(usuario.rol)}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {usuario.rol === 'DUENIO' && usuario.complejo ? (
                        <div>
                          <p className="font-medium text-gray-900">{usuario.complejo.nombre}</p>
                          <p className="text-sm text-gray-500">{usuario.complejo.direccion}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          {usuario.rol === 'DUENIO' ? 'Sin complejo asignado' : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{usuario.dni}</td>
                    <td className="py-3 px-4 text-gray-700">{usuario.telefono || 'No especificado'}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModalUsuario(usuario)}
                          className="text-primary hover:text-secondary transition-colors duration-200 p-2 rounded-md hover:bg-blue-100"
                          title="Editar usuario"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleDeleteUsuario(usuario)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-md hover:bg-red-100"
                          title="Eliminar usuario"
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
      </div>

      {/* Modal para agregar/editar usuario */}
      {isModalUsuarioOpen && (
        <ModalUsuario
          isOpen={isModalUsuarioOpen}
          usuarioActual={usuarioSeleccionado}
          onSave={handleSaveUsuario}
          onClose={handleCloseModalUsuario}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {isModalEliminarOpen && (
        <ModalConfirmacion
          isOpen={isModalEliminarOpen}
          title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar al usuario "${usuarioSeleccionado?.nombre} ${usuarioSeleccionado?.apellido}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmarEliminar}
          onClose={() => setIsModalEliminarOpen(false)}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}

export default GestionUsuarios;