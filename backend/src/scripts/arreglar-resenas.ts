// Script para arreglar reseñas: cada usuario solo puede hacer UNA reseña por cancha
// Nota: Las reseñas están asociadas a Alquileres, no directamente a Canchas

import prisma from '../config/prisma';

async function arreglarResenas() {
  console.log('🔄 Arreglando reseñas...\n');

  // 1. Eliminar todas las reseñas existentes
  const resenasEliminadas = await prisma.resenia.deleteMany();
  console.log(`❌ Eliminadas ${resenasEliminadas.count} reseñas antiguas\n`);

  // 2. Obtener alquileres finalizados sin reseña
  const alquileresSinResena = await prisma.alquiler.findMany({
    where: {
      estado: 'FINALIZADO',
      resenia: null
    },
    include: {
      cliente: true,
      turnos: {
        include: {
          cancha: {
            include: {
              complejo: true,
              deporte: true
            }
          }
        }
      }
    }
  });

  console.log(`📊 ${alquileresSinResena.length} alquileres finalizados sin reseña\n`);

  // 3. Rastrear qué usuarios ya reseñaron qué canchas
  const resenasXUsuarioXCancha = new Map<string, Set<number>>();

  const comentariosPositivos = [
    'Excelente cancha, muy bien mantenida!',
    'Me encantó, volvería sin dudas',
    'Instalaciones impecables, muy recomendable',
    'Perfecta para jugar con amigos',
    'Buena atención y excelente estado de la cancha',
    'Todo muy limpio y organizado',
    'La cancha está en perfecto estado',
    'Muy buena experiencia, lo recomiendo'
  ];

  const comentariosNeutrales = [
    'Está bien, nada excepcional',
    'Cumple con lo esperado',
    'Cancha decente para el precio',
    'Es aceptable, podría mejorar'
  ];

  const comentariosNegativos = [
    'Podría estar mejor mantenida',
    'Falta un poco de mantenimiento',
    'Esperaba un poco más por el precio'
  ];

  let resenasCreadas = 0;
  let resenasOmitidas = 0;

  for (const alquiler of alquileresSinResena) {
    if (!alquiler.turnos.length) continue;

    const canchaId = alquiler.turnos[0].cancha.id;
    const userId = alquiler.clienteId;
    const userKey = `user-${userId}`;

    // Verificar si este usuario ya reseñó esta cancha
    if (!resenasXUsuarioXCancha.has(userKey)) {
      resenasXUsuarioXCancha.set(userKey, new Set());
    }

    const canchasReseñadas = resenasXUsuarioXCancha.get(userKey)!;
    
    if (canchasReseñadas.has(canchaId)) {
      // Este usuario ya reseñó esta cancha, saltar
      resenasOmitidas++;
      continue;
    }

    // Generar calificación y comentario 
    const puntaje = Math.random() > 0.15 
      ? Math.floor(Math.random() * 2) + 4 // 80% entre 4-5
      : Math.floor(Math.random() * 3) + 2; // 20% entre 2-4

    let descripcion;
    if (puntaje >= 4) {
      descripcion = comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];
    } else if (puntaje === 3) {
      descripcion = comentariosNeutrales[Math.floor(Math.random() * comentariosNeutrales.length)];
    } else {
      descripcion = comentariosNegativos[Math.floor(Math.random() * comentariosNegativos.length)];
    }

    try {
      await prisma.resenia.create({
        data: {
          descripcion,
          puntaje,
          alquilerId: alquiler.id
        }
      });

      canchasReseñadas.add(canchaId);
      resenasCreadas++;
      
      const cancha = alquiler.turnos[0].cancha;
      console.log(`✅ Reseña #${resenasCreadas}: ${alquiler.cliente.nombre} → ${cancha.complejo.nombre} (${cancha.deporte.nombre}) - ${puntaje}⭐`);
    } catch (error) {
      console.error(`❌ Error creando reseña para alquiler ${alquiler.id}: ${error}`);
    }
  }

  // 4. Actualizar el puntaje promedio de cada cancha
  console.log('\n📊 Actualizando puntajes de canchas...');
  
  const canchas = await prisma.cancha.findMany({
    include: {
      complejo: true,
      deporte: true
    }
  });

  for (const cancha of canchas) {
    // Obtener todas las reseñas de alquileres de esta cancha
    const resenas = await prisma.resenia.findMany({
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

    if (resenas.length > 0) {
      const promedio = resenas.reduce((sum, r) => sum + r.puntaje, 0) / resenas.length;
      await prisma.cancha.update({
        where: { id: cancha.id },
        data: { puntaje: Math.round(promedio * 10) / 10 }
      });
      console.log(`  ✓ ${cancha.complejo.nombre} - ${cancha.deporte.nombre}: ${promedio.toFixed(1)}⭐ (${resenas.length} reseñas)`);
    }
  }

  console.log(`\n✨ Proceso completado:`);
  console.log(`   📝 ${resenasCreadas} reseñas creadas`);
  console.log(`   ⏭️  ${resenasOmitidas} alquileres omitidos (usuario ya reseñó esa cancha)`);
  console.log(`   ✅ Cada usuario tiene máximo 1 reseña por cancha`);
  
  await prisma.$disconnect();
}

arreglarResenas().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

