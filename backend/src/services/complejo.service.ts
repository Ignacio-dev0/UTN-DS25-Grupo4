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
    const complejo = await prisma.complejo.findUnique({
        where: { id },
        include: {
            solicitud: true,
            domicilio: true,
            usuario: true
        }
    });

    if (!complejo) {
        throw new Error('complejo not found');
    }

    // Eliminar el complejo, solicitud, domicilio Y el usuario dueño en una sola transacción
    return prisma.$transaction([
        prisma.complejo.delete({where:{id}}),
        prisma.solicitud.delete({where:{id:complejo.solicitudId}}),
        prisma.domicilio.delete({where:{id:complejo.domicilioId}}),
        prisma.usuario.delete({where:{id:complejo.usuarioId}}) // ✅ Eliminar también el usuario dueño
    ]);
}