// backend/src/scripts/generarResenasRapido.ts
import { PrismaClient, EstadoAlquiler, Rol } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('⭐ Generando 5 reseñas por cancha...');

  try {
    // Obtener todas las canchas
    const canchas = await prisma.cancha.findMany();
    console.log(`🏟️ Encontradas ${canchas.length} canchas`);

    // Obtener todos los clientes
    const clientes = await prisma.usuario.findMany({
      where: { rol: Rol.CLIENTE }
    });
    console.log(`👥 Encontrados ${clientes.length} clientes`);

    const comentarios = [
      'Excelente cancha, muy bien mantenida y buena atención',
      'Instalaciones de primera calidad, iluminación perfecta',
      'Muy buen estado del césped sintético, experiencia increíble',
      'Vestuarios limpios y amplios, muy recomendable',
      'Perfecto para jugar con amigos, ambiente familiar',
      'Precio justo por la calidad ofrecida',
      'Cancha en perfectas condiciones, muy satisfecho',
      'Excelente servicio, personal muy amable',
      'Instalaciones modernas con todos los servicios',
      'Muy buena ubicación y fácil acceso',
      'Calidad premium a precio accesible',
      'Canchas profesionales con tecnología de punta',
      'Ambiente seguro y bien cuidado',
      'Superficie de juego excelente, equipos en buen estado',
      'Instalaciones limpias y modernas'
    ];

    let totalResenias = 0;

    // Crear 5 reseñas por cancha
    for (const cancha of canchas) {
      console.log(`   🎯 Generando reseñas para cancha ${cancha.id}...`);
      
      for (let i = 0; i < 5; i++) {
        // Seleccionar cliente aleatorio
        const clienteRandom = clientes[Math.floor(Math.random() * clientes.length)];
        
        // Crear turno en el pasado
        const fechaPasada = new Date();
        fechaPasada.setDate(fechaPasada.getDate() - Math.floor(Math.random() * 30) - 1);
        
        const horaAleatoria = Math.floor(Math.random() * 16) + 7;
        const precioAleatorio = Math.floor(Math.random() * (25000 - 10000) + 10000);
        
        const turno = await prisma.turno.create({
          data: {
            fecha: fechaPasada,
            horaInicio: new Date(`1970-01-01T${horaAleatoria.toString().padStart(2, '0')}:00:00Z`),
            precio: precioAleatorio,
            reservado: true,
            canchaId: cancha.id,
          }
        });
        
        // Crear alquiler
        const alquiler = await prisma.alquiler.create({
          data: {
            estado: EstadoAlquiler.FINALIZADO,
            clienteId: clienteRandom.id,
            turnos: {
              connect: [{ id: turno.id }]
            }
          }
        });
        
        // Crear reseña
        let puntaje = 5;
        const rand = Math.random();
        if (rand > 0.60 && rand <= 0.85) {
          puntaje = 4;
        } else if (rand > 0.85) {
          puntaje = 3;
        }
        
        const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
        
        await prisma.resenia.create({
          data: {
            descripcion: comentario,
            puntaje: puntaje,
            alquilerId: alquiler.id,
          }
        });
        
        totalResenias++;
      }
    }

    console.log(`✅ Generadas ${totalResenias} reseñas (5 por cada una de las ${canchas.length} canchas)`);

    // Verificar estadísticas finales
    const reseniasCreadas = await prisma.resenia.findMany();
    const distribucion = {
      5: reseniasCreadas.filter(r => r.puntaje === 5).length,
      4: reseniasCreadas.filter(r => r.puntaje === 4).length,
      3: reseniasCreadas.filter(r => r.puntaje === 3).length
    };
    
    console.log('📊 Distribución de puntajes:');
    console.log(`   - 5 estrellas: ${distribucion[5]} (${Math.round((distribucion[5]/totalResenias)*100)}%)`);
    console.log(`   - 4 estrellas: ${distribucion[4]} (${Math.round((distribucion[4]/totalResenias)*100)}%)`);
    console.log(`   - 3 estrellas: ${distribucion[3]} (${Math.round((distribucion[3]/totalResenias)*100)}%)`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});