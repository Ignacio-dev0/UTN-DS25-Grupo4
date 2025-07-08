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