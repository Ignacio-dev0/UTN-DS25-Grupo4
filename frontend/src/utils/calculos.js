import { datosReseñas } from '../data/reseñas';

/**
 * Calcula el puntaje promedio y la cantidad total de reseñas para una cancha específica.
 * @param {number} canchaId 
 * @returns {{promedio: number, cantidad: number}}.
 */
 
export const calcularInfoReseñas = (canchaId) => {
    const reseñasDeLaCancha = datosReseñas.filter(r => r.canchaId === canchaId);
    
    if (reseñasDeLaCancha.length === 0) {
        return {
            promedio: 0,
            cantidad: 0,
        };
    }

    const sumaPuntajes = reseñasDeLaCancha.reduce((total, reseña) => total + reseña.puntaje, 0);
    
    const promedio = sumaPuntajes / reseñasDeLaCancha.length;

    return {
        promedio: promedio,
        cantidad: reseñasDeLaCancha.length,
    };
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