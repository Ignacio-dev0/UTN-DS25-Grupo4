const API_BASE_URL = 'http://localhost:3000/api';

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
    return {
      ok: true,
      canchas: data || []
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
export const getLocalidades = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/loc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las localidades');
    }

    const data = await response.json();
    return {
      ok: true,
      localidades: data.localidades || []
    };
  } catch (error) {
    console.error('Error en getLocalidades:', error);
    return {
      ok: false,
      error: 'Error de conexión'
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
    return {
      ok: true,
      canchas: data || []
    };
  } catch (error) {
    console.error('Error en buscarCanchas:', error);
    return {
      ok: false,
      error: 'Error de conexión'
    };
  }
};
