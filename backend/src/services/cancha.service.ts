// backend/src/services/cancha.service.ts
import prisma from '../config/prisma';
import { CanchaFull } from '../types/cancha.types'
import { Prisma, EstadoAlquiler } from '@prisma/client';
import { CreateCanchaData, UpdateCanchaData } from '../validations/cancha.validation';

// Los puntajes de cancha y complejo se actualizan cada vez que se instancia una reseña

// Función para recalcular el precio "desde" de una cancha
export async function recalcularPrecioDesde(canchaId: number) {
    try {
        // Obtener turnos disponibles de la cancha
        const turnos = await prisma.turno.findMany({
            where: {
                canchaId: canchaId,
                reservado: false,
                fecha: { gte: new Date() } // Solo turnos futuros
            },
            select: { precio: true }
        });

        let precioMinimo = 0;

        if (turnos.length > 0) {
            // Si hay turnos, usar el precio más barato de los turnos
            precioMinimo = Math.min(...turnos.map(t => t.precio));
        } else {
            // Si no hay turnos, usar el precio más barato del cronograma
            const cronogramas = await prisma.horarioCronograma.findMany({
                where: { canchaId },
                select: { precio: true }
            });

            precioMinimo = cronogramas.length > 0 
                ? Math.min(...cronogramas.map(c => c.precio))
                : 0;
        }

        // Actualizar el precio "desde" de la cancha y el precio hora para compatibilidad
        await prisma.cancha.update({
            where: { id: canchaId },
            data: { 
                precioDesde: precioMinimo,
                precioHora: precioMinimo // Mantener compatibilidad con código existente
            }
        });

        // También actualizar el precio "desde" del complejo
        try {
            const { actualizarPrecioDesdeComplejo } = require('./camposCalculados.service.js');
            const cancha = await prisma.cancha.findUnique({
                where: { id: canchaId },
                select: { complejoId: true }
            });
            if (cancha) {
                await actualizarPrecioDesdeComplejo(cancha.complejoId);
            }
        } catch (error) {
            console.error('❌ Error actualizando precio desde del complejo:', error);
        }

        console.log(`✅ Precio "desde" recalculado para cancha ${canchaId}: $${precioMinimo}`);
    } catch (error) {
        console.error(`❌ Error recalculando precio para cancha ${canchaId}:`, error);
    }
}

export async function crearCancha(canchaData: CreateCanchaData) {
	try {
		console.log('🔧 CANCHA SERVICE - crearCancha called with data:', JSON.stringify(canchaData, null, 2));
		
		const { complejoId, deporteId, ...cancha } = canchaData;
		
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
		
		// Generar nroCancha automáticamente (obtener el máximo + 1 para el complejo)
		console.log('🔢 CANCHA SERVICE - Generando número de cancha automático...');
		const ultimaCancha = await prisma.cancha.findFirst({
			where: { complejoId: complejoId },
			orderBy: { nroCancha: 'desc' }
		});
		
		const nuevoNroCancha = ultimaCancha ? ultimaCancha.nroCancha + 1 : 1;
		console.log('✅ CANCHA SERVICE - Número de cancha generado:', nuevoNroCancha);
		
		// Crear data para la nueva cancha, sobrescribiendo nroCancha si viene en los datos
		const dataCancha = {
			...cancha,
			nroCancha: nuevoNroCancha, // Siempre usar el número generado automáticamente
		};
		
		console.log('🚀 CANCHA SERVICE - Creando cancha en la base de datos...');
		
		const nuevaCancha = await prisma.cancha.create({
			data: {
				...dataCancha,
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
    return obtenerCanchasConFiltros(incluirInactivas, {});
}

export async function obtenerCanchasConFiltros(
  incluirInactivas: boolean = false,
  filtros: any = {}
): Promise<CanchaFull[]> {

    // Construir filtros dinámicos
    const where: Prisma.CanchaWhereInput = {
        ...(incluirInactivas ? {} : { activa: true })
    };

    // Filtro por deporte
    if (filtros.deporte) {
        where.deporte = {
            nombre: {
                contains: filtros.deporte,
                mode: 'insensitive'
            }
        };
    }

    // Filtro por localidad
    if (filtros.localidad) {
        where.complejo = {
            domicilio: {
                localidad: {
                    nombre: {
                        contains: filtros.localidad,
                        mode: 'insensitive'
                    }
                }
            }
        };
    }

    const canchas = await prisma.cancha.findMany({
        where,
        include: {
            cronograma: {
                orderBy: {
                    precio: 'asc'
                },
                take: 5 // Reducir la cantidad de cronogramas
            }
        },
    });

    // Filtros adicionales para fecha y hora (requieren lógica especial)
    let canchasFiltradas = canchas;

    if (filtros.fecha || filtros.hora) {
        canchasFiltradas = await filtrarPorFechaYHora(canchas, filtros.fecha, filtros.hora);
    }

    // ✅ OPTIMIZACIÓN: Usar campo precalculado precioDesde en lugar de calcular dinámicamente
    const canchasConPrecios = canchasFiltradas.map(cancha => ({
        ...cancha,
        precioDesde: cancha.precioDesde || cancha.precioHora || 0
    }));

    return canchasConPrecios;
}

// Función auxiliar para filtrar por fecha y hora
async function filtrarPorFechaYHora(canchas: any[], fecha?: string, hora?: string) {
    if (!fecha && !hora) return canchas;

    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const canchasFiltradas = [];

    for (const cancha of canchas) {
        let tieneDisponibilidad = false;

        if (fecha && hora) {
            // Verificar disponibilidad para fecha y hora específica
            const fechaConsulta = new Date(fecha);
            const diaConsulta = diasSemana[fechaConsulta.getDay()];
            
            // Convertir hora a formato de tiempo para comparar - manejar diferentes formatos
            let horaLimpia = hora.replace(/hs?$/i, ''); // Remover "hs" o "h" al final
            const [horas, minutos = '00'] = horaLimpia.split(':');
            const horaConsulta = new Date(`1970-01-01T${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}:00.000Z`);
            
            // PRIMERO: Verificar turnos existentes para esa fecha y hora específica
            const turnoDisponible = await prisma.turno.findFirst({
                where: {
                    canchaId: cancha.id,
                    fecha: fechaConsulta,
                    horaInicio: horaConsulta,
                    reservado: false
                }
            });
            
            if (turnoDisponible) {
                tieneDisponibilidad = true;
            } else {
                // SEGUNDO: Si no hay turno específico, verificar cronograma regular
                const cronogramasDelDia = cancha.cronograma.filter(c => c.diaSemana === diaConsulta);
                
                for (const cronograma of cronogramasDelDia) {
                    if (cronograma.horaInicio <= horaConsulta && cronograma.horaFin > horaConsulta) {
                        // Verificar si no hay un turno ya reservado en esa fecha/hora
                        const turnoReservado = await prisma.turno.findFirst({
                            where: {
                                canchaId: cancha.id,
                                fecha: fechaConsulta,
                                horaInicio: horaConsulta,
                                reservado: true
                            }
                        });
                        
                        if (!turnoReservado) {
                            tieneDisponibilidad = true;
                            break;
                        }
                    }
                }
            }
        } else if (fecha) {
            // Solo verificar fecha - buscar disponibilidad en turnos Y cronograma
            const fechaConsulta = new Date(fecha);
            const diaConsulta = diasSemana[fechaConsulta.getDay()];
            
            // PRIMERO: Verificar si hay turnos disponibles para esa fecha
            const turnosDisponibles = await prisma.turno.findMany({
                where: {
                    canchaId: cancha.id,
                    fecha: fechaConsulta,
                    reservado: false
                }
            });
            
            if (turnosDisponibles.length > 0) {
                tieneDisponibilidad = true;
            } else {
                // SEGUNDO: Si no hay turnos específicos, verificar cronograma
                const cronogramasDelDia = cancha.cronograma.filter(c => c.diaSemana === diaConsulta);
                tieneDisponibilidad = cronogramasDelDia.length > 0;
            }
        } else if (hora) {
            // Solo verificar hora - buscar en turnos Y cronograma - manejar diferentes formatos
            let horaLimpia = hora.replace(/hs?$/i, ''); // Remover "hs" o "h" al final
            const [horas, minutos = '00'] = horaLimpia.split(':');
            const horaConsulta = new Date(`1970-01-01T${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}:00.000Z`);
            
            // PRIMERO: Verificar turnos con esa hora (cualquier fecha futura)
            const turnosConHora = await prisma.turno.findMany({
                where: {
                    canchaId: cancha.id,
                    horaInicio: horaConsulta,
                    fecha: { gte: new Date() }, // Solo fechas futuras
                    reservado: false
                }
            });
            
            if (turnosConHora.length > 0) {
                tieneDisponibilidad = true;
            } else {
                // SEGUNDO: Verificar en cronograma regular
                for (const cronograma of cancha.cronograma) {
                    if (cronograma.horaInicio <= horaConsulta && cronograma.horaFin > horaConsulta) {
                        tieneDisponibilidad = true;
                        break;
                    }
                }
            }
        }

        if (tieneDisponibilidad) {
            canchasFiltradas.push(cancha);
        }
    }

    return canchasFiltradas;
}

// Función auxiliar para calcular precio desde
async function calcularPrecioDesde(canchas: any[], fecha?: string) {
    const canchasConPrecio = [];
    
    for (const cancha of canchas) {
        let precioMinimo = 0;
        
        // Primero intentar obtener precios de turnos existentes
        const whereConditions: any = {
            canchaId: cancha.id,
            reservado: false,
            fecha: { gte: new Date() } // Solo turnos futuros
        };
        
        if (fecha) {
            whereConditions.fecha = new Date(fecha);
        }
        
        const turnos = await prisma.turno.findMany({
            where: whereConditions,
            select: { precio: true }
        });
        
        if (turnos.length > 0) {
            // Si hay turnos, usar el precio más barato de los turnos
            precioMinimo = Math.min(...turnos.map(t => t.precio));
        } else {
            // Si no hay turnos, usar el precio del cronograma
            const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
            
            if (fecha) {
                const fechaConsulta = new Date(fecha);
                const diaConsulta = diasSemana[fechaConsulta.getDay()];
                const cronogramasDelDia = cancha.cronograma.filter(c => c.diaSemana === diaConsulta);
                precioMinimo = cronogramasDelDia.length > 0 
                    ? Math.min(...cronogramasDelDia.map(c => c.precio))
                    : 0;
            } else {
                precioMinimo = cancha.cronograma.length > 0 
                    ? Math.min(...cancha.cronograma.map(c => c.precio))
                    : 0;
            }
        }
        
        canchasConPrecio.push({
            ...cancha,
            precioDesde: precioMinimo
        });
    }
    
    return canchasConPrecio;
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

export async function obtenerCanchasPorComplejoId(
  complejoId: number,
  incluirInactivas: boolean = false
): Promise<CanchaFull[]> {
  const canchas = await prisma.cancha.findMany({
    where: {
      complejoId,
      ...(incluirInactivas ? {} : { activa: true })
    },
    include: {
      cronograma: true
    }
  });

  // Agregar precio mínimo de cada cancha (solo del día actual)
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const hoy = diasSemana[new Date().getDay()];
  
  const canchasConPrecios = canchas.map(cancha => {
    // Filtrar solo los cronogramas del día actual
    const cronogramasHoy = cancha.cronograma?.filter(c => c.diaSemana === hoy) || [];
    
    // Encontrar el precio más barato SOLO de hoy
    const precioMinimo = cronogramasHoy.length > 0 
      ? Math.min(...cronogramasHoy.map(c => c.precio))
      : 0;
      
    return {
      ...cancha,
      precioDesde: precioMinimo
    };
  });

  return canchasConPrecios;
};

export async function actualizarCancha (id: number, data: UpdateCanchaData) {
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
	// Verificar que la cancha existe
	const canchaExistente = await prisma.cancha.findUnique({
		where: { id }
	});
	
	if (!canchaExistente) {
		const error = new Error(`La cancha con ID ${id} no existe`);
		(error as any).statusCode = 404;
		throw error;
	}

	// Verificar si hay alquileres pagados que referencien turnos de esta cancha
	const alquileres = await prisma.alquiler.findMany({
		where: {
			estado: EstadoAlquiler.PAGADO,
			turnos: { some: { canchaId: id } },
		}
	});

	if (alquileres.length !== 0) {
		const error = new Error(`No se puede eliminar la cancha porque tiene ${alquileres.length} reserva${alquileres.length > 1 ? 's' : ''} confirmada${alquileres.length > 1 ? 's' : ''} pendiente${alquileres.length > 1 ? 's' : ''} de cumplir.`);
		(error as any).statusCode = 400;
		throw error;
 	}
	
	// Eliminar turnos asociados primero
	await prisma.turno.deleteMany({
		where: { canchaId: id }
	});
	
	// Eliminar cronogramas asociados
	await prisma.horarioCronograma.deleteMany({
		where: { canchaId: id }
	});
	
  return prisma.cancha.delete({
    where: { id },
  });
};

export async function esDuenioDeCancha(canchaId: number, usuarioId: number): Promise<boolean> {
  const cancha = await obtenerCanchaPorId(canchaId);
  return cancha.complejo.usuarioId === usuarioId;
}

export async function obtenerReseniasCancha(canchaId: number) {
  const alquileres = await prisma.alquiler.findMany({
    where: {
      turnos: { some: { canchaId } },
      resenia: { isNot: null }
    },
    select: { resenia: true }
  });
  return alquileres.map(a => a.resenia);
}

export async function recalcularPuntaje(canchaId: number) {
  const resenias = await obtenerReseniasCancha(canchaId);
  
  // Recalculo el promedio de puntajes de las resenias
  const puntaje = resenias.reduce((acc, r) => acc += r.puntaje, 0) / resenias.length;

  return await prisma.cancha.update({
    where: { id: canchaId },
    data: { puntaje }
  });
}