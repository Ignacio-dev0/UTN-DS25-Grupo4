import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAlquiler3225() {
    try {
        console.log('🔍 DEBUG DETALLADO DEL ALQUILER 3225\n');

        // Query exactamente como lo hace el frontend
        const alquileres = await prisma.alquiler.findMany({
            where: { clienteId: 2 },
            include: {
                turnos: {
                    include: {
                        cancha: {
                            include: {
                                complejo: true
                            }
                        }
                    }
                },
                cliente: true,
                pago: true
            },
            orderBy: {
                id: 'desc'
            },
            take: 10
        });

        // Buscar el alquiler 3225
        const alquiler3225 = alquileres.find(a => a.id === 3225);

        if (!alquiler3225) {
            console.log('❌ Alquiler 3225 NO está en los últimos 10');
            console.log(`✅ Total de alquileres encontrados: ${alquileres.length}`);
            console.log('📋 IDs encontrados:', alquileres.map(a => a.id));
            
            // Verificar si existe pero está fuera del top 10
            const existe = await prisma.alquiler.findUnique({
                where: { id: 3225 },
                include: {
                    turnos: true,
                    cliente: true
                }
            });
            
            if (existe) {
                console.log('\n⚠️ El alquiler 3225 SÍ existe pero no está en el top 10:');
                console.log({
                    id: existe.id,
                    clienteId: existe.clienteId,
                    estado: existe.estado,
                    createdAt: existe.createdAt,
                    cantidadTurnos: existe.turnos.length
                });
            }
        } else {
            console.log('✅ Alquiler 3225 ENCONTRADO en los últimos 10\n');
            
            // Analizar detalladamente
            console.log('📦 Datos completos:');
            console.log(JSON.stringify({
                id: alquiler3225.id,
                clienteId: alquiler3225.clienteId,
                estado: alquiler3225.estado,
                createdAt: alquiler3225.createdAt,
                turnos: alquiler3225.turnos.map(t => ({
                    id: t.id,
                    fecha: t.fecha,
                    horaInicio: t.horaInicio,
                    reservado: t.reservado,
                    alquilerId: t.alquilerId,
                    canchaId: t.canchaId,
                    precio: t.precio
                })),
                cancha: alquiler3225.turnos[0]?.cancha ? {
                    id: alquiler3225.turnos[0].cancha.id,
                    nroCancha: alquiler3225.turnos[0].cancha.nroCancha,
                    complejo: {
                        id: alquiler3225.turnos[0].cancha.complejo?.id,
                        nombre: alquiler3225.turnos[0].cancha.complejo?.nombre
                    }
                } : null,
                cliente: {
                    id: alquiler3225.cliente.id,
                    nombre: alquiler3225.cliente.nombre,
                    apellido: alquiler3225.cliente.apellido,
                    email: alquiler3225.cliente.email
                }
            }, null, 2));
            
            console.log('\n🔍 Análisis de validaciones frontend:');
            
            // Check 1: ¿Tiene turnos?
            const tieneTurnos = alquiler3225.turnos && alquiler3225.turnos.length > 0;
            console.log(`✓ Tiene turnos: ${tieneTurnos ? '✅ SÍ (' + alquiler3225.turnos.length + ')' : '❌ NO'}`);
            
            if (tieneTurnos) {
                const primerTurno = alquiler3225.turnos[0];
                
                // Check 2: ¿Tiene fecha?
                const tieneFecha = primerTurno.fecha !== null && primerTurno.fecha !== undefined;
                console.log(`✓ Tiene fecha: ${tieneFecha ? '✅ SÍ' : '❌ NO'}`);
                
                // Check 3: ¿Tiene cancha?
                const tieneCancha = primerTurno.cancha !== null && primerTurno.cancha !== undefined;
                console.log(`✓ Tiene cancha: ${tieneCancha ? '✅ SÍ' : '❌ NO'}`);
                
                // Check 4: ¿Tiene complejo?
                const tieneComplejo = primerTurno.cancha?.complejo !== null && primerTurno.cancha?.complejo !== undefined;
                console.log(`✓ Tiene complejo: ${tieneComplejo ? '✅ SÍ' : '❌ NO'}`);
                
                // Check 5: ¿La fecha es válida?
                if (tieneFecha) {
                    const fecha = new Date(primerTurno.fecha);
                    const esValida = !isNaN(fecha.getTime());
                    console.log(`✓ Fecha válida: ${esValida ? '✅ SÍ' : '❌ NO'} (${primerTurno.fecha})`);
                }
                
                // Check 6: ¿Pasaría el filtro de auto-finalización?
                const ahora = new Date();
                const fecha = new Date(primerTurno.fecha);
                const horaInicio = new Date(primerTurno.horaInicio);
                
                // Parsear hora (como lo hace el frontend)
                const horaInicioStr = `${horaInicio.getUTCHours().toString().padStart(2, '0')}:${horaInicio.getUTCMinutes().toString().padStart(2, '0')}`;
                const [horaNum, minNum] = horaInicioStr.split(':').map(Number);
                const horaFinNum = (horaNum + 1) % 24;
                const horaFinStr = `${horaFinNum.toString().padStart(2, '0')}:${minNum.toString().padStart(2, '0')}`;
                
                const fechaHoraFinTurno = new Date(
                    fecha.getFullYear(),
                    fecha.getMonth(),
                    fecha.getDate(),
                    horaFinNum,
                    minNum
                );
                
                const yaTermino = ahora > fechaHoraFinTurno;
                
                console.log(`\n🕒 Análisis de tiempo:`);
                console.log(`   - Fecha turno: ${fecha.toLocaleDateString('es-ES')}`);
                console.log(`   - Hora inicio: ${horaInicioStr}`);
                console.log(`   - Hora fin calculada: ${horaFinStr}`);
                console.log(`   - Fecha/hora fin: ${fechaHoraFinTurno.toLocaleString('es-ES')}`);
                console.log(`   - Ahora: ${ahora.toLocaleString('es-ES')}`);
                console.log(`   - Ya terminó: ${yaTermino ? '✅ SÍ (se auto-finalizará)' : '❌ NO (aún válido)'}`);
                
                if (yaTermino) {
                    console.log(`\n⚠️  PROBLEMA DETECTADO: El turno se auto-finalizará por fecha pasada`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAlquiler3225();
