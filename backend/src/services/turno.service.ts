import { number } from 'zod';
import prisma from '../config/prisma';
import { Turno} from '@prisma/client';
import { CreateTurno, UpdateTurno } from '../types/turno.types';
import { getNowInArgentina, getTodayStartInArgentina } from '../utils/timezone';

// Cache simple en memoria para turnos por cancha
interface CacheEntry {
    data: Turno[];
    timestamp: number;
}

const turnosCache = new Map<number, CacheEntry>();
const CACHE_DURATION = 30000; // 30 segundos

// Función para limpiar cache expirado
function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of turnosCache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
            turnosCache.delete(key);
        }
    }
}

// Función para generar turnos basados en el cronograma
// Genera turnos para los próximos 8 días (7 para clientes + 1 extra para el dueño)
export async function generarTurnosDesdeHoy() {
    const hoy = getTodayStartInArgentina();
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(hoy.getDate() + 8); // 8 días hacia adelante (incluye hoy)

    console.log(`🔄 Generando turnos desde ${hoy.toISOString()} hasta ${fechaLimite.toISOString()}`);
    console.log(`🕐 Hora actual en Argentina: ${getNowInArgentina().toISOString()}`);

    // Obtener todas las canchas con sus cronogramas
    const canchas = await prisma.cancha.findMany({
        where: {
            activa: true // Solo canchas activas
        },
        include: {
            cronograma: true,
            complejo: true,
            horariosDeshabilitados: true // Incluir horarios deshabilitados permanentemente
        }
    });

    console.log(`📊 Procesando ${canchas.length} canchas activas`);

    const turnosACrear = [];

    for (const cancha of canchas) {
        for (let dia = 0; dia < 8; dia++) { // 8 días en total
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() + dia);
            fecha.setHours(0, 0, 0, 0);
            
            const diaSemana = getDiaSemanaEnum(fecha.getDay());
            
            // Filtrar cronogramas para este día
            const cronogramasDelDia = cancha.cronograma.filter(c => c.diaSemana === diaSemana);
            
            for (const cronograma of cronogramasDelDia) {
                // Verificar si este horario está deshabilitado permanentemente
                // Convertir horaInicio a string en formato "HH:00"
                const horaString = `${String(cronograma.horaInicio.getUTCHours()).padStart(2, '0')}:00`;
                
                const horarioDeshabilitado = cancha.horariosDeshabilitados.find(hd => 
                    hd.dia === diaSemana && 
                    hd.hora === horaString
                );
                
                if (horarioDeshabilitado) {
                    console.log(`⏭️ Saltando turno deshabilitado: Cancha ${cancha.id}, ${diaSemana}, ${horaString}`);
                    continue; // No crear turno si está deshabilitado permanentemente
                }
                
                // Verificar si el turno ya existe
                const fechaSiguienteDia = new Date(fecha);
                fechaSiguienteDia.setDate(fechaSiguienteDia.getDate() + 1);

                const turnoExistente = await prisma.turno.findFirst({
                    where: {
                        canchaId: cancha.id,
                        fecha: {
                            gte: fecha,
                            lt: fechaSiguienteDia
                        },
                        horaInicio: cronograma.horaInicio
                    }
                });

                // Solo crear turno si NO existe
                // Si existe pero está deshabilitado temporalmente, NO lo regeneramos (debe permanecer deshabilitado)
                if (!turnoExistente) {
                    turnosACrear.push({
                        fecha: fecha,
                        horaInicio: cronograma.horaInicio,
                        precio: cronograma.precio || 5000, // Usar precio del cronograma o defecto
                        reservado: false,
                        deshabilitado: false, // Por defecto no está deshabilitado temporalmente
                        canchaId: cancha.id
                    });
                }
                // Si turnoExistente.deshabilitado === true, NO hacemos nada (respetamos el estado deshabilitado)
            }
        }
    }

    if (turnosACrear.length > 0) {
        await prisma.turno.createMany({
            data: turnosACrear,
            skipDuplicates: true // Evitar duplicados por si acaso
        });
        console.log(`✅ Se crearon ${turnosACrear.length} nuevos turnos`);
    } else {
        console.log(`ℹ️ No hay turnos nuevos para crear`);
    }

    return turnosACrear.length;
}

// Función auxiliar para convertir número de día a enum
function getDiaSemanaEnum(diaSemana: number) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[diaSemana];
}

export async function createTurno(data: CreateTurno): Promise<Turno>{
    const created = await prisma.turno.create({
        data:{
            fecha: data.fecha,
            horaInicio: data.horaInicio,
            precio:data.precio,
            cancha:{
                connect:{id:data.canchaId}
            }
        }
    })

    return created
}

export async function getAllTurnos(): Promise<Turno[]> {
    const turnos = await prisma.turno.findMany({
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return turnos;
}

export async function getTurnoById(id: number): Promise<Turno | null> {
    const turno = await prisma.turno.findUnique({
        where: { id },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return turno;
}

export async function getTurnosByCancha(canchaId: number): Promise<Turno[]> {
    try {
        console.log(`🔍 Servicio: Buscando turnos para cancha ${canchaId}`);
        
        // Limpiar cache expirado
        cleanExpiredCache();
        
        // Verificar si existe en cache y no ha expirado
        const cached = turnosCache.get(canchaId);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            console.log(`⚡ Cache hit: Devolviendo ${cached.data.length} turnos desde cache para cancha ${canchaId}`);
            return cached.data;
        }
        
        console.log(`💾 Cache miss: Consultando base de datos para cancha ${canchaId}`);
        
        // Consulta optimizada con select específico en lugar de include
        const turnos = await prisma.turno.findMany({
            where: { canchaId },
            select: {
                id: true,
                fecha: true,
                horaInicio: true,
                precio: true,
                reservado: true,
                deshabilitado: true,
                alquilerId: true,
                canchaId: true,
                cancha: {
                    select: {
                        id: true,
                        nombre: true,
                        nroCancha: true,
                        complejo: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { fecha: 'asc' },
                { horaInicio: 'asc' }
            ]
        });
        
        // Guardar en cache
        turnosCache.set(canchaId, {
            data: turnos as Turno[],
            timestamp: Date.now()
        });
        
        console.log(`✅ Servicio: Encontrados ${turnos.length} turnos para cancha ${canchaId} (guardado en cache)`);
        if (turnos.length > 0) {
            console.log(`📅 Primer turno: ${turnos[0].fecha} a las ${turnos[0].horaInicio}`);
            console.log(`📅 Último turno: ${turnos[turnos.length - 1].fecha} a las ${turnos[turnos.length - 1].horaInicio}`);
        }
        
        return turnos as Turno[];
        
    } catch (error) {
        console.error(`❌ Servicio: Error buscando turnos para cancha ${canchaId}:`, error);
        throw error;
    }
}

export async function updateTurno(id: number, data: UpdateTurno): Promise<Turno> {
    // Construir el objeto de actualización dinámicamente
    const updateData: any = {};
    
    if (data.fecha !== undefined) updateData.fecha = data.fecha;
    if (data.horaInicio !== undefined) updateData.horaInicio = data.horaInicio;
    if (data.precio !== undefined) updateData.precio = data.precio;
    if (data.reservado !== undefined) updateData.reservado = data.reservado;
    if (data.deshabilitado !== undefined) updateData.deshabilitado = data.deshabilitado;
    
    // alquilerId puede ser null, number o undefined
    if (data.alquilerId !== undefined) {
        updateData.alquilerId = data.alquilerId;
    }
    
    if (data.canchaId) {
        updateData.cancha = {
            connect: { id: data.canchaId }
        };
    }
    
    const updated = await prisma.turno.update({
        where: { id },
        data: updateData,
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    
    // Log para debug
    if (data.deshabilitado !== undefined) {
        console.log(`✅ Turno ${id} actualizado: deshabilitado = ${data.deshabilitado}`);
    }
    
    return updated;
}

export async function deleteTurno(id: number): Promise<Turno> {
    const deleted = await prisma.turno.delete({
        where: { id },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    return deleted;
}

export async function getTurnosPorSemana(canchaId: number, semanaOffset: number = 0): Promise<Turno[]> {
    try {
        console.log(`🔍 Servicio getTurnosPorSemana: cancha ${canchaId}, semana offset ${semanaOffset}`);
        
        // Calcular fechas de inicio y fin de la semana EN ARGENTINA
        const hoy = getTodayStartInArgentina();
        
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() + (semanaOffset * 7));
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 7);
        
        console.log(`📅 Rango de fechas (Argentina): ${inicioSemana.toISOString()} hasta ${finSemana.toISOString()}`);
        console.log(`🕐 Hora actual en Argentina: ${getNowInArgentina().toISOString()}`);
        
        const turnos = await prisma.turno.findMany({
            where: {
                canchaId,
                fecha: {
                    gte: inicioSemana,
                    lt: finSemana
                }
            },
            select: {
                id: true,
                fecha: true,
                horaInicio: true,
                precio: true,
                reservado: true,
                deshabilitado: true,
                alquilerId: true,
                canchaId: true,
                cancha: {
                    select: {
                        id: true,
                        nombre: true,
                        nroCancha: true,
                        complejo: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { fecha: 'asc' },
                { horaInicio: 'asc' }
            ]
        });
        
        console.log(`✅ Servicio: Encontrados ${turnos.length} turnos para semana ${semanaOffset}`);
        if (turnos.length > 0) {
            console.log(`📅 Primer turno: ${turnos[0].fecha} a las ${turnos[0].horaInicio}`);
            console.log(`📅 Último turno: ${turnos[turnos.length - 1].fecha} a las ${turnos[turnos.length - 1].horaInicio}`);
        }
        
        return turnos as Turno[];
        
    } catch (error) {
        console.error(`❌ Servicio: Error en getTurnosPorSemana:`, error);
        throw error;
    }
}

/**
 * Obtener todos los turnos con pago pendiente (alquilerId presente pero reservado=false)
 * Estos turnos deben ser liberados si han pasado 2 horas desde la hora del turno
 */
export async function getTurnosConPagoPendiente() {
    return await prisma.turno.findMany({
        where: {
            alquilerId: { not: null },
            reservado: false // Pago pendiente
        },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
}
