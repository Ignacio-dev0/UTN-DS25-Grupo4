const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calcula y actualiza el puntaje promedio de una cancha basado en sus reseñas
 * @param {number} canchaId - ID de la cancha
 * @returns {Promise<number>} - Puntaje promedio calculado
 */
async function actualizarPuntajeCancha(canchaId) {
  try {
    // Obtener todas las reseñas de la cancha a través de los alquileres
    const resenas = await prisma.resenia.findMany({
      include: {
        alquiler: {
          include: {
            turnos: {
              where: {
                canchaId: canchaId
              }
            }
          }
        }
      }
    });

    // Filtrar reseñas que pertenecen a esta cancha
    const resenasDeLaCancha = resenas.filter(resena => 
      resena.alquiler.turnos.some(turno => turno.canchaId === canchaId)
    );

    let puntajePromedio = 0.0;
    if (resenasDeLaCancha.length > 0) {
      const sumaPuntajes = resenasDeLaCancha.reduce((suma, resena) => suma + resena.puntaje, 0);
      puntajePromedio = sumaPuntajes / resenasDeLaCancha.length;
    }

    // Actualizar el puntaje en la cancha
    await prisma.cancha.update({
      where: { id: canchaId },
      data: { puntaje: puntajePromedio }
    });

    console.log(`Puntaje de cancha ${canchaId} actualizado a: ${puntajePromedio}`);
    return puntajePromedio;
  } catch (error) {
    console.error(`Error actualizando puntaje de cancha ${canchaId}:`, error);
    throw error;
  }
}

/**
 * Calcula y actualiza el precio "desde" de una cancha basado en sus turnos disponibles
 * @param {number} canchaId - ID de la cancha
 * @returns {Promise<number>} - Precio mínimo encontrado
 */
async function actualizarPrecioDesdeCancha(canchaId) {
  try {
    // Obtener el precio mínimo de los turnos disponibles de la cancha
    const precioMinimo = await prisma.turno.aggregate({
      where: {
        canchaId: canchaId,
        reservado: false,
        fecha: {
          gte: new Date() // Solo turnos futuros
        }
      },
      _min: {
        precio: true
      }
    });

    // Si no hay turnos disponibles, usar el precio del cronograma
    let precioDesde = precioMinimo._min.precio;
    
    if (!precioDesde) {
      const cronogramaMinimo = await prisma.horarioCronograma.aggregate({
        where: {
          canchaId: canchaId
        },
        _min: {
          precio: true
        }
      });
      precioDesde = cronogramaMinimo._min.precio || 0.0;
    }

    // Actualizar el precio "desde" en la cancha
    await prisma.cancha.update({
      where: { id: canchaId },
      data: { precioDesde: precioDesde || 0.0 }
    });

    console.log(`Precio desde de cancha ${canchaId} actualizado a: ${precioDesde || 0.0}`);
    return precioDesde || 0.0;
  } catch (error) {
    console.error(`Error actualizando precio desde de cancha ${canchaId}:`, error);
    throw error;
  }
}

/**
 * Calcula y actualiza el puntaje promedio de un complejo basado en todas sus canchas
 * @param {number} complejoId - ID del complejo
 * @returns {Promise<number>} - Puntaje promedio calculado
 */
async function actualizarPuntajeComplejo(complejoId) {
  try {
    // Obtener todas las canchas del complejo con sus puntajes
    const canchas = await prisma.cancha.findMany({
      where: { 
        complejoId: complejoId,
        activa: true 
      },
      select: { puntaje: true }
    });

    let puntajePromedio = 0.0;
    if (canchas.length > 0) {
      const sumaPuntajes = canchas.reduce((suma, cancha) => suma + cancha.puntaje, 0);
      puntajePromedio = sumaPuntajes / canchas.length;
    }

    // Actualizar el puntaje en el complejo
    await prisma.complejo.update({
      where: { id: complejoId },
      data: { puntaje: puntajePromedio }
    });

    console.log(`Puntaje de complejo ${complejoId} actualizado a: ${puntajePromedio}`);
    return puntajePromedio;
  } catch (error) {
    console.error(`Error actualizando puntaje de complejo ${complejoId}:`, error);
    throw error;
  }
}

/**
 * Calcula y actualiza el precio "desde" de un complejo basado en el precio mínimo de todas sus canchas
 * @param {number} complejoId - ID del complejo
 * @returns {Promise<number>} - Precio mínimo encontrado
 */
async function actualizarPrecioDesdeComplejo(complejoId) {
  try {
    // Obtener el precio mínimo de todas las canchas activas del complejo
    const precioMinimo = await prisma.cancha.aggregate({
      where: {
        complejoId: complejoId,
        activa: true,
        precioDesde: {
          gt: 0 // Solo considerar precios mayores a 0
        }
      },
      _min: {
        precioDesde: true
      }
    });

    const precioDesde = precioMinimo._min.precioDesde || 0.0;

    // Actualizar el precio "desde" en el complejo
    await prisma.complejo.update({
      where: { id: complejoId },
      data: { precioDesde: precioDesde }
    });

    console.log(`Precio desde de complejo ${complejoId} actualizado a: ${precioDesde}`);
    return precioDesde;
  } catch (error) {
    console.error(`Error actualizando precio desde de complejo ${complejoId}:`, error);
    throw error;
  }
}

/**
 * Actualiza todos los campos calculados de una cancha
 * @param {number} canchaId - ID de la cancha
 * @returns {Promise<Object>} - Objeto con los valores actualizados
 */
async function actualizarCamposCalculadosCancha(canchaId) {
  try {
    // Obtener el complejo de la cancha
    const cancha = await prisma.cancha.findUnique({
      where: { id: canchaId },
      select: { complejoId: true }
    });

    if (!cancha) {
      throw new Error(`Cancha con ID ${canchaId} no encontrada`);
    }

    // Actualizar campos de la cancha
    const puntaje = await actualizarPuntajeCancha(canchaId);
    const precioDesde = await actualizarPrecioDesdeCancha(canchaId);

    // Actualizar campos del complejo
    await actualizarPuntajeComplejo(cancha.complejoId);
    await actualizarPrecioDesdeComplejo(cancha.complejoId);

    return { puntaje, precioDesde };
  } catch (error) {
    console.error(`Error actualizando campos calculados de cancha ${canchaId}:`, error);
    throw error;
  }
}

/**
 * Actualiza todos los campos calculados de un complejo y sus canchas
 * @param {number} complejoId - ID del complejo
 * @returns {Promise<void>}
 */
async function actualizarCamposCalculadosComplejo(complejoId) {
  try {
    // Obtener todas las canchas del complejo
    const canchas = await prisma.cancha.findMany({
      where: { complejoId: complejoId },
      select: { id: true }
    });

    // Actualizar campos de cada cancha
    for (const cancha of canchas) {
      await actualizarPuntajeCancha(cancha.id);
      await actualizarPrecioDesdeCancha(cancha.id);
    }

    // Actualizar campos del complejo
    await actualizarPuntajeComplejo(complejoId);
    await actualizarPrecioDesdeComplejo(complejoId);

    console.log(`Campos calculados del complejo ${complejoId} actualizados`);
  } catch (error) {
    console.error(`Error actualizando campos calculados de complejo ${complejoId}:`, error);
    throw error;
  }
}

module.exports = {
  actualizarPuntajeCancha,
  actualizarPrecioDesdeCancha,
  actualizarPuntajeComplejo,
  actualizarPrecioDesdeComplejo,
  actualizarCamposCalculadosCancha,
  actualizarCamposCalculadosComplejo
};