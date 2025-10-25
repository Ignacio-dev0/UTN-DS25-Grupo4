// API Service - Conexión con el backend
import { API_BASE_URL } from '../config/api.js';

/**
 * Configuración base para las requests
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Obtener token del localStorage
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }), // Agregar token si existe
      ...(options.headers || {}), // Merge con headers personalizados
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en API request a ${endpoint}:`, error);
    throw error;
  }
};

/**
 * ==================
 * SERVICIOS DE CANCHAS
 * ==================
 */

export const canchasApi = {
  // Obtener todas las canchas
  getAll: () => apiRequest('/canchas'),
  
  // Obtener canchas por deporte
  getByDeporte: (deporteId) => apiRequest(`/canchas/deporte/${deporteId}`),
  
  // Obtener canchas por complejo
  getByComplejo: (complejoId) => apiRequest(`/canchas/complejo/${complejoId}`),
  
  // Obtener cancha específica
  getById: (canchaId) => apiRequest(`/canchas/${canchaId}`),
  
  // Crear nueva cancha (para owners)
  create: (canchaData) => apiRequest('/canchas', {
    method: 'POST',
    body: JSON.stringify(canchaData)
  }),
  
  // Actualizar cancha
  update: (canchaId, canchaData) => apiRequest(`/canchas/${canchaId}`, {
    method: 'PUT',
    body: JSON.stringify(canchaData)
  }),
  
  // Eliminar cancha
  delete: (canchaId) => apiRequest(`/canchas/${canchaId}`, {
    method: 'DELETE'
  })
};

/**
 * ==================
 * SERVICIOS DE DEPORTES
 * ==================
 */

export const deportesApi = {
  // Obtener todos los deportes
  getAll: () => apiRequest('/deportes'),
  
  // Obtener deporte específico
  getById: (deporteId) => apiRequest(`/deportes/${deporteId}`)
};

/**
 * ==================
 * SERVICIOS DE COMPLEJOS
 * ==================
 */

export const complejosApi = {
  // Obtener todos los complejos
  getAll: () => apiRequest('/complejos'),
  
  // Obtener complejo específico
  getById: (complejoId) => apiRequest(`/complejos/${complejoId}`),
  
  // Obtener complejos por usuario (para owners)
  getByUsuario: (usuarioId) => apiRequest(`/complejos/usuario/${usuarioId}`),
  
  // Crear nuevo complejo
  create: (complejoData) => apiRequest('/complejos', {
    method: 'POST',
    body: JSON.stringify(complejoData)
  }),
  
  // Actualizar complejo
  update: (complejoId, complejoData) => apiRequest(`/complejos/${complejoId}`, {
    method: 'PUT',
    body: JSON.stringify(complejoData)
  })
};

/**
 * ==================
 * SERVICIOS DE TURNOS
 * ==================
 */

export const turnosApi = {
  // Obtener turnos por cancha y fecha
  getByCanchaYFecha: (canchaId, fecha) => 
    apiRequest(`/turnos/cancha/${canchaId}/fecha/${fecha}`),
  
  // Obtener turnos disponibles
  getDisponibles: (canchaId, fecha) => 
    apiRequest(`/turnos/cancha/${canchaId}/fecha/${fecha}/disponibles`),
  
  // Reservar turno
  reservar: (turnoId, clienteId) => apiRequest(`/turnos/${turnoId}/reservar`, {
    method: 'POST',
    body: JSON.stringify({ clienteId })
  })
};

/**
 * ==================
 * SERVICIOS DE USUARIOS
 * ==================
 */

export const usuariosApi = {
  // Obtener todos los usuarios
  getAll: () => apiRequest('/usuarios'),
  
  // Obtener usuario por ID
  getById: (usuarioId) => apiRequest(`/usuarios/${usuarioId}`),
  
  // Obtener usuario por email
  getByEmail: (email) => apiRequest(`/usuarios/email/${email}`),
  
  // Crear nuevo usuario (registro)
  create: (userData) => apiRequest('/usuarios', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // Actualizar usuario
  update: (usuarioId, userData) => apiRequest(`/usuarios/${usuarioId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  // Eliminar usuario
  delete: (usuarioId) => apiRequest(`/usuarios/${usuarioId}`, {
    method: 'DELETE'
  })
};

/**
 * ==================
 * SERVICIOS DE RESEÑAS
 * ==================
 */

export const resenasApi = {
  // Obtener reseñas por complejo
  getByComplejo: (complejoId) => apiRequest(`/resenas/complejo/${complejoId}`),
  
  // Obtener reseñas por cancha
  getByCancha: (canchaId) => apiRequest(`/resenas/cancha/${canchaId}`),
  
  // Crear nueva reseña
  create: (resenaData) => apiRequest('/resenas', {
    method: 'POST',
    body: JSON.stringify(resenaData)
  }),
  
  // Actualizar reseña
  update: (resenaId, resenaData) => apiRequest(`/resenas/${resenaId}`, {
    method: 'PUT',
    body: JSON.stringify(resenaData)
  })
};

/**
 * ==================
 * SERVICIOS DE LOCALIDADES
 * ==================
 */

export const localidadesApi = {
  // Obtener todas las localidades
  getAll: () => apiRequest('/loc')
};

/**
 * ==================
 * FUNCIONES DE UTILIDAD
 * ==================
 */

// Transformar datos del backend al formato esperado por el frontend
export const transformCanchaData = (canchaBackend) => {
  return {
    id: canchaBackend.id,
    numero: canchaBackend.nroCancha,
    deporte: canchaBackend.deporte?.nombre || 'Sin deporte',
    deporteId: canchaBackend.deporteId,
    complejo: canchaBackend.complejo?.nombre || 'Sin complejo',
    complejoId: canchaBackend.complejoId,
    localidad: canchaBackend.complejo?.domicilio?.localidad?.nombre || 'Sin localidad',
    descripcion: canchaBackend.descripcion || '',
    puntaje: canchaBackend.puntaje || 0,
    imagenes: canchaBackend.image ? canchaBackend.image.map(img => `${API_BASE_URL.replace("/api", "")}${img}`) : [],
    turnos: canchaBackend.turnos || [], // Incluir turnos disponibles
    // Agregar campos adicionales que el frontend pueda necesitar
    precioDesde: 8000, // Precio base por defecto, después se puede obtener de turnos
  };
};

// Transformar datos de complejo del backend al formato del frontend
export const transformComplejoData = (complejoBackend) => {
  return {
    id: complejoBackend.id,
    nombre: complejoBackend.nombre,
    descripcion: complejoBackend.descripcion || '',
    puntaje: complejoBackend.puntaje || 0,
    imagen: complejoBackend.image || '',
    // Agregar información de domicilio si está disponible
    direccion: complejoBackend.domicilio ? 
      `${complejoBackend.domicilio.calle} ${complejoBackend.domicilio.altura}` : '',
    localidad: complejoBackend.domicilio?.localidad?.nombre || '',
    usuarioId: complejoBackend.usuarioId,
  };
};

// Eliminar export default para evitar conflictos de módulos
export default {
  canchasApi,
  deportesApi,
  complejosApi,
  turnosApi,
  usuariosApi,
  resenasApi,
  localidadesApi,
  transformCanchaData,
  transformComplejoData
};
