import prisma from "../config/prisma";
import { CreateComplejoRequest, UpdateComplejoRequest } from "../types/complejo.types";


export const createComplejo = async (data: CreateComplejoRequest) => {
  const { domicilio, solicitud, usuarioId, ...complejo } = data;
    
  return await prisma.$transaction(async (tx) => {
        
    const nuevoDomicilio = await tx.domicilio.create({
      data: {
        calle: domicilio.calle,
        altura: domicilio.altura,
        localidad: { connect: { id: domicilio.localidadId } },
      }
    });
    
    const nuevaSolicitud = await tx.solicitud.create({
      data:{
        cuit: solicitud.cuit,
        usuario: { connect: { id: data.usuarioId } },
      }
    });

    const nuevoComplejo = await tx.complejo.create({
      data: {
        ...complejo,
        cuit: solicitud.cuit,
        solicitud: { connect: { id: nuevaSolicitud.id } },
        usuario: { connect: { id: usuarioId } },
        domicilio: { connect: { id: nuevoDomicilio.id } },
      }
    });

    return nuevoComplejo;
  });
};

export const updateComplejo = async (id: number, data: UpdateComplejoRequest) =>{
  console.log('=== SERVICIO updateComplejo ===');
  console.log('ID:', id);
  console.log('Data recibida:', data);
  
  try {
    // Separar servicios de los demás campos
    const { servicios, ...complejoData } = data;
    
    // Actualizar el complejo
    const complejo = await prisma.complejo.update({
      where: { id },
      data: complejoData,
    });

    console.log('✅ Complejo actualizado en la base de datos:', complejo);
    
    // Si hay servicios para actualizar, manejar la relación ComplejoServicio
    if (servicios && servicios.length >= 0) {
      console.log('🔄 Actualizando servicios:', servicios);
      
      // Primero eliminar todas las relaciones existentes
      await prisma.complejoServicio.deleteMany({
        where: { complejoId: id }
      });
      
      // Luego crear las nuevas relaciones
      if (servicios.length > 0) {
        await prisma.complejoServicio.createMany({
          data: servicios.map(servicioId => ({
            complejoId: id,
            servicioId,
            disponible: true
          }))
        });
      }
      
      console.log('✅ Servicios actualizados correctamente');
    }
    
    if (!complejo) throw ('Complejo no encontrado');
    return complejo;
  } catch (error) {
    console.error('❌ Error en updateComplejo service:', error);
    throw error;
  }
};

export const getAllComplejos = async () => {
  return await prisma.complejo.findMany({
    include: { domicilio: true },
  });
};

export const getComplejosAprobados = async () => {
  return await prisma.complejo.findMany({
    where: {
      solicitud: {
        estado: 'APROBADA'
      }
    },
    include: { 
      domicilio: {
        include: {
          localidad: true
        }
      },
      solicitud: true,
      usuario: true 
    },
  });
};


export const getComplejoById = async (id:number) => {
  return prisma.complejo.findUnique({
    where:{ id }, 
    include: { 
      domicilio: {
        include: {
          localidad: true
        }
      },
      solicitud: true,
      usuario: true,
      servicios: {
        include: {
          servicio: true
        }
      },
      canchas: {
        include: {
          deporte: true,
          cronograma: true,
          turnos: {
            where: {
              fecha: {
                gte: new Date()
              }
            },
            orderBy: {
              fecha: 'asc'
            }
          }
        }
      }
    },
  });
}

//esta era la primera forma de eliminar pero no funionaba bien por que
//solo eliminaba el complejo pero la soli y el domicilio no
// export const deleteComplejo = async (id:number) => {
//     return prisma.complejo.delete({where:{id}})
// }

export const deleteComplejo_sol_dom = async (id: number) => {
    try {
        console.log(`🔍 [${new Date().toISOString()}] Looking for complejo with ID: ${id}`);
        
        const complejo = await prisma.complejo.findUnique({
            where: { id },
            include: {
                solicitud: true,
                domicilio: true,
                usuario: {
                    include: {
                        reservas: {
                            include: {
                                turnos: true,
                                pago: true,
                                resenia: true
                            }
                        }
                    }
                },
                canchas: {
                    include: {
                        turnos: {
                            include: {
                                alquiler: true
                            }
                        },
                        cronograma: true
                    }
                },
                servicios: true
            }
        });

        if (!complejo) {
            console.log(`❌ [${new Date().toISOString()}] Complejo not found with ID: ${id}`);
            const error = new Error('Complejo not found');
            (error as any).code = 'P2025';
            throw error;
        }

        console.log(`🗑️ [${new Date().toISOString()}] Deleting complejo and related entities:`, {
            complejoId: id,
            solicitudId: complejo.solicitudId,
            domicilioId: complejo.domicilioId,
            usuarioId: complejo.usuarioId,
            canchasCount: complejo.canchas.length,
            serviciosCount: complejo.servicios.length,
            reservasCount: complejo.usuario.reservas.length
        });

        // Eliminar todo en una transacción más robusta
        const result = await prisma.$transaction(async (tx) => {
            // 1. Eliminar reseñas de alquileres del usuario
            for (const reserva of complejo.usuario.reservas) {
                if (reserva.resenia) {
                    await tx.resenia.delete({ where: { id: reserva.resenia.id } });
                }
                if (reserva.pago) {
                    await tx.pago.delete({ where: { id: reserva.pago.id } });
                }
                // Eliminar turnos de esta reserva
                await tx.turno.deleteMany({ where: { alquilerId: reserva.id } });
                // Eliminar la reserva
                await tx.alquiler.delete({ where: { id: reserva.id } });
            }

            // 2. Eliminar turnos y cronogramas de las canchas del complejo
            for (const cancha of complejo.canchas) {
                // Eliminar turnos que no estén en alquileres ya eliminados
                const turnosRestantes = await tx.turno.findMany({
                    where: { canchaId: cancha.id }
                });
                
                for (const turno of turnosRestantes) {
                    if (turno.alquilerId) {
                        // Si hay alquiler asociado, eliminar todo
                        const alquiler = await tx.alquiler.findUnique({
                            where: { id: turno.alquilerId },
                            include: { pago: true, resenia: true }
                        });
                        
                        if (alquiler) {
                            if (alquiler.resenia) {
                                await tx.resenia.delete({ where: { id: alquiler.resenia.id } });
                            }
                            if (alquiler.pago) {
                                await tx.pago.delete({ where: { id: alquiler.pago.id } });
                            }
                            await tx.alquiler.delete({ where: { id: alquiler.id } });
                        }
                    }
                }
                
                // Eliminar todos los turnos de la cancha
                await tx.turno.deleteMany({ where: { canchaId: cancha.id } });
                
                // Eliminar cronogramas (es un array)
                if (cancha.cronograma && cancha.cronograma.length > 0) {
                    await tx.horarioCronograma.deleteMany({
                        where: { canchaId: cancha.id }
                    });
                }
            }

            // 3. Eliminar servicios del complejo
            if (complejo.servicios.length > 0) {
                await tx.complejoServicio.deleteMany({
                    where: { complejoId: id }
                });
            }

            // 4. Eliminar las canchas
            await tx.cancha.deleteMany({ where: { complejoId: id } });

            // 5. Eliminar el complejo, solicitud, domicilio Y el usuario dueño
            await tx.complejo.delete({ where: { id } });
            await tx.solicitud.delete({ where: { id: complejo.solicitudId } });
            await tx.domicilio.delete({ where: { id: complejo.domicilioId } });
            await tx.usuario.delete({ where: { id: complejo.usuarioId } });

            return { success: true, deletedComplejoId: id };
        });
        
        console.log(`✅ [${new Date().toISOString()}] Successfully deleted complejo and all related entities`);
        return result;
    } catch (error: any) {
        console.error(`❌ [${new Date().toISOString()}] Error in deleteComplejo_sol_dom:`, {
            id,
            error: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
}