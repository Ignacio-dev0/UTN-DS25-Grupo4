import prisma from "../config/prisma";

// import { Prisma } from "../generated/prisma/client";

// COMENTADO TEMPORALMENTE - No existe el modelo Owner en el schema actual
// export const createOwner = async (data: Prisma.OwnerCreateInput) => {
//     return prisma.owner.create({data})
// }

export const createOwner = async (data: any) => {
    throw new Error("Owner model not implemented yet");
}
