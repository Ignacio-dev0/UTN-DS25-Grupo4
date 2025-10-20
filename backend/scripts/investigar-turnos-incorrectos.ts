// Script para investigar turnos con horarios incorrectos
import prisma from '../src/config/prisma';

async function investigarTurnosIncorrectos() {
    try {
        console.log('🔍 Investigando turnos con horarios fuera del rango 7:00-23:00...\n');
        
        // Obtener todos los turnos
        const todosTurnos = await prisma.turno.findMany({
            select: {
                id: true,
                canchaId: true,
                fecha: true,
                horaInicio: true,
                reservado: true,
                alquilerId: true
            },
            take: 500,
            orderBy: {
                horaInicio: 'asc'
            }
        });
        
        console.log(`📊 Total de turnos consultados: ${todosTurnos.length}\n`);
        
        // Agrupar por hora
        const turnosPorHora: { [key: number]: number } = {};
        const turnosIncorrectos: any[] = [];
        
        todosTurnos.forEach(turno => {
            const hora = new Date(turno.horaInicio);
            const horaNum = hora.getHours();
            
            turnosPorHora[horaNum] = (turnosPorHora[horaNum] || 0) + 1;
            
            // Turnos fuera del rango 7-23
            if (horaNum < 7 || horaNum > 23) {
                turnosIncorrectos.push({
                    id: turno.id,
                    canchaId: turno.canchaId,
                    fecha: new Date(turno.fecha).toLocaleDateString('es-AR'),
                    hora: `${horaNum}:${hora.getMinutes().toString().padStart(2, '0')}`,
                    reservado: turno.reservado,
                    alquilerId: turno.alquilerId
                });
            }
        });
        
        // Mostrar distribución por hora
        console.log('📊 Distribución de turnos por hora:');
        Object.keys(turnosPorHora)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(hora => {
                const marcador = (parseInt(hora) < 7 || parseInt(hora) > 23) ? '❌' : '✅';
                console.log(`  ${marcador} Hora ${hora}:00 - ${turnosPorHora[parseInt(hora)]} turnos`);
            });
        
        console.log('\n⚠️ Turnos con horarios INCORRECTOS (fuera de 7:00-23:00):');
        console.log(`Total: ${turnosIncorrectos.length} turnos\n`);
        
        if (turnosIncorrectos.length > 0) {
            console.log('Primeros 20 turnos incorrectos:');
            turnosIncorrectos.slice(0, 20).forEach((turno, i) => {
                console.log(`  ${i + 1}. ID: ${turno.id}, Cancha: ${turno.canchaId}, Fecha: ${turno.fecha}, Hora: ${turno.hora}, Reservado: ${turno.reservado}`);
            });
            
            // Agrupar por cancha
            const incorrectosPorCancha: { [key: number]: number } = {};
            turnosIncorrectos.forEach(turno => {
                incorrectosPorCancha[turno.canchaId] = (incorrectosPorCancha[turno.canchaId] || 0) + 1;
            });
            
            console.log('\n📊 Turnos incorrectos por cancha:');
            Object.keys(incorrectosPorCancha)
                .sort((a, b) => incorrectosPorCancha[parseInt(b)] - incorrectosPorCancha[parseInt(a)])
                .slice(0, 10)
                .forEach(canchaId => {
                    console.log(`  Cancha ${canchaId}: ${incorrectosPorCancha[parseInt(canchaId)]} turnos incorrectos`);
                });
        }
        
        // Verificar el cronograma de una cancha
        console.log('\n🔍 Verificando cronograma de cancha 1:');
        const cronogramas = await prisma.horarioCronograma.findMany({
            where: { canchaId: 1 },
            select: {
                id: true,
                diaSemana: true,
                horaInicio: true,
                precio: true
            },
            take: 10
        });
        
        if (cronogramas.length > 0) {
            console.log('Primeros 10 cronogramas:');
            cronogramas.forEach((c, i) => {
                const hora = new Date(c.horaInicio);
                console.log(`  ${i + 1}. ${c.diaSemana} - ${hora.getHours()}:${hora.getMinutes().toString().padStart(2, '0')} - $${c.precio}`);
            });
        } else {
            console.log('⚠️ No hay cronogramas para la cancha 1');
        }
        
    } catch (error) {
        console.error('❌ Error investigando turnos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
investigarTurnosIncorrectos()
    .then(() => {
        console.log('\n✅ Investigación completada');
    })
    .catch((error) => {
        console.error('\n❌ Error en el script:', error);
        process.exit(1);
    });
