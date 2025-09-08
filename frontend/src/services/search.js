const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Función para normalizar rutas de imágenes (remover acentos)
 */
const normalizeImagePath = (path) => {
  return path
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n');
};

/**
 * Función para mapear imágenes a las que realmente existen (1-8 por deporte)
 */
const mapToExistingImage = (imagePath, deporteNombre) => {
  const normalizedPath = normalizeImagePath(imagePath);
  
  // Extraer el número de la imagen original
  const match = normalizedPath.match(/(\w+)-(\d+)\.jpg$/);
  if (!match) return normalizedPath;
  
  const [, deporte, numero] = match;
  const num = parseInt(numero);
  
  // Mapear a números 1-8 que realmente existen
  const mappedNum = ((num - 1) % 8) + 1;
  const newPath = normalizedPath.replace(/(\w+)-(\d+)\.jpg$/, `$1-${mappedNum}.jpg`);
  
  return newPath;
};

/**
 * Función para crear URL de imagen con fallback
 */
const createImageUrl = (imagePath, deporte) => {
  const mappedPath = mapToExistingImage(imagePath, deporte);
  const imageUrl = `http://localhost:3000${mappedPath}`;
  return imageUrl;
};

/**
 * Función para transformar los datos de canchas con mapeo de imágenes
 */
const transformCanchaData = (cancha) => {
  // Calcular precio mínimo desde los turnos reales
  const precios = cancha.turnos?.map(turno => turno.precio).filter(precio => precio > 0) || [];
  const precioMinimo = precios.length > 0 ? Math.min(...precios) : 15000;
  
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
    image: cancha.image ? cancha.image.map(img => createImageUrl(img, cancha.deporte?.nombre)) : [],
    imagenes: cancha.image ? cancha.image.map(img => createImageUrl(img, cancha.deporte?.nombre)) : [],
    turnos: cancha.turnos || [],
    precioDesde: precioMinimo,
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
    
    // Transformar datos con mapeo de imágenes
    const transformedData = data.map(cancha => transformCanchaData(cancha));
    
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
    const response = await fetch(`${API_BASE_URL}/localidades`, {
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
