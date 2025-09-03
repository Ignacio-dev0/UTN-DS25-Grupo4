import prisma from "../config/prisma";

import { Prisma } from "../generated/prisma/client";

export const crearLocalidad =(data: Prisma.LocalidadCreateInput) => {
    return prisma.localidad.create({data});
}