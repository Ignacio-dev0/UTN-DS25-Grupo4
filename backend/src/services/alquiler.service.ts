import prisma from '../config/prisma';
import { EstadoAlquiler } from '@prisma/client';
import { CreateAlquilerRequest, PagarAlquilerRequest, UpdateAlquilerRequest } from '../types/alquiler.types';

export async function obtenerAlquileresPorComplejo(complejoId: number) {
	return await prisma.alquiler.findMany({
		where: {
			turnos: {
				some: {
					cancha: {
						complejoId: complejoId
					}
				}
			}
		},
		include: {
			cliente: true,
			turnos: {
				include: {
					cancha: true
				}
			}
		},
		orderBy: {
			id: 'desc'
		}
	});
}

export async function crearAlquiler(data: CreateAlquilerRequest) {
	console.log('🔍 CREAR ALQUILER - Datos recibidos:', JSON.stringify(data, null, 2));
	
	const { usuarioId, turnosIds } = data;
	
	console.log('📋 CREAR ALQUILER - Usuario ID:', usuarioId, 'Turnos IDs:', turnosIds);
	
	if (turnosIds.length < 1) {
		throw new Error('Se debe seleccionar al menos un turno');
	}
	if (turnosIds.length > 3) {
		throw new Error('No se puede seleccionar más de tres turnos');
	}
	
	// Si se envía el mismo turno múltiples veces, interpretamos que quiere bloques consecutivos
	const turnoBase = turnosIds[0];
	const cantidadBloques = turnosIds.length;
	
	console.log('🎯 TURNO BASE:', turnoBase, 'BLOQUES SOLICITADOS:', cantidadBloques);
	
	// Verificar que todos los turnos sean el mismo (si envían múltiples)
	const todosIguales = turnosIds.every(id => id === turnoBase);
	
	if (!todosIguales) {
		console.log('❌ TURNOS DIFERENTES ENVIADOS - Usando lógica de turnos múltiples distintos');
		// Usar la lógica original para turnos distintos
		return await crearAlquilerTurnosDistintos({ usuarioId, turnosIds });
	}
	
	console.log('✅ MISMO TURNO REPETIDO - Creando bloques consecutivos');
	
	// Obtener el turno base
	const turnoOriginal = await prisma.turno.findUnique({
		where: { id: turnoBase },
		include: { 
			cancha: {
				include: {
					cronograma: true
				}
			}
		},
	});

	if (!turnoOriginal) {
		console.log('❌ TURNO BASE NO EXISTE');
		throw new Error('El turno seleccionado no existe');
	}

	if (turnoOriginal.reservado) {
		console.log('❌ TURNO BASE YA RESERVADO');
		throw new Error('El turno seleccionado ya está reservado');
	}

	// Buscar la duración del turno en el cronograma
	const horarioCronograma = turnoOriginal.cancha.cronograma.find(c => {
		const horaInicioTurno = turnoOriginal.horaInicio;
		const horaInicioCronograma = c.horaInicio;
		
		return horaInicioTurno.getUTCHours() === horaInicioCronograma.getUTCHours() &&
		       horaInicioTurno.getUTCMinutes() === horaInicioCronograma.getUTCMinutes();
	});

	if (!horarioCronograma) {
		console.log('❌ NO SE ENCONTRÓ HORARIO EN CRONOGRAMA');
		throw new Error('No se pudo determinar la duración del turno');
	}

	// Calcular duración del turno en minutos
	const horaInicio = horarioCronograma.horaInicio;
	const horaFin = horarioCronograma.horaFin;
	const duracionMinutos = (horaFin.getUTCHours() * 60 + horaFin.getUTCMinutes()) - 
	                       (horaInicio.getUTCHours() * 60 + horaInicio.getUTCMinutes());
	
	console.log(`⏱️ DURACIÓN DEL TURNO: ${duracionMinutos} minutos`);

	// Generar turnos consecutivos basados en el turno original
	const turnosConsecutivos = [];
	
	for (let i = 0; i < cantidadBloques; i++) {
		const nuevaHora = new Date(turnoOriginal.horaInicio);
		const minutosOffset = i * duracionMinutos;
		
		// Sumar los minutos de offset
		nuevaHora.setUTCMinutes(nuevaHora.getUTCMinutes() + minutosOffset);
		
		console.log(`🔍 BUSCANDO TURNO CONSECUTIVO ${i + 1}: ${nuevaHora.getUTCHours()}:${nuevaHora.getUTCMinutes().toString().padStart(2, '0')}`);
		
		// Buscar si existe un turno en este horario consecutivo
		const turnoConsecutivo = await prisma.turno.findFirst({
			where: {
				canchaId: turnoOriginal.canchaId,
				fecha: turnoOriginal.fecha,
				horaInicio: nuevaHora
			}
		});
		
		if (!turnoConsecutivo) {
			console.log(`❌ NO EXISTE TURNO CONSECUTIVO para ${nuevaHora.getUTCHours()}:${nuevaHora.getUTCMinutes().toString().padStart(2, '0')}`);
			throw new Error(`No hay disponibilidad para ${cantidadBloques} bloques consecutivos desde este horario`);
		}
		
		if (turnoConsecutivo.reservado) {
			console.log(`❌ TURNO CONSECUTIVO YA RESERVADO para ${nuevaHora.getUTCHours()}:${nuevaHora.getUTCMinutes().toString().padStart(2, '0')}`);
			throw new Error(`Uno de los bloques consecutivos ya está reservado`);
		}
		
		turnosConsecutivos.push(turnoConsecutivo);
	}
	
	console.log('💰 CALCULANDO PRECIO TOTAL...');
	const precioTotal = turnosConsecutivos.reduce((total, turno) => total + turno.precio, 0);
	console.log('💰 PRECIO TOTAL:', precioTotal, 'para', turnosConsecutivos.length, 'bloques');

	console.log('💾 CREANDO ALQUILER EN BASE DE DATOS...');
	const nuevoAlquiler = await prisma.alquiler.create({
		data: {
			cliente: { connect: { id: usuarioId } },
			turnos: { connect: turnosConsecutivos.map(t => ({ id: t.id })) },
		},
		include: {
			turnos: true,
			cliente: {
				select: {
					nombre: true,
					apellido: true,
					correo: true
				}
			}
		}
	});
	
	console.log('✅ ALQUILER CREADO EXITOSAMENTE:', {
		id: nuevoAlquiler.id,
		turnos: nuevoAlquiler.turnos.length,
		cliente: nuevoAlquiler.cliente.nombre + ' ' + nuevoAlquiler.cliente.apellido
	});

	return nuevoAlquiler;
}

// Función auxiliar para manejar turnos distintos (lógica original)
async function crearAlquilerTurnosDistintos(data: CreateAlquilerRequest) {
	const { usuarioId, turnosIds } = data;
	
	const turnos = await prisma.turno.findMany({
		where: { id: { in: turnosIds} },
		include: { cancha: true },
	});

	console.log('🎯 TURNOS ENCONTRADOS:', turnos.length, 'de', turnosIds.length);
	
	if (turnos.length !== turnosIds.length) {
		console.log('❌ ALGUNOS TURNOS NO EXISTEN');
		throw new Error('Algunos turnos no existen');
	}

	const turnosReservados = turnos.filter(t => t.reservado);
	if (turnosReservados.length > 0) {
		console.log('❌ TURNOS YA RESERVADOS:', turnosReservados.map(t => t.id));
		throw new Error('Algunos turnos ya están reservados');
	}

	const canchasDistintas = new Set(turnos.map(t => t.cancha.id));
	if (canchasDistintas.size > 1) {
		console.log('❌ CANCHAS DIFERENTES:', Array.from(canchasDistintas));
		throw new Error('No se puede seleccionar turnos de distintas canchas');
	}
	
	const fechasDistintas = new Set(turnos.map(t => t.fecha.toDateString()));
	if (fechasDistintas.size > 1) {
		console.log('❌ FECHAS DIFERENTES:', Array.from(fechasDistintas));
		throw new Error('No se puede seleccionar turnos de distintas fechas');
	}
	if (turnos.length > 1) {
		/* Validar que los turnos sean consecutivos - permitir múltiples turnos consecutivos */
		const horariosOrdenados = turnos
		.map(t => ({
			hora: t.horaInicio.getHours() * 60 + t.horaInicio.getMinutes(),
			turnoId: t.id
		}))
		.sort( (a, b) => a.hora - b.hora );
		
		console.log('🔍 VALIDANDO TURNOS CONSECUTIVOS:', horariosOrdenados);
		
		let consecutivos = true;
		let maxGapPermitido = 60; // Máximo gap de 60 minutos entre turnos
		
		for(let i = 0; i < horariosOrdenados.length - 1; i++) {
			const diferencia = horariosOrdenados[i + 1].hora - horariosOrdenados[i].hora;
			console.log(`  Gap entre turno ${i} y ${i + 1}: ${diferencia} minutos`);
			
			// Permitir gaps de exactamente 60 minutos (turnos consecutivos de 1 hora)
			if (diferencia !== 60) {
				console.log(`  ❌ Gap no válido: ${diferencia} minutos (esperado: 60)`);
				consecutivos = false;
				break;
			}
		}
		
		if (!consecutivos) {
			console.log('❌ TURNOS NO CONSECUTIVOS - Rechazando alquiler');
			throw new Error('Los turnos no son consecutivos. Solo se pueden seleccionar turnos en horarios seguidos.');
		}
		
		console.log('✅ TURNOS CONSECUTIVOS VÁLIDOS');
	}

	console.log('💰 CALCULANDO PRECIO TOTAL...');
	const precioTotal = turnos.reduce((total, turno) => total + turno.precio, 0);
	console.log('💰 PRECIO TOTAL:', precioTotal, 'para', turnos.length, 'turnos');

	console.log('💾 CREANDO ALQUILER EN BASE DE DATOS...');
	const nuevoAlquiler = await prisma.alquiler.create({
		data: {
			cliente: { connect: { id: usuarioId } },
			turnos: { connect: turnos.map(t => {
				return { id: t.id } }
			)},
		},
		include: {
			turnos: true,
			cliente: {
				select: {
					nombre: true,
					apellido: true,
					correo: true
				}
			}
		}
	});
	
	console.log('✅ ALQUILER CREADO EXITOSAMENTE:', {
		id: nuevoAlquiler.id,
		turnos: nuevoAlquiler.turnos.length,
		cliente: nuevoAlquiler.cliente.nombre + ' ' + nuevoAlquiler.cliente.apellido
	});

	return nuevoAlquiler;
}

export async function obtenerAlquilerPorId(id: number) {
	const alquiler = await prisma.alquiler.findUnique({
		where: { id },
		include: { 
			turnos: {
				include: {
					cancha: {
						include: {
							complejo: true,
							deporte: true
						}
					}
				}
			}, 
			pago: true 
		},
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
		include: { 
			turnos: {
				include: {
					cancha: {
						include: {
							complejo: true,
							deporte: true
						}
					}
				}
			}, 
			pago: true 
		},
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
		include: { 
			turnos: {
				include: {
					cancha: {
						include: {
							complejo: true,
							deporte: true
						}
					}
				}
			}, 
			pago: true 
		},
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