import prisma from '../config/prisma';
import { EstadoAlquiler, MetodoPago } from '@prisma/client';
import { CreateAlquilerRequest, PagarAlquilerRequest, UpdateAlquilerRequest } from '../types/alquiler.types';
import { CrearAlquilerData } from '../validations/alquiler.validation';
import { validarLimiteCancelaciones, validarTiempoMinimoCancelacion } from '../utils/reservaValidations';
import { getNowInArgentina } from '../utils/timezone';
import { invalidateMultipleTurnosCache } from './turno.service';
// a ver si funca el mp
// --- NUEVO: Imports para Mercado Pago ---
import { mercadopago } from '../app'; // Importamos el cliente global de MP
import { Preference } from 'mercadopago'; // Importamos los tipos de MP
// --- FIN NUEVO ---


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

export async function crearAlquiler(usuarioId: number, data: CrearAlquilerData) {
  const { turnosIds } = data;

  if (turnosIds.length < 1) {
		throw new Error('Se debe seleccionar al menos un turno');
	}
	if (turnosIds.length > 3) {
		throw new Error('No se puede seleccionar más de tres turnos');
	}
	
	// VALIDACIÓN 1: Verificar límite de cancelaciones del usuario (máximo 2 en los últimos 30 días)
	const hace30Dias = new Date(getNowInArgentina());
	hace30Dias.setDate(hace30Dias.getDate() - 30);
	
	const cancelacionesRecientes = await prisma.alquiler.count({
		where: {
			clienteId: usuarioId,
			estado: EstadoAlquiler.CANCELADO,
			createdAt: {
				gte: hace30Dias
			}
		}
	});
	
	const validacionCancelaciones = validarLimiteCancelaciones(cancelacionesRecientes, 2);
	if (!validacionCancelaciones.valido) {
		console.log(`❌ Usuario ${usuarioId} bloqueado por exceso de cancelaciones: ${cancelacionesRecientes}`);
		throw new Error(validacionCancelaciones.mensaje);
	}
	
	console.log(`✅ Usuario ${usuarioId} tiene ${cancelacionesRecientes} cancelaciones en los últimos 30 días`);
	
	// Si se envía el mismo turno múltiples veces, interpretamos que quiere bloques consecutivos
	const turnoBase = turnosIds[0];
	const cantidadBloques = turnosIds.length;
	
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
	
	// VALIDACIÓN 2: Verificar que el turno no haya finalizado (permitir reservar hasta el inicio del turno)
	const ahora = getNowInArgentina();
	const fechaHoraTurno = new Date(
		turnoOriginal.fecha.getFullYear(),
		turnoOriginal.fecha.getMonth(),
		turnoOriginal.fecha.getDate(),
		turnoOriginal.horaInicio.getHours(),
		turnoOriginal.horaInicio.getMinutes()
	);
	
	const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
	const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
	
	if (diferenciaHoras < 0) {
		console.log(`❌ Turno ya finalizado: ${Math.abs(diferenciaHoras).toFixed(2)} horas atrás`);
		throw new Error('No puedes reservar un turno que ya finalizó');
	}
	
	console.log(`✅ Turno disponible: Inicia en ${diferenciaHoras.toFixed(2)} horas`);

	// Buscar la duración del turno en el cronograma
	const horarioCronograma = turnoOriginal.cancha.cronograma.find(c => {
		const horaInicioTurno = turnoOriginal.horaInicio;
		const horaInicioCronograma = c.horaInicio;
		
		return horaInicioTurno.getUTCHours() === horaInicioCronograma.getUTCHours() &&
		       horaInicioTurno.getUTCMinutes() === horaInicioCronograma.getUTCMinutes();
	});

	let duracionFinal = 60; // Duración por defecto: 60 minutos

	if (horarioCronograma) {
		// Si hay cronograma, calcular duración del turno en minutos usando horaFin - horaInicio
		const horaInicio = horarioCronograma.horaInicio;
		const horaFin = horarioCronograma.horaFin;
		const duracionMinutos = (horaFin.getUTCHours() * 60 + horaFin.getUTCMinutes()) - 
		                       (horaInicio.getUTCHours() * 60 + horaInicio.getUTCMinutes());
		
		console.log(`⏱️ DURACIÓN DEL TURNO (cronograma): ${duracionMinutos} minutos (${horaInicio.getUTCHours()}:${horaInicio.getUTCMinutes().toString().padStart(2, '0')} - ${horaFin.getUTCHours()}:${horaFin.getUTCMinutes().toString().padStart(2, '0')})`);
		
		// Si la duración es válida, usarla
		if (duracionMinutos > 0) {
			duracionFinal = duracionMinutos;
		}
	} else {
		console.log('⚠️ NO SE ENCONTRÓ HORARIO EN CRONOGRAMA - Usando duración por defecto de 60 minutos');
		console.log('🔍 HORARIOS DISPONIBLES EN CRONOGRAMA:', turnoOriginal.cancha.cronograma.map(c => ({
			horaInicio: c.horaInicio,
			horaFin: c.horaFin
		})));
		console.log('🔍 HORA DEL TURNO:', turnoOriginal.horaInicio);
	}
	
	console.log(`⏱️ DURACIÓN FINAL: ${duracionFinal} minutos`);

	// Generar turnos consecutivos basados en el turno original
	const turnosConsecutivos = [];
	
	for (let i = 0; i < cantidadBloques; i++) {
		const nuevaHora = new Date(turnoOriginal.horaInicio);
		const minutosOffset = i * duracionFinal;
		
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
	
	// DETERMINAR SI REQUIERE PAGO INMEDIATO (menos de 2 horas de anticipación)
	const primerTurno = turnosConsecutivos[0];
	const validacionTiempoPago = validarTiempoMinimoCancelacion(primerTurno.fecha, primerTurno.horaInicio);
	const requierePagoInmediato = !validacionTiempoPago.valido; // Si no hay 2 horas, requiere pago inmediato
	const horasRestantes = validacionTiempoPago.horasRestantes || 0;
	
	console.log(`⏰ VALIDACIÓN TIEMPO PAGO:`, {
		horasRestantes: horasRestantes.toFixed(2),
		requierePagoInmediato: requierePagoInmediato ? '✅ SÍ (PAGO INMEDIATO REQUERIDO)' : '❌ NO (PUEDE PAGAR DESPUÉS)'
	});
	
	// Calcular monto total
	const montoTotal = turnosConsecutivos.reduce((sum, t) => sum + t.precio, 0);
	
	// NUEVO FLUJO: SIEMPRE crear en PROGRAMADO sin pago
	// El frontend mostrará el modal de pago inmediatamente si requierePagoInmediato=true
	const dataAlquiler: any = {
		cliente: { connect: { id: usuarioId } },
		turnos: { connect: turnosConsecutivos.map(t => ({ id: t.id })) },
		estado: EstadoAlquiler.PROGRAMADO, // Siempre PROGRAMADO al crear
		requierePagoInmediato: requierePagoInmediato // Flag para que frontend sepa si mostrar modal
	};
	
	const nuevoAlquiler = await prisma.alquiler.create({
		data: dataAlquiler,
		include: {
			turnos: true,
			cliente: {
				select: {
					nombre: true,
					apellido: true,
					email: true
				}
			},
			pago: true
		}
	});
	
	// CRUCIAL: Marcar turnos como reservado=false (pendiente de pago)
	// El pago se confirma en un paso posterior (desde frontend)
	await prisma.turno.updateMany({
		where: {
			id: { in: turnosConsecutivos.map(t => t.id) }
		},
		data: {
			alquilerId: nuevoAlquiler.id,
			reservado: false // Siempre false hasta que se pague
		}
	});
	
	console.log('✅ ALQUILER CREADO:', {
		id: nuevoAlquiler.id,
		turnos: nuevoAlquiler.turnos.length,
		cliente: nuevoAlquiler.cliente.nombre + ' ' + nuevoAlquiler.cliente.apellido,
		estado: '⏳ PROGRAMADO (pendiente pago)',
		requierePagoInmediato: requierePagoInmediato,
		monto: montoTotal,
		horasRestantes: horasRestantes.toFixed(2),
		mensaje: requierePagoInmediato ? 
			'🚨 FRONTEND DEBE MOSTRAR MODAL DE PAGO INMEDIATAMENTE' : 
			'✅ Usuario puede pagar después desde Mis Reservas'
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

	// DETERMINAR SI REQUIERE PAGO INMEDIATO (menos de 2 horas de anticipación)
	const primerTurno = turnos[0];
	const validacionTiempoPago = validarTiempoMinimoCancelacion(primerTurno.fecha, primerTurno.horaInicio);
	const requierePagoInmediato = !validacionTiempoPago.valido;
	const horasRestantes = validacionTiempoPago.horasRestantes || 0;
	
	console.log(`⏰ VALIDACIÓN TIEMPO PAGO:`, {
		horasRestantes: horasRestantes.toFixed(2),
		requierePagoInmediato: requierePagoInmediato ? '✅ SÍ (PAGO INMEDIATO REQUERIDO)' : '❌ NO (PUEDE PAGAR DESPUÉS)'
	});

	console.log('💾 CREANDO ALQUILER EN BASE DE DATOS...');
	const dataAlquiler: any = {
		cliente: { connect: { id: usuarioId } },
		turnos: { connect: turnos.map(t => ({ id: t.id })) },
		estado: EstadoAlquiler.PROGRAMADO, // Siempre PROGRAMADO al crear
		requierePagoInmediato: requierePagoInmediato // Flag para que frontend sepa si mostrar modal
	};
	
	const nuevoAlquiler = await prisma.alquiler.create({
		data: dataAlquiler,
		include: {
			turnos: true,
			cliente: {
				select: {
					nombre: true,
					apellido: true,
					email: true
				}
			},
			pago: true
		}
	});
	
	// IMPORTANTE: Marcar turnos como reservado=false (pendiente de pago)
	console.log('🔒 MARCANDO TURNOS...');
	await prisma.turno.updateMany({
		where: { id: { in: turnos.map(t => t.id) } },
		data: { 
			reservado: false, // Siempre false hasta que se pague
			alquilerId: nuevoAlquiler.id 
		}
	});
	console.log(`✅ TURNOS MARCADOS: reservado=false (pendiente pago)`);
	
	console.log('✅ ALQUILER CREADO:', {
		id: nuevoAlquiler.id,
		turnos: nuevoAlquiler.turnos.length,
		cliente: nuevoAlquiler.cliente.nombre + ' ' + nuevoAlquiler.cliente.apellido,
		estado: '⏳ PROGRAMADO (pendiente pago)',
		requierePagoInmediato: requierePagoInmediato,
		monto: precioTotal,
		horasRestantes: horasRestantes.toFixed(2),
		mensaje: requierePagoInmediato ? 
			'🚨 FRONTEND DEBE MOSTRAR MODAL DE PAGO INMEDIATAMENTE' : 
			'✅ Usuario puede pagar después desde Mis Reservas'
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
	const alquileres = await prisma.alquiler.findMany({
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
			pago: true,
			resenia: true // Incluir reseña para verificar si ya fue reseñado
		},
		orderBy: {
			createdAt: 'desc' // Más recientes primero
		},
		take: 100 // Limitar a los últimos 100 alquileres
	});

	if (!alquileres) {
		const error = new Error('Alquiler no encontrado');
		(error as any).statusCode = 404;
		throw error;
	}
	
	// Para alquileres cancelados sin turnos, buscar los turnos históricos
	// (esto ocurre porque al cancelar se desvincula alquilerId)
	const alquileresConTurnos = await Promise.all(
		alquileres.map(async (alq) => {
			// Si el alquiler está cancelado y no tiene turnos, buscar turnos históricos
			if (alq.estado === EstadoAlquiler.CANCELADO && alq.turnos.length === 0) {
				console.log(`🔍 Alquiler ${alq.id} cancelado sin turnos, buscando historial...`);
				
				// Buscar en el log de turnos (auditoria) o reconstruir desde createdAt
				// Por ahora, simplemente logueamos que está vacío
				// TODO: Implementar auditlog o campo turnosSnapshot en schema
			}
			
			return alq;
		})
	);
	
	// Optimización: Hacer una sola consulta para obtener todas las canchas con reseñas del usuario
	// en lugar de hacer una consulta por cada alquiler
	const canchasIds = alquileresConTurnos
		.filter(alq => alq.turnos.length > 0)
		.map(alq => alq.turnos[0].cancha.id);
	
	// Obtener todas las reseñas del usuario para las canchas en cuestión (una sola query)
	const reseñasUsuario = canchasIds.length > 0 ? await prisma.resenia.findMany({
		where: {
			alquiler: {
				clienteId: clienteId,
				turnos: {
					some: {
						canchaId: {
							in: canchasIds
						}
					}
				}
			}
		},
		include: {
			alquiler: {
				include: {
					turnos: {
						select: {
							canchaId: true
						}
					}
				}
			}
		}
	}) : [];
	
	// Crear un Set con las canchas que ya tienen reseña
	const canchasConReseña = new Set(
		reseñasUsuario.flatMap(r => r.alquiler.turnos.map(t => t.canchaId))
	);
	
	// Mapear los alquileres con la información de reseña
	const alquileresConInfoReseña = alquileresConTurnos.map(alq => {
		if (alq.turnos.length === 0) return { ...alq, usuarioYaReseñoCancha: false };
		
		const canchaId = alq.turnos[0].cancha.id;
		return {
			...alq,
			usuarioYaReseñoCancha: canchasConReseña.has(canchaId)
		};
	});
	
	return alquileresConInfoReseña;
}

// ... (otros imports)// <-- 1. AÑADIR IMPORT

// ... (resto de tus funciones: obtenerAlquileresPorComplejo, crearAlquiler, etc.)

// vvv REEMPLAZAR ESTA FUNCIÓN vvv
// En backend/src/services/alquiler.service.ts
// ... (imports)

// vvv REEMPLAZA ESTA FUNCIÓN ENTERA vvv
export async function pagarAlquiler(id: number) {
    const alquiler = await prisma.alquiler.findUnique({
        where: { id },
        include: { 
            turnos: {
                include: {
                    cancha: {
                        include: {
                            complejo: true
                        }
                    }
                }
            }, 
            cliente: true 
        },
    });

    if (!alquiler) {
        const error = new Error('Alquiler no encontrado');
        (error as any).statusCode = 404;
        throw error;
    }

    if (alquiler.estado !== EstadoAlquiler.PROGRAMADO) {
        const error = new Error(`El alquiler ya está pagado o fue cancelado.`);
        (error as any).statusCode = 400;
        throw error;
    }

    // --- CORRECCIÓN 1: Obtener el primer turno y sus datos ---
    if (!alquiler.turnos || alquiler.turnos.length === 0) {
      const error = new Error('Este alquiler no tiene turnos asociados.');
      (error as any).statusCode = 400;
      throw error;
    }
    const primerTurno = alquiler.turnos[0];
    const cancha = primerTurno.cancha;
    const complejo = cancha.complejo;
    // --- FIN CORRECCIÓN 1 ---

    const monto = alquiler.turnos.reduce( (acum, t) => acum + t.precio, 0)

    // 1. Buscar si ya existe un pago PENDIENTE para este alquiler
    let pago = await prisma.pago.findFirst({
        where: { 
          alquilerId: id,
        } 
    });

    // 2. Si no existe pago, crearlo.
    if (!pago) {
        console.log(`No existe pago para Alquiler ${id}, creando uno nuevo...`);
        pago = await prisma.pago.create({
            data: {
                monto: monto,
                metodoPago: MetodoPago.MERCADOPAGO,
                alquiler: { connect: { id } },
                estadoPago: 'PENDING' // Estado inicial
            }
        });
    } else {
        console.log(`Pago ${pago.id} ya existe para Alquiler ${id}, re-usándolo...`);
        if (pago.monto !== monto) {
          pago = await prisma.pago.update({
            where: { id: pago.id },
            data: { monto: monto }
          });
        }
    }

    // 3. Definir URLs
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // --- CORRECCIÓN 2: Usar la variable de entorno API_BASE_URL ---
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const notificationUrl = `${apiBaseUrl}/api/webhooks/mercadopago`;
    // --- FIN CORRECCIÓN 2 ---

    console.log(`[MP Service] Alquiler ID: ${alquiler.id}, Pago ID: ${pago.id}`);
    console.log(`[MP Service] Frontend URL (Back URLs): ${frontendUrl}`);
    console.log(`[MP Service] Webhook URL (Notification): ${notificationUrl}`);

    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error("MP_ACCESS_TOKEN no está configurado");
    }

    // 4. Crear la Preferencia en Mercado Pago
    const preference = new Preference(mercadopago);
    const mpResponse = await preference.create({ 
      body: {
        items: [
          {
            id: alquiler.id.toString(),
            // --- CORRECCIÓN 1 (continuación) ---
            title: `Reserva en ${complejo.nombre}`,
            description: `Alquiler de ${alquiler.turnos.length} turno(s) (${cancha.nombre || 'Cancha'})`,
            // --- FIN CORRECCIÓN 1 ---
            quantity: 1,
            unit_price: monto,
            currency_id: 'ARS', 
          }
        ],
        payer: {
          name: alquiler.cliente.nombre,
          surname: alquiler.cliente.apellido,
          email: alquiler.cliente.email,
        },
        external_reference: alquiler.id.toString(), // Enviamos el ID de *nuestro* Pago
        notification_url: `${notificationUrl}?pagoId=${pago.id}&source_news=webhooks`,
        back_urls: {
          success: `${frontendUrl}/mis-reservas?pago=exitoso&alquilerId=${alquiler.id}`, 
          failure: `${frontendUrl}/mis-reservas?pago=fallido&alquilerId=${alquiler.id}`, 
          pending: `${frontendUrl}/mis-reservas?pago=pendiente&alquilerId=${alquiler.id}`,
        },
        auto_return: 'approved', // Redirige solo si es aprobado
      }
    });

    console.log(`[MP Service] Preferencia creada: ${mpResponse.id}`);

    // 5. Actualizar nuestro Pago con el *nuevo* ID de preferencia
    await prisma.pago.update({
        where: { id: pago.id },
        data: { mpPreferenceId: mpResponse.id }
    });

    // 6. Devolver el link de pago
    return { init_point: mpResponse.init_point };
}
// ^^^ REEMPLAZA HASTA AQUÍ ^^^


export async function actualizarAlquiler(id: number, data: UpdateAlquilerRequest) {
	const alquiler = await prisma.alquiler.findUnique({
		where: { id },
		include: { turnos: true }
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

	// VALIDACIÓN: Si se está cancelando, verificar tiempo mínimo (2 horas antes)
	if (data.estado === EstadoAlquiler.CANCELADO) {
		console.log(`🕐 Validando tiempo para cancelación del alquiler ${id}...`);
		
		// Obtener el primer turno (el más cercano)
		const primerTurno = alquiler.turnos[0];
		
		let esCancelacionPenalizada = false;
		
		if (primerTurno) {
			const validacionTiempo = validarTiempoMinimoCancelacion(primerTurno.fecha, primerTurno.horaInicio);
			
			if (!validacionTiempo.valido) {
				console.log(`❌ Cancelación muy cercana: ${validacionTiempo.horasRestantes?.toFixed(2)} horas`);
				const error = new Error(validacionTiempo.mensaje || 'No puedes cancelar con menos de 2 horas de anticipación');
				(error as any).statusCode = 400;
				throw error;
			}
			
			// NUEVA LÓGICA: La cancelación NO cuenta si se hace con 2+ horas de anticipación
			// Solo penaliza si alguien intenta forzar cancelación muy cercana (aunque está bloqueado arriba)
			esCancelacionPenalizada = (validacionTiempo.horasRestantes || 0) < 2;
			
			console.log(`✅ Cancelación permitida: ${validacionTiempo.horasRestantes?.toFixed(2)} horas de anticipación`);
			console.log(`📊 ¿Cuenta como cancelación penalizada?: ${esCancelacionPenalizada ? 'SÍ' : 'NO'}`);
		}
		
		// Agregar el flag de penalización a los datos de actualización
		(data as any).cancelacionPenalizada = esCancelacionPenalizada;
		
		console.log(`🔓 LIBERANDO TURNOS - Alquiler ${id} cancelado, liberando ${alquiler.turnos.length} turno(s)`);
		console.log(`📋 Turnos a liberar:`, alquiler.turnos.map(t => ({ id: t.id, canchaId: t.canchaId })));
		
		// Obtener las canchas afectadas para invalidar su caché
		const canchasAfectadas = [...new Set(alquiler.turnos.map(turno => turno.canchaId))];
		console.log(`🎯 Canchas afectadas para invalidar caché:`, canchasAfectadas);
		
		// ESTRATEGIA: Mantener alquilerId para historial, pero marcar reservado=false
		// El frontend debe verificar el estado del alquiler (CANCELADO) para determinar disponibilidad
		// CAMBIO: Solo marcar los turnos como no reservados
		// NO eliminamos alquilerId para mantener el historial de la cancelación
		await prisma.turno.updateMany({
			where: {
				alquilerId: id
			},
			data: {
				reservado: false
				// Mantenemos alquilerId para que el historial funcione
			}
		});
		
		// Invalidar el caché de las canchas afectadas
		console.log(`🗑️ Invalidando caché ANTES...`);
		invalidateMultipleTurnosCache(canchasAfectadas);
		console.log(`🗑️ Cache invalidado para ${canchasAfectadas.length} cancha(s): [${canchasAfectadas.join(', ')}]`);
		
		console.log(`✅ TURNOS LIBERADOS - ${alquiler.turnos.length} turno(s) ahora disponibles (mantienen referencia al alquiler cancelado)`);
		console.log(`ℹ️  Los turnos mantienen alquilerId=${id} para historial. Frontend debe verificar estado del alquiler.`);
	}
	
	return await prisma.alquiler.update({
		where: { id },
		data,
	});
}