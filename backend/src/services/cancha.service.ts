// backend/src/services/cancha.service.ts
import prisma from '../config/prisma';
import { CreateCanchaRequest, UpdateCanchaRequest } from '../types/cancha.types'
import { EstadoAlquiler } from '@prisma/client';

export async function crearCancha(data: CreateCanchaRequest) {
	try {
		console.log('🔧 CANCHA SERVICE - crearCancha called with data:', JSON.stringify(data, null, 2));
		
		const { complejoId, deporteId, ...cancha } = data;
		
		console.log('🔧 CANCHA SERVICE - Extracted data:');
		console.log('   complejoId:', complejoId);
		console.log('   deporteId:', deporteId);
		console.log('   cancha data:', JSON.stringify(cancha, null, 2));
		
		// Verificar que el complejo existe
		console.log('🔍 CANCHA SERVICE - Verificando complejo...');
		const complejoExistente = await prisma.complejo.findUnique({
			where: { id: complejoId }
		});
		
		if (!complejoExistente) {
			console.log('❌ CANCHA SERVICE - Complejo no encontrado');
			throw new Error(`Complejo con ID ${complejoId} no existe`);
		}
		console.log('✅ CANCHA SERVICE - Complejo encontrado:', complejoExistente.nombre);
		
		// Verificar que el deporte existe
		console.log('🔍 CANCHA SERVICE - Verificando deporte...');
		const deporteExistente = await prisma.deporte.findUnique({
			where: { id: deporteId }
		});
		
		if (!deporteExistente) {
			console.log('❌ CANCHA SERVICE - Deporte no encontrado');
			throw new Error(`Deporte con ID ${deporteId} no existe`);
		}
		console.log('✅ CANCHA SERVICE - Deporte encontrado:', deporteExistente.nombre);
		
		console.log('🚀 CANCHA SERVICE - Creando cancha en la base de datos...');
		
		const nuevaCancha = await prisma.cancha.create({
			data: {
				...cancha,
				deporte: { connect: { id: deporteId }},
				complejo: { connect: { id: complejoId }},
			},
			include: {
				deporte: true,
				complejo: true
			}
		});
		
		console.log('✅ CANCHA SERVICE - Cancha creada exitosamente:', nuevaCancha);
		return nuevaCancha;
		
	} catch (error) {
		console.error('💥 CANCHA SERVICE - Error en crearCancha:', error);
		throw error;
	}
}

export async function obtenerCanchas(incluirInactivas: boolean = false) {
    return prisma.cancha.findMany({
        where: incluirInactivas ? {} : { activa: true },
        include: {
            deporte: true, // Para saber qué deporte se juega en la cancha
            complejo: {
                include: {
                    domicilio: {
                        include: {
                            localidad: true
                        }
                    }
                }
            }, // Para obtener datos del complejo con localidad
            cronograma: {
                orderBy: {
                    precio: 'asc'
                },
                take: 10 // Obtener varios horarios para calcular precio mínimo
            }
        },
    });
}

export async function obtenerCanchaPorId(id: number, permitirInactiva: boolean = false) {
	const cancha = await prisma.cancha.findUnique({
		where: { id },
		include: {
			deporte: true,
			complejo: {
				include: {
					domicilio: {
						include: {
							localidad: true
						}
					},
					servicios: {
						include: {
							servicio: true
						}
					}
				}
			},
			turnos: {
				where: {
					fecha: {
						gte: new Date(), // Solo turnos futuros
					}
				},
				orderBy: {
					fecha: 'asc'
				}
			}
		},
	});

	if (!cancha) {
		const error = new Error('Cancha no encontrada');
		(error as any).statusCode = 404;
		throw error;
	}

	// Si la cancha está inactiva y no se permite el acceso a inactivas, lanzar error
	if (!cancha.activa && !permitirInactiva) {
		const error = new Error('Cancha no disponible');
		(error as any).statusCode = 403;
		throw error;
	}

	return cancha;
};

export async function obtenerCanchasPorComplejoId(complejoId: number, incluirInactivas: boolean = false) {
  return prisma.cancha.findMany({
    where: {
      complejoId: complejoId, // Corregir: debe filtrar por complejoId, no por id
      ...(incluirInactivas ? {} : { activa: true })
    },
    include: {
      deporte: true,
      complejo: {
        include: {
          domicilio: {
            include: {
              localidad: true
            }
          }
        }
      },
      turnos: {
        where: {
          fecha: {
            gte: new Date(),
          }
        },
        take: 5,
        orderBy: {
          fecha: 'asc'
        }
      }
    },
  });
};

export async function actualizarCancha (id: number, data: UpdateCanchaRequest) {
	const { deporteId, ...cancha } = data;
  
  const updateData: any = { ...cancha };
  
  // Solo conectar deporte si deporteId está definido
  if (deporteId !== undefined) {
    updateData.deporte = { connect: { id: deporteId } };
  }
  
  return prisma.cancha.update({
    where: { id },
    data: updateData
  });
};

export async function eliminarCancha(id: number) {
	const alquileres = await prisma.alquiler.findMany({
		where: {
			estado: EstadoAlquiler.PAGADO,
			turnos: { some: { canchaId: id } },
		}
	});

	if (alquileres.length !== 0) {
		const error = new Error(`Eliminacion fallida: ${alquileres.length} alquileres por cumplir.`);
		(error as any).statusCode = 400;
		throw error;
 	}
	
  return prisma.cancha.delete({
    where: { id },
  });
};