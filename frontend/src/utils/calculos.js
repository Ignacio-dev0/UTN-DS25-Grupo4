import { API_BASE_URL } from '../config/api.js';

// Cache para evitar múltiples requests a la misma cancha
const reseñasCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos - cache más largo para reseñas

/**
 * Calcula el puntaje promedio y la cantidad total de reseñas para una cancha específica usando la API real.
 * @param {number} canchaId 
 * @returns {Promise<{promedio: number, cantidad: number}>}
 */
export const calcularInfoReseñasAsync = async (canchaId) => {
    try {
        // Verificar cache
        const cacheKey = `resenas-${canchaId}`;
        const cached = reseñasCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            return cached.data;
        }

        // Realizar petición a la API con timeout más corto
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos timeout
        
        try {
            const response = await fetch(`${API_BASE_URL}/resenas/cancha/${canchaId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                // Si el servidor no está disponible, devolver resultado por defecto sin error
                if (response.status >= 500) {
                    console.warn(`Servidor no disponible para cancha ${canchaId}, usando valores por defecto`);
                    const result = { promedio: 0, cantidad: 0 };
                    reseñasCache.set(cacheKey, { data: result, timestamp: now });
                    return result;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            const reseñas = data.resenas || data || [];
            
            if (reseñas.length === 0) {
                const result = { promedio: 0, cantidad: 0 };
                reseñasCache.set(cacheKey, { data: result, timestamp: now });
                return result;
            }

            const sumaPuntajes = reseñas.reduce((total, reseña) => total + reseña.puntaje, 0);
            const promedio = sumaPuntajes / reseñas.length;

            const result = {
                promedio: Math.round(promedio * 10) / 10, // Redondear a 1 decimal
                cantidad: reseñas.length,
            };
            
            // Guardar en cache
            reseñasCache.set(cacheKey, { data: result, timestamp: now });
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn(`Timeout calculando reseñas para cancha ${canchaId}`);
            } else {
                console.warn(`Error calculando reseñas para cancha ${canchaId}:`, error.message);
            }
            // Devolver valores por defecto en lugar de fallar
            const result = { promedio: 0, cantidad: 0 };
            reseñasCache.set(cacheKey, { data: result, timestamp: now });
            return result;
        }
        
    } catch (error) {
        console.warn(`Error general calculando reseñas para cancha ${canchaId}:`, error.message);
        return { promedio: 0, cantidad: 0 };
    }
};

/**
 * Procesa consultas de reseñas en lotes para evitar sobrecargar el servidor
 * @param {number[]} canchaIds - Array de IDs de canchas
 * @param {number} batchSize - Tamaño del lote (por defecto 3)
 * @returns {Promise<Map<number, {promedio: number, cantidad: number}>>}
 */
// Función para calcular reseñas en lotes usando el nuevo endpoint optimizado
export const calcularInfoReseñasEnLotes = async (canchaIds) => {
  const resultado = {};
  
  // Primero verificar cache para todos los IDs
  const canchasNeedAPI = [];
  const resultadosCache = {};
  
  canchaIds.forEach(canchaId => {
    const cacheKey = `resenas-${canchaId}`;
    if (reseñasCache.has(cacheKey)) {
      const cached = reseñasCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        resultadosCache[canchaId] = cached.data;
      } else {
        canchasNeedAPI.push(canchaId);
      }
    } else {
      canchasNeedAPI.push(canchaId);
    }
  });
  
  // Si todas están en cache, devolver resultados
  if (canchasNeedAPI.length === 0) {
    return resultadosCache;
  }
  
  try {
    // Llamar al endpoint de lote para las canchas que necesitan API
    const response = await fetch(`${API_BASE_URL}/resenas/lote/puntajes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ canchaIds: canchasNeedAPI }),
    });
    
    if (response.ok) {
      const dataFromAPI = await response.json();
      
      // Procesar resultados de la API
      Object.entries(dataFromAPI).forEach(([canchaId, puntajes]) => {
        const data = {
          cantidadResenas: puntajes.total,
          promedio: puntajes.promedio
        };
        
        // Guardar en cache
        const cacheKey = `resenas-${canchaId}`;
        reseñasCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        resultado[canchaId] = data;
      });
    } else {
      console.warn('Error en endpoint de lote, fallback a método individual');
      // Fallback a método individual para canchas que fallan
      for (const canchaId of canchasNeedAPI) {
        try {
          const data = await calcularInfoReseñasAsync(canchaId);
          resultado[canchaId] = data;
        } catch (error) {
          console.warn(`Error calculando reseñas para cancha ${canchaId}:`, error);
          resultado[canchaId] = { cantidadResenas: 0, promedio: 0 };
        }
      }
    }
  } catch (error) {
    console.warn('Error en calcularInfoReseñasEnLotes:', error);
    // Fallback a método individual
    for (const canchaId of canchasNeedAPI) {
      try {
        const data = await calcularInfoReseñasAsync(canchaId);
        resultado[canchaId] = data;
      } catch (error) {
        console.warn(`Error calculando reseñas para cancha ${canchaId}:`, error);
        resultado[canchaId] = { cantidadResenas: 0, promedio: 0 };
      }
    }
  }
  
  // Combinar resultados de cache y API
  return { ...resultadosCache, ...resultado };
};

/**
 * Versión síncrona (legacy) - mantener para compatibilidad pero devolver datos por defecto
 * @param {number} canchaId 
 * @returns {{promedio: number, cantidad: number}}
 */
export const calcularInfoReseñas = () => {
    // Para evitar romper el código existente, devolver valores por defecto
    // El código debería migrar a usar calcularInfoReseñasAsync
    return { promedio: 0, cantidad: 0 };
};

// src/utils/calculos.js

/**
 * Genera un precio aleatorio para un turno de cancha.
 * @param {string} hora - La hora del turno (ej: "19:00").
 * @param {string} deporte - El nombre del deporte (ej: "Fútbol 5").
 * @returns {number} - Un precio aleatorio en pesos.
 */
export function generarPrecioTurno(hora, deporte) {
  // Precios base por deporte
  const preciosBase = {
    'Fútbol 5': 20000,
    'Pádel': 12000,
    'Básquet': 18000,
    'Tenis': 15000,
    'Hockey': 25000,
    'default': 10000
  };

  let precio = preciosBase[deporte] || preciosBase['default'];
  const horaNumerica = parseInt(hora.split(':')[0]);

  // Aumentar el precio en horarios pico (después de las 18:00)
  if (horaNumerica >= 18) {
    precio *= 1.4; // Aumento del 40%
  }

  // Añadir una pequeña variación aleatoria para que no todos los precios sean iguales
  const variacion = (Math.random() - 0.5) * 2000; // +/- 1000 pesos
  let precioFinal = precio + variacion;

  // Redondear al múltiplo de 500 más cercano para que los precios sean "limpios"
  return Math.round(precioFinal / 500) * 500;
}