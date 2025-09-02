// backend/src/services/resenas.service.ts
//import prisma from '../lib/prisma';
//import { Prisma } from '@prisma/client';


// const getByCanchaId = async (canchaId: number) => {
//     return await prisma.resena.findMany({
//         where: { canchaId },
//         include: {
//             usuario: {
//                 select: { nombre: true, apellido: true },
//             },
//         },
//     });
// };

// const create = async (data: Prisma.ResenaUncheckedCreateInput) => {
//     return await prisma.resena.create({ data });
// };

// export default {
//     getByCanchaId,
//     create,
// };