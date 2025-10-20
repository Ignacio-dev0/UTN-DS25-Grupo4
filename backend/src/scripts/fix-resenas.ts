// Script para arreglar las reseñas de todas las canchas
// Asegura que cada cancha tenga al menos 5 reseñas y actualiza los puntajes

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const comentariosPositivos = [
  "Excelente cancha, muy buena iluminación y en perfectas condiciones",
  "Muy buen lugar, limpio y bien mantenido",
  "Gran experiencia, volveremos seguro",
  "Instalaciones de primera calidad, totalmente recomendable",
  "Perfecta ubicación y excelente estado de la cancha",
  "Muy buena atención y las canchas están impecables",
  "Lugar muy cómodo, con todo lo necesario",
  "Canchas de excelente calidad, muy profesional todo",
  "Recomendado al 100%, gran experiencia deportiva",
  "Instalaciones modernas y muy bien cuidadas",
  "Excelente relación precio-calidad",
  "Muy buena experiencia, todo muy prolijo",
  "Gran lugar para practicar deporte, lo recomiendo",
  "Canchas en perfecto estado, excelente servicio",
  "Muy satisfechos con las instalaciones y la atención",
  "Lugar impecable, volveremos sin dudas",
  "Excelente complejo, todo muy ordenado y limpio",
  "Muy buena infraestructura, canchas de calidad",
  "Recomendable para jugar con amigos, muy buen ambiente",
  "Instalaciones de primer nivel, excelente mantenimiento"
];

async function main() {
  console.log('🔍 Analizando reseñas de canchas...\n');

  try {
    // 1. Obtener todas las canchas
    const canchas = await prisma.cancha.findMany({
      include: {
        complejo: true,
        deporte: true
      }
    });

    console.log(`📊 Total de canchas: ${canchas.length}\n`);

    // 2. Obtener todos los clientes disponibles
    const clientes = await prisma.usuario.findMany({
      where: {
        rol: 'CLIENTE'
      }
    });

    console.log(`👥 Total de clientes disponibles: ${clientes.length}\n`);

    // 3. Analizar reseñas por cancha
    let canchasSinResenas = 0;
    let canchasConPocasResenas = 0;
    let canchasOk = 0;

    for (const cancha of canchas) {
      // Obtener reseñas de esta cancha
      const resenias = await prisma.resenia.findMany({
        where: {
          alquiler: {
            turnos: {
              some: {
                canchaId: cancha.id
              }
            }
          }
        }
      });

      const cantidadResenas = resenias.length;

      if (cantidadResenas === 0) {
        console.log(`❌ ${cancha.complejo.nombre} - Cancha ${cancha.nroCancha} (${cancha.deporte.nombre}): SIN RESEÑAS`);
        canchasSinResenas++;
      } else if (cantidadResenas < 5) {
        console.log(`⚠️  ${cancha.complejo.nombre} - Cancha ${cancha.nroCancha} (${cancha.deporte.nombre}): ${cantidadResenas} reseñas (necesita más)`);
        canchasConPocasResenas++;
      } else {
        canchasOk++;
      }
    }

    console.log(`\n📈 Resumen:`);
    console.log(`   ✅ Canchas con 5+ reseñas: ${canchasOk}`);
    console.log(`   ⚠️  Canchas con 1-4 reseñas: ${canchasConPocasResenas}`);
    console.log(`   ❌ Canchas sin reseñas: ${canchasSinResenas}`);
    console.log(`   🎯 Canchas que necesitan reseñas: ${canchasSinResenas + canchasConPocasResenas}\n`);

    // 4. Preguntar si desea corregir
    console.log('🔧 Generando reseñas faltantes...\n');

    let reseniasCreadas = 0;
    let canchasCorregidas = 0;

    for (const cancha of canchas) {
      // Obtener reseñas actuales de esta cancha
      const reseniasActuales = await prisma.resenia.findMany({
        where: {
          alquiler: {
            turnos: {
              some: {
                canchaId: cancha.id
              }
            }
          }
        },
        include: {
          alquiler: {
            include: {
              cliente: true
            }
          }
        }
      });

      const reseniasNecesarias = 5 - reseniasActuales.length;

      if (reseniasNecesarias > 0) {
        console.log(`🔨 Generando ${reseniasNecesarias} reseñas para ${cancha.complejo.nombre} - Cancha ${cancha.nroCancha}`);

        // Obtener clientes que ya dejaron reseña en esta cancha
        const clientesConResena = reseniasActuales.map(r => r.alquiler.clienteId);

        // Filtrar clientes disponibles (que no hayan dejado reseña)
        const clientesDisponibles = clientes.filter(c => !clientesConResena.includes(c.id));

        if (clientesDisponibles.length === 0) {
          console.log(`   ⚠️  No hay suficientes clientes disponibles para generar reseñas`);
          continue;
        }

        // Crear reseñas necesarias
        for (let i = 0; i < reseniasNecesarias && i < clientesDisponibles.length; i++) {
          const cliente = clientesDisponibles[i];

          // Crear un alquiler simulado (pasado)
          const fechaPasada = new Date();
          fechaPasada.setDate(fechaPasada.getDate() - Math.floor(Math.random() * 30) - 7); // Entre 7 y 37 días atrás

          const turno = await prisma.turno.findFirst({
            where: {
              canchaId: cancha.id,
              fecha: {
                lt: new Date() // Turno pasado
              },
              alquilerId: null
            }
          });

          if (!turno) {
            console.log(`   ⚠️  No se encontró turno disponible para crear alquiler`);
            continue;
          }

          // Crear alquiler
          const alquiler = await prisma.alquiler.create({
            data: {
              clienteId: cliente.id,
              estado: 'FINALIZADO',
              createdAt: fechaPasada,
              turnos: {
                connect: { id: turno.id }
              },
              pago: {
                create: {
                  metodoPago: 'DEBITO',
                  monto: turno.precio,
                  codigoTransaccion: `SIM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  fechaHora: fechaPasada
                }
              }
            }
          });

          // Marcar turno como reservado
          await prisma.turno.update({
            where: { id: turno.id },
            data: {
              reservado: true,
              alquilerId: alquiler.id
            }
          });

          // Generar puntaje (60% de 5 estrellas, 30% de 4 estrellas, 10% de 3 estrellas)
          let puntaje = 5;
          const rand = Math.random();
          if (rand > 0.60 && rand <= 0.90) {
            puntaje = 4;
          } else if (rand > 0.90) {
            puntaje = 3;
          }

          // Crear reseña
          const comentario = comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];

          await prisma.resenia.create({
            data: {
              descripcion: comentario,
              puntaje: puntaje,
              alquilerId: alquiler.id
            }
          });

          reseniasCreadas++;
        }

        canchasCorregidas++;
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   📝 Reseñas creadas: ${reseniasCreadas}`);
    console.log(`   🏟️  Canchas corregidas: ${canchasCorregidas}\n`);

    // 5. Recalcular puntajes de todas las canchas
    console.log('🔄 Recalculando puntajes de todas las canchas...\n');

    for (const cancha of canchas) {
      // Obtener reseñas de esta cancha
      const resenias = await prisma.resenia.findMany({
        where: {
          alquiler: {
            turnos: {
              some: {
                canchaId: cancha.id
              }
            }
          }
        },
        select: {
          puntaje: true
        }
      });

      if (resenias.length === 0) {
        // Sin reseñas, puntaje 0
        await prisma.cancha.update({
          where: { id: cancha.id },
          data: { puntaje: 0 }
        });
        console.log(`   ${cancha.complejo.nombre} - Cancha ${cancha.nroCancha}: 0.0 ⭐ (sin reseñas)`);
      } else {
        // Calcular promedio
        const sumaTotal = resenias.reduce((sum, r) => sum + r.puntaje, 0);
        const promedio = sumaTotal / resenias.length;

        await prisma.cancha.update({
          where: { id: cancha.id },
          data: { puntaje: promedio }
        });

        console.log(`   ${cancha.complejo.nombre} - Cancha ${cancha.nroCancha}: ${promedio.toFixed(1)} ⭐ (${resenias.length} reseñas)`);
      }
    }

    // 6. Recalcular puntajes de todos los complejos
    console.log('\n🔄 Recalculando puntajes de complejos...\n');

    const complejos = await prisma.complejo.findMany({
      include: {
        canchas: {
          include: {
            turnos: {
              include: {
                alquiler: {
                  include: {
                    resenia: true
                  }
                }
              }
            }
          }
        }
      }
    });

    for (const complejo of complejos) {
      // Obtener todas las reseñas de todas las canchas del complejo
      const todasLasResenias = complejo.canchas.flatMap(cancha =>
        cancha.turnos
          .filter(turno => turno.alquiler?.resenia)
          .map(turno => turno.alquiler!.resenia!)
      );

      if (todasLasResenias.length === 0) {
        await prisma.complejo.update({
          where: { id: complejo.id },
          data: { puntaje: 0 }
        });
        console.log(`   ${complejo.nombre}: 0.0 ⭐ (sin reseñas)`);
      } else {
        const sumaTotal = todasLasResenias.reduce((sum, r) => sum + r.puntaje, 0);
        const promedio = sumaTotal / todasLasResenias.length;

        await prisma.complejo.update({
          where: { id: complejo.id },
          data: { puntaje: promedio }
        });

        console.log(`   ${complejo.nombre}: ${promedio.toFixed(1)} ⭐ (${todasLasResenias.length} reseñas)`);
      }
    }

    console.log('\n✅ ¡Proceso completo! Todas las canchas tienen al menos 5 reseñas y los puntajes están actualizados.\n');

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
