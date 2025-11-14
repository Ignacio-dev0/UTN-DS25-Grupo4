import prisma from '../config/prisma';
import { Prisma, Pago, MetodoPago, EstadoAlquiler } from '@prisma/client';
import { CrearPagoRequest, actualizarPagoRequest } from '../types/pago.types';
// --- INICIO DE CAMBIOS: Imports para MP Connect ---
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { decrypt } from './encriptacionmp.service'; // Servicio para desencriptar el token del dueño
// --- FIN DE CAMBIOS ---

/**
 * DEPRECADO: Esta función crea un alquiler Y un pago en una sola transacción.
 * El nuevo flujo (pagarAlquiler) es más robusto.
 * Se actualiza para usar MP Connect.
 */
export async function crearPreferenciaDePago(turnoId: number, clienteId: number) {
    console.log(`Iniciando creación de preferencia para turnoId: ${turnoId} y clienteId: ${clienteId}`);

    // 1. Buscar el turno y verificar que esté disponible
    const turno = await prisma.turno.findFirst({
        where: {
            id: turnoId,
            reservado: false,
            deshabilitado: false
        },
        include: {
            cancha: {
                include: {
                    complejo: {
                        // 1. Incluimos el 'usuario' (dueño) del complejo
                        include: {
                            usuario: true 
                        }
                    }
                }
            }
        }
    });

    if (!turno) {
        const error = new Error('Turno no encontrado o no disponible');
        (error as any).statusCode = 404;
        throw error;
    }

    // 2. Obtener los datos del dueño
    const duenio = turno.cancha.complejo.usuario;
    const monto = turno.precio;
    console.log(`Turno encontrado: ${turno.cancha.nombre}, Precio: ${monto}`);

    // 3. Crear Alquiler y Pago en PENDIENTE (todo en una transacción)
    const { alquiler, pago } = await prisma.$transaction(async (tx) => {
        const nuevoAlquiler = await tx.alquiler.create({
            data: {
                estado: EstadoAlquiler.PROGRAMADO,
                clienteId: clienteId,
                turnos: {
                    connect: { id: turnoId }
                }
            }
        });

        // Marcar el turno como reservado (lógica vieja, pero la mantenemos)
        await tx.turno.update({
            where: { id: turnoId },
            data: { reservado: true }
        });

        const nuevoPago = await tx.pago.create({
            data: {
                metodoPago: MetodoPago.MERCADOPAGO,
                monto: monto,
                alquilerId: nuevoAlquiler.id,
                estadoPago: 'PENDING',
            }
        });

        console.log(`Alquiler ${nuevoAlquiler.id} y Pago ${nuevoPago.id} creados en DB.`);
        return { alquiler: nuevoAlquiler, pago: nuevoPago };
    });

    // 4. Definir URLs
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    if (apiBaseUrl === 'http://localhost:3000') {
        console.warn('API_BASE_URL no está definida, usando localhost para webhook. ¡Esto fallará en producción!');
    }
    const notificationUrl = `${apiBaseUrl}/api/webhooks/mercadopago`;

    // --- INICIO LÓGICA MP CONNECT ---
    
    // 5. Verificar y desencriptar el token del DUEÑO
    if (!duenio.mpAccessToken) {
        throw new Error(`El dueño del complejo ${turno.cancha.complejo.nombre} no tiene una cuenta de MP conectada.`);
    }
    
    let duenioAccessToken: string;
    try {
        duenioAccessToken = decrypt(duenio.mpAccessToken);
    } catch (error) {
        console.error("Error al desencriptar el token del dueño:", error);
        throw new Error("Error interno al procesar las credenciales del dueño.");
    }

    // 6. Crear un cliente de MP *solo para esta transacción*
    const duenioMpClient = new MercadoPagoConfig({ 
        accessToken: duenioAccessToken,
        options: { timeout: 5000 }
    });
    
    // 7. Definir la comisión de la plataforma (ej: 10%)
    const comisionCanchaYa = Math.round((monto * 0.10) * 100) / 100; // Redondear a 2 decimales
    
    console.log(`[MP Connect] Cobrando comisión de ${comisionCanchaYa} (10%) sobre ${monto}`);
    // --- FIN LÓGICA MP CONNECT ---

    // 8. Crear la preferencia de pago en Mercado Pago
    try {
        const preference = await new Preference(duenioMpClient).create({ // <-- USAR CLIENTE DEL DUEÑO
            body: {
                items: [
                    {
                        id: turno.id.toString(),
                        title: `Reserva de cancha: ${turno.cancha.nombre} en ${turno.cancha.complejo.nombre}`,
                        description: `Turno para el ${turno.fecha.toLocaleDateString()} a las ${new Date(turno.horaInicio).toLocaleTimeString()}`,
                        quantity: 1,
                        unit_price: monto,
                        currency_id: 'ARS'
                    }
                ],
                marketplace_fee: comisionCanchaYa, // ¡Cobrar la comisión!
                back_urls: {
                    success: `${frontendUrl}/mis-reservas?pago=exitoso&alquilerId=${alquiler.id}`,
                    failure: `${frontendUrl}/mis-reservas?pago=fallido&alquilerId=${alquiler.id}`,
                    pending: `${frontendUrl}/mis-reservas?pago=pendiente&alquilerId=${alquiler.id}`
                },
                auto_return: 'approved',
                notification_url: `${notificationUrl}?pagoId=${pago.id}&source_news=webhooks`,
                external_reference: alquiler.id.toString(), // ID del Alquiler (para el webhook)
            }
        });

        console.log(`Preferencia de MP creada: ${preference.id}`);

        // 9. Guardar el ID de la preferencia en nuestro Pago
        await prisma.pago.update({
            where: { id: pago.id },
            data: { mpPreferenceId: preference.id }
        });

        // 10. Devolver la URL de pago (init_point) al controlador
        return {
            preferenceId: preference.id,
            init_point: preference.init_point
        };

    } catch (error) {
        console.error("Error al crear preferencia de MP:", error);
        // Si MP falla, revertir la reserva del turno para liberarlo
        await prisma.turno.update({
            where: { id: turnoId },
            data: { reservado: false }
        });
        
        const err = new Error('Error al contactar con Mercado Pago');
        (err as any).statusCode = 500;
        throw err;
    }
}


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
    if (!pago) {
        const error = new Error('Pago No Encontrado');
        (error as any).statusCode = 404;
        throw error;
    }
    return pago;
};

/**
 * Crea un pago manual (ej: Efectivo en el local)
 */
export async function crearPago(data: CrearPagoRequest): Promise<Pago>{
    const created = await prisma.pago.create({
        data:{
            monto: data.monto,
            metodoPago: data.metodoPago,
            alquiler: {connect:{id:data.alquilerId}},
            estadoPago: 'paid' // Asumimos que si es manual, está pago
        },
    });
    return created;
};

export async function actualizarPago(id: number, updateData: actualizarPagoRequest): Promise<Pago> {
    try {
        const actualizacion = await prisma.pago.update({
            where: {id},
            data: {
                ...(updateData.monto !== undefined ? {monto: updateData.monto} : {}),
                ...(updateData.metodoPago !== undefined ? {metodoPago: updateData.metodoPago} : {}),
                ...(updateData.alquilerId !== undefined ? { alquiler: {connect:{id:updateData.alquilerId}}} : {})
            }
        });
        return actualizacion;
    } catch (e : any) {
        if (e.code === 'P2025'){
            const error = new Error('Pago No Encontrado');
            (error as any).statusCode(404);
            throw error;
        }
        throw e;
    }    
};

export async function EliminarPago(id : number): Promise<Pago> {
    try {
        const eliminado = await prisma.pago.delete({where: {id}});
        return eliminado;
    } catch (e : any){
        if (e.code === 'PS2025') {
            const error = new Error('Pago No Encontrado');
            (error as any).statusCode(400);
            throw error;
        }
        throw e;
    }
};