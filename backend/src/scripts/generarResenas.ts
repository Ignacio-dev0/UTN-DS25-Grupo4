import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generarResenas() {
  console.log('📝 Generando 4 reseñas por cancha...');
  
  try {
    // 1. Obtener todas las canchas activas
    const canchas = await prisma.cancha.findMany({
      where: { activa: true },
      include: {
        complejo: {
          select: { nombre: true }
        }
      }
    });
    
    console.log(`🏟️ Encontradas ${canchas.length} canchas activas`);
    
    // 2. Obtener usuarios clientes para asignar como autores de reseñas
    const clientes = await prisma.usuario.findMany({
      where: { rol: 'CLIENTE' },
      take: 20 // Suficientes para variar
    });
    
    console.log(`👥 Encontrados ${clientes.length} clientes`);
    
    // 3. Comentarios variados para las reseñas
    const comentarios = [
      "Excelente cancha, muy bien mantenida. El césped está perfecto y las instalaciones son de primera.",
      "Muy buena experiencia. Personal amable y cancha en óptimas condiciones. Totalmente recomendable.",
      "Cancha profesional con todas las comodidades. Vestuarios limpios y buen estacionamiento.",
      "Una de las mejores canchas de la zona. Precio justo y excelente calidad de juego.",
      "Instalaciones modernas y muy cuidadas. Ideal para jugar con amigos o entrenar.",
      "Cancha de primer nivel. El complejo cuenta con todos los servicios necesarios.",
      "Experiencia excepcional. Cancha perfecta y atención de calidad. Volveremos seguro.",
      "Muy satisfecho con la reserva. Cancha bien iluminada y en excelente estado.",
      "Recomiendo 100%. Instalaciones impecables y muy buena ubicación.",
      "Cancha de alta calidad. Personal profesional y instalaciones de primera.",
      "Excelente relación precio-calidad. Cancha mantenida y servicios completos.",
      "Una experiencia fantástica. Todo muy limpio y organizado. Cinco estrellas.",
      "Cancha profesional con césped sintético de excelente calidad. Muy recomendable.",
      "Instalaciones de lujo. Vestuarios modernos y cancha en perfecto estado.",
      "Servicio impecable y cancha de primera. Definitivamente la mejor opción de la zona.",
      "Cancha espectacular, bien equipada y con todas las comodidades necesarias.",
      "Muy buena atención al cliente y cancha en óptimas condiciones de juego.",
      "Complejo deportivo excelente. Cancha perfecta para competir al más alto nivel.",
      "Instalaciones de calidad superior. Personal atento y cancha impecable.",
      "Una experiencia deportiva inolvidable. Cancha profesional y ambiente genial."
    ];
    
    let totalResenasCreadas = 0;
    
    // 4. Para cada cancha, crear exactamente 4 reseñas
    for (const cancha of canchas) {
      console.log(`\n🏟️ Procesando cancha ID ${cancha.id} - ${cancha.complejo.nombre}`);
      
      // Verificar si ya tiene reseñas (eliminarlas para empezar limpio)
      const resenasExistentes = await prisma.resenia.findMany({
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
      
      if (resenasExistentes.length > 0) {
        console.log(`🗑️ Eliminando ${resenasExistentes.length} reseñas existentes...`);
        for (const resena of resenasExistentes) {
          await prisma.resenia.delete({ where: { id: resena.id } });
        }
      }
      
      // Crear 4 reseñas para esta cancha
      for (let i = 0; i < 4; i++) {
        const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
        const comentarioAleatorio = comentarios[Math.floor(Math.random() * comentarios.length)];
        const puntaje = Math.random() < 0.7 ? 5 : (Math.random() < 0.8 ? 4 : 3); // 70% = 5★, 20% = 4★, 10% = 3★
        
        // Crear un alquiler ficticio para esta reseña
        const alquiler = await prisma.alquiler.create({
          data: {
            clienteId: clienteAleatorio.id,
            estado: 'FINALIZADO',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Último mes
          }
        });
        
        // Crear un turno ficticio asociado al alquiler
        const fechaAleatoria = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000); // Últimas 2 semanas
        const horaAleatoria = new Date();
        horaAleatoria.setUTCHours(Math.floor(Math.random() * 16) + 7, 0, 0, 0); // 7:00 - 22:00
        
        await prisma.turno.create({
          data: {
            fecha: fechaAleatoria,
            horaInicio: horaAleatoria,
            precio: Math.floor(Math.random() * 10000) + 15000, // 15k-25k
            reservado: true,
            canchaId: cancha.id,
            alquilerId: alquiler.id
          }
        });
        
        // Crear la reseña
        await prisma.resenia.create({
          data: {
            descripcion: comentarioAleatorio,
            puntaje: puntaje,
            alquilerId: alquiler.id
          }
        });
        
        totalResenasCreadas++;
        console.log(`✅ Reseña ${i + 1}/4 creada (${puntaje}★)`);
      }
    }
    
    console.log(`\n🎉 ¡Proceso completado exitosamente!`);
    console.log(`📊 Total de reseñas creadas: ${totalResenasCreadas}`);
    console.log(`📈 Promedio por cancha: ${totalResenasCreadas / canchas.length}`);
    
    // Verificar resultados
    const verificacion = await prisma.resenia.count();
    console.log(`✅ Verificación: ${verificacion} reseñas en la base de datos`);
    
  } catch (error) {
    console.error('❌ Error generando reseñas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generarResenas();