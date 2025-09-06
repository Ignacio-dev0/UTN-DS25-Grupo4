import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma/client";

export const crearLocalidad =(data: Prisma.LocalidadCreateInput) => {
    return prisma.localidad.create({data});
};

export async function obtenerLocalidad(id : number) {
    return await prisma.localidad.findUnique({where: {id}});
};

export async function eliminarLocalidad( id : number) {
    return await prisma.localidad.eliminarLocalidad({where : {id}});
};

export async function actulizarLocalida(id : number, data : Prisma.LocaliadadUpdateInput) {
  return await prisma.localidad.update({where: {id}});  
};