// src/services/webhook.service.ts
import { MercadoPagoConfig, Payment } from 'mercadopago';
import prisma from '../config/prisma';
import { EstadoAlquiler } from '@prisma/client';

// Configura el cliente de MP (usa el mismo token)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

/**
 * Procesa un webhook de notificación de Mercado Pago.
 */
export async function procesarWebhook(data: any) {
  
  if (data.type === 'payment') {
    const paymentId = data.data.id;
    console.log(`🔔 Webhook recibido: Procesando pago ${paymentId}...`);

    try {
      // 1. Buscar el pago en la API de Mercado Pago
      const payment = await new Payment(client).get({ id: paymentId });

      if (!payment) {
        throw new Error(`Pago ${paymentId} no encontrado en Mercado Pago.`);
      }

      // 2. Obtener nuestro ID de Alquiler desde 'external_reference'
      const alquilerId = parseInt(payment.external_reference!);

      if (!alquilerId) {
        throw new Error(`Webhook (Pago ${paymentId}) no tiene external_reference.`);
      }

      // 3. Buscar el alquiler y su pago en nuestra BD
      const alquiler = await prisma.alquiler.findUnique({
        where: { id: alquilerId },
        include: { pago: true }
      });

      if (!alquiler) {
        throw new Error(`Alquiler ${alquilerId} no encontrado en la BD.`);
      }
      if (!alquiler.pago) {
        throw new Error(`Pago para Alquiler ${alquilerId} no encontrado en la BD.`);
      }

      // 4. Si el pago fue aprobado y nuestro alquiler sigue "PROGRAMADO"
      if (payment.status === 'approved' && alquiler.estado === 'PROGRAMADO') {
        
        console.log(`✅ Pago ${paymentId} APROBADO para Alquiler ${alquilerId}.`);

        // 5. Actualizar todo en una transacción
        await prisma.$transaction([
          
          // 5a. Marcar el Alquiler como PAGADO
          prisma.alquiler.update({
            where: { id: alquilerId },
            data: { estado: 'PAGADO' }
          }),

          // 5b. Actualizar nuestro Pago con los IDs de MP
          prisma.pago.update({
            where: { id: alquiler.pago.id },
            data: {
              idPagoMp: payment.id?.toString(),
              estadoPago: payment.status
            }
          }),

          // 5c. ¡CRÍTICO! Marcar los Turnos como reservados
          // (Tu lógica de 'crearAlquiler' chequea 'reservado', 
          // aquí es donde lo marcamos como 'true')
          prisma.turno.updateMany({
            where: { alquilerId: alquilerId },
            data: { reservado: true }
          })
        ]);

        console.log(`🎉 Alquiler ${alquilerId} y turnos actualizados a PAGADO/RESERVADO.`);
      
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        
        // Opcional: Si el pago es rechazado, cancelar el alquiler
        console.log(`❌ Pago ${paymentId} RECHAZADO/CANCELADO para Alquiler ${alquilerId}.`);
        await prisma.alquiler.update({
          where: { id: alquilerId },
          data: { estado: 'CANCELADO' } // O el estado que prefieras
        });
      }

    } catch (error: any) {
      console.error(`Error procesando Webhook para Pago ${paymentId}:`, error.message);
      // Devolvemos el error para que MP pueda reintentar si es necesario
      throw new Error(`Error en webhook: ${error.message}`);
    }
  }
}