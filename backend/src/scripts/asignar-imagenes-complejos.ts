// Script para asignar imágenes a los complejos desde sus canchas


import prisma from '../config/prisma';

async function asignarImagenesComplejos() {
  console.log('🖼️ Iniciando asignación de imágenes a complejos...\n');

  try {
    // 1. Obtener todos los complejos
    const complejos = await prisma.complejo.findMany({
      include: {
        canchas: {
          select: {
            id: true,
            image: true
          }
        }
      }
    });

    console.log(`📊 Total de complejos encontrados: ${complejos.length}\n`);

    // 2. Obtener todas las imágenes de canchas disponibles
    const todasLasCanchas = await prisma.cancha.findMany({
      where: {
        image: {
          isEmpty: false // Solo canchas que tienen imágenes
        }
      },
      select: {
        id: true,
        image: true
      }
    });

    const imagenesDisponibles = todasLasCanchas
      .filter(c => c.image.length > 0)
      .map(c => c.image[0]);

    console.log(`🎨 Total de imágenes de canchas disponibles: ${imagenesDisponibles.length}\n`);

    if (imagenesDisponibles.length === 0) {
      console.log('❌ No hay imágenes de canchas disponibles. Asegúrate de que las canchas tengan imágenes.');
      return;
    }

    let actualizados = 0;
    let conImagenPropia = 0;
    let conImagenRandom = 0;

    // 3. Procesar cada complejo
    for (const complejo of complejos) {
      let imagenAsignada: string | null = null;

      // Caso 1: El complejo tiene canchas con imágenes
      if (complejo.canchas.length > 0) {
        const canchaConImagen = complejo.canchas.find(c => c.image.length > 0);
        
        if (canchaConImagen) {
          imagenAsignada = canchaConImagen.image[0];
          console.log(`✅ Complejo "${complejo.nombre}" (ID: ${complejo.id}): Usando imagen de su cancha`);
          conImagenPropia++;
        }
      }

      // Caso 2: El complejo NO tiene canchas o ninguna cancha tiene imagen
      if (!imagenAsignada) {
        // Asignar una imagen aleatoria de cualquier cancha
        const imagenRandom = imagenesDisponibles[Math.floor(Math.random() * imagenesDisponibles.length)];
        imagenAsignada = imagenRandom;
        console.log(`🎲 Complejo "${complejo.nombre}" (ID: ${complejo.id}): Usando imagen random (sin canchas)`);
        conImagenRandom++;
      }

      // Actualizar el complejo con la imagen
      if (imagenAsignada) {
        await prisma.complejo.update({
          where: { id: complejo.id },
          data: { image: imagenAsignada }
        });
        actualizados++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log('='.repeat(60));
    console.log(`✅ Total de complejos actualizados: ${actualizados}`);
    console.log(`🏟️  Con imagen de su propia cancha: ${conImagenPropia}`);
    console.log(`🎲 Con imagen random (sin canchas): ${conImagenRandom}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error asignando imágenes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
asignarImagenesComplejos()
  .then(() => {
    console.log('\n✨ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
