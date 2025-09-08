// Configuración de la API
export const API_BASE_URL = 'http://localhost:3000';

// Función helper para construir URLs de imágenes
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  
  // Si la ruta ya incluye /images/, la usamos directamente
  if (imagePath.startsWith('/images/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Si no, asumimos que es una ruta relativa dentro de /images/
  return `${API_BASE_URL}/images/${imagePath}`;
};

// Función helper para construir URLs de API
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Función para generar placeholder de imagen
export const getPlaceholderImage = (text = 'Imagen') => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#e5e7eb"/>
      <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">
        ${text}
      </text>
    </svg>
  `)}`;
};
