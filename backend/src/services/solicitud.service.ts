import { connect } from "http2";
import prisma from "../config/prisma";

import * as soliTypes from "../types/solicitud.types"
import { da } from "zod/v4/locales/index.cjs";
import { Solicitud } from "@prisma/client";
import { primitiveTypes } from "zod/v4/core/util.cjs";

export const createSolicitud = async (data: soliTypes.CreateSolicitudRequest) => {
    return prisma.solicitud.create({data:{
        cuit: data.cuit,
        estado: data.estado,
        usuario : {connect:{id:data.usuarioId}}
    }});
}

export const createSolicitudWithComplejo = async (data: any) => {
    // Crear la solicitud y luego el complejo asociado
    return prisma.$transaction(async (tx) => {
        // Buscar o crear localidad
        let localidad = await tx.localidad.findFirst({
            where: { nombre: data.complejo.domicilio.localidad }
        });
        
        if (!localidad) {
            localidad = await tx.localidad.create({
                data: { nombre: data.complejo.domicilio.localidad }
            });
        }

        // Crear la solicitud primero
        const nuevaSolicitud = await tx.solicitud.create({
            data: {
                cuit: data.cuit,
                estado: 'PENDIENTE',
                usuarioId: data.usuarioId
            }
        });

        // Crear el domicilio
        const nuevoDomicilio = await tx.domicilio.create({
            data: {
                calle: data.complejo.domicilio.calle,
                altura: parseInt(data.complejo.domicilio.altura),
                localidadId: localidad.id
            }
        });

        // Crear el complejo asociado a la solicitud
        const nuevoComplejo = await tx.complejo.create({
            data: {
                nombre: data.complejo.nombre,
                image: data.complejo.imagen,
                cuit: data.cuit,
                domicilioId: nuevoDomicilio.id,
                usuarioId: data.usuarioId,
                solicitudId: nuevaSolicitud.id
            }
        });

        // Retornar la solicitud completa con todas las relaciones
        return await tx.solicitud.findUnique({
            where: { id: nuevaSolicitud.id },
            include: {
                usuario: true,
                complejo: {
                    include: {
                        domicilio: {
                            include: {
                                localidad: true
                            }
                        }
                    }
                }
            }
        });
    });
};

export const updateSolicitud = async (id: number, data:soliTypes.UpdateSolicitudRequest) =>{
    const soliUpdate:any={
        estado: data.estado,
        evaluador: data.evaluadorId,
    }
    return prisma.solicitud.update({
        where:{id},
        data:soliUpdate,
    });
};

// export async function getAllRequest(): Promise<Solicitud[]> {
//   // Log para confirmar que esta función se está ejecutando
//   console.log('DEBUG: Entrando a getAllRequest en solicitud.service.ts');

//   // Obtenemos todos los campos de las solicitudes, eliminando el 'select'.
//   const solicitudes = await prisma.solicitud.findMany();

//   // Log para ver EXACTAMENTE lo que Prisma devuelve ANTES de enviarlo al controlador.
//   console.log('DEBUG: Datos devueltos por Prisma:', solicitudes);

//   // Transformamos los datos para que coincidan con el tipo de retorno.
//   // Prisma devuelve 'cuit' como BigInt, pero nuestro tipo espera un string.
//   const solicitudesTransformadas = solicitudes.map(s => ({
//     ...s,
//     cuit: s.cuit.toString(),
//   }));

//   return solicitudesTransformadas;
// }



// export async function getAllRequest(): Promise<Solicitud[]> {
//   // Log para confirmar que esta función se está ejecutando
//   console.log('DEBUG: Entrando a getAllRequest en solicitud.service.ts');

//   const solicitudes = await prisma.solicitud.findMany({
//     select: {
//       cuit: true,
//       estado: true,
//       // No incluimos ningún otro campo, por lo que Prisma NO debería devolverlos.
//     }
//   });

//   // Log para ver EXACTAMENTE lo que Prisma devuelve ANTES de enviarlo al controlador.
//   console.log('DEBUG: Datos devueltos por Prisma:', solicitudes);

//   // SOLUCIÓN: Transformamos los datos para que coincidan con el tipo de retorno.
//   // Prisma devuelve 'cuit' como BigInt, pero nuestro tipo 'SolicitudSeleccionada' espera un string.
//   const solicitudesTransformadas = solicitudes.map(s => ({
//     ...s,
//     cuit: s.cuit.toString(),
//   }));

//   return solicitudesTransformadas;
// }

export async function getRequestById (id:number): Promise<Solicitud>{
    const soli = await prisma.solicitud.findUnique({
        where:{id}//no se si tenemos que traer toda la info de la soli o solo cuit-usuario-estado
    });

    if(!soli){
        const error = new Error('solicitud no encontrada');
        (error as any).statusCode = 404;
        throw error;
    };

    return soli;
} 

export async function getAllRequest (): Promise<Solicitud[]>{
    return prisma.solicitud.findMany({
        include: {
            usuario: true,
            admin: true,
            complejo: {
                include: {
                    domicilio: {
                        include: {
                            localidad: true
                        }
                    }
                }
            }
        }
    });
}

export async function deleteSoli(id: number) {
    return prisma.solicitud.delete({where:{id}})
}


// import prisma from '../config/prisma';

import { EstadoSolicitud } from '@prisma/client';
import { createComplejo } from './complejo.service';
import { CreateSolicitudRequest, UpdateSolicitudRequest } from '../types/solicitud.types';

// COMENTADAS TEMPORALMENTE - Hay conflictos con el schema actual
// export async function crearSolicitud(data: CreateSolicitudRequest) {
// 	return prisma.solicitud.create({ data });
// }

// export async function obtenerSolicitudes() {
//   return prisma.solicitud.findMany({
// 		include: { emisor: true, documentos: true }
// 	});
// };

// export async function obtenerSolicitudesPendientes() {
//   return prisma.solicitud.findMany({
// 		where: { estado: EstadoSolicitud.PENDIENTE },
// 		include: { emisor: true, documentos: true }
// 	});
// };

// export async function obtenerSolicitudPorId(id: number) {
//   const solicitud = prisma.solicitud.findUnique({
//     where: { id }
//   });

// 	if (!solicitud) {
//     const error = new Error('Solicitud not Found');
//     (error as any).statusCode = 404;
//     throw error;
//   }
// 	return solicitud;
// };

// export async function evaluarSolicitud(
// 	id: number,
// 	data: UpdateSolicitudRequest
// ) {
// 	const solicitud = await prisma.solicitud.findUnique({
// 		where: { id }
// 	});

// 	if (!solicitud) {
//     const error = new Error('Solicitud not Found');
//     (error as any).statusCode = 404;
//     throw error;
//   }

// 	if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
// 		const error = new Error('La solicitud ya fue evaluada');
//     (error as any).statusCode = 404;
//     throw error;
// 	}

// 	if (data.estado === EstadoSolicitud.APROBADA) {
// 		crearComplejo({
// 			solicitud: { connect: { id } },
// 			duenios: { connect: { id: solicitud.emisorId } },
// 		});
// 	}

// 	return prisma.solicitud.update({
// 		where: { id },
// 		data: {
// 			estado: data.estado,
// 			evaluador: { connect: { id: data.evaluadorId } },
// 		},
// 	});
// }
