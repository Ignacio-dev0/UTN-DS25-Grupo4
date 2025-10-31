// Servicio de Solicitudes - Adaptado al nuevo esquema sin modelo Solicitud
// Ahora usa Complejo.estado directamente (PENDIENTE, APROBADO, RECHAZADO)

import prisma from "../config/prisma";
import { EstadoComplejo } from '@prisma/client';
import * as emailService from './email.service';

// Obtener todas las solicitudes (complejos filtrados por estado)
export async function getAllRequest(includeApproved: boolean = false): Promise<any[]> {
  const whereCondition = includeApproved 
    ? { estado: { in: ['PENDIENTE', 'APROBADO', 'RECHAZADO'] as EstadoComplejo[] } }
    : { estado: 'PENDIENTE' as EstadoComplejo };
    
  return prisma.complejo.findMany({
    where: whereCondition,
    include: {
      usuario: true,
      administrador: true,
      domicilio: {
        include: {
          localidad: true
        }
      }
    }
  });
}

// Obtener una solicitud por ID (complejo)
export async function getRequestById(id: number): Promise<any> {
  const complejo = await prisma.complejo.findUnique({
    where: { id },
    include: {
      usuario: true,
      administrador: true,
      domicilio: {
        include: {
          localidad: true
        }
      }
    }
  });

  if (!complejo) {
    const error = new Error('complejo no encontrado');
    (error as any).statusCode = 404;
    throw error;
  }

  return complejo;
}

// Eliminar solicitud (eliminar complejo pendiente)
export async function deleteSoli(id: number) {
  return prisma.complejo.delete({ where: { id } });
}

// Actualizar estado de solicitud (cambiar estado del complejo)
export async function updateSolicitud(id: number, data: { estado: EstadoComplejo, evaluadorId?: number }) {
  const complejoActualizado = await prisma.complejo.update({
    where: { id },
    data: {
      estado: data.estado,
      administradorId: data.evaluadorId || null
    },
    include: {
      usuario: true,
      domicilio: {
        include: {
          localidad: true
        }
      }
    }
  });
  if (data.estado === 'APROBADO' && complejoActualizado.usuario) {
    
    emailService.enviarEmailComplejoAprobado(
      complejoActualizado.usuario.email,  // Email del dueño
      complejoActualizado.nombre,         // Nombre del complejo
      complejoActualizado.usuario.nombre  // Nombre del dueño
    )
    .catch(errorEmail => {
      console.error(`[Error Asíncrono] Falló el envío de email de aprobación para complejo ${id}`, errorEmail);
    });
  }
  return complejoActualizado;
}

// Crear solicitud con complejo (registro de nuevo dueño)
export async function createSolicitudWithComplejo(data: any) {
  return prisma.$transaction(async (tx) => {
    // Buscar localidad por ID
    let localidadId = data.complejo.domicilio.localidad;
    if (typeof localidadId === 'string') {
      localidadId = parseInt(localidadId);
    }
    
    const localidad = await tx.localidad.findUnique({
      where: { id: localidadId }
    });
    
    if (!localidad) {
      throw new Error('Localidad no encontrada');
    }

    // Crear el domicilio
    const nuevoDomicilio = await tx.domicilio.create({
      data: {
        calle: data.complejo.domicilio.calle,
        altura: parseInt(data.complejo.domicilio.altura),
        localidadId: localidad.id
      }
    });

    // Crear el complejo con estado PENDIENTE
    const nuevoComplejo = await tx.complejo.create({
      data: {
        nombre: data.complejo.nombre,
        image: data.complejo.imagen || null,
        cuit: data.cuit,
        domicilioId: nuevoDomicilio.id,
        usuarioId: data.usuarioId,
        estado: 'PENDIENTE' // Estado inicial - reemplaza a Solicitud
      },
      include: {
        usuario: true,
        domicilio: {
          include: {
            localidad: true
          }
        }
      }
    });

    return nuevoComplejo;
  });
}

// Crear solicitud simple (deprecado - usar createSolicitudWithComplejo)
export async function createSolicitud(data: any) {
  throw new Error('createSolicitud deprecado - usar createSolicitudWithComplejo');
}

// Alias para compatibilidad con código existente
export const getAllSolicitudes = getAllRequest;
export const getSolicitudById = getRequestById;
export const deleteSolicitud = deleteSoli;
