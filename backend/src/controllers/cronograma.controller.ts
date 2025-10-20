import { Request, Response } from 'express';
import prisma from '../config/prisma';
// import { recalcularPrecioDesde } from '../services/cancha.service';

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
    } catch (error: any) {
        // Manejo específico para errores de conectividad de base de datos
        if (error.message && error.message.includes("Can't reach database server")) {
            console.log(`⚠️ CRONOGRAMA CONTROLLER - Base de datos no disponible para cronograma cancha ${req.params.canchaId}, devolviendo lista vacía`);
            return res.status(200).json({
                cronograma: [],
                total: 0,
                message: 'Servicio temporalmente no disponible'
            });
        }
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
        
        try {
            await prisma.$transaction(async (tx) => {
                console.log(`🔄 Iniciando transacción para cancha ${canchaIdNum}`);
                
                // Eliminar cronograma existente
                const deletedCronograma = await tx.horarioCronograma.deleteMany({
                    where: { canchaId: canchaIdNum }
                });
                console.log(`🗑️ Cronogramas eliminados: ${deletedCronograma.count}`);

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

                        console.log(`📋 Procesando cronograma: ${item.dia} ${item.hora} - $${item.precio}`);

                        return {
                            canchaId: canchaIdNum,
                            diaSemana: diasMap[item.dia.toUpperCase()] || item.dia,
                            horaInicio: new Date(`1970-01-01T${item.hora}:00.000Z`),
                            horaFin: new Date(`1970-01-01T${item.hora.split(':')[0]}:59:59.000Z`), // 1 hora de duración por defecto
                            precio: item.precio || 0
                        };
                    });

                    const createdCronograma = await tx.horarioCronograma.createMany({
                        data: cronogramaData
                    });
                    console.log(`✅ Cronogramas creados: ${createdCronograma.count}`);

                    // Generar turnos automáticamente para los próximos 7 días (hoy + 6 días siguientes)
                    // SOLO si no existen turnos para esos días
                    const hoy = new Date();
                    const diasAGenerar = 7; // Cambiado de 14 a 7 días
                    const turnosData = [];

                    console.log(`🔄 Verificando turnos existentes para cancha ${canchaIdNum} - próximos ${diasAGenerar} días`);

                    for (let i = 0; i < diasAGenerar; i++) {
                        const fecha = new Date(hoy);
                        fecha.setDate(hoy.getDate() + i);
                        
                        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
                        const diaSemana = diasSemana[fecha.getDay()];

                        // Buscar cronogramas para este día
                        const cronogramasDelDia = cronogramaData.filter(c => c.diaSemana === diaSemana);

                        console.log(`📅 Fecha: ${fecha.toISOString().split('T')[0]}, Día: ${diaSemana}, Cronogramas: ${cronogramasDelDia.length}`);

                        for (const cronogramaDia of cronogramasDelDia) {
                            // Verificar si ya existe un turno para esta fecha y hora
                            const turnoExistente = await tx.turno.findFirst({
                                where: {
                                    canchaId: canchaIdNum,
                                    fecha: fecha,
                                    horaInicio: cronogramaDia.horaInicio
                                }
                            });

                            if (!turnoExistente) {
                                turnosData.push({
                                    fecha: fecha,
                                    horaInicio: cronogramaDia.horaInicio,
                                    precio: cronogramaDia.precio,
                                    reservado: false,
                                    canchaId: canchaIdNum
                                });
                                console.log(`➕ Nuevo turno a crear: ${fecha.toISOString().split('T')[0]} ${cronogramaDia.horaInicio}`);
                            } else {
                                console.log(`⏭️ Turno ya existe: ${fecha.toISOString().split('T')[0]} ${cronogramaDia.horaInicio} - manteniéndolo`);
                            }
                        }
                    }

                    console.log(`� Nuevos turnos a crear: ${turnosData.length}`);

                    // NO eliminar turnos existentes - solo crear los nuevos que falten
                    if (turnosData.length > 0) {
                        const created = await tx.turno.createMany({
                            data: turnosData
                        });
                        turnosGenerados = created.count;
                        console.log(`✅ Turnos NUEVOS creados: ${turnosGenerados}`);
                    } else {
                        console.log(`✅ No hay turnos nuevos que crear - todos ya existen`);
                    }
                }
                
                console.log(`✅ Transacción completada exitosamente`);
            });
            
            // Recalcular el precio "desde" de la cancha después de actualizar cronograma
            // await recalcularPrecioDesde(canchaIdNum);
            
        } catch (transactionError) {
            console.error('❌ Error en la transacción de cronograma:', transactionError);
            throw transactionError;
        }

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
