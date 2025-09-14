import { number } from 'zod';
import prisma from '../config/prisma';
import { Turno} from '@prisma/client';
import { CreateTurno } from '../types/turno.types';

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
        
        // Primero verificar que la cancha existe
        const cancha = await prisma.cancha.findUnique({
            where: { id: canchaId }
        });
        
        if (!cancha) {
            console.log(`❌ Servicio: Cancha ${canchaId} no encontrada`);
            throw new Error(`Cancha ${canchaId} no encontrada`);
        }
        
        console.log(`✅ Servicio: Cancha ${canchaId} existe, buscando turnos...`);
        
        // Primero intentar sin include para ver si el problema está en las relaciones
        try {
            console.log(`🔍 Intentando consulta simple sin include...`);
            const turnosSimple = await prisma.turno.findMany({
                where: { canchaId },
                orderBy: [
                    { fecha: 'asc' },
                    { horaInicio: 'asc' }
                ]
            });
            console.log(`✅ Consulta simple exitosa: ${turnosSimple.length} turnos`);
            
            // Si la consulta simple funciona, intentar con include
            console.log(`🔍 Intentando consulta con include...`);
            const turnos = await prisma.turno.findMany({
                where: { canchaId },
                include: {
                    cancha: {
                        include: {
                            complejo: true
                        }
                    }
                },
                orderBy: [
                    { fecha: 'asc' },
                    { horaInicio: 'asc' }
                ]
            });
            
            console.log(`✅ Servicio: Encontrados ${turnos.length} turnos para cancha ${canchaId}`);
            if (turnos.length > 0) {
                console.log(`📅 Primer turno: ${turnos[0].fecha} a las ${turnos[0].horaInicio}`);
                console.log(`📅 Último turno: ${turnos[turnos.length - 1].fecha} a las ${turnos[turnos.length - 1].horaInicio}`);
            }
            
            return turnos;
        } catch (includeError) {
            console.log(`⚠️ Error con include, devolviendo consulta simple`);
            const turnosSimple = await prisma.turno.findMany({
                where: { canchaId },
                orderBy: [
                    { fecha: 'asc' },
                    { horaInicio: 'asc' }
                ]
            });
            // Convertir a formato esperado sin las relaciones
            return turnosSimple as Turno[];
        }
        
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