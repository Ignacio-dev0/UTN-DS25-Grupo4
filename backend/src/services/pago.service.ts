import prisma from '../config/prisma';
import {Prisma, Pago} from '../generated/prisma';
import { CrearPagoRequest, actualizarPagoRequest } from '../types/pago.types';

export async function getAllpagos(): Promise<Pago[]> {
    const pagos = await prisma.pago.findMany({orderBy: {fechaHora: 'desc'}})
    return pagos;
};

export async function obtenerPagoById(id: number): Promise<Pago> {
    const pago = await prisma.pago.findUnique({
        where: {id},
        include: {
        alquiler: true
        }
    });
    if (!Pago) {
        const error = new Error('Pago No Encontrado');
        (error as any).statusCode = 404;
        throw error;
    }
    return pago;
};

export async function crearPago(data: CrearPagoRequest): Promise<Pago>{
    const created = await prisma.pago.create({
        data:{
            codigotransaccion: data.codigotransaccion,
            monto: data.monto,
            metodopago: data.metodoPago,
            alquiler: data.alquiler,
        },
    });
    return created;
};

export async function actualizarPago(id: number, updateData: actualizarPagoRequest): Promise<Pago> {
    try {
        const actualizacion = await prisma.pago.update({
            where: {id},
            data: {
                ...(updateData.codigotransaccion !== undefined ? {codigotransaccion: updateData.codigotransaccion} : {}),
                ...(updateData.monto !== undefined ? {monto: updateData.monto} : {}),
                ...(updateData.metodoPago !== undefined ? {metodoPago: updateData.metodoPago} : {}),
                ...(updateData.alquiler !== undefined ? {alquiler: updateData.alquiler} : {}),
            }
        });
        return actualizacion;
    } catch (e : any) {
        if (e.code === 'PS2025'){
            const error = new Error('Pago No Encontrado');
            (error as any).statusCode(404);
            throw error;
        }
        throw e;
    }    
};

export async function EliminarPago(id : number): Promise<Pago> {
  try {
    const eliminado = await prisma.pago.delate({where: {id}});
    return eliminado;
  }  catch (e : any){
    if (e.code === 'PS2025') {
        const error = new Error('Pago No Encontrado');
        (error as any).statusCode(400);
        throw error;
    }
    throw e;
  }
};