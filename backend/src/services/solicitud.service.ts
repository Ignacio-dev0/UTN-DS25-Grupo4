import prisma from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { EstadoSolicitud } from '../generated/prisma/client';
import { crearComplejo } from './complejo.service';

export const crearSolicitud = (data: Prisma.SolicitudCreateInput) => {
	return prisma.solicitud.create({
		data
	});
}

export const obtenerSolicitudes = () => {
  return prisma.solicitud.findMany({
		include: {
			emisor: true,
			documentos: true
		}
	});
};

export const obtenerSolicitudesPendientes = () => {
  return prisma.solicitud.findMany({
		where: {
			estado: EstadoSolicitud.PENDIENTE
		},
		include: {
			emisor: true,
			documentos: true
		}
	});
};

export const obtenerSolicitudPorId = (id: number) => {
  return prisma.solicitud.findUnique({
    where: { id }
  });
};

export const evaluarSolicitud = async (
	id: number,
	data: Prisma.SolicitudUpdateInput,
	evaluadorId: number
) => {

	const solicitud = await prisma.solicitud.findUnique({
		where: { id }
	});

	if (solicitud === null) {
		throw(`La solicitud de id: ${id} no existe`);
	}

	if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
		throw('La solicitud ya fue evaluada');
	}

	if (data.estado === EstadoSolicitud.APROBADA) {
		crearComplejo({
			solicitud: {
				connect: { id }
			},
			duenios: {
				connect: { id: solicitud.emisorId }
			},
		});
	}

	return prisma.solicitud.update({
		where: { id },
		data: {
			estado: data.estado,
			evaluador: {
				connect: { id: evaluadorId }
			},
		},
	});
}