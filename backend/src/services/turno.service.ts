import { number } from 'zod';
import prisma from '../config/prisma';
import { Turno} from '@prisma/client';
import { CreateTurno } from '../types/turno.types';
import { recalcularPrecioDesde } from './cancha.service';

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
export async function generarTurnosDesdeHoy() {
    const hoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + 7); // 7 días hacia adelante

    // Obtener todas las canchas con sus cronogramas
    const canchas = await prisma.cancha.findMany({
        include: {
            cronograma: true,
            complejo: true
        }
    });

    const turnosACrear = [];

    for (const cancha of canchas) {
        for (let dia = 0; dia < 7; dia++) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() + dia);
            
            const diaSemana = getDiaSemanaEnum(fecha.getDay());
            
            // Filtrar cronogramas para este día
            const cronogramasDelDia = cancha.cronograma.filter(c => c.diaSemana === diaSemana);
            
            for (const cronograma of cronogramasDelDia) {
                // Verificar si el turno ya existe (usando rango de fechas para evitar problemas de timestamp)
                const fechaSoloFecha = new Date(fecha);
                fechaSoloFecha.setHours(0, 0, 0, 0);
                
                const fechaSiguienteDia = new Date(fechaSoloFecha);
                fechaSiguienteDia.setDate(fechaSiguienteDia.getDate() + 1);

                const turnoExistente = await prisma.turno.findFirst({
                    where: {
                        canchaId: cancha.id,
                        fecha: {
                            gte: fechaSoloFecha,
                            lt: fechaSiguienteDia
                        },
                        horaInicio: cronograma.horaInicio
                    }
                });

                if (!turnoExistente) {
                    turnosACrear.push({
                        fecha: fechaSoloFecha,
                        horaInicio: cronograma.horaInicio,
                        precio: cronograma.precio || 5000, // Usar precio del cronograma o defecto
                        reservado: false,
                        canchaId: cancha.id
                    });
                }
            }
        }
    }

    if (turnosACrear.length > 0) {
        await prisma.turno.createMany({
            data: turnosACrear
        });
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

    // Recalcular precio desde después de crear el turno
    await recalcularPrecioDesde(data.canchaId);

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

export async function updateTurno(id: number, data: Partial<CreateTurno>): Promise<Turno> {
    const updated = await prisma.turno.update({
        where: { id },
        data: {
            ...(data.fecha && { fecha: data.fecha }),
            ...(data.horaInicio && { horaInicio: data.horaInicio }),
            ...(data.precio && { precio: data.precio }),
            ...(data.canchaId && { 
                cancha: {
                    connect: { id: data.canchaId }
                }
            })
        },
        include: {
            cancha: {
                include: {
                    complejo: true
                }
            }
        }
    });
    
    // Recalcular precio desde después de actualizar el turno
    await recalcularPrecioDesde(updated.canchaId);
    
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
    
    // Recalcular precio desde después de eliminar el turno
    await recalcularPrecioDesde(deleted.canchaId);
    
    return deleted;
}

// Función específica para obtener turnos disponibles del día actual posteriores a la hora actual
export async function getTurnosDisponiblesHoy(canchaId: number): Promise<Turno[]> {
    try {
        console.log(`🔍 Buscando turnos disponibles hoy para cancha ${canchaId}`);
        
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const manana = new Date(hoy);
        manana.setDate(hoy.getDate() + 1);
        
        // Crear hora mínima como time (formato HH:MM:SS)
        const horaActual = ahora.getHours();
        const horaMinima = new Date();
        horaMinima.setFullYear(1970, 0, 1); // Año 1970 para Time fields
        horaMinima.setHours(horaActual + 1, 0, 0, 0);
        
        console.log(`📅 Buscando turnos para hoy (${hoy.toDateString()}) después de las ${horaMinima.toTimeString()}`);
        
        const turnos = await prisma.turno.findMany({
            where: {
                canchaId: canchaId,
                reservado: false, // Solo turnos disponibles
                fecha: {
                    gte: hoy,
                    lt: manana
                },
                // Solo turnos que empiecen al menos 1 hora después de ahora
                horaInicio: {
                    gte: horaMinima
                }
            },
            select: {
                id: true,
                fecha: true,
                horaInicio: true,
                precio: true,
                reservado: true,
                canchaId: true
            },
            orderBy: {
                horaInicio: 'asc'
            },
            take: 12 // Limitamos a 12 turnos para mejor rendimiento
        });
        
        console.log(`✅ Encontrados ${turnos.length} turnos disponibles hoy para cancha ${canchaId}`);
        return turnos as Turno[];
        
    } catch (error) {
        console.error(`❌ Error obteniendo turnos disponibles hoy para cancha ${canchaId}:`, error);
        return [];
    }
}
