import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

// Sistema de turnos automáticos que se regeneran semanalmente
export const regenerarTurnosSemanales = async (req: Request, res: Response) => {
    try {
        const { canchaId } = req.params;
        
        if (!canchaId || isNaN(Number(canchaId))) {
            return res.status(400).json({ error: "ID de cancha debe ser un número válido" });
        }

        const canchaIdNum = Number(canchaId);

        // Verificar que la cancha existe
        const cancha = await prisma.cancha.findUnique({
            where: { id: canchaIdNum }
        });

        if (!cancha) {
            return res.status(404).json({ error: "Cancha no encontrada" });
        }

        // Obtener el cronograma base de la cancha
        const cronograma = await prisma.horarioCronograma.findMany({
            where: { canchaId: canchaIdNum }
        });

        if (cronograma.length === 0) {
            return res.status(400).json({ error: "No hay cronograma definido para esta cancha" });
        }

        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo de esta semana
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 13); // 2 semanas completas

        console.log(`🔄 Regenerando turnos para cancha ${canchaIdNum} desde ${inicioSemana.toISOString().split('T')[0]} hasta ${finSemana.toISOString().split('T')[0]}`);

        await prisma.$transaction(async (tx) => {
            // 1. RESETEAR turnos pasados a "disponible" (no borrar, solo resetear estado)
            const ahora = new Date();
            await tx.turno.updateMany({
                where: {
                    canchaId: canchaIdNum,
                    fecha: {
                        lt: ahora
                    },
                    alquilerId: null // Solo resetear los que no están alquilados
                },
                data: {
                    reservado: false
                }
            });

            // 2. ELIMINAR turnos futuros para regenerar (solo los disponibles)
            await tx.turno.deleteMany({
                where: {
                    canchaId: canchaIdNum,
                    fecha: {
                        gte: ahora
                    },
                    reservado: false, // Solo eliminar disponibles, conservar reservados
                    alquilerId: null // Solo eliminar los que no están alquilados
                }
            });

            // 3. GENERAR nuevos turnos para las próximas 2 semanas
            const turnosData = [];
            const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

            for (let i = 0; i < 14; i++) { // 2 semanas
                const fecha = new Date(ahora);
                fecha.setDate(ahora.getDate() + i);
                
                const diaSemana = diasSemana[fecha.getDay()];

                // Buscar horarios del cronograma para este día
                const horariosDelDia = cronograma.filter((c: any) => c.diaSemana === diaSemana);

                for (const horario of horariosDelDia) {
                    // Normalizar la fecha para evitar problemas de timestamp
                    const fechaNormalizada = new Date(fecha);
                    fechaNormalizada.setHours(0, 0, 0, 0);
                    
                    const hora = horario.horaInicio.getUTCHours();
                    const minutos = horario.horaInicio.getUTCMinutes();
                    
                    const fechaHora = new Date(fechaNormalizada);
                    fechaHora.setHours(hora, minutos, 0, 0);

                    // Solo crear si es futuro
                    if (fechaHora > ahora) {
                        turnosData.push({
                            canchaId: canchaIdNum,
                            fecha: fechaNormalizada, // Usar fecha normalizada
                            horaInicio: horario.horaInicio,
                            precio: horario.precio || 5000, // Precio por defecto si no está definido
                            reservado: false
                        });
                    }
                }
            }

            // Crear los nuevos turnos
            if (turnosData.length > 0) {
                await tx.turno.createMany({
                    data: turnosData,
                    skipDuplicates: true
                });
            }

            console.log(`✅ Regenerados ${turnosData.length} turnos para cancha ${canchaIdNum}`);
        });

        res.json({ 
            message: `Turnos regenerados exitosamente para cancha ${canchaIdNum}`,
            turnosRegenerados: true
        });

    } catch (error) {
        console.error('Error al regenerar turnos semanales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Endpoint para actualizar precio o estado de un turno individual
export const actualizarTurnoIndividual = async (req: Request, res: Response) => {
    try {
        const { turnoId } = req.params;
        const { precio, reservado } = req.body;

        if (!turnoId || isNaN(Number(turnoId))) {
            return res.status(400).json({ error: "ID de turno debe ser un número válido" });
        }

        const turnoIdNum = Number(turnoId);

        const datosActualizacion: any = {};
        if (precio !== undefined) datosActualizacion.precio = Number(precio);
        if (reservado !== undefined) datosActualizacion.reservado = Boolean(reservado);

        const turnoActualizado = await prisma.turno.update({
            where: { id: turnoIdNum },
            data: datosActualizacion
        });

        res.json({ 
            message: 'Turno actualizado exitosamente',
            turno: turnoActualizado
        });

    } catch (error) {
        console.error('Error al actualizar turno:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Job automático que se puede ejecutar diariamente para resetear turnos
export const resetearTurnosDiarios = async () => {
    try {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        ayer.setHours(23, 59, 59, 999);

        // Resetear turnos de ayer que no estén reservados ni alquilados
        const result = await prisma.turno.updateMany({
            where: {
                fecha: {
                    lt: ayer
                },
                reservado: false,
                alquilerId: null
            },
            data: {
                reservado: false
            }
        });

        console.log(`🔄 Turnos de días pasados reseteados: ${result.count}`);
        return result.count;
    } catch (error) {
        console.error('Error al resetear turnos diarios:', error);
        throw error;
    }
};

// Endpoint para crear un turno individual
export const crearTurnoIndividual = async (req: Request, res: Response) => {
    try {
        const { canchaId, dia, hora, precio } = req.body;

        if (!canchaId || !dia || !hora || precio === undefined) {
            return res.status(400).json({ 
                error: "Faltan campos requeridos: canchaId, dia, hora, precio" 
            });
        }

        // Validar formato de hora (HH:MM)
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!horaRegex.test(hora)) {
            return res.status(400).json({ 
                error: "Formato de hora inválido. Use formato HH:MM (ej: 17:00)" 
            });
        }

        const canchaIdNum = Number(canchaId);
        const precioNum = Number(precio);

        // Convertir día y hora a fecha dentro de los próximos 7 días
        // IMPORTANTE: Sin acentos para coincidir con el enum DiaSemana de Prisma
        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const indiceDia = diasSemana.indexOf(dia.toUpperCase());
        
        if (indiceDia === -1) {
            return res.status(400).json({ error: "Día inválido" });
        }

        // Crear fecha para los próximos 7 días (como en el calendario) usando UTC
        const hoy = new Date();
        
        // Buscar la próxima ocurrencia de ese día dentro de los próximos 7 días
        let diasAgregar = (indiceDia - hoy.getUTCDay() + 7) % 7;
        if (diasAgregar === 0 && hoy.getUTCHours() < parseInt(hora.split(':')[0])) {
            // Si es el mismo día y aún no pasó la hora, usar hoy
            diasAgregar = 0;
        } else if (diasAgregar === 0) {
            // Si es el mismo día pero ya pasó la hora, usar la próxima semana
            diasAgregar = 7;
        }
        
        // Crear fechaTurno con fecha específica (sin tiempo) en UTC
        const fechaTurno = new Date(hoy);
        fechaTurno.setUTCDate(hoy.getUTCDate() + diasAgregar);
        fechaTurno.setUTCHours(0, 0, 0, 0); // Normalizar a medianoche UTC
        
        // Validar que la hora sea en punto (solo :00 permitido)
        const [horas, minutos] = hora.split(':');
        if (parseInt(minutos) !== 0) {
            return res.status(400).json({ 
                error: "Solo se permiten horarios en punto (ej: 17:00, 18:00). No se aceptan horarios con minutos." 
            });
        }
        
        // Crear horaInicio en la MISMA FECHA que fechaTurno pero en UTC
        const horaInicio = new Date(fechaTurno);
        horaInicio.setUTCHours(parseInt(horas), 0, 0, 0); // Siempre minutos = 0



        // Verificar si ya existe un turno en ese horario exacto
        const turnoExistente = await prisma.turno.findFirst({
            where: {
                canchaId: canchaIdNum,
                fecha: fechaTurno,
                horaInicio: horaInicio
            }
        });

        if (turnoExistente) {
            return res.status(400).json({ 
                error: "Ya existe un turno en ese horario",
                detalle: `Turno ID ${turnoExistente.id} ya existe para esta fecha y hora`
            });
        }

        // Crear el turno
        const nuevoTurno = await prisma.turno.create({
            data: {
                canchaId: canchaIdNum,
                fecha: fechaTurno,
                horaInicio: horaInicio,
                precio: precioNum,
                reservado: false,
                alquilerId: null
            }
        });

        res.json({ 
            message: 'Turno creado exitosamente',
            turno: nuevoTurno
        });

    } catch (error) {
        console.error('Error al crear turno individual:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Endpoint para eliminar un turno individual
export const eliminarTurnoIndividual = async (req: Request, res: Response) => {
    try {
        const { turnoId } = req.params;
        const turnoIdNum = Number(turnoId);

        if (!turnoIdNum || isNaN(turnoIdNum)) {
            return res.status(400).json({ error: "ID de turno inválido" });
        }

        // Verificar que el turno existe
        const turnoExistente = await prisma.turno.findUnique({
            where: { id: turnoIdNum },
            include: {
                cancha: {
                    include: {
                        complejo: true
                    }
                }
            }
        });

        if (!turnoExistente) {
            return res.status(404).json({ error: "Turno no encontrado" });
        }

        // No permitir eliminar turnos reservados por usuarios
        if (turnoExistente.alquilerId && turnoExistente.alquilerId !== null) {
            return res.status(400).json({ 
                error: "No se puede eliminar un turno reservado por un usuario",
                detalle: `El turno está reservado por el usuario ID ${turnoExistente.alquilerId}`
            });
        }

        // Eliminar el turno
        await prisma.turno.delete({
            where: { id: turnoIdNum }
        });

        console.log(`🗑️ Turno eliminado: ID ${turnoIdNum} de cancha ${turnoExistente.canchaId}`);

        res.json({ 
            message: 'Turno eliminado exitosamente',
            turnoEliminado: {
                id: turnoExistente.id,
                fecha: turnoExistente.fecha,
                horaInicio: turnoExistente.horaInicio,
                precio: turnoExistente.precio,
                cancha: turnoExistente.cancha.nroCancha,
                complejo: turnoExistente.cancha.complejo.nombre
            }
        });

    } catch (error) {
        console.error('Error al eliminar turno individual:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
