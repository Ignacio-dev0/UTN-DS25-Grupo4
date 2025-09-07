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
  const complejo = await prisma.complejo.update({
    where: { id },
    data,
  });

  if (!complejo) throw ('Complejo no encontrado');
  return complejo;
};

export const getAllComplejos = async () => {
  return await prisma.complejo.findMany({
    include: { domicilio: true },
  });
};


export const getComplejoById = async (id:number) => {
  return prisma.complejo.findUnique({
    where:{ id }, 
    include: { domicilio: true },
  });
}

//esta era la primera forma de eliminar pero no funionaba bien por que
//solo eliminaba el complejo pero la soli y el domicilio no
// export const deleteComplejo = async (id:number) => {
//     return prisma.complejo.delete({where:{id}})
// }

export const deleteComplejo_sol_dom = async (id: number) => {
    const complejo = await prisma.complejo.findUnique({
        where: { id }
    });

    if (!complejo) {
        throw new Error('complejo not found');
    }
    return prisma.$transaction([
        prisma.complejo.delete({where:{id}}),
        prisma.solicitud.delete({where:{id:complejo.solicitudId}}),
        prisma.domicilio.delete({where:{id:complejo.domicilioId}}),
    ]);
}