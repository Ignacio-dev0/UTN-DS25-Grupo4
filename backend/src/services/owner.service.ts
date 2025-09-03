import prisma from "../config/prisma";

import { Prisma } from "../generated/prisma/client";

export const createOwner = async (data: Prisma.OwnerCreateInput) => {
    return prisma.owner.create({data})
}
