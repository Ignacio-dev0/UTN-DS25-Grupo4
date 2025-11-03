// backend/src/services/resenas.service.ts
import prisma from '../config/prisma';
import { Resenia } from '@prisma/client';
import { CreateReseniaRequest, UpdateReseniaRequest } from '../types/resenia.types';
import { actualizarCamposCalculadosCancha } from './camposCalculados.service';

export async function getAllResenas(): Promise<Resenia[]> {
    const resenas = await prisma.resenia.findMany({
        include: {
            alquiler: {
                include: {
                    cliente: {
                        select: {
                            nombre: true,
                            apellido: true,
                            image: true
                        }
                    },
                    turnos: {
                        include: {
                            cancha: {
                                include: {
                                    complejo: {
                                        select: {
                                            nombre: true
                                        }
                                    },
                                    deporte: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });
    return resenas;
}

export async function getReseniaById(id: number): Promise<Resenia | null> {
    const resenia = await prisma.resenia.findUnique({
        where: { id },
        include: {
            alquiler: {
                include: {
                    cliente: {
                        select: {
                            nombre: true,
                            apellido: true,
                            image: true
                        }
                    },
                    turnos: {
                        include: {
                            cancha: {
                                include: {
                                    complejo: {
                                        select: {
                                            nombre: true
                                        }
                                    },
                                    deporte: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    return resenia;
}

export async function getResenasByComplejo(complejoId: number): Promise<Resenia[]> {
    const resenas = await prisma.resenia.findMany({
        where: {
            alquiler: {
                turnos: {
                    some: {
                        cancha: {
                            complejoId: complejoId
                        }
                    }
                }
            }
        },
        include: {
            alquiler: {
                include: {
                    cliente: {
                        select: {
                            nombre: true,
                            apellido: true,
                            image: true
                        }
                    },
                    turnos: {
                        include: {
                            cancha: {
                                include: {
                                    deporte: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });
    
    return resenas;
}

export async function getResenasByCancha(canchaId: number): Promise<Resenia[]> {
    const resenas = await prisma.resenia.findMany({
        where: {
            alquiler: {
                turnos: {
                    some: {
                        canchaId: canchaId
                    }
                }
            }
        },
        include: {
            alquiler: {
                include: {
                    cliente: {
                        select: {
                            nombre: true,
                            apellido: true,
                            image: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });
    
    return resenas;
}

export async function getResenasByUsuario(usuarioId: number): Promise<Resenia[]> {
    const resenas = await prisma.resenia.findMany({
        where: {
            alquiler: {
                clienteId: usuarioId
            }
        },
        include: {
            alquiler: {
                include: {
                    turnos: {
                        include: {
                            cancha: {
                                include: {
                                    complejo: {
                                        select: {
                                            nombre: true
                                        }
                                    },
                                    deporte: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });
    
    return resenas;
}

export async function createResenia(data: CreateReseniaRequest): Promise<Resenia> {
    console.log('🔧 RESENIA SERVICE - createResenia called with data:', JSON.stringify(data, null, 2));
    
    // Validar que el puntaje esté entre 1 y 5
    if (data.puntaje < 1 || data.puntaje > 5) {
        console.log('❌ RESENIA SERVICE - Puntaje inválido:', data.puntaje);
        const error = new Error('El puntaje debe estar entre 1 y 5');
        (error as any).statusCode = 400;
        throw error;
    }

    // Validar que la descripción no esté vacía después de limpiar espacios
    if (!data.descripcion || data.descripcion.trim().length < 10) {
        console.log('❌ RESENIA SERVICE - Descripción demasiado corta');
        const error = new Error('La descripción debe tener al menos 10 caracteres');
        (error as any).statusCode = 400;
        throw error;
    }

    console.log('🔍 RESENIA SERVICE - Verificando alquiler...');
    // Verificar que el alquiler existe y no tiene ya una reseña
    const alquiler = await prisma.alquiler.findUnique({
        where: { id: data.alquilerId },
        include: { 
            resenia: true,
            cliente: true // Para validar que existe
        }
    });

    if (!alquiler) {
        console.log('❌ RESENIA SERVICE - Alquiler no encontrado:', data.alquilerId);
        const error = new Error('El alquiler no existe');
        (error as any).statusCode = 404;
        throw error;
    }

    if (alquiler.resenia) {
        console.log('❌ RESENIA SERVICE - Alquiler ya tiene reseña:', data.alquilerId);
        const error = new Error('Este alquiler ya tiene una reseña');
        (error as any).statusCode = 409;
        throw error;
    }

    console.log('🚀 RESENIA SERVICE - Creando reseña en la base de datos...');
    const created = await prisma.resenia.create({
        data: {
            descripcion: data.descripcion.trim(), // Limpiar espacios
            puntaje: Math.round(data.puntaje), // Asegurar que sea entero
            alquilerId: data.alquilerId
        },
        include: {
            alquiler: {
                include: {
                    cliente: {
                        select: {
                            nombre: true,
                            apellido: true,
                            image: true
                        }
                    },
                    turnos: {
                        select: {
                            canchaId: true
                        }
                    }
                }
            }
        }
    });

    console.log('✅ RESENIA SERVICE - Reseña creada exitosamente:', created.id);
    
    // Actualizar campos calculados para todas las canchas afectadas
    console.log('🔄 RESENIA SERVICE - Actualizando campos calculados...');
    try {
        // Obtener las canchas únicas de los turnos del alquiler
        const canchasIds = [...new Set(created.alquiler.turnos.map(turno => turno.canchaId))];
        
        // Actualizar campos calculados para cada cancha
        for (const canchaId of canchasIds) {
            await actualizarCamposCalculadosCancha(canchaId);
        }
        
        console.log('✅ RESENIA SERVICE - Campos calculados actualizados para canchas:', canchasIds);
    } catch (error) {
        console.error('❌ RESENIA SERVICE - Error actualizando campos calculados:', error);
        // No lanzamos el error para no afectar la creación de la reseña
    }
    
    return created;
}

export async function updateResenia(id: number, updateData: UpdateReseniaRequest): Promise<Resenia> {
    try {
        // Validar puntaje si se proporciona
        if (updateData.puntaje && (updateData.puntaje < 1 || updateData.puntaje > 5)) {
            const error = new Error('El puntaje debe estar entre 1 y 5');
            (error as any).statusCode = 400;
            throw error;
        }

        const updated = await prisma.resenia.update({
            where: { id },
            data: {
                ...(updateData.descripcion !== undefined ? { descripcion: updateData.descripcion } : {}),
                ...(updateData.puntaje !== undefined ? { puntaje: updateData.puntaje } : {}),
            },
            include: {
                alquiler: {
                    include: {
                        cliente: {
                            select: {
                                nombre: true,
                                apellido: true,
                                image: true
                            }
                        },
                        turnos: {
                            select: {
                                canchaId: true
                            }
                        }
                    }
                }
            }
        });
        
        // Actualizar campos calculados si se modificó el puntaje
        if (updateData.puntaje !== undefined) {
            console.log('🔄 RESENIA SERVICE - Actualizando campos calculados por cambio de puntaje...');
            try {
                // Obtener las canchas únicas de los turnos del alquiler
                const canchasIds = [...new Set(updated.alquiler.turnos.map(turno => turno.canchaId))];
                
                // Actualizar campos calculados para cada cancha
                for (const canchaId of canchasIds) {
                    await actualizarCamposCalculadosCancha(canchaId);
                }
                
                console.log('✅ RESENIA SERVICE - Campos calculados actualizados para canchas:', canchasIds);
            } catch (error) {
                console.error('❌ RESENIA SERVICE - Error actualizando campos calculados:', error);
            }
        }
        
        return updated;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Reseña no encontrada');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

export async function deleteResenia(id: number): Promise<Resenia> {
    try {
        const deleted = await prisma.resenia.delete({
            where: { id }
        });
        return deleted;
    } catch (e: any) {
        if (e.code === 'P2025') {
            const error = new Error('Reseña no encontrada');
            (error as any).statusCode = 404;
            throw error;
        }
        throw e;
    }
}

// Función optimizada para obtener solo puntajes (para cálculos de frontend)
export async function getReseniasPuntajesByCanchaId(canchaId: number): Promise<{puntaje: number}[]> {
    const resenas = await prisma.resenia.findMany({
        where: {
            alquiler: {
                turnos: {
                    some: {
                        canchaId: canchaId
                    }
                }
            }
        },
        select: {
            puntaje: true
        }
    });
    return resenas;
}

export async function getResenasByCanchaId(canchaId: number): Promise<Resenia[]> {
    const resenas = await prisma.resenia.findMany({
        where: {
            alquiler: {
                turnos: {
                    some: {
                        canchaId: canchaId
                    }
                }
            }
        },
        include: {
            alquiler: {
                include: {
                    cliente: {
                        select: {
                            nombre: true,
                            apellido: true,
                            image: true
                        }
                    },
                    turnos: {
                        where: {
                            canchaId: canchaId
                        },
                        include: {
                            cancha: {
                                include: {
                                    complejo: {
                                        select: {
                                            nombre: true
                                        }
                                    },
                                    deporte: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });
    return resenas;
}