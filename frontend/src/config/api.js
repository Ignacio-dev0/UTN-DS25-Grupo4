// Configuración de la API
export const API_BASE_URL = 'http://localhost:3000';

// Función helper para construir URLs de imágenes
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  
  // Si la ruta ya incluye /images/, la usamos directamente (sin API_BASE_URL para usar imágenes del frontend)
  if (imagePath.startsWith('/images/')) {
    return imagePath;
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
    'Fútbol 5': 'futbol5-1.jpg',
    'Fútbol 11': 'futbol11-1.jpg',
    'Básquet': 'basquet-1.jpg',
    'Básquetbol': 'basquet-1.jpg',
    'Tenis': 'tenis-1.jpg',
    'Pádel': 'padel-1.jpg',
    'Vóley': 'voley-1.jpg',
    'Handball': 'handball-1.jpg',
    'Hockey': 'hockey-1.jpg'
  };
  
  // Buscar imagen por nombre exacto o por palabras clave
  let imageName = deporteImageMap[deporteNombre];
  
  if (!imageName) {
    // Buscar por palabras clave
    const deporteLower = deporteNombre.toLowerCase();
    if (deporteLower.includes('futbol') || deporteLower.includes('fútbol')) {
      imageName = deporteLower.includes('11') ? 'futbol11-1.jpg' : 'futbol5-1.jpg';
    } else if (deporteLower.includes('basquet')) {
      imageName = 'basquet-1.jpg';
    } else if (deporteLower.includes('tenis')) {
      imageName = 'tenis-1.jpg';
    } else if (deporteLower.includes('padel')) {
      imageName = 'padel-1.jpg';
    } else if (deporteLower.includes('voley')) {
      imageName = 'voley-1.jpg';
    } else if (deporteLower.includes('handball')) {
      imageName = 'handball-1.jpg';
    } else if (deporteLower.includes('hockey')) {
      imageName = 'hockey-1.jpg';
    } else {
      imageName = 'futbol5-1.jpg'; // Imagen por defecto
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
  
  // Calcular número de imagen usando una combinación del ID y número de cancha
  // Esto asegura que canchas con el mismo deporte tengan imágenes diferentes
  const baseNumber = nroCancha || canchaId;
  const seedNumber = (canchaId * 7) + (baseNumber * 3); // Multiplicadores primos para mejor distribución
  const imageNumber = (seedNumber % 8) + 1; // Cicla entre 1-8
  
  return `/images/canchas/${deportePrefix}-${imageNumber}.jpg`;
};
