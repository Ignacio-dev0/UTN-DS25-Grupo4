// backend/src/services/deportes.service.ts
import prisma from '../config/prisma';
import { Deporte } from '@prisma/client';
import { CreateDeporteResquest, UpdateDeporteResquest } from "../types/deporte.types";

export async function getAllDeportes(): Promise<Deporte[]> {
    const deportes = await prisma.deporte.findMany({
        select: {
            id: true,
            nombre: true,
            icono: true
        },
        orderBy: { id: 'asc'}
    });
    console.log('🔍 [DEPORTES SERVICE] Deportes from DB:', JSON.stringify(deportes.slice(0, 2), null, 2));
    return deportes;
}

export async function getDeporteById(id: number): Promise<Deporte> {
    const deporte = await prisma.deporte.findUnique({ where: { id } });
    
    if (!deporte) {
        const error = new Error('Deporte not Found');
        (error as any).statusCode = 404;
        throw error;
    }
    
    return deporte;
}

export async function createDeporte(data: CreateDeporteResquest): Promise<Deporte>{
    if(!data.name){
        const error = new Error('Name is required');
        (error as any).statusCode = 400;
        throw error;
    }
    
    return await prisma.deporte.create({
        data: {
            nombre: data.name,
            icono: data.icono || '⚽'
        }
    });
}

export async function updateDeporte(id:number, updateData: UpdateDeporteResquest): Promise<Deporte>{
    try {
        return await prisma.deporte.update({
            where: { id },
            data: {
                ...(updateData.name !== undefined ? { nombre: updateData.name } : {}),
                ...(updateData.icono !== undefined ? { icono: updateData.icono } : {})
            }
        });
    } catch (e: any) {
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
        return await prisma.deporte.delete({
            where: { id }
        });
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Deporte not found');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}