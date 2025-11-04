import { getNowInArgentina } from './timezone';

/**
 * Valida si se puede reservar un turno con al menos 1 hora de anticipación
 */
export function validarTiempoMinimoReserva(fechaTurno: Date, horaTurno: Date): { valido: boolean; mensaje?: string; horasRestantes?: number } {
    const ahora = getNowInArgentina();
    
    // 🔍 DEBUG: Ver qué valores estamos recibiendo
    console.log('📋 Validación tiempo mínimo reserva - Datos recibidos:', {
        fechaTurno: fechaTurno.toISOString(),
        horaTurno: horaTurno.toISOString(),
        ahoraArgentina: ahora.toISOString()
    });
    
    // Construir fecha+hora completa del turno usando fecha de Argentina
    // fechaTurno contiene la fecha (día/mes/año)
    // horaTurno contiene la hora y minutos
    const fechaHoraTurno = new Date(
        fechaTurno.getFullYear(),
        fechaTurno.getMonth(),
        fechaTurno.getDate(),
        horaTurno.getHours(), // ✅ Hora local
        horaTurno.getMinutes() // ✅ Minutos locales
    );
    
    // Calcular diferencia en horas
    const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
    
    console.log('🕐 Validación tiempo mínimo reserva - Cálculo:', {
        fechaHoraTurnoCompleta: fechaHoraTurno.toISOString(),
        ahoraArgentina: ahora.toISOString(),
        diferenciaHoras: diferenciaHoras.toFixed(2),
        validacion: diferenciaHoras >= 1 ? 'PERMITIDO ✅' : 'BLOQUEADO ❌'
    });
    
    if (diferenciaHoras < 1) {
        return {
            valido: false,
            mensaje: `No puedes reservar con menos de 1 hora de anticipación. Faltan ${diferenciaHoras.toFixed(1)} horas.`,
            horasRestantes: diferenciaHoras
        };
    }
    
    return { valido: true, horasRestantes: diferenciaHoras };
}

/**
 * Valida si se puede cancelar un alquiler con al menos 2 horas de anticipación
 */
export function validarTiempoMinimoCancelacion(fechaTurno: Date, horaTurno: Date): { valido: boolean; mensaje?: string; horasRestantes?: number } {
    const ahora = getNowInArgentina();
    
    // 🔍 DEBUG: Ver qué valores estamos recibiendo
    console.log('📋 Validación tiempo mínimo cancelación - Datos recibidos:', {
        fechaTurno: fechaTurno.toISOString(),
        horaTurno: horaTurno.toISOString(),
        ahoraArgentina: ahora.toISOString()
    });
    
    // Construir fecha+hora completa del turno usando fecha de Argentina
    // fechaTurno contiene la fecha (día/mes/año)
    // horaTurno contiene la hora y minutos
    const fechaHoraTurno = new Date(
        fechaTurno.getFullYear(),
        fechaTurno.getMonth(),
        fechaTurno.getDate(),
        horaTurno.getHours(), // ✅ Hora local
        horaTurno.getMinutes() // ✅ Minutos locales
    );
    
    // Calcular diferencia en horas
    const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
    
    console.log('🕐 Validación tiempo mínimo cancelación - Cálculo:', {
        fechaHoraTurnoCompleta: fechaHoraTurno.toISOString(),
        ahoraArgentina: ahora.toISOString(),
        diferenciaHoras: diferenciaHoras.toFixed(2),
        validacion: diferenciaHoras >= 2 ? 'PERMITIDO ✅' : 'BLOQUEADO ❌ (SE PENALIZA)'
    });
    
    if (diferenciaHoras < 2) {
        return {
            valido: false,
            mensaje: `No puedes cancelar con menos de 2 horas de anticipación. Faltan ${diferenciaHoras.toFixed(1)} horas.`,
            horasRestantes: diferenciaHoras
        };
    }
    
    return { valido: true, horasRestantes: diferenciaHoras };
}

/**
 * Valida si un usuario puede reservar (máximo 2 cancelaciones en los últimos 30 días)
 */
export function validarLimiteCancelaciones(cancelacionesRecientes: number, maximoCancelaciones: number = 2): { valido: boolean; mensaje?: string } {
    if (cancelacionesRecientes >= maximoCancelaciones) {
        return {
            valido: false,
            mensaje: `Has alcanzado el límite de ${maximoCancelaciones} cancelaciones en los últimos 30 días. No puedes realizar más reservas temporalmente.`
        };
    }
    
    return { valido: true };
}

/**
 * Calcula si un turno debe ser auto-liberado (2 horas después de la hora del turno sin confirmar pago)
 */
export function debeLiberarTurnoPorFaltaDePago(fechaTurno: Date, horaTurno: Date): boolean {
    const ahora = getNowInArgentina();
    
    // Construir fecha+hora completa del turno + 2 horas usando hora local de Argentina
    const year = fechaTurno.getFullYear();
    const month = fechaTurno.getMonth();
    const day = fechaTurno.getDate();
    const hora = horaTurno.getHours(); // ✅ Usar getHours() en lugar de getUTCHours()
    const minutos = horaTurno.getMinutes(); // ✅ Usar getMinutes() en lugar de getUTCMinutes()
    
    const fechaHoraTurno = new Date(year, month, day, hora, minutos);
    const limitePago = new Date(fechaHoraTurno.getTime() + (2 * 60 * 60 * 1000)); // +2 horas
    
    return ahora >= limitePago;
}
