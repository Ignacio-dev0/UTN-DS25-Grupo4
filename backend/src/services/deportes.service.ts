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
    console.log('🔍 [DEPORTES SERVICE] Deportes existentes en DB:', deportes.map(d => `${d.id}: ${d.nombre}`).join(', '));
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
    
    // Verificar si ya existe un deporte con ese nombre
    const deporteExistente = await prisma.deporte.findUnique({
        where: { nombre: data.name }
    });
    
    if (deporteExistente) {
        console.log(`⚠️ DEPORTE YA EXISTE - Intento de crear deporte con nombre duplicado: "${data.name}"`);
        const error = new Error(`Ya existe un deporte con el nombre "${data.name}"`);
        (error as any).statusCode = 409;
        throw error;
    }
    
    try {
        console.log(`✅ CREANDO DEPORTE - Nombre: "${data.name}", Icono: "${data.icono || '⚽'}"`);
        const nuevoDeporte = await prisma.deporte.create({
            data: {
                // NO incluir el ID, dejar que Prisma lo genere automáticamente
                nombre: data.name,
                icono: data.icono || '⚽'
            }
        });
        console.log(`✅ DEPORTE CREADO EXITOSAMENTE - ID: ${nuevoDeporte.id}, Nombre: "${nuevoDeporte.nombre}"`);
        return nuevoDeporte;
    } catch (e: any) {
        // Log detallado del error para debugging
        console.error('❌ Error al crear deporte:', {
            code: e.code,
            message: e.message,
            meta: e.meta,
            nombre: data.name
        });
        
        // Si es un error de constraint en el ID, probablemente la secuencia está desincronizada
        if (e.code === 'P2002' && e.meta?.target?.includes('id')) {
            const error = new Error('Error interno: la secuencia de IDs está desincronizada. Contacta al administrador.');
            (error as any).statusCode = 500;
            console.error('⚠️ SECUENCIA DESINCRONIZADA - Se necesita ejecutar: SELECT setval(pg_get_serial_sequence(\'"Deporte"\', \'id\'), (SELECT MAX(id) FROM "Deporte"), true);');
            throw error;
        }
        
        throw e;
    }
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