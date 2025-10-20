// Script para marcar algunos turnos aleatorios como ocupados por el sistema
import prisma from '../src/config/prisma';

async function marcarTurnosComoOcupadosSistema() {
    try {
        console.log('🔄 Marcando algunos turnos como ocupados por el sistema en TODAS las canchas...');
        
        // Obtener todas las canchas
        const canchas = await prisma.cancha.findMany({
            select: {
                id: true,
                nroCancha: true
            }
        });
        
        console.log(`📊 Encontradas ${canchas.length} canchas`);
        
        const ahora = new Date();
        let totalTurnosMarcados = 0;
        
        // Procesar cada cancha
        for (const cancha of canchas) {
            // Obtener turnos disponibles de esta cancha (no reservados, futuros)
            const turnosDisponibles = await prisma.turno.findMany({
                where: {
                    canchaId: cancha.id,
                    reservado: false,
                    alquilerId: null,
                    fecha: { gte: ahora }
                },
                select: {
                    id: true,
                    fecha: true,
                    horaInicio: true,
                    precio: true
                },
                take: 50 // Limitar a 50 por cancha
            });
            
            if (turnosDisponibles.length === 0) {
                console.log(`  ⚠️ Cancha ${cancha.nroCancha}: No hay turnos disponibles`);
                continue;
            }
            
            // Seleccionar aleatoriamente 2-3 turnos por cancha para ocupar
            const cantidadAOcupar = Math.min(3, Math.max(2, Math.floor(turnosDisponibles.length * 0.05)));
            
            // Shuffle y tomar los primeros N
            const turnosBarajados = turnosDisponibles.sort(() => Math.random() - 0.5);
            const turnosAOcupar = turnosBarajados.slice(0, cantidadAOcupar);
            
            console.log(`\n🎯 Cancha ${cancha.nroCancha}: Marcando ${turnosAOcupar.length} turnos como ocupados...`);
            
            // Actualizar los turnos seleccionados
            for (const turno of turnosAOcupar) {
                await prisma.turno.update({
                    where: { id: turno.id },
                    data: { 
                        reservado: true,
                        // NO asignamos alquilerId, esto lo marca como "ocupado por el sistema"
                        alquilerId: null
                    }
                });
                
                totalTurnosMarcados++;
                const fecha = new Date(turno.fecha);
                const hora = new Date(turno.horaInicio);
                console.log(`    ✅ Turno ${turno.id} - ${fecha.toLocaleDateString()} ${hora.getHours()}:00 - $${turno.precio}`);
            }
        }
        
        console.log(`\n\n✅ ¡${totalTurnosMarcados} turnos marcados como ocupados por el sistema en ${canchas.length} canchas!`);
        console.log('\n📝 Estos turnos aparecerán como "Ocupados" en el calendario pero NO tendrán reserva de usuario.');
        console.log('💡 Esto simula que el complejo bloqueó esos horarios para mantenimiento u otros usos.');
        
    } catch (error) {
        console.error('❌ Error marcando turnos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
marcarTurnosComoOcupadosSistema()
    .then(() => {
        console.log('\n🎉 Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en el script:', error);
        process.exit(1);
    });
