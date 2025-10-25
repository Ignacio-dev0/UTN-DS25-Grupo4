import React, { useState, useEffect } from 'react';
import { FaPlus, FaPencilAlt, FaTrash, FaEye, FaEyeSlash, FaUsers } from 'react-icons/fa';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ModalUsuario from './ModalUsuario';
import ModalConfirmacion from './ModalConfirmacion';
import LoadingSpinner from './LoadingSpinner';
import { API_BASE_URL } from '../config/api.js';

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalUsuarioOpen, setIsModalUsuarioOpen] = useState(false);
  const [isModalEliminarOpen, setIsModalEliminarOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [imagenesError, setImagenesError] = useState(new Set()); // Trackear imágenes que fallaron
  
  // Estados para filtros y búsqueda
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [busquedaEmail, setBusquedaEmail] = useState('');
  const [busquedaComplejo, setBusquedaComplejo] = useState('');
  const [busquedaDNI, setBusquedaDNI] = useState('');

  // Función para manejar errores de imagen
  const handleImageError = (usuario) => {
    console.log('Error cargando imagen para usuario:', usuario.id);
    setImagenesError(prev => new Set([...prev, usuario.id]));
  };

  // Helper para obtener headers con JWT
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
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
      const imageUrl = usuario.complejo.image;
      // Si es base64, devolverlo directamente
      if (imageUrl.startsWith('data:image')) {
        return imageUrl;
      }
      // Si es URL HTTP completa
      if (imageUrl.startsWith('http')) {
        return `${imageUrl}?t=${Date.now()}`;
      }
      // Corregir rutas mal formadas (ej: /apifutbol5_07.jpg -> /api/images/solicitudes/futbol5_07.jpg)
      if (imageUrl.startsWith('/api')) {
        const correctedUrl = imageUrl.replace(/^\/api/, '/api/images/solicitudes/');
        return `${API_BASE_URL}${correctedUrl}?t=${Date.now()}`;
      }
      // Si es ruta relativa
      return `${API_BASE_URL}${imageUrl}?t=${Date.now()}`;
    }
    
    // Para otros usuarios o dueños sin complejo, usar su imagen personal
    if (usuario.image) {
      const imageUrl = usuario.image;
      // Si es base64, devolverlo directamente
      if (imageUrl.startsWith('data:image')) {
        return imageUrl;
      }
      // Si es URL HTTP completa
      if (imageUrl.startsWith('http')) {
        return `${imageUrl}?t=${Date.now()}`;
      }
      // Si es ruta relativa
      return `${API_BASE_URL}${imageUrl}?t=${Date.now()}`;
    }
    
    return null;
  };

  // Cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Usuarios cargados:', data);
        // Filtrar usuarios con rol ADMINISTRADOR
        const usuariosFiltrados = (data.usuarios || data || []).filter(u => u.rol !== 'ADMINISTRADOR');
        setUsuarios(usuariosFiltrados);
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

  const handleSaveUsuario = async (usuarioGuardado) => {
    try {
      let response;
      
      if (usuarioGuardado.id) {
        // Actualizar usuario existente
        // Si tiene imagen, usar el endpoint con imagen, sino el normal
        if (usuarioGuardado.imagen) {
          response = await fetch(`${API_BASE_URL}/usuarios/${usuarioGuardado.id}/update-with-image`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(usuarioGuardado),
          });
        } else {
          response = await fetch(`${API_BASE_URL}/usuarios/${usuarioGuardado.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(usuarioGuardado),
          });
        }
      } else {
        // Crear nuevo usuario
        // Si tiene imagen, usar el endpoint con imagen, sino el normal
        if (usuarioGuardado.imagen) {
          response = await fetch(`${API_BASE_URL}/usuarios/register-with-image`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(usuarioGuardado),
          });
        } else {
          response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: getAuthHeaders(),
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
        
        alert(usuarioGuardado.id ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
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
        headers: getAuthHeaders()
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
    // Filtro por rol
    if (filtroRol !== 'todos' && usuario.rol !== filtroRol) return false;
    
    // Filtro por nombre (nombre + apellido)
    if (busquedaNombre) {
      const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
      if (!nombreCompleto.includes(busquedaNombre.toLowerCase())) return false;
    }
    
    // Filtro por email
    if (busquedaEmail) {
      if (!usuario.email.toLowerCase().includes(busquedaEmail.toLowerCase())) return false;
    }
    
    // Filtro por DNI
    if (busquedaDNI) {
      if (!usuario.dni.includes(busquedaDNI)) return false;
    }
    
    // Filtro por complejo: solo mostrar DUENIOS cuando se busca por complejo
    if (busquedaComplejo) {
      // Si busca complejo, solo mostrar dueños con complejo
      if (usuario.rol !== 'DUENIO') return false;
      if (!usuario.complejo) return false;
      if (!usuario.complejo.nombre.toLowerCase().includes(busquedaComplejo.toLowerCase())) return false;
    }
    
    return true;
  });

  const limpiarFiltros = () => {
    setBusquedaNombre('');
    setBusquedaEmail('');
    setBusquedaDNI('');
    setBusquedaComplejo('');
    setFiltroRol('todos');
  };

  const hayFiltrosActivos = busquedaNombre || busquedaEmail || busquedaDNI || busquedaComplejo || filtroRol !== 'todos';

  const getRolBadge = (rol) => {
    const roleStyles = {
      ADMINISTRADOR: 'bg-purple-100 text-purple-800',
      DUENIO: 'bg-blue-100 text-blue-800',
      CLIENTE: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[rol] || 'bg-gray-100 text-gray-800'}`}>
        {rol}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <div className="p-8">
      {/* Header con título, estadísticas y botón */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FaUsers /> Gestión de Usuarios
          </h2>
          <p className="text-gray-600 mt-1">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </p>
        </div>
        <button
          onClick={() => handleOpenModalUsuario()}
          className="bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Agregar Usuario
        </button>
      </div>

      {/* Sección de Búsqueda y Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</h3>
          </div>
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro por rol */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="todos">Todos los roles</option>
              <option value="DUENIO">Dueños</option>
              <option value="CLIENTE">Clientes</option>
            </select>
          </div>

          {/* Búsqueda por nombre */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar nombre
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre o apellido..."
                value={busquedaNombre}
                onChange={(e) => setBusquedaNombre(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaNombre && (
                <button
                  onClick={() => setBusquedaNombre('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda por email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar email
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Correo electrónico..."
                value={busquedaEmail}
                onChange={(e) => setBusquedaEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaEmail && (
                <button
                  onClick={() => setBusquedaEmail('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda por DNI */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar DNI
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Número de DNI..."
                value={busquedaDNI}
                onChange={(e) => setBusquedaDNI(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaDNI && (
                <button
                  onClick={() => setBusquedaDNI('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda por complejo */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar complejo
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre de complejo..."
                value={busquedaComplejo}
                onChange={(e) => setBusquedaComplejo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {busquedaComplejo && (
                <button
                  onClick={() => setBusquedaComplejo('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay usuarios que coincidan con los filtros</p>
            <p className="text-gray-400 text-sm mt-2">Intenta ajustar los criterios de búsqueda</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
              <tbody className="bg-white divide-y divide-gray-200">
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
                    <td className="py-3 px-4 text-gray-700">{usuario.email}</td>
                    <td className="py-3 px-4">{getRolBadge(usuario.rol)}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {usuario.rol === 'DUENIO' && usuario.complejo ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {usuario.complejo.nombre}
                            {usuario.complejo.estado !== 'APROBADO' && (
                              <span className="ml-2 text-xs text-gray-500 italic">
                                ({usuario.complejo.estado})
                              </span>
                            )}
                          </p>
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
                          className="text-primary hover:text-white hover:bg-primary p-2 rounded-full transition-colors shadow-md"
                          title="Editar usuario"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleDeleteUsuario(usuario)}
                          className="text-canchaRed hover:text-white hover:bg-canchaRed p-2 rounded-full transition-colors shadow-md"
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