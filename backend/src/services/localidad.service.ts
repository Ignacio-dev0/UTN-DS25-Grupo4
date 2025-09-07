import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma/client";

export const crearLocalidad = (data: Prisma.LocalidadCreateInput) => {
    return prisma.localidad.create({data});
};

export async function obtenerTodasLasLocalidades() {
    return await prisma.localidad.findMany();
};

export async function obtenerLocalidad(id: number) {
    return await prisma.localidad.findUnique({where: {id}});
};

export async function eliminarLocalidad(id: number) {
    return await prisma.localidad.delete({where: {id}});
};

export async function actualizarLocalidad(id: number, data: Prisma.LocalidadUpdateInput) {
    return await prisma.localidad.update({where: {id}, data});
};