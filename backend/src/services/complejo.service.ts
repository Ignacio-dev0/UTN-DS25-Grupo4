import prisma from "../config/prisma";
import { CreateComplejoRequest, UpdateComplejoRequest } from "../types/complejo.types"

import * as complejoTypes from "../types/complejo.types"


export const createComplejo = async (data:complejoTypes.createComplejoType) =>{
    return prisma.$transaction(async (tx)=>{
        const nuevoDomicilio = await tx.domicilio.create({
            data: {	
                calle: data.domicilio.calle,
                altura: data.domicilio.altura,
                localidad: {connect: {id: data.domicilio.localidadId}}
            }
        });

        const nuevaSolicitud = await tx.solicitud.create({
            data:{
                cuit: data.solicitud.cuit,
                usuario: {connect:{id:data.usuarioId}},
            }
        });

        const nuevoComplejo = await tx.complejo.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                puntaje: data.puntaje,
                image: data.image,
                solicitud: {connect:{id:nuevaSolicitud.id}},
                usuario: {connect:{id:data.usuarioId}},
                domicilio: {connect:{id:nuevoDomicilio.id}},
            }
        });
        return nuevoComplejo;
    });
};

export const updateComplejo = async (id: number, data: UpdateComplejoRequest) =>{
    const dataAux: any={
        nombre: data.nombre,
        descripcion: data.descripcion,
        puntaje: data.puntaje,
        image: data.image,
    };
    return prisma.complejo.update({
        where: {id},
        data: dataAux,
    });

};

export const getAllComplejo = async () =>{
    return prisma.complejo.findMany({
        select:{
            id:true,
            nombre:true,
            descripcion:true,
            puntaje:true,
            image:true,
            domicilio:{
                select:{
                    calle:true,
                    altura:true,
                    localidad:{
                        select:{nombre:true},
                    }
                }
            },
        }
    });
};


export const getComplejoById = async (id:number) => {
    return prisma.complejo.findUnique({
        where:{id}, 
        select:{
            nombre:true, 
            descripcion:true,
            puntaje:true, 
            domicilio:{
                select:{
                    calle:true,
                    altura:true
                }
                
            }
        }
    })
}

//esta era la primera forma de eliminar pero no funionaba bien por que
//solo eliminaba el complejo pero la soli y el domicilio no
// export const deleteComplejo = async (id:number) => {
//     return prisma.complejo.delete({where:{id}})
// }

export const deleteComplejo_sol_dom = async (id: number) => {
    const complejo = await prisma.complejo.findUnique({
        where:{id},
        select:{
            solicitud:true,
            domicilioId:true
        }
    });
    if (!complejo){
        throw new Error('complejo not found / no existe tu complejo hermano')
    }
    return prisma.$transaction([
        prisma.complejo.delete({where:{id}}),
        prisma.solicitud.delete({where:{id:complejo.solicitud.id}}),
        prisma.domicilio.delete({where:{id:complejo.domicilioId}}),
    ])
}