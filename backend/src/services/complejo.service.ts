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

    // Ya no creamos Solicitud - el complejo se crea directamente con estado APROBADO
    const nuevoComplejo = await tx.complejo.create({
      data: {
        ...complejo,
        cuit: solicitud.cuit,
        estado: 'APROBADO', // Complejo creado directamente está aprobado
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
    if (servicios !== undefined) {
      console.log('🔄 Actualizando servicios:', servicios);
      console.log('🔍 Tipo de servicios:', typeof servicios, Array.isArray(servicios));
      console.log('� Primer elemento:', servicios[0], typeof servicios[0]);
      
      // Validar que servicios sea un array de números
      if (!Array.isArray(servicios)) {
        throw new Error('servicios debe ser un array');
      }
      
      // Filtrar solo números válidos
      const serviciosIds = servicios.filter(s => typeof s === 'number' && s > 0);
      console.log('✅ IDs de servicios válidos:', serviciosIds);
      
      // Primero eliminar todas las relaciones existentes
      const deleted = await prisma.complejoServicio.deleteMany({
        where: { complejoId: id }
      });
      console.log(`🗑️ Eliminadas ${deleted.count} relaciones anteriores`);
      
      // Luego crear las nuevas relaciones
      if (serviciosIds.length > 0) {
        const created = await prisma.complejoServicio.createMany({
          data: serviciosIds.map(servicioId => ({
            complejoId: id,
            servicioId,
            disponible: true
          }))
        });
        console.log(`✅ Creadas ${created.count} nuevas relaciones`);
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
      estado: 'APROBADO'
    },
    include: { 
      domicilio: {
        include: {
          localidad: true
        }
      },
      usuario: true,
      administrador: true
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
      administrador: true,
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
                administrador: true,
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
            // solicitudId: complejo.solicitudId, // REMOVED: Solicitud model no longer exists
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

            // 5. Eliminar el complejo, domicilio Y el usuario dueño
            await tx.complejo.delete({ where: { id } });
            // await tx.solicitud.delete({ where: { id: complejo.solicitudId } }); // REMOVED: Solicitud model no longer exists
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

export async function esDuenioDeComplejo(complejoId: number, usuarioId: number): Promise<boolean> {
  const complejo = await getComplejoById(complejoId);
  return complejo.usuarioId === usuarioId;
}