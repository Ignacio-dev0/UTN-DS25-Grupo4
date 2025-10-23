// backend/src/services/deportes.service.ts
import prisma from '../config/prisma'; 
import { Deporte } from '@prisma/client';
import { CreateDeporteResquest, UpdateDeporteResquest } from "../types/deporte.types";

export async function getAllDeportes(): Promise<Deporte[]> {
    const deportes = await prisma.deporte.findMany({
        orderBy: { id: 'asc'},
    })
    return deportes;
}

export async function getDeporteById(id: number): Promise<Deporte> {
    const deporte = await prisma.deporte.findUnique({ where: {id }});

    if (!deporte) {
        const error = new Error('Deporte not Found');
        (error as any).statusCode = 404;
        throw error;
    }
    return deporte;
}

export async function createDeporte(data: CreateDeporteResquest): Promise<Deporte>{
    const created = await prisma.deporte.create({ data });
    return created;
}

export async function updateDeporte(id:number, updateData: UpdateDeporteResquest): Promise<Deporte>{
    try {
        const updated= await prisma.deporte.update({
            where: {id},
            data: updateData
        });
        return updated;
    } catch (e : any) {
        if (e.code === 'P2025') {
            const error = new Error('Deporte not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

export async function deleteDeporte(id: number): Promise<Deporte>{
    try {
        const deleted = await prisma.deporte.delete({
            where: {id},
        });
        return deleted;
    } catch (e : any) {
        if (e.code === 'P2025') {
            const error = new Error('Deporte not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}