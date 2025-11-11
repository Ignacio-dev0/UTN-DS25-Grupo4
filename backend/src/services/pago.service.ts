import prisma from '../config/prisma';
import { Prisma, Pago, MetodoPago, EstadoAlquiler } from '@prisma/client';
import { CrearPagoRequest, actualizarPagoRequest } from '../types/pago.types';
import { mercadopago } from '../app'; // <-- Importamos el cliente de MP
import { Preference } from 'mercadopago'; // <-- Importamos los tipos de MP

// --- Función para crear la preferencia de pago ---
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
          complejo: true
        }
      }
    }
  });

  if (!turno) {
    const error = new Error('Turno no encontrado o no disponible');
    (error as any).statusCode = 404;
    throw error;
  }

  console.log(`Turno encontrado: ${turno.cancha.nombre} a las ${turno.horaInicio}, Precio: ${turno.precio}`);

  // 2. Crear Alquiler y Pago en PENDIENTE (todo en una transacción)
  const { alquiler, pago } = await prisma.$transaction(async (tx) => {
    // Crear Alquiler
    const nuevoAlquiler = await tx.alquiler.create({
      data: {
        estado: EstadoAlquiler.PROGRAMADO, // Lo creamos como programado
        clienteId: clienteId,
        turnos: {
          connect: { id: turnoId }
        }
      }
    });

    // Marcar el turno como reservado
    await tx.turno.update({
      where: { id: turnoId },
      data: { reservado: true }
    });

    // Crear Pago (asociado al alquiler)
    const nuevoPago = await tx.pago.create({
      data: {
        metodoPago: MetodoPago.MERCADOPAGO,
        monto: turno.precio,
        alquilerId: nuevoAlquiler.id,
        estadoPago: 'PENDING', // Estado inicial
      }
    });

    console.log(`Alquiler ${nuevoAlquiler.id} y Pago ${nuevoPago.id} creados en DB.`);
    return { alquiler: nuevoAlquiler, pago: nuevoPago };
  });


  // 3. Definir URLs (¡IMPORTANTE!)
  // Usamos la URL del frontend (que pusimos en .env) para la redirección
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Esta URL es donde MP nos avisará si el pago fue aprobado (Webhook)
  // DEBE ser una URL pública (ej: Railway), ¡MP no puede ver tu localhost!
  // Por ahora usaremos una de NGROK o Railway como placeholder.
  const notificationUrl = process.env.RAILWAY_PUBLIC_URL 
    ? `${process.env.RAILWAY_PUBLIC_URL}/api/webhooks/mercadopago`
    : 'https://TU_URL_DE_PRODUCCION/api/webhooks/mercadopago'; // ¡Cambiar esto en producción!

  console.log(`URL de Notificación (Webhook): ${notificationUrl}`);


  // 4. Crear la preferencia de pago en Mercado Pago
  try {
    const preference = await new Preference(mercadopago).create({
      body: {
        items: [
          {
            id: turno.id.toString(),
            title: `Reserva de cancha: ${turno.cancha.nombre} en ${turno.cancha.complejo.nombre}`,
            description: `Turno para el ${turno.fecha.toLocaleDateString()} a las ${new Date(turno.horaInicio).toLocaleTimeString()}`,
            quantity: 1,
            unit_price: turno.precio,
            currency_id: 'ARS' // Moneda Argentina
          }
        ],
        back_urls: {
          // A dónde va el usuario si el pago es exitoso
          success: `${frontendUrl}/mis-reservas?pago=exitoso&alquilerId=${alquiler.id}`,
          // A dónde va si falla
          failure: `${frontendUrl}/mis-reservas?pago=fallido&alquilerId=${alquiler.id}`,
          // A dónde va si está pendiente
          pending: `${frontendUrl}/mis-reservas?pago=pendiente&alquilerId=${alquiler.id}`
        },
        auto_return: 'approved', // Redirigir solo si es aprobado
        notification_url: `${notificationUrl}?pagoId=${pago.id}&source_news=webhooks`, // El Webhook
        external_reference: pago.id.toString(), // ID de nuestro pago
      }
    });

    console.log(`Preferencia de MP creada: ${preference.id}`);

    // 5. Guardar el ID de la preferencia en nuestro Pago
    await prisma.pago.update({
      where: { id: pago.id },
      data: { mpPreferenceId: preference.id }
    });

    // 6. Devolver la URL de pago (init_point) al controlador
    return {
      preferenceId: preference.id,
      init_point: preference.init_point // Esta es la URL a la que el frontend debe redirigir
    };

  } catch (error) {
    console.error("Error al crear preferencia de MP:", error);
    // Si MP falla, revertir la reserva del turno (opcional, pero recomendado)
    await prisma.turno.update({
      where: { id: turnoId },
      data: { reservado: false }
    });
    // (También podríamos borrar el Alquiler y el Pago, pero por ahora esto es suficiente)
    const err = new Error('Error al contactar con Mercado Pago');
    (err as any).statusCode = 500;
    throw err;
  }
}


// --- FUNCIONES VIEJAS (Las dejamos como estaban) ---

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

export async function crearPago(data: CrearPagoRequest): Promise<Pago>{
// Esta función es para pagos manuales (ej: Efectivo)
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
    const eliminado = await prisma.pago.delete({where: {id}});
    return eliminado;
  }  catch (e : any){
    if (e.code === 'PS2025') {
        const error = new Error('Pago No Encontrado');
        (error as any).statusCode(400);
        throw error;
    }
    throw e;
  }
};