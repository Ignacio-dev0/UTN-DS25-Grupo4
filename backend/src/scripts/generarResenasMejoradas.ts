// backend/src/scripts/generarResenasMejoradas.ts
import { PrismaClient, EstadoAlquiler } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⭐ Generando reseñas mejoradas con lógica realista...');

  try {
    // Eliminar reseñas existentes para empezar limpio
    console.log('🧹 Limpiando reseñas existentes...');
    await prisma.resenia.deleteMany();

    // Obtener todos los alquileres finalizados únicos por cliente-cancha
    console.log('📋 Obteniendo alquileres finalizados...');
    const alquileresFinalizados = await prisma.alquiler.findMany({
      where: { estado: EstadoAlquiler.FINALIZADO },
      include: {
        turnos: {
          include: { cancha: true }
        },
        cliente: true
      }
    });

    console.log(`🎯 Encontrados ${alquileresFinalizados.length} alquileres finalizados`);

    // Comentarios variados para reseñas
    const comentarios = [
      'Excelente cancha, muy bien mantenida y buena atención al cliente',
      'Instalaciones de primera calidad, iluminación perfecta para jugar',
      'Muy buen estado del césped sintético, experiencia increíble',
      'Vestuarios limpios y amplios, muy recomendable el lugar',
      'Perfecto para jugar con amigos, ambiente familiar y cálido',
      'Precio justo por la calidad ofrecida, volveremos pronto',
      'Cancha en perfectas condiciones, muy satisfecho',
      'Excelente servicio, personal muy amable y atento',
      'Instalaciones modernas con todos los servicios necesarios',
      'Muy buena ubicación y fácil acceso, estacionamiento amplio',
      'Calidad premium a precio accesible, definitivamente volveremos',
      'Canchas profesionales con tecnología de última generación',
      'Ambiente seguro y bien cuidado, ideal para toda la familia',
      'Superficie de juego excelente, pelotas y arcos en buen estado',
      'Atención personalizada y horarios muy convenientes',
      'Instalaciones limpias y modernas, muy satisfecho con el servicio',
      'Muy buena experiencia, la pasamos genial jugando',
      'Recomiendo este lugar, canchas de gran calidad',
      'Excelente relación precio-calidad, sin dudas volveremos',
      'Muy conforme con las instalaciones y la atención recibida',
      'Todo perfecto, desde la reserva hasta el final del partido',
      'Cancha impecable, se nota el cuidado y mantenimiento',
      'Personal muy atento, nos ayudaron en todo momento',
      'Instalaciones top, definitivamente nuestro lugar favorito',
      'Experiencia 10/10, superó nuestras expectativas completamente'
    ];

    // Crear un mapa de cliente-cancha para evitar reseñas duplicadas
    const reseniasMap = new Map<string, any>();
    let reseniasGeneradas = 0;
    let resenasPorCancha = new Map<number, number>();

    for (const alquiler of alquileresFinalizados) {
      for (const turno of alquiler.turnos) {
        const key = `${alquiler.clienteId}-${turno.cancha.id}`;
        
        // Solo si no existe ya una reseña de este cliente para esta cancha
        if (!reseniasMap.has(key)) {
          // 75% de probabilidad de que el cliente haga reseña
          if (Math.random() < 0.75) {
            // Distribución de puntajes más realista:
            // 60% cinco estrellas, 25% cuatro estrellas, 15% tres estrellas
            let puntaje = 5;
            const rand = Math.random();
            if (rand > 0.60 && rand <= 0.85) {
              puntaje = 4;
            } else if (rand > 0.85) {
              puntaje = 3;
            }
            
            const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
            
            reseniasMap.set(key, {
              descripcion: comentario,
              puntaje: puntaje,
              alquilerId: alquiler.id,
            });

            // Contador por cancha
            const canchaId = turno.cancha.id;
            resenasPorCancha.set(canchaId, (resenasPorCancha.get(canchaId) || 0) + 1);
            reseniasGeneradas++;
          }
        }
      }
    }

    // Verificar que cada cancha tenga al menos 4 reseñas
    console.log('🔍 Verificando cobertura mínima de reseñas por cancha...');
    const canchas = await prisma.cancha.findMany();
    
    for (const cancha of canchas) {
      const reseniasActuales = resenasPorCancha.get(cancha.id) || 0;
      const reseniasNecesarias = Math.max(0, 4 - reseniasActuales);
      
      if (reseniasNecesarias > 0) {
        console.log(`   🎯 Cancha ${cancha.id} necesita ${reseniasNecesarias} reseñas adicionales`);
        
        // Crear reseñas adicionales con alquileres simulados
        for (let i = 0; i < reseniasNecesarias; i++) {
          // Obtener un cliente aleatorio que no haya reseñado esta cancha
          const clientes = await prisma.usuario.findMany({
            where: { rol: 'CLIENTE' }
          });
          
          let clienteElegido = null;
          let intentos = 0;
          
          while (!clienteElegido && intentos < 20) {
            const clienteRandom = clientes[Math.floor(Math.random() * clientes.length)];
            const key = `${clienteRandom.id}-${cancha.id}`;
            
            if (!reseniasMap.has(key)) {
              clienteElegido = clienteRandom;
            }
            intentos++;
          }
          
          if (clienteElegido) {
            // Crear un turno en el pasado para esta cancha
            const fechaPasada = new Date();
            fechaPasada.setDate(fechaPasada.getDate() - Math.floor(Math.random() * 60)); // Últimos 60 días
            
            const horaAleatoria = Math.floor(Math.random() * 16) + 7; // Entre 7 y 22
            const precioAleatorio = Math.floor(Math.random() * (25000 - 10000) + 10000);
            
            // Crear turno
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
                clienteId: clienteElegido.id,
                turnos: {
                  connect: [{ id: turno.id }]
                }
              }
            });
            
            // Generar reseña
            let puntaje = 5;
            const rand = Math.random();
            if (rand > 0.60 && rand <= 0.85) {
              puntaje = 4;
            } else if (rand > 0.85) {
              puntaje = 3;
            }
            
            const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
            
            const key = `${clienteElegido.id}-${cancha.id}`;
            reseniasMap.set(key, {
              descripcion: comentario,
              puntaje: puntaje,
              alquilerId: alquiler.id,
            });
            
            resenasPorCancha.set(cancha.id, (resenasPorCancha.get(cancha.id) || 0) + 1);
            reseniasGeneradas++;
          }
        }
      }
    }

    // Crear todas las reseñas en lotes de 50
    console.log('💫 Creando reseñas en la base de datos...');
    const reseniasArray = Array.from(reseniasMap.values());
    
    for (let i = 0; i < reseniasArray.length; i += 50) {
      const batch = reseniasArray.slice(i, i + 50);
      
      const reseniasPromises = batch.map(reseniaData => 
        prisma.resenia.create({ data: reseniaData })
      );
      
      await Promise.all(reseniasPromises);
      console.log(`   ✅ Procesadas ${Math.min(i + 50, reseniasArray.length)} de ${reseniasArray.length} reseñas...`);
    }

    // Estadísticas finales
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log(`📊 Estadísticas:`);
    console.log(`   • Total de reseñas creadas: ${reseniasArray.length}`);
    console.log(`   • Promedio por cancha: ${(reseniasArray.length / canchas.length).toFixed(1)}`);
    
    // Verificar cobertura por cancha
    let canchasConPocasResenias = 0;
    let canchasConBuenaCobertura = 0;
    
    for (const cancha of canchas) {
      const count = resenasPorCancha.get(cancha.id) || 0;
      if (count < 4) {
        canchasConPocasResenias++;
      } else {
        canchasConBuenaCobertura++;
      }
    }
    
    console.log(`   • Canchas con 4+ reseñas: ${canchasConBuenaCobertura}/${canchas.length}`);
    console.log(`   • Canchas con menos de 4 reseñas: ${canchasConPocasResenias}/${canchas.length}`);
    
    // Mostrar distribución de puntajes
    const reseniasCreadas = await prisma.resenia.findMany();
    const distribucionPuntajes = {
      5: reseniasCreadas.filter(r => r.puntaje === 5).length,
      4: reseniasCreadas.filter(r => r.puntaje === 4).length,
      3: reseniasCreadas.filter(r => r.puntaje === 3).length
    };
    
    console.log(`   • Distribución de puntajes:`);
    console.log(`     - 5 estrellas: ${distribucionPuntajes[5]} (${Math.round((distribucionPuntajes[5]/reseniasCreadas.length)*100)}%)`);
    console.log(`     - 4 estrellas: ${distribucionPuntajes[4]} (${Math.round((distribucionPuntajes[4]/reseniasCreadas.length)*100)}%)`);
    console.log(`     - 3 estrellas: ${distribucionPuntajes[3]} (${Math.round((distribucionPuntajes[3]/reseniasCreadas.length)*100)}%)`);
    
    console.log('\n✅ Sistema de reseñas completamente configurado!');

  } catch (error) {
    console.error('❌ Error durante la generación de reseñas:', error);
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