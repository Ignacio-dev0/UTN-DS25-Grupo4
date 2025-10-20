// backend/src/services/deportes.service.ts
import { CreateDeporteResquest, UpdateDeporteResquest } from "../types/deporte.types";

// DATOS MOCK TEMPORALES hasta sincronizar la base de datos
const DEPORTES_MOCK = [
    { id: 1, nombre: "Fútbol 5", icono: "⚽" },
    { id: 2, nombre: "Fútbol 11", icono: "🥅" },
    { id: 3, nombre: "Vóley", icono: "🏐" },
    { id: 4, nombre: "Básquet", icono: "🏀" }
];

export async function getAllDeportes(): Promise<any[]> {
    console.log('🚨 [DEPORTES] Devolviendo datos mock debido a problemas de DB');
    return DEPORTES_MOCK;
}

export async function getDeporteById(id: number): Promise<any> {
    console.log(`🚨 [DEPORTES] Devolviendo deporte mock para id: ${id}`);
    const deporte = DEPORTES_MOCK.find(d => d.id === id);
    if (!deporte) {
        const error = new Error('Deporte not Found');
        (error as any).statusCode = 404;
        throw error;
    }
    return deporte;
}

export async function createDeporte(data: CreateDeporteResquest): Promise<any>{
    console.log('🚨 [DEPORTES] Mock create - devolviendo datos falsos');
    return { id: Date.now(), nombre: data.name, icono: "⚽" };
}

export async function updateDeporte(id:number, updateData: UpdateDeporteResquest): Promise<any>{
    console.log(`🚨 [DEPORTES] Mock update para id: ${id}`);
    const deporte = DEPORTES_MOCK.find(d => d.id === id);
    if (!deporte) {
        const error = new Error('Deporte not found');
        (error as any).statusCode = 404;
        throw error;
    }
    return { ...deporte, ...(updateData.name ? { nombre: updateData.name } : {}) };
}

export async function deleteDeporte(id: number): Promise<any>{
    console.log(`🚨 [DEPORTES] Mock delete para id: ${id}`);
    const deporte = DEPORTES_MOCK.find(d => d.id === id);
    if (!deporte) {
        const error = new Error('Deporte not found');
        (error as any).statusCode = 404;
        throw error;
    }
    return deporte;
}