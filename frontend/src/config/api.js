// Configuración de la API

// 1. Usamos la variable de entorno VITE_API_URL que definimos en Render.
// 2. Como fallback (si VITE_API_URL no existe), ponemos la URL de tu backend de Render.
const RENDER_BACKEND_URL = 'https://utn-ds25-grupo4-6dc8.onrender.com/api';
export const API_BASE_URL = import.meta.env.VITE_API_URL || RENDER_BACKEND_URL;

// Debug log para saber qué URL se está usando
console.log('🚀 Configuración del Frontend:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL_EN_USO: API_BASE_URL,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
});

// Función para validar y sanitizar imágenes base64
export const validateBase64Image = (base64String) => {
    if (!base64String) return null;
    
    // Si no es base64, retornar tal cual
    if (!base64String.startsWith('data:image')) return base64String;
    
    try {
        // Calcular tamaño en KB
        const sizeInKB = (base64String.length * 0.75) / 1024;
        
        // Si es muy grande (>1MB), retornar null para usar placeholder
        if (sizeInKB > 1024) {
            console.warn(`⚠️ Imagen base64 demasiado grande: ${sizeInKB.toFixed(2)} KB. Usando placeholder.`);
            return null;
        }
        
        return base64String;
    } catch (error) {
        console.error('Error validando imagen base64:', error);
        return null;
    }
};

// Función helper para construir URLs de imágenes
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Validar y sanitizar imágenes base64
    if (imagePath.startsWith('data:')) {
        return validateBase64Image(imagePath);
    }
    
    if (imagePath.startsWith('http')) return imagePath;
    
    // Si la ruta ya incluye /images/, construir la URL completa con la API
    if (imagePath.startsWith('/images/')) {
        return `${API_BASE_URL}${imagePath}`;
    }
    
    // Si viene de la base de datos, las imágenes están en /images/canchas/
    if (imagePath.includes('.jpg') || imagePath.includes('.png') || imagePath.includes('.jpeg')) {
        // Las imágenes estáticas se sirven desde el backend
        const imageBaseUrl = API_BASE_URL.replace('/api', '');
        // Limpiar cualquier prefijo "api" pegado al nombre del archivo
        const cleanImagePath = imagePath.replace(/^api/, '').replace(/^\//, '');
        return `${imageBaseUrl}/images/canchas/${cleanImagePath}`;
    }
    
    // Si no, asumimos que es una ruta relativa dentro de /images/
    const imageBaseUrl = API_BASE_URL.replace('/api', '');
    return `${imageBaseUrl}/images/${imagePath}`;
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
    
    // Las imágenes estáticas se sirven desde el backend
    const imageBaseUrl = API_BASE_URL.replace('/api', '');
    return `${imageBaseUrl}/images/canchas/${imageName}`;
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
    const uniqueNumber = nroCancha ? (canchaId * 13 + nroCancha * 7) : (canchaId * 17);
    const imageNumber = (uniqueNumber % 8) + 1; // Cicla entre 1-8
    
    // Las imágenes estáticas se sirven desde el backend
    const imageBaseUrl = API_BASE_URL.replace('/api', '');
    return `${imageBaseUrl}/images/canchas/${deportePrefix}_${imageNumber}.jpg`;
};