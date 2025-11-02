import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReservadoFlag() {
    try {
        console.log('🔧 Corrigiendo flag "reservado" en turnos con alquilerId...\n');

        // Encontrar todos los turnos que tienen alquilerId pero reservado=false
        const turnosIncorrectos = await prisma.turno.findMany({
            where: {
                alquilerId: { not: null },
                reservado: false
            },
            select: {
                id: true,
                alquilerId: true,
                fecha: true,
                horaInicio: true
            }
        });

        console.log(`📊 Encontrados ${turnosIncorrectos.length} turnos con alquilerId pero reservado=false`);

        if (turnosIncorrectos.length === 0) {
            console.log('✅ No hay turnos que corregir');
            return;
        }

        // Mostrar algunos ejemplos
        console.log('\n📋 Primeros 5 ejemplos:');
        turnosIncorrectos.slice(0, 5).forEach(t => {
            console.log(`   - Turno ${t.id}: alquilerId=${t.alquilerId}, fecha=${t.fecha.toISOString().split('T')[0]}`);
        });

        // Actualizar todos los turnos
        const result = await prisma.turno.updateMany({
            where: {
                alquilerId: { not: null },
                reservado: false
            },
            data: {
                reservado: true
            }
        });

        console.log(`\n✅ Actualizados ${result.count} turnos`);
        console.log('✅ Todos los turnos con alquilerId ahora tienen reservado=true');

        // Verificar
        const verificacion = await prisma.turno.count({
            where: {
                alquilerId: { not: null },
                reservado: false
            }
        });

        if (verificacion === 0) {
            console.log('✅ Verificación exitosa: No quedan turnos inconsistentes');
        } else {
            console.log(`⚠️  Advertencia: Aún quedan ${verificacion} turnos inconsistentes`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixReservadoFlag();
