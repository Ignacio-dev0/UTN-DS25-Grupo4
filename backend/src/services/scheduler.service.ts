import cron from 'node-cron';
import prisma from '../config/prisma';
import { estaHorarioDeshabilitado } from './horarioDeshabilitado.service';
import { DiaSemana } from '@prisma/client';

// Función auxiliar para convertir número de día a enum
function getDiaSemanaEnum(diaSemana: number) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[diaSemana];
}

// Función para generar turnos del día siguiente
async function generarTurnosDelDiaSiguiente() {
    try {
        console.log('🕛 [SCHEDULER] Iniciando generación de turnos para el día siguiente...');
        
        // Calcular la fecha del día 8 (para que el dueño pueda editar antes de que salga al público)
        const hoy = new Date();
        const dia8 = new Date(hoy);
        dia8.setDate(hoy.getDate() + 7); // El octavo día desde hoy
        
        const fechaSoloFecha = new Date(dia8);
        fechaSoloFecha.setHours(0, 0, 0, 0);
        
        const diaDeLaSemana = dia8.getDay();
        const diaSemanaEnum = getDiaSemanaEnum(diaDeLaSemana);
        
        console.log(`📅 [SCHEDULER] Generando turnos para: ${fechaSoloFecha.toLocaleDateString()} (${diaSemanaEnum})`);
        
        // Obtener todas las canchas con sus cronogramas
        const canchas = await prisma.cancha.findMany({
            include: {
                cronograma: true,
                complejo: true
            }
        });
        
        const turnosACrear = [];
        let turnosGenerados = 0;
        
        for (const cancha of canchas) {
            
            // Filtrar cronogramas para este día
            const cronogramasDelDia = cancha.cronograma.filter(c => c.diaSemana === diaSemanaEnum);
            
            for (const cronograma of cronogramasDelDia) {
                // Convertir horaInicio a formato "HH:00"
                const horaStr = cronograma.horaInicio instanceof Date 
                    ? `${cronograma.horaInicio.getHours().toString().padStart(2, '0')}:00`
                    : cronograma.horaInicio;

                const estaDeshabilitado = await estaHorarioDeshabilitado(
                    cancha.id,
                    diaSemanaEnum as DiaSemana,
                    horaStr
                );

                if (estaDeshabilitado) {
                    console.log(`⛔ [SCHEDULER] Horario deshabilitado: Cancha ${cancha.id} - ${diaSemanaEnum} ${horaStr}`);
                    continue; // Saltar este turno
                }

                // Verificar si el turno ya existe
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
                    turnosACrear.push({
                        fecha: fechaSoloFecha,
                        horaInicio: cronograma.horaInicio,
                        precio: cronograma.precio || 5000,
                        reservado: false,
                        canchaId: cancha.id
                    });
                }
            }
        }

        if (turnosACrear.length > 0) {
            await prisma.turno.createMany({
                data: turnosACrear
            });
            turnosGenerados = turnosACrear.length;
            console.log(`✅ [SCHEDULER] Creados ${turnosGenerados} turnos para ${fechaSoloFecha.toLocaleDateString()}`);
            
            // Ocupar 3 turnos aleatorios del día nuevo
            await ocuparTurnosAleatorios(fechaSoloFecha);
        } else {
            console.log(`ℹ️ [SCHEDULER] No se necesitaron crear turnos para ${fechaSoloFecha.toLocaleDateString()}`);
        }
        
        return turnosGenerados;
        
    } catch (error) {
        console.error('❌ [SCHEDULER] Error generando turnos del día siguiente:', error);
        throw error;
    }
}

// Función para ocupar 3 turnos aleatorios del día nuevo
async function ocuparTurnosAleatorios(fecha: Date) {
    try {
        console.log(`🎲 [SCHEDULER] Ocupando turnos aleatorios para ${fecha.toLocaleDateString()}`);
        
        // Obtener usuarios clientes
        const clientes = await prisma.usuario.findMany({ 
            where: { rol: 'CLIENTE' },
            take: 10 
        });
        
        if (clientes.length === 0) {
            console.log('⚠️ [SCHEDULER] No hay clientes disponibles para reservas aleatorias');
            return;
        }
        
        // Obtener turnos disponibles del día
        const fechaSiguienteDia = new Date(fecha);
        fechaSiguienteDia.setDate(fechaSiguienteDia.getDate() + 1);
        
        const turnosDisponibles = await prisma.turno.findMany({
            where: { 
                reservado: false,
                fecha: {
                    gte: fecha,
                    lt: fechaSiguienteDia
                }
            },
            take: 20 // Obtener 20 para seleccionar 3 aleatorios
        });
        
        // Seleccionar 3 turnos aleatorios
        const turnosAOcupar = [];
        const turnosSeleccionados = [...turnosDisponibles]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        for (const turno of turnosSeleccionados) {
            const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
            
            // Crear alquiler
            const alquiler = await prisma.alquiler.create({
                data: {
                    clienteId: clienteAleatorio.id,
                    estado: 'PROGRAMADO'
                }
            });
            
            // Reservar el turno
            await prisma.turno.update({
                where: { id: turno.id },
                data: {
                    reservado: true,
                    alquilerId: alquiler.id
                }
            });
            
            turnosAOcupar.push({
                turnoId: turno.id,
                cliente: clienteAleatorio.nombre,
                hora: turno.horaInicio
            });
        }
        
        console.log(`🎯 [SCHEDULER] Ocupados ${turnosAOcupar.length} turnos aleatorios:`, 
            turnosAOcupar.map(t => `${t.cliente} - ${t.hora.toLocaleTimeString()}`));
        
    } catch (error) {
        console.error('❌ [SCHEDULER] Error ocupando turnos aleatorios:', error);
    }
}

// Inicializar el scheduler
export function iniciarScheduler() {
    console.log('🚀 [SCHEDULER] Iniciando sistema de tareas programadas...');
    
    // Ejecutar todos los días a las 00:00
    cron.schedule('0 0 * * *', async () => {
        console.log('🕛 [SCHEDULER] Ejecutando tarea diaria de medianoche...');
        try {
            await generarTurnosDelDiaSiguiente();
        } catch (error) {
            console.error('❌ [SCHEDULER] Error en tarea de medianoche:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });
    
    console.log('✅ [SCHEDULER] Sistema de tareas programadas iniciado');
    console.log('📅 [SCHEDULER] Próxima ejecución: todos los días a las 00:00 (Argentina)');
}

// Función para ejecutar manualmente (para testing)
export async function ejecutarGeneracionManual() {
    console.log('🔧 [SCHEDULER] Ejecutando generación manual...');
    return await generarTurnosDelDiaSiguiente();
}