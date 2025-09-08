// backend/src/services/cancha.service.ts
import prisma from '../config/prisma';
import { CreateCanchaRequest, UpdateCanchaRequest } from '../types/cancha.types'
import { EstadoAlquiler } from '../generated/prisma';

export async function crearCancha(data: CreateCanchaRequest) {
	const { complejoId, deporteId, ...cancha } = data;
  return prisma.cancha.create({
		data: {
			...cancha,
			deporte: { connect: { id: deporteId }},
			complejo: { connect: { id: complejoId }},
		}
	});
}

export async function obtenerCanchas() {
  return prisma.cancha.findMany({
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
      turnos: {
        where: {
          fecha: {
            gte: new Date(), // Solo turnos futuros
          }
        },
        take: 5, // Solo los próximos 5 turnos
        orderBy: {
          fecha: 'asc'
        }
      }
    },
  });
};

export async function obtenerCanchaPorId(id: number) {
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

	return cancha;
};

export async function obtenerCanchasPorComplejoId(complejoId: number) {
  return prisma.cancha.findMany({
    where: {
      complejoId: complejoId, // Corregir: debe filtrar por complejoId, no por id
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
  return prisma.cancha.update({
    where: { id },
    data: {
			...cancha,
			deporte: { connect: { id: deporteId } },
		}
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