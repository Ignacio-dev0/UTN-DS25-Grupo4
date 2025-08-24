// backend/src/services/deportes.service.ts
import prisma from '../lib/prisma'; 
import { Deporte } from '../generated/prisma/client';


const getAll = async (): Promise<Deporte[]> => {
    return await prisma.deporte.findMany();
};

const create = async (data: { nombre: string }): Promise<Deporte> => {
    return await prisma.deporte.create({ data });
};

export default {
    getAll,
    create,
};