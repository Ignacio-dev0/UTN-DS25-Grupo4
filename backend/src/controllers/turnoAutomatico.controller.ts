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

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

        const canchaIdNum = Number(canchaId);
        const precioNum = Number(precio);

        // Convertir día y hora a fecha dentro de los próximos 7 días
        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
        const indiceDia = diasSemana.indexOf(dia.toUpperCase());
        
        if (indiceDia === -1) {
            return res.status(400).json({ error: "Día inválido" });
        }

        // Crear fecha para los próximos 7 días (como en el calendario)
        const hoy = new Date();
        let fechaTurno = new Date(hoy);
        
        // Buscar la próxima ocurrencia de ese día dentro de los próximos 7 días
        let diasAgregar = (indiceDia - hoy.getDay() + 7) % 7;
        if (diasAgregar === 0 && hoy.getHours() < parseInt(hora.split(':')[0])) {
            // Si es el mismo día y aún no pasó la hora, usar hoy
            diasAgregar = 0;
        } else if (diasAgregar === 0) {
            // Si es el mismo día pero ya pasó la hora, usar la próxima semana
            diasAgregar = 7;
        }
        
        fechaTurno.setDate(hoy.getDate() + diasAgregar);
        
        // Crear horaInicio
        const [horas, minutos] = hora.split(':');
        const horaInicio = new Date(fechaTurno);
        horaInicio.setHours(parseInt(horas), parseInt(minutos), 0, 0);

        console.log(`📅 Creando turno para: ${fechaTurno.toISOString().split('T')[0]} a las ${hora}`);

        // Verificar si ya existe un turno en ese horario (usando solo fecha y hora, no timestamp exacto)
        const fechaSoloFecha = new Date(fechaTurno);
        fechaSoloFecha.setHours(0, 0, 0, 0); // Resetear a medianoche para comparar solo fecha

        const fechaSiguienteDia = new Date(fechaSoloFecha);
        fechaSiguienteDia.setDate(fechaSiguienteDia.getDate() + 1);

        const turnoExistente = await prisma.turno.findFirst({
            where: {
                canchaId: canchaIdNum,
                fecha: {
                    gte: fechaSoloFecha,
                    lt: fechaSiguienteDia
                },
                horaInicio: horaInicio
            }
        });

        if (turnoExistente) {
            console.log(`⚠️ Ya existe un turno para cancha ${canchaIdNum} el ${fechaTurno.toISOString().split('T')[0]} a las ${hora}`);
            return res.status(400).json({ 
                error: "Ya existe un turno en ese horario" 
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
