// Script para normalizar los nombres de imágenes en la base de datos
// Convierte futbol5_01.jpg -> futbol5_1.jpg

import prisma from '../config/prisma';

async function normalizarImagenes() {
  console.log('🔄 Normalizando nombres de imágenes en la base de datos...\n');

  // Obtener todas las canchas con imágenes
  const canchas = await prisma.cancha.findMany();

  console.log(`📋 Encontradas ${canchas.length} canchas\n`);

  let actualizadas = 0;

  for (const cancha of canchas) {
    if (!cancha.image || cancha.image.length === 0) continue;

    // Normalizar cada imagen del array
    const imagenesNormalizadas = cancha.image.map((img: string) => {
      // Convertir números con leading zero a números sin leading zero
      // futbol5_01.jpg -> futbol5_1.jpg
      return img.replace(/(_)0(\d)(\.[a-z]+)$/i, '$1$2$3');
    });

    // Verificar si hubo cambios
    const huboCambios = imagenesNormalizadas.some((img: string, index: number) => img !== cancha.image[index]);

    if (huboCambios) {
      await prisma.cancha.update({
        where: { id: cancha.id },
        data: { image: imagenesNormalizadas }
      });
      
      console.log(`✅ Cancha ${cancha.id}:`);
      console.log(`   Antes: [${cancha.image.join(', ')}]`);
      console.log(`   Después: [${imagenesNormalizadas.join(', ')}]`);
      actualizadas++;
    }
  }

  // También normalizar imágenes de complejos (String simple, no array)
  const complejos = await prisma.complejo.findMany();

  console.log(`\n📋 Encontrados ${complejos.length} complejos\n`);

  for (const complejo of complejos) {
    if (!complejo.image) continue;

    const imagenNormalizada = complejo.image.replace(/(_)0(\d)(\.[a-z]+)$/i, '$1$2$3');

    if (imagenNormalizada !== complejo.image) {
      await prisma.complejo.update({
        where: { id: complejo.id },
        data: { image: imagenNormalizada }
      });
      
      console.log(`✅ Complejo ${complejo.id}: ${complejo.image} -> ${imagenNormalizada}`);
      actualizadas++;
    }
  }

  console.log(`\n✨ Proceso completado: ${actualizadas} registros actualizados`);
  
  await prisma.$disconnect();
}

normalizarImagenes().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
