import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restaurarServicios() {
  console.log('🔧 Restaurando servicios y reseñas...');
  
  try {
    // 1. Obtener todos los complejos
    const complejos = await prisma.complejo.findMany({
      where: { solicitud: { estado: 'APROBADA' } }
    });
    
    console.log(`📋 Encontrados ${complejos.length} complejos aprobados`);
    
    // 2. Obtener todos los servicios
    const servicios = await prisma.servicio.findMany();
    console.log(`🛠️ Encontrados ${servicios.length} servicios`);
    
    // 3. Asignar servicios aleatoriamente a cada complejo
    for (const complejo of complejos) {
      // Seleccionar 3-6 servicios aleatorios para cada complejo
      const numServicios = Math.floor(Math.random() * 4) + 3; // 3-6 servicios
      const serviciosAsignados = servicios.sort(() => 0.5 - Math.random()).slice(0, numServicios);
      
      for (const servicio of serviciosAsignados) {
        await prisma.complejoServicio.upsert({
          where: {
            complejoId_servicioId: {
              complejoId: complejo.id,
              servicioId: servicio.id
            }
          },
          update: { disponible: true },
          create: {
            complejoId: complejo.id,
            servicioId: servicio.id,
            disponible: true
          }
        });
      }
      
      console.log(`✅ Asignados ${serviciosAsignados.length} servicios al complejo: ${complejo.nombre}`);
    }
    
    // 4. Crear algunas reseñas de ejemplo
    console.log('📝 Creando reseñas de ejemplo...');
    
    // Obtener algunos alquileres existentes
    const alquileres = await prisma.alquiler.findMany({
      take: 10,
      include: { turnos: true }
    });
    
    const comentarios = [
      "Excelente lugar, muy bien mantenido y con todas las comodidades.",
      "Buena cancha, el césped está en perfecto estado.",
      "Muy recomendable, instalaciones limpias y buen servicio.",
      "Cancha profesional, ideal para jugar con amigos.",
      "Precio justo y buenas instalaciones. Volveremos.",
      "Personal muy amable y cancha en excelente estado.",
      "Una de las mejores canchas de la zona, 100% recomendable.",
      "Instalaciones modernas y muy bien cuidadas."
    ];
    
    for (const alquiler of alquileres.slice(0, 6)) {
      const puntaje = Math.floor(Math.random() * 2) + 4; // 4-5 estrellas
      const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
      
      await prisma.resenia.create({
        data: {
          puntaje,
          descripcion: comentario,
          alquilerId: alquiler.id
        }
      });
    }
    
    console.log('✅ Servicios y reseñas restaurados exitosamente!');
    console.log('📊 Verificando resultados...');
    
    // Verificar resultados
    const serviciosConComplejos = await prisma.servicio.findMany({
      include: {
        complejos: {
          where: { disponible: true }
        }
      }
    });
    
    const totalRelaciones = serviciosConComplejos.reduce((sum, s) => sum + s.complejos.length, 0);
    console.log(`🔗 Total de relaciones servicio-complejo: ${totalRelaciones}`);
    
    const totalResenas = await prisma.resenia.count();
    console.log(`📝 Total de reseñas: ${totalResenas}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restaurarServicios();