import prisma from "../config/prisma";
import { Domicilio } from '../generated/prisma';
import { crearDomicilioRequest, UpdateDomicilioRequest } from "../types/domicilio.types";

export async function crearDomicilio(data: crearDomicilioRequest): Promise<Domicilio> {
    const created = await prisma.domicilio.create({
        data: {
            calle: data.calle,
            altura: data.altura,
            localidad: {connect:{id:data.localidadId}},
            //no puse localidad el complejo necesita domicilio para existir
        },
    });
    return created;
}

export async function actualizarDomicilio(id: number, data:UpdateDomicilioRequest): Promise<Domicilio> {
    try {
        const update = await prisma.domicilio.update({
            where: {id},
            data: {
                ...(data.complejoId !== undefined ? {complejo:{connect:{id:data.complejoId}}} : {}),
                ...(data.calle !== undefined ? {calle:data.calle} : {}),
                ...(data.altura !== undefined ? {altura:data.altura} : {}),
                ...(data.localidadId !== undefined ? {localidad:{connect:{id:data.localidadId}}} : {}),
            }
        })
        return update;
    } catch (e : any) {
        if (e.code === 'P2025') {
            const error = new Error('Domicilio no encontrado');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

export async function eliminarDomicilio(id: number): Promise<Domicilio> {
try {
    const delated = await prisma.domicilio.delete({where : {id}});
    return delated;
}   catch (e : any) {
    if (e.code === 'P2025') {
        const error =  new Error('Domicilio no encontrado');
        (error as any).statusCode = 400;
        throw error;
    }
    throw e;
}
}

export async function getDomicilioById( id : number ): Promise<Domicilio> {
    const domicilio = await prisma.domicilio.findUnique({
        where: {id},
        include: {
            localidad: true
        }
    });  
    if (!domicilio) {
        const error = new Error('Domicilio no encontrado');
        (error as any).statusCode = 404;
        throw error;
    }
    return domicilio;  
}

export async function getAllDomicilio() {
    return prisma.domicilio.findMany();
}