// backend/src/services/resenas.service.ts
import prisma from '../config/prisma';
import { Resenia } from '@prisma/client';
import { CreateReseniaRequest, UpdateReseniaRequest } from '../types/resenia.types';

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
    // Validar que el puntaje esté entre 1 y 5
    if (data.puntaje < 1 || data.puntaje > 5) {
        const error = new Error('El puntaje debe estar entre 1 y 5');
        (error as any).statusCode = 400;
        throw error;
    }

    // Verificar que el alquiler existe y no tiene ya una reseña
    const alquiler = await prisma.alquiler.findUnique({
        where: { id: data.alquilerId },
        include: { resenia: true }
    });

    if (!alquiler) {
        const error = new Error('El alquiler no existe');
        (error as any).statusCode = 404;
        throw error;
    }

    if (alquiler.resenia) {
        const error = new Error('Este alquiler ya tiene una reseña');
        (error as any).statusCode = 409;
        throw error;
    }

    const created = await prisma.resenia.create({
        data: {
            descripcion: data.descripcion,
            puntaje: data.puntaje,
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
                    }
                }
            }
        }
    });

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
                        }
                    }
                }
            }
        });
        
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