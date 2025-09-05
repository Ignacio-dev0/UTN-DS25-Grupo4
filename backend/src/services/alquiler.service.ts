import prisma from '../config/prisma';
import { EstadoAlquiler } from '../generated/prisma';
import { CreateAlquilerRequest, PagarAlquilerRequest, UpdateAlquilerRequest } from '../types/alquiler.types';

export async function crearAlquiler(data: CreateAlquilerRequest) {
	const { usuarioId, turnosIds } = data;
	if (turnosIds.length < 1) {
		throw new Error('Se debe seleccionar al menos un turno');
	}
	if (turnosIds.length > 3) {
		throw new Error('No se puede seleccionar más de tres turnos');
	}
	
	const turnos = await prisma.turno.findMany({
		where: { id: { in: turnosIds} },
		include: { cancha: true },
	});

	if (new Set(turnos.map(t => t.cancha)).size > 1) {
		throw new Error('No se puede seleccionar turnos de distintas canchas');
	}
	if (new Set(turnos.map(t => t.fecha)).size > 1) {
		throw new Error('No se puede seleccionar turnos de distintas fechas');
	}
	if (turnos.length > 1) {
		/* Se debería validar de alguna manera que los turnos
		sean consecutivos :/ */
		const horariosOrdenados = turnos
		.map(t => t.horaInicio.getHours() * 60 + t.horaInicio.getMinutes())
		.sort( (a, b) => a - b );
		
		let consecutivos = true;
		for(let i=0; i<horariosOrdenados.length-1; i++) {
			if (horariosOrdenados[i] + 60 < horariosOrdenados[i+1]) {
				consecutivos = false;
			}
		}
		if (!consecutivos) {
			throw new Error('Los turnos no son consecutivos');
		}
	}

	return await prisma.alquiler.create({
		data: {
			cliente: { connect: { id: usuarioId } },
			turnos: { connect: turnos.map(t => {
				return { id: t.id } }
			)},
		}
	});
}

export async function obtenerAlquilerPorId(id: number) {
	const alquiler = await prisma.alquiler.findUnique({
		where: { id },
		include: { turnos: true, pago: true },
	});
	if (!alquiler) {
		const error = new Error('Alquiler no encontrado');
		(error as any).statusCode = 404;
		throw error;
	}
	return alquiler;
}

export async function obtenerAlquileres() {
	const alquiler = await prisma.alquiler.findMany({
		include: { turnos: true, pago: true },
	});

	if (!alquiler) {
		const error = new Error('Alquiler no encontrado');
		(error as any).statusCode = 404;
		throw error;
	}
	return alquiler;
}

export async function obtenerAlquileresPorClienteId(clienteId: number) {
	const alquiler = await prisma.alquiler.findMany({
		where: { clienteId },
		include: { turnos: true, pago: true },
	});

	if (!alquiler) {
		const error = new Error('Alquiler no encontrado');
		(error as any).statusCode = 404;
		throw error;
	}
	return alquiler;
}

export async function pagarAlquiler(id: number, data: PagarAlquilerRequest) {
	const alquiler = await prisma.alquiler.findUnique({
		where: { id },
		include: { turnos: true },
	});

	if (!alquiler) {
		const error = new Error('Alquiler no encontrado');
		(error as any).statusCode = 404;
		throw error;
	}

	if (alquiler.estado !== EstadoAlquiler.PROGRAMADO) {
		const error = new Error(`Alquiler debe estar en estado PROGRAMADO`);
		(error as any).statusCode = 400;
		throw error;
	}

	const monto = alquiler.turnos.reduce( (acum, t) => acum + t.precio, 0)

	return await prisma.$transaction([
		prisma.pago.create({
			data: {
				codigoTransaccion: data.codigoTransaccion,
				metodoPago: data.metodoPago,
				monto,
				alquiler: { connect: { id } },
			}
		}),

		prisma.alquiler.update({
			where: { id },
			data: {
				estado: EstadoAlquiler.PAGADO,
			}
		})

	]);

}

export async function actualizarAlquiler(id: number, data: UpdateAlquilerRequest) {
	const alquiler = await prisma.alquiler.findUnique({
		where: { id },
	});

	if (!alquiler) {
		const error = new Error('Alquiler no encontrado');
		(error as any).statusCode = 404;
		throw error;
	}

	if (alquiler.estado === EstadoAlquiler.CANCELADO || alquiler.estado === EstadoAlquiler.FINALIZADO) {
		const error = new Error('Alquiler no puede cancelarse');
		(error as any).statusCode = 400;
		throw error;
	}

	/* En un futuro se deberán realizar las validaciones correspondientes acá mismo */
	
	return await prisma.alquiler.update({
		where: { id },
		data,
	});
}