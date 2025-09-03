import { connect } from "http2";
import prisma from "../config/prisma";

import * as complejoTypes from "../types/complejo.types"


export const createComplejo = async (data:complejoTypes.createComplejoType) =>{
    const propietarios = data.propietarios.map(id=>({id:id}));
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
            }
        });

        const nuevoComplejo = await tx.complejo.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                puntaje: data.puntaje,
                solicitud: {connect:{id:nuevaSolicitud.id}},
                domicilio: {connect:{id:nuevoDomicilio.id}},
                propietarios: {connect: propietarios},
            }
        });
        return nuevoComplejo;
    });
};

export const updateComplejo = async (id: number, data: complejoTypes.updateComplejo) =>{
    const dataAux: any={
        nombreAux: data.nombre,
        descripcionAux: data.descripcion,
        porcentajeReembolsoAux: data.porcentajeReembolse
    };

    if(data.propietarios){
        const nuevosPropietarios = data.propietarios.map(duenioId => ({id:duenioId}));
        dataAux.propietarios={
            set: nuevosPropietarios,
        }
    };

    return prisma.complejo.update({
        where: {id},
        data: dataAux,
    });

};

export const getAllComplejo = async () =>{
    return prisma.complejo.findMany({
        select:{
            nombre:true,
            descripcion:true,
            domicilio:{
                select:{
                    calle:true,
                    altura:true,
                    localidad:{
                        select:{nombre:true},
                    }
                }
            },
            propietarios:{
                select:{
                    nombre:true,
                    apellido:true,
                }
            }
        }
    });
};


export const getComplejoById = async (id:number) => {
    return prisma.complejo.findUnique({
        where:{id}, select:{
            nombre:true, descripcion:true, domicilio:{select:{calle:true,altura:true}}, propietarios:{select:{nombre:true, apellido:true}}
        }
    });
};

export const deleteComplejo = async (id:number) => {
    return prisma.complejo.delete({where:{id}})
}
