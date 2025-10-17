// backend/src/scripts/verificarPuntajes.ts
import { PrismaClient } from '@prisma/client';
import { calcularPuntajeCancha, calcularPuntajeComplejo } from '../services/cancha.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 VERIFICANDO CÁLCULO DE PUNTAJES DINÁMICOS\n');

  try {
    // Obtener algunas canchas con reseñas
    const canchasConResenias = await prisma.cancha.findMany({
      include: {
        complejo: {
          select: {
            id: true,
            nombre: true
          }
        },
        _count: {
          select: {
            turnos: {
              where: {
                alquiler: {
                  resenia: {
                    isNot: null
                  }
                }
              }
            }
          }
        }
      },
      take: 5
    });

    console.log('📊 ANÁLISIS POR CANCHA:');
    for (const cancha of canchasConResenias) {
      console.log(`\n🏟️ Cancha ${cancha.id} (${cancha.complejo.nombre})`);
      
      // Obtener reseñas de esta cancha directamente
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

      console.log(`   📝 Reseñas encontradas: ${resenias.length}`);
      if (resenias.length > 0) {
        const puntajes = resenias.map(r => r.puntaje);
        const promedioManual = puntajes.reduce((sum, p) => sum + p, 0) / puntajes.length;
        const puntajeFuncion = await calcularPuntajeCancha(cancha.id);
        
        console.log(`   ⭐ Puntajes individuales: [${puntajes.join(', ')}]`);
        console.log(`   📊 Promedio manual: ${promedioManual.toFixed(1)}`);
        console.log(`   🔧 Promedio función: ${puntajeFuncion}`);
        console.log(`   ${promedioManual.toFixed(1) === puntajeFuncion.toString() ? '✅' : '❌'} Coinciden: ${promedioManual.toFixed(1) === puntajeFuncion.toString()}`);
      }
    }

    console.log('\n📊 ANÁLISIS POR COMPLEJO:');
    const complejos = await prisma.complejo.findMany({
      select: {
        id: true,
        nombre: true
      },
      take: 3
    });

    for (const complejo of complejos) {
      console.log(`\n🏢 Complejo ${complejo.id} (${complejo.nombre})`);
      
      // Obtener todas las reseñas del complejo
      const reseniasComplejo = await prisma.resenia.findMany({
        where: {
          alquiler: {
            turnos: {
              some: {
                cancha: {
                  complejoId: complejo.id
                }
              }
            }
          }
        },
        select: {
          puntaje: true
        }
      });

      console.log(`   📝 Reseñas total del complejo: ${reseniasComplejo.length}`);
      if (reseniasComplejo.length > 0) {
        const puntajes = reseniasComplejo.map(r => r.puntaje);
        const promedioManual = puntajes.reduce((sum, p) => sum + p, 0) / puntajes.length;
        const puntajeFuncion = await calcularPuntajeComplejo(complejo.id);
        
        console.log(`   📊 Promedio manual: ${promedioManual.toFixed(1)}`);
        console.log(`   🔧 Promedio función: ${puntajeFuncion}`);
        console.log(`   ${Math.abs(promedioManual - puntajeFuncion) < 0.1 ? '✅' : '❌'} Coinciden: ${Math.abs(promedioManual - puntajeFuncion) < 0.1}`);
      }
    }

    console.log('\n🎯 PRUEBA DE ENDPOINTS:');
    
    // Obtener una cancha usando el servicio actualizado
    const canchaConPuntajeDinamico = await import('../services/cancha.service').then(service =>
      service.obtenerCanchaPorId(canchasConResenias[0].id)
    );
    
    console.log(`   🏟️ Cancha ID: ${canchaConPuntajeDinamico.id}`);
    console.log(`   ⭐ Puntaje dinámico cancha: ${canchaConPuntajeDinamico.puntaje}`);
    console.log(`   🏢 Puntaje dinámico complejo: ${canchaConPuntajeDinamico.complejo.puntaje}`);

    console.log('\n✅ Verificación de puntajes completada!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);