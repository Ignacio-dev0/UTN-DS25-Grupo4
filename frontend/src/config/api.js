// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://utn-ds25-grupo4.onrender.com/api';

// Debug temporal - mostrar qué URL se está usando
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 VITE_API_URL from env:', import.meta.env.VITE_API_URL);

// Función helper para construir URLs de imágenes
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  
  // Si la ruta ya incluye /images/, la usamos directamente (sin API_BASE_URL para usar imágenes del frontend)
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // Si viene de la base de datos, las imágenes están en /images/canchas/
  if (imagePath.includes('.jpg') || imagePath.includes('.png') || imagePath.includes('.jpeg')) {
    // Manejar nombres de archivo con leading zeros que necesitan ser convertidos
    // Por ejemplo: futbol5_03.jpg -> futbol5_3.jpg
    let normalizedPath = imagePath;
    
    // Convertir números con leading zero a números sin leading zero
    normalizedPath = normalizedPath.replace(/(_)0(\d+)(\.[a-z]+)$/i, '$1$2$3');
    
    return `/images/canchas/${normalizedPath}`;
  }
  
  // Si no, asumimos que es una ruta relativa dentro de /images/
  return `/images/${imagePath}`;
};

// Función helper para construir URLs de API
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Función para generar placeholder de imagen
export const getPlaceholderImage = (deporteNombre = 'Cancha') => {
  // Mapear nombres de deportes a archivos de imagen disponibles
  const deporteImageMap = {
    'Fútbol 5': 'futbol5_1.jpg',
    'Fútbol 11': 'futbol11_1.jpg',
    'Básquet': 'basquet_1.jpg',
    'Básquetbol': 'basquet_1.jpg',
    'Tenis': 'tenis_1.jpg',
    'Pádel': 'padel_1.jpg',
    'Vóley': 'voley_1.jpg',
    'Handball': 'handball_1.jpg',
    'Hockey': 'hockey_1.jpg'
  };
  
  // Buscar imagen por nombre exacto o por palabras clave
  let imageName = deporteImageMap[deporteNombre];
  
  if (!imageName) {
    // Buscar por palabras clave
    const deporteLower = deporteNombre.toLowerCase();
    if (deporteLower.includes('futbol') || deporteLower.includes('fútbol')) {
      imageName = deporteLower.includes('11') ? 'futbol11_1.jpg' : 'futbol5_1.jpg';
    } else if (deporteLower.includes('basquet')) {
      imageName = 'basquet_1.jpg';
    } else if (deporteLower.includes('tenis')) {
      imageName = 'tenis_1.jpg';
    } else if (deporteLower.includes('padel')) {
      imageName = 'padel_1.jpg';
    } else if (deporteLower.includes('voley')) {
      imageName = 'voley_1.jpg';
    } else if (deporteLower.includes('handball')) {
      imageName = 'handball_1.jpg';
    } else if (deporteLower.includes('hockey')) {
      imageName = 'hockey_1.jpg';
    } else {
      imageName = 'futbol5_1.jpg'; // Imagen por defecto
    }
  }
  
  return `/images/canchas/${imageName}`;
};

// Función para obtener imagen específica de cancha basada en su ID y deporte
export const getCanchaImage = (canchaId, deporteNombre, nroCancha = null) => {
  // Mapear nombres de deportes a prefijos de archivos
  const deporteFileMap = {
    'Fútbol 5': 'futbol5',
    'Fútbol 11': 'futbol11',
    'Básquet': 'basquet',
    'Básquetbol': 'basquet',
    'Tenis': 'tenis',
    'Pádel': 'padel',
    'Vóley': 'voley',
    'Handball': 'handball',
    'Hockey': 'hockey'
  };
  
  let deportePrefix = deporteFileMap[deporteNombre];
  
  if (!deportePrefix) {
    // Buscar por palabras clave
    const deporteLower = deporteNombre.toLowerCase();
    if (deporteLower.includes('futbol') || deporteLower.includes('fútbol')) {
      deportePrefix = deporteLower.includes('11') ? 'futbol11' : 'futbol5';
    } else if (deporteLower.includes('basquet')) {
      deportePrefix = 'basquet';
    } else if (deporteLower.includes('tenis')) {
      deportePrefix = 'tenis';
    } else if (deporteLower.includes('padel')) {
      deportePrefix = 'padel';
    } else if (deporteLower.includes('voley')) {
      deportePrefix = 'voley';
    } else if (deporteLower.includes('handball')) {
      deportePrefix = 'handball';
    } else if (deporteLower.includes('hockey')) {
      deportePrefix = 'hockey';
    } else {
      deportePrefix = 'futbol5'; // Por defecto
    }
  }
  
  // Usar una combinación de ID de cancha y número de cancha para mayor variación
  // Si no hay nroCancha, usar solo el ID
  const uniqueNumber = nroCancha ? (canchaId * 13 + nroCancha * 7) : (canchaId * 17);
  const imageNumber = (uniqueNumber % 8) + 1; // Cicla entre 1-8
  
  return `/images/canchas/${deportePrefix}_${imageNumber}.jpg`;
};
