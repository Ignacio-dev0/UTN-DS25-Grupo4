import prisma from "../config/prisma";

import { Prisma } from "../generated/prisma/client";

export const createSolicitud = async (data: Prisma.SolicitudCreateInput) => {
    return prisma.solicitud.create({data});
}



// import prisma from '../config/prisma';

// import { EstadoSolicitud } from '../generated/prisma';
// import { crearComplejo } from './complejo.service';
// import { CreateSolicitudRequest, UpdateSolicitudRequest } from '../types/solicitud.types';

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
// 			evaluador: { connect: { id: data.evaluador.id } },
// 		},
// 	});
// }
