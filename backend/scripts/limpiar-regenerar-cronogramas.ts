// Script para limpiar cronogramas y turnos incorrectos y regenerarlos correctamente
import prisma from '../src/config/prisma';

async function limpiarYRegenerarCronogramas() {
    try {
        console.log('🔄 Iniciando limpieza y regeneración de cronogramas...\n');
        
        // 1. Eliminar todos los turnos con horarios fuera del rango 7:00-23:00
        console.log('🗑️ Paso 1: Eliminando turnos con horarios incorrectos...');
        const turnosIncorrectos = await prisma.turno.findMany({
            select: { id: true, horaInicio: true }
        });
        
        const idsAEliminar: number[] = [];
        turnosIncorrectos.forEach(turno => {
            const hora = new Date(turno.horaInicio).getHours();
            if (hora < 7 || hora > 23) {
                idsAEliminar.push(turno.id);
            }
        });
        
        if (idsAEliminar.length > 0) {
            await prisma.turno.deleteMany({
                where: { id: { in: idsAEliminar } }
            });
            console.log(`  ✅ Eliminados ${idsAEliminar.length} turnos incorrectos\n`);
        } else {
            console.log('  ✅ No hay turnos incorrectos para eliminar\n');
        }
        
        // 2. Eliminar todos los cronogramas con horarios fuera del rango
        console.log('🗑️ Paso 2: Eliminando cronogramas con horarios incorrectos...');
        const cronogramasIncorrectos = await prisma.horarioCronograma.findMany({
            select: { id: true, horaInicio: true }
        });
        
        const idsCronogramasAEliminar: number[] = [];
        cronogramasIncorrectos.forEach(cronograma => {
            const hora = new Date(cronograma.horaInicio).getHours();
            if (hora < 7 || hora > 23) {
                idsCronogramasAEliminar.push(cronograma.id);
            }
        });
        
        if (idsCronogramasAEliminar.length > 0) {
            await prisma.horarioCronograma.deleteMany({
                where: { id: { in: idsCronogramasAEliminar } }
            });
            console.log(`  ✅ Eliminados ${idsCronogramasAEliminar.length} cronogramas incorrectos\n`);
        } else {
            console.log('  ✅ No hay cronogramas incorrectos para eliminar\n');
        }
        
        // 3. Verificar si quedan cronogramas válidos
        const cronogramasValidos = await prisma.horarioCronograma.count();
        console.log(`📊 Cronogramas válidos restantes: ${cronogramasValidos}\n`);
        
        if (cronogramasValidos === 0) {
            console.log('⚠️ No hay cronogramas válidos. Es necesario regenerar los cronogramas desde el seed.');
            console.log('Por favor, ejecuta: npx prisma db seed\n');
        }
        
        // 4. Generar turnos para los próximos 7 días basados en cronogramas válidos
        console.log('🔄 Paso 3: Generando turnos para los próximos 7 días...');
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const canchas = await prisma.cancha.findMany({
            include: {
                cronograma: true
            }
        });
        
        console.log(`📊 Procesando ${canchas.length} canchas...\n`);
        
        let turnosCreados = 0;
        
        for (const cancha of canchas) {
            // Filtrar cronogramas válidos (7:00 - 23:00)
            const cronogramasValidos = cancha.cronograma.filter(c => {
                const hora = new Date(c.horaInicio).getHours();
                return hora >= 7 && hora <= 23;
            });
            
            if (cronogramasValidos.length === 0) {
                console.log(`⚠️ Cancha ${cancha.nroCancha} no tiene cronogramas válidos`);
                continue;
            }
            
            // Generar turnos para los próximos 7 días
            for (let dia = 0; dia < 7; dia++) {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() + dia);
                
                const diaSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'][fecha.getDay()];
                
                const cronogramasDelDia = cronogramasValidos.filter(c => c.diaSemana === diaSemana);
                
                for (const cronograma of cronogramasDelDia) {
                    // Verificar si el turno ya existe
                    const fechaSoloFecha = new Date(fecha);
                    fechaSoloFecha.setHours(0, 0, 0, 0);
                    
                    const fechaSiguienteDia = new Date(fechaSoloFecha);
                    fechaSiguienteDia.setDate(fechaSiguienteDia.getDate() + 1);
                    
                    const turnoExistente = await prisma.turno.findFirst({
                        where: {
                            canchaId: cancha.id,
                            fecha: {
                                gte: fechaSoloFecha,
                                lt: fechaSiguienteDia
                            },
                            horaInicio: cronograma.horaInicio
                        }
                    });
                    
                    if (!turnoExistente) {
                        await prisma.turno.create({
                            data: {
                                fecha: fechaSoloFecha,
                                horaInicio: cronograma.horaInicio,
                                precio: cronograma.precio,
                                reservado: false,
                                canchaId: cancha.id
                            }
                        });
                        turnosCreados++;
                    }
                }
            }
        }
        
        console.log(`\n✅ Creados ${turnosCreados} turnos válidos para los próximos 7 días\n`);
        
        // 5. Mostrar resumen final
        const turnosTotales = await prisma.turno.count();
        const cronogramasTotales = await prisma.horarioCronograma.count();
        
        console.log('📊 Resumen final:');
        console.log(`  - Total turnos en BD: ${turnosTotales}`);
        console.log(`  - Total cronogramas en BD: ${cronogramasTotales}`);
        
        // Verificar distribución de horas
        const turnosVerificacion = await prisma.turno.findMany({
            select: { horaInicio: true },
            take: 200
        });
        
        const distribucionHoras: { [key: number]: number } = {};
        turnosVerificacion.forEach(t => {
            const hora = new Date(t.horaInicio).getHours();
            distribucionHoras[hora] = (distribucionHoras[hora] || 0) + 1;
        });
        
        console.log('\n📊 Distribución de horas (muestra de 200 turnos):');
        Object.keys(distribucionHoras)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(hora => {
                const marcador = (parseInt(hora) >= 7 && parseInt(hora) <= 23) ? '✅' : '❌';
                console.log(`  ${marcador} Hora ${hora}:00 - ${distribucionHoras[parseInt(hora)]} turnos`);
            });
        
    } catch (error) {
        console.error('❌ Error en la limpieza:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar el script
limpiarYRegenerarCronogramas()
    .then(() => {
        console.log('\n✅ Limpieza y regeneración completada');
    })
    .catch((error) => {
        console.error('\n❌ Error en el script:', error);
        process.exit(1);
    });
