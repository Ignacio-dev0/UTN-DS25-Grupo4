import prisma from '../config/prisma';
import { EstadoAlquiler, MetodoPago } from '@prisma/client';
import { CreateAlquilerRequest, PagarAlquilerRequest, UpdateAlquilerRequest } from '../types/alquiler.types';
import { CrearAlquilerData } from '../validations/alquiler.validation';
import { validarLimiteCancelaciones, validarTiempoMinimoCancelacion } from '../utils/reservaValidations';
import { getNowInArgentina } from '../utils/timezone';
import { invalidateMultipleTurnosCache } from './turno.service';
// --- INICIO DE CAMBIOS: Imports para MP Connect ---
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { decrypt } from './encriptacionmp.service'; // Servicio para desencriptar el token del dueño
// --- FIN DE CAMBIOS ---


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
    
    const todosIguales = turnosIds.every(id => id === turnoBase);
    
    if (!todosIguales) {
        console.log('❌ TURNOS DIFERENTES ENVIADOS - Usando lógica de turnos múltiples distintos');
        return await crearAlquilerTurnosDistintos({ usuarioId, turnosIds });
    }
    
    console.log('✅ MISMO TURNO REPETIDO - Creando bloques consecutivos');
    
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
    
    // VALIDACIÓN 2: Verificar que el turno no haya finalizado
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
        const horaInicio = horarioCronograma.horaInicio;
        const horaFin = horarioCronograma.horaFin;
        const duracionMinutos = (horaFin.getUTCHours() * 60 + horaFin.getUTCMinutes()) - 
                               (horaInicio.getUTCHours() * 60 + horaInicio.getUTCMinutes());
        
        console.log(`⏱️ DURACIÓN DEL TURNO (cronograma): ${duracionMinutos} minutos`);
        
        if (duracionMinutos > 0) {
            duracionFinal = duracionMinutos;
        }
    } else {
        console.log('⚠️ NO SE ENCONTRÓ HORARIO EN CRONOGRAMA - Usando duración por defecto de 60 minutos');
    }
    
    console.log(`⏱️ DURACIÓN FINAL: ${duracionFinal} minutos`);

    // Generar turnos consecutivos basados en el turno original
    const turnosConsecutivos = [];
    
    for (let i = 0; i < cantidadBloques; i++) {
        const nuevaHora = new Date(turnoOriginal.horaInicio);
        const minutosOffset = i * duracionFinal;
        
        nuevaHora.setUTCMinutes(nuevaHora.getUTCMinutes() + minutosOffset);
        
        console.log(`🔍 BUSCANDO TURNO CONSECUTIVO ${i + 1}: ${nuevaHora.getUTCHours()}:${nuevaHora.getUTCMinutes().toString().padStart(2, '0')}`);
        
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
    
    const montoTotal = turnosConsecutivos.reduce((sum, t) => sum + t.precio, 0);
    
    // El alquiler se crea siempre en PROGRAMADO, sin pago.
    const dataAlquiler: any = {
        cliente: { connect: { id: usuarioId } },
        turnos: { connect: turnosConsecutivos.map(t => ({ id: t.id })) },
        estado: EstadoAlquiler.PROGRAMADO,
        requierePagoInmediato: requierePagoInmediato
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
    
    // CRUCIAL: Marcar turnos como pendientes de pago (reservado=false)
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
        estado: '⏳ PROGRAMADO (pendiente pago)',
        requierePagoInmediato: requierePagoInmediato,
        monto: montoTotal,
    });

    return nuevoAlquiler;
}

/**
 * Lógica de creación de alquiler para turnos múltiples NO consecutivos (lógica original).
 */
async function crearAlquilerTurnosDistintos(data: CreateAlquilerRequest) {
    const { usuarioId, turnosIds } = data;
    
    const turnos = await prisma.turno.findMany({
        where: { id: { in: turnosIds} },
        include: { cancha: true },
    });

    console.log('🎯 TURNOS ENCONTRADOS:', turnos.length, 'de', turnosIds.length);
    
    if (turnos.length !== turnosIds.length) {
        throw new Error('Algunos turnos no existen');
    }

    const turnosReservados = turnos.filter(t => t.reservado);
    if (turnosReservados.length > 0) {
        throw new Error('Algunos turnos ya están reservados');
    }

    const canchasDistintas = new Set(turnos.map(t => t.cancha.id));
    if (canchasDistintas.size > 1) {
        throw new Error('No se puede seleccionar turnos de distintas canchas');
    }
    
    const fechasDistintas = new Set(turnos.map(t => t.fecha.toDateString()));
    if (fechasDistintas.size > 1) {
        throw new Error('No se puede seleccionar turnos de distintas fechas');
    }
    if (turnos.length > 1) {
        // Validar que los turnos sean consecutivos
        const horariosOrdenados = turnos
        .map(t => ({
            hora: t.horaInicio.getHours() * 60 + t.horaInicio.getMinutes(),
            turnoId: t.id
        }))
        .sort( (a, b) => a.hora - b.hora );
        
        console.log('🔍 VALIDANDO TURNOS CONSECUTIVOS:', horariosOrdenados);
        
        let consecutivos = true;
        
        for(let i = 0; i < horariosOrdenados.length - 1; i++) {
            const diferencia = horariosOrdenados[i + 1].hora - horariosOrdenados[i].hora;
            console.log(`  Gap entre turno ${i} y ${i + 1}: ${diferencia} minutos`);
            
            if (diferencia !== 60) {
                console.log(`  ❌ Gap no válido: ${diferencia} minutos (esperado: 60)`);
                consecutivos = false;
                break;
            }
        }
        
        if (!consecutivos) {
            throw new Error('Los turnos no son consecutivos. Solo se pueden seleccionar turnos en horarios seguidos.');
        }
        
        console.log('✅ TURNOS CONSECUTIVOS VÁLIDOS');
    }

    const precioTotal = turnos.reduce((total, turno) => total + turno.precio, 0);
    console.log('💰 PRECIO TOTAL:', precioTotal, 'para', turnos.length, 'turnos');

    // DETERMINAR SI REQUIERE PAGO INMEDIATO
    const primerTurno = turnos[0];
    const validacionTiempoPago = validarTiempoMinimoCancelacion(primerTurno.fecha, primerTurno.horaInicio);
    const requierePagoInmediato = !validacionTiempoPago.valido;
    const horasRestantes = validacionTiempoPago.horasRestantes || 0;
    
    console.log(`⏰ VALIDACIÓN TIEMPO PAGO:`, {
        horasRestantes: horasRestantes.toFixed(2),
        requierePagoInmediato: requierePagoInmediato
    });

    console.log('💾 CREANDO ALQUILER EN BASE DE DATOS...');
    const dataAlquiler: any = {
        cliente: { connect: { id: usuarioId } },
        turnos: { connect: turnos.map(t => ({ id: t.id })) },
        estado: EstadoAlquiler.PROGRAMADO,
        requierePagoInmediato: requierePagoInmediato
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
    await prisma.turno.updateMany({
        where: { id: { in: turnos.map(t => t.id) } },
        data: { 
            reservado: false, // Siempre false hasta que se pague
            alquilerId: nuevoAlquiler.id 
        }
    });
    
    console.log('✅ ALQUILER CREADO:', {
        id: nuevoAlquiler.id,
        estado: '⏳ PROGRAMADO (pendiente pago)',
        monto: precioTotal,
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
            createdAt: 'desc'
        },
        take: 100
    });

    if (!alquileres) {
        const error = new Error('Alquiler no encontrado');
        (error as any).statusCode = 404;
        throw error;
    }
    
    // Para alquileres cancelados sin turnos, buscar los turnos históricos
    const alquileresConTurnos = await Promise.all(
        alquileres.map(async (alq) => {
            if (alq.estado === EstadoAlquiler.CANCELADO && alq.turnos.length === 0) {
                console.log(`🔍 Alquiler ${alq.id} cancelado sin turnos, buscando historial...`);
                // TODO: Implementar auditlog o campo turnosSnapshot en schema
            }
            return alq;
        })
    );
    
    // Optimización: Obtener reseñas del usuario para las canchas en cuestión
    const canchasIds = alquileresConTurnos
        .filter(alq => alq.turnos.length > 0)
        .map(alq => alq.turnos[0].cancha.id);
    
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

/**
 * Inicia el proceso de pago para un alquiler existente (PROGRAMADO).
 * Crea o reutiliza un registro de Pago y genera una preferencia de Mercado Pago.
 * USA EL TOKEN DEL DUEÑO (MP CONNECT) Y COBRA COMISIÓN.
 */
export async function pagarAlquiler(id: number) {
    const alquiler = await prisma.alquiler.findUnique({
        where: { id },
        include: { 
            turnos: {
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

    if (!alquiler.turnos || alquiler.turnos.length === 0) {
        const error = new Error('Este alquiler no tiene turnos asociados.');
        (error as any).statusCode = 400;
        throw error;
    }
    
    // 2. Obtener los datos del dueño y del complejo
    const primerTurno = alquiler.turnos[0];
    const cancha = primerTurno.cancha;
    const complejo = cancha.complejo;
    const duenio = complejo.usuario; // Este es el Usuario (rol DUENIO)

    const monto = alquiler.turnos.reduce( (acum, t) => acum + t.precio, 0);

    // 3. Buscar o crear el registro de Pago
    let pago = await prisma.pago.findFirst({
        where: { 
            alquilerId: id,
        } 
    });

    if (!pago) {
        console.log(`No existe pago para Alquiler ${id}, creando uno nuevo...`);
        pago = await prisma.pago.create({
            data: {
                monto: monto,
                metodoPago: MetodoPago.MERCADOPAGO,
                alquiler: { connect: { id } },
                estadoPago: 'PENDING'
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

    // 4. Definir URLs
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const notificationUrl = `${apiBaseUrl}/api/webhooks/mercadopago`;

    console.log(`[MP Service] Alquiler ID: ${alquiler.id}, Pago ID: ${pago.id}`);
    console.log(`[MP Service] Webhook URL (Notification): ${notificationUrl}`);

    // --- INICIO LÓGICA MP CONNECT ---
    
    // 5. Verificar y desencriptar el token del DUEÑO
    if (!duenio.mpAccessToken) {
        throw new Error(`El dueño del complejo ${complejo.nombre} no tiene una cuenta de MP conectada.`);
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
        accessToken: duenioAccessToken 
    });
    
    // 7. Definir la comisión de la plataforma (ej: 10%)
    // ¡Asegúrate de que 'monto' sea un número válido!
    const comisionCanchaYa = Math.round((monto * 0.10) * 100) / 100; // Redondear a 2 decimales
    
    // --- FIN LÓGICA MP CONNECT ---

    // 8. Crear la Preferencia en Mercado Pago
    const preference = new Preference(duenioMpClient); // <-- Usar el cliente del DUEÑO
    const mpResponse = await preference.create({ 
        body: {
            items: [
                {
                    id: alquiler.id.toString(),
                    title: `Reserva en ${complejo.nombre}`,
                    description: `Alquiler de ${alquiler.turnos.length} turno(s) (${cancha.nombre || 'Cancha'})`,
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
            marketplace_fee: comisionCanchaYa, // ¡Cobrar la comisión!
            external_reference: alquiler.id.toString(), // Enviamos el ID del Alquiler
            notification_url: `${notificationUrl}?pagoId=${pago.id}&source_news=webhooks`,
            back_urls: {
                success: `${frontendUrl}/mis-reservas?pago=exitoso&alquilerId=${alquiler.id}`, 
                failure: `${frontendUrl}/mis-reservas?pago=fallido&alquilerId=${alquiler.id}`, 
                pending: `${frontendUrl}/mis-reservas?pago=pendiente&alquilerId=${alquiler.id}`,
            },
            auto_return: 'approved',
        }
    });

    console.log(`[MP Service] Preferencia creada: ${mpResponse.id}`);

    // 9. Actualizar nuestro Pago con el *nuevo* ID de preferencia
    await prisma.pago.update({
        where: { id: pago.id },
        data: { mpPreferenceId: mpResponse.id }
    });

    // 10. Devolver el link de pago
    return { init_point: mpResponse.init_point };
}

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
            
            esCancelacionPenalizada = (validacionTiempo.horasRestantes || 0) < 2;
            
            console.log(`✅ Cancelación permitida: ${validacionTiempo.horasRestantes?.toFixed(2)} horas de anticipación`);
            console.log(`📊 ¿Cuenta como cancelación penalizada?: ${esCancelacionPenalizada ? 'SÍ' : 'NO'}`);
        }
        
        (data as any).cancelacionPenalizada = esCancelacionPenalizada;
        
        console.log(`🔓 LIBERANDO TURNOS - Alquiler ${id} cancelado, liberando ${alquiler.turnos.length} turno(s)`);
        
        const canchasAfectadas = [...new Set(alquiler.turnos.map(turno => turno.canchaId))];
        
        // Al cancelar, marcamos los turnos como no reservados
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
        console.log(`🗑️ Invalidando caché para canchas: [${canchasAfectadas.join(', ')}]`);
        invalidateMultipleTurnosCache(canchasAfectadas);
        
        console.log(`✅ TURNOS LIBERADOS - ${alquiler.turnos.length} turno(s) ahora disponibles`);
    }
    
    return await prisma.alquiler.update({
        where: { id },
        data,
    });
}