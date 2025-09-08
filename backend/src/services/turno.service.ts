import prisma from "../config/prisma";
import { Turno } from "../generated/prisma";
import { CreateTurnoRequest, UpdateTurnoRequest } from "../types/turno.types";

export async function getAllTurnos(): Promise<Turno[]> {
    return prisma.turno.findMany({
        include: {
            cancha: true,
            alquiler: true,
        },
        orderBy: {
            fecha: 'asc',
        },
    });
}

export async function getTurnoById(id: number): Promise<Turno | null> {
    return prisma.turno.findUnique({
        where: { id },
        include: {
            cancha: true,
            alquiler: true,
        },
    });
}

export async function getTurnosByCanchaAndDate(canchaId: number, fecha: Date): Promise<Turno[]> {
    const startOfDay = new Date(fecha);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(fecha);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.turno.findMany({
        where: {
            canchaId: canchaId,
            fecha: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        orderBy: {
            horaInicio: 'asc',
        },
    });
}

export async function createTurno(data: CreateTurnoRequest): Promise<Turno> {
    return prisma.turno.create({
        data: {
            fecha: data.fecha,
            horaInicio: data.horaInicio,
            precio: data.precio,
            reservado: data.reservado || false, 
            cancha: {
                connect: { id: data.canchaId }
            }
        },
    });
}

export async function updateTurno(id: number, updateData: UpdateTurnoRequest): Promise<Turno> {
    try {
        return await prisma.turno.update({
            where: { id },
            data: {
                ...updateData
            },
        });
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Turno no encontrado');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}


export async function deleteTurno(id: number): Promise<Turno> {
    try {
        return await prisma.turno.delete({
            where: { id },
        });
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Turno no encontradoo');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

////////////////////////////// a probar
export async function generateTurnos(): Promise<number> {
    const today = new Date();
    const turnsToCreate = [];

    // Paso 1: Obtener todos los horarios definidos
    const horariosCronograma = await prisma.horarioCronograma.findMany();

    // Paso 2: Iterar sobre la semana actual
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = new Date(today);
        currentDay.setDate(today.getDate() + dayOffset);
        currentDay.setUTCHours(0, 0, 0, 0);

        const currentDayOfWeek = currentDay.toLocaleDateString('es-AR', { weekday: 'long' }).toUpperCase();
        
        // Paso 3: Iterar sobre cada horario del cronograma
        for (const horario of horariosCronograma) {
            // Solo generar turnos para el día de la semana correspondiente
            if (horario.diaSemana.toUpperCase() === currentDayOfWeek) {
                
                // Generar turnos para el bloque de tiempo del HorarioCronograma
                let startHour = horario.horaInicio.getUTCHours();
                const endHour = horario.horaFin.getUTCHours();

                while (startHour < endHour) {
                    const horaTurno = new Date(currentDay);
                    horaTurno.setUTCHours(startHour, 0, 0, 0);

                    // Verificar si el turno ya existe para evitar duplicados
                    const existingTurno = await prisma.turno.findFirst({
                        where: {
                            canchaId: horario.canchaId,
                            fecha: currentDay,
                            horaInicio: horaTurno
                        }
                    });

                    if (!existingTurno) {
                        // Si no existe, lo agregamos a la lista de creación masiva
                        turnsToCreate.push({
                            fecha: currentDay,
                            horaInicio: horaTurno,
                            precio: 20000 + Math.floor(Math.random() * 5000), // Precio de ejemplo
                            reservado: false,
                            canchaId: horario.canchaId
                        });
                    }

                    startHour++;
                }
            }
        }
    }

    // Paso 4: Insertar todos los turnos nuevos de forma masiva
    if (turnsToCreate.length > 0) {
        await prisma.turno.createMany({
            data: turnsToCreate
        });
        console.log(`✅ Se generaron ${turnsToCreate.length} nuevos turnos.`);
    } else {
        console.log('⚠️ No se generaron nuevos turnos. Es posible que ya existan para el período.');
    }

    return turnsToCreate.length;
}
