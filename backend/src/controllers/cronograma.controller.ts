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
