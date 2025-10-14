// backend/src/services/cancha.service.ts
import prisma from '../config/prisma';
import { CreateCanchaRequest, UpdateCanchaRequest } from '../types/cancha.types'
import { EstadoAlquiler } from '@prisma/client';

// Función para calcular el puntaje promedio de una cancha basado en sus reseñas
export async function calcularPuntajeCancha(canchaId: number): Promise<number> {
  try {
    const resenias = await prisma.resenia.findMany({
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

    if (resenias.length === 0) {
      return 0; // Sin reseñas, puntaje 0
    }

    const sumaTotal = resenias.reduce((sum, resenia) => sum + resenia.puntaje, 0);
    return Math.round((sumaTotal / resenias.length) * 10) / 10; // Redondear a 1 decimal
  } catch (error) {
    console.error('Error calculando puntaje de cancha:', error);
    return 0;
  }
}

// Función para calcular el puntaje promedio de un complejo basado en todas las reseñas de sus canchas
export async function calcularPuntajeComplejo(complejoId: number): Promise<number> {
  try {
    const resenias = await prisma.resenia.findMany({
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
      select: {
        puntaje: true
      }
    });

    if (resenias.length === 0) {
      return 0; // Sin reseñas, puntaje 0
    }

    const sumaTotal = resenias.reduce((sum, resenia) => sum + resenia.puntaje, 0);
    return Math.round((sumaTotal / resenias.length) * 10) / 10; // Redondear a 1 decimal
  } catch (error) {
    console.error('Error calculando puntaje de complejo:', error);
    return 0;
  }
}

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

export async function crearCancha(canchaData: any) {
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

export async function obtenerCanchasConFiltros(incluirInactivas: boolean = false, filtros: any = {}) {
    // Construir filtros dinámicos
    const where: any = {
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
        select: {
            id: true,
            nombre: true,
            nroCancha: true,
            descripcion: true,
            puntaje: true,
            precioDesde: true,
            image: true,
            activa: true,
            precioHora: true,
            deporte: {
                select: {
                    id: true,
                    nombre: true,
                    icono: true
                }
            },
            complejo: {
                select: {
                    id: true,
                    nombre: true,
                    domicilio: {
                        select: {
                            id: true,
                            calle: true,
                            altura: true,
                            localidad: {
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            }
                        }
                    }
                }
            },
            cronograma: {
                select: {
                    id: true,
                    diaSemana: true,
                    horaInicio: true,
                    horaFin: true,
                    precio: true
                },
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

	// Calcular puntajes dinámicos
	const puntajeCancha = await calcularPuntajeCancha(cancha.id);
	const puntajeComplejo = await calcularPuntajeComplejo(cancha.complejo.id);

	return {
		...cancha,
		puntaje: puntajeCancha, // Puntaje dinámico de la cancha
		complejo: {
			...cancha.complejo,
			puntaje: puntajeComplejo // Puntaje dinámico del complejo
		}
	};
};

export async function obtenerCanchasPorComplejoId(complejoId: number, incluirInactivas: boolean = false) {
  const canchas = await prisma.cancha.findMany({
    where: {
      complejoId: complejoId,
      ...(incluirInactivas ? {} : { activa: true })
    },
    select: {
      id: true,
      nombre: true,
      nroCancha: true,
      descripcion: true,
      puntaje: true,
      image: true,
      activa: true,
      precioHora: true,
      deporte: {
        select: {
          id: true,
          nombre: true,
          icono: true
        }
      },
      complejo: {
        select: {
          id: true,
          nombre: true,
          domicilio: {
            select: {
              id: true,
              calle: true,
              altura: true,
              localidad: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          }
        }
      },
      cronograma: {
        select: {
          id: true,
          diaSemana: true,
          horaInicio: true,
          horaFin: true,
          precio: true
        },
        orderBy: {
          precio: 'asc'
        },
        take: 5
      }
    },
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

