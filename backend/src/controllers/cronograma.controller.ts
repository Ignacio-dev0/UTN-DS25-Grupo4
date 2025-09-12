import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const obtenerCronogramaCancha = async (req: Request, res: Response) => {
    try {
        const { canchaId } = req.params;
        
        if (!canchaId || isNaN(Number(canchaId))) {
            return res.status(400).json({ error: "ID de cancha debe ser un número válido" });
        }

        const cronograma = await prisma.horarioCronograma.findMany({
            where: {
                canchaId: Number(canchaId)
            },
            orderBy: [
                { diaSemana: 'asc' },
                { horaInicio: 'asc' }
            ]
        });

        res.json({
            cronograma,
            total: cronograma.length
        });
    } catch (error) {
        console.error('Error al obtener cronograma:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const actualizarCronogramaCancha = async (req: Request, res: Response) => {
    try {
        const { canchaId } = req.params;
        const { cronograma } = req.body;
        
        if (!canchaId || isNaN(Number(canchaId))) {
            return res.status(400).json({ error: "ID de cancha debe ser un número válido" });
        }

        if (!Array.isArray(cronograma)) {
            return res.status(400).json({ error: "El cronograma debe ser un array" });
        }

        const canchaIdNum = Number(canchaId);

        // Verificar que la cancha existe
        const cancha = await prisma.cancha.findUnique({
            where: { id: canchaIdNum }
        });

        if (!cancha) {
            return res.status(404).json({ error: "Cancha no encontrada" });
        }

        // Transacción para actualizar el cronograma
        let turnosGenerados = 0;
        
        await prisma.$transaction(async (tx) => {
            // Eliminar cronograma existente
            await tx.horarioCronograma.deleteMany({
                where: { canchaId: canchaIdNum }
            });

            // Crear nuevo cronograma
            if (cronograma.length > 0) {
                const cronogramaData = cronograma.map((item: any) => {
                    // Convertir día de string a enum DiaSemana
                    const diasMap: { [key: string]: string } = {
                        'LUNES': 'LUNES',
                        'MARTES': 'MARTES',
                        'MIÉRCOLES': 'MIERCOLES', // Sin acento en el enum
                        'MIERCOLES': 'MIERCOLES',
                        'JUEVES': 'JUEVES',
                        'VIERNES': 'VIERNES',
                        'SÁBADO': 'SABADO', // Sin acento en el enum
                        'SABADO': 'SABADO',
                        'DOMINGO': 'DOMINGO'
                    };

                    return {
                        canchaId: canchaIdNum,
                        diaSemana: diasMap[item.dia.toUpperCase()] || item.dia,
                        horaInicio: new Date(`1970-01-01T${item.hora}:00.000Z`),
                        horaFin: new Date(`1970-01-01T${item.hora.split(':')[0]}:59:59.000Z`), // 1 hora de duración por defecto
                        precio: item.precio || 0
                    };
                });

                await tx.horarioCronograma.createMany({
                    data: cronogramaData
                });

                // Generar turnos automáticamente para los próximos 14 días
                const hoy = new Date();
                const diasAGenerar = 14;
                const turnosData = [];

                for (let i = 0; i < diasAGenerar; i++) {
                    const fecha = new Date(hoy);
                    fecha.setDate(hoy.getDate() + i);
                    
                    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
                    const diaSemana = diasSemana[fecha.getDay()];

                    // Buscar cronogramas para este día
                    const cronogramasDelDia = cronogramaData.filter(c => c.diaSemana === diaSemana);

                    for (const cronogramaDia of cronogramasDelDia) {
                        turnosData.push({
                            fecha: fecha,
                            horaInicio: cronogramaDia.horaInicio,
                            precio: cronogramaDia.precio,
                            reservado: false,
                            canchaId: canchaIdNum
                        });
                    }
                }

                // Eliminar turnos existentes de la cancha para evitar duplicados
                await tx.turno.deleteMany({
                    where: { 
                        canchaId: canchaIdNum,
                        fecha: {
                            gte: hoy
                        }
                    }
                });

                // Crear nuevos turnos
                if (turnosData.length > 0) {
                    await tx.turno.createMany({
                        data: turnosData
                    });
                    turnosGenerados = turnosData.length;
                }
            }
        });

        res.json({
            message: 'Cronograma actualizado exitosamente',
            turnosGenerados: turnosGenerados,
            canchaId: canchaIdNum
        });
    } catch (error) {
        console.error('Error al actualizar cronograma:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const obtenerTodosCronogramas = async (req: Request, res: Response) => {
    try {
        const cronogramas = await prisma.horarioCronograma.findMany({
            include: {
                cancha: {
                    select: {
                        id: true,
                        nroCancha: true,
                        complejo: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { canchaId: 'asc' },
                { diaSemana: 'asc' },
                { horaInicio: 'asc' }
            ]
        });

        res.json({
            cronogramas,
            total: cronogramas.length
        });
    } catch (error) {
        console.error('Error al obtener cronogramas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
