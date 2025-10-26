import { API_BASE_URL } from '../config/api.js';

/**
 * Función para transformar los datos de canchas con mapeo de imágenes
 */
const transformCanchaData = (cancha) => {
  // Log para debug de imágenes
  console.log(`🖼️ [SEARCH.JS] Transformando cancha ${cancha.id}:`, {
    tieneImage: !!cancha.image,
    lengthImage: cancha.image?.length || 0,
    primerImagenSubstring: cancha.image?.[0]?.substring(0, 50) || 'sin imagen'
  });
  
  return {
    id: cancha.id,
    nroCancha: cancha.nroCancha,
    numero: cancha.nroCancha,
    deporte: cancha.deporte || { nombre: 'Sin deporte' },
    deporteId: cancha.deporteId,
    complejo: cancha.complejo,
    complejoId: cancha.complejoId,
    localidad: cancha.complejo?.domicilio?.localidad?.nombre || 'Sin localidad',
    descripcion: cancha.descripcion || '',
    puntaje: cancha.puntaje || 0,
    // Keep original image array for CanchaCard component compatibility
    image: cancha.image || [],
    imagenes: cancha.image || [],
    turnos: cancha.turnos || [],
    // Use the precalculated price from backend instead of calculating from turnos
    precioDesde: cancha.precioDesde || cancha.precioHora || 0,
  };
};

/**
 * Función para obtener todas las canchas
 */
export const getCanchas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/canchas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las canchas');
    }

    const data = await response.json();
    
    // Asegurar que data es un array
    const canchasArray = Array.isArray(data) ? data : (data.canchas || []);
    
    // Transformar datos con mapeo de imágenes
    const transformedData = canchasArray.map(cancha => transformCanchaData(cancha));
    
    return {
      ok: true,
      canchas: transformedData || []
    };
  } catch (error) {
    console.error('Error en getCanchas:', error);
    return {
      ok: false,
      error: 'Error de conexión'
    };
  }
};

/**
 * Función para obtener canchas con filtros (incluyendo fecha y hora)
 */
export const getCanchasConFiltros = async (filtros = {}) => {
  try {
    console.log('🔍 [FRONTEND] getCanchasConFiltros llamado con filtros:', filtros);
    
    // Construir query parameters
    const queryParams = new URLSearchParams();
    
    if (filtros.deporte) queryParams.append('deporte', filtros.deporte);
    if (filtros.localidad) queryParams.append('localidad', filtros.localidad);
    if (filtros.fecha) queryParams.append('fecha', filtros.fecha);
    if (filtros.hora) queryParams.append('hora', filtros.hora);
    
    const url = `${API_BASE_URL}/canchas?${queryParams.toString()}`;
    console.log('🔍 [FRONTEND] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 [FRONTEND] Response status:', response.status);

    if (!response.ok) {
      throw new Error('Error al obtener las canchas con filtros');
    }

    const data = await response.json();
    console.log('🔍 [FRONTEND] Data recibida:', data);
    console.log('🔍 [FRONTEND] Tipo de data:', typeof data, Array.isArray(data));
    
    // Asegurar que data es un array
    const canchasArray = Array.isArray(data) ? data : (data.canchas || []);
    console.log('🔍 [FRONTEND] canchasArray length:', canchasArray.length);
    
    // Transformar datos con mapeo de imágenes
    const transformedData = canchasArray.map(cancha => transformCanchaData(cancha));
    console.log('🔍 [FRONTEND] transformedData length:', transformedData.length);
    
    return {
      ok: true,
      canchas: transformedData || []
    };
  } catch (error) {
    console.error('❌ [FRONTEND] Error en getCanchasConFiltros:', error);
    return {
      ok: false,
      error: 'Error de conexión'
    };
  }
};

/**
 * Función para obtener todos los deportes
 */
export const getDeportes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/deportes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los deportes');
    }

    const data = await response.json();
    return {
      ok: true,
      deportes: data.deportes || []
    };
  } catch (error) {
    console.error('Error en getDeportes:', error);
    return {
      ok: false,
      error: 'Error de conexión'
    };
  }
};

/**
 * Función para obtener todas las localidades
 */
export const getLocalidades = async (reintentos = 2) => {
  try {
    const response = await fetch(`${API_BASE_URL}/localidades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Agregar timeout para evitar requests colgados
      signal: AbortSignal.timeout(10000) // 10 segundos
    });

    if (!response.ok) {
      console.error(`Error HTTP ${response.status}:`, response.statusText);
      throw new Error(`Error al obtener las localidades: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ok: true,
      localidades: data.localidades || []
    };
  } catch (error) {
    console.error('Error en getLocalidades:', error);
    
    // Reintentar si hay reintentos disponibles y no es un error de timeout
    if (reintentos > 0 && error.name !== 'TimeoutError') {
      console.log(`Reintentando... quedan ${reintentos} intentos`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      return getLocalidades(reintentos - 1);
    }
    
    return {
      ok: false,
      error: error.message || 'Error de conexión'
    };
  }
};

/**
 * Función para buscar canchas con filtros
 */
export const buscarCanchas = async (filtros = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filtros.localidad) queryParams.append('localidad', filtros.localidad);
    if (filtros.deporte) queryParams.append('deporte', filtros.deporte);
    if (filtros.fecha) queryParams.append('fecha', filtros.fecha);
    if (filtros.hora) queryParams.append('hora', filtros.hora);

    const url = `${API_BASE_URL}/canchas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al buscar las canchas');
    }

    const data = await response.json();
    
    // Transformar datos con mapeo de imágenes
    const transformedData = data.map(cancha => transformCanchaData(cancha));
    
    return {
      ok: true,
      canchas: transformedData || []
    };
  } catch (error) {
    console.error('Error en buscarCanchas:', error);
    return {
      ok: false,
      error: 'Error de conexión'
    };
  }
};
