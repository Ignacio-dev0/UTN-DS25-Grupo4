import { getNowInArgentina } from './timezone';

/**
 * Valida si se puede reservar un turno con al menos 1 hora de anticipación
 */
export function validarTiempoMinimoReserva(fechaTurno: Date, horaTurno: Date): { valido: boolean; mensaje?: string; horasRestantes?: number } {
    const ahora = getNowInArgentina();
    
    // Construir fecha+hora completa del turno
    const year = fechaTurno.getFullYear();
    const month = fechaTurno.getMonth();
    const day = fechaTurno.getDate();
    const hora = horaTurno.getUTCHours();
    const minutos = horaTurno.getUTCMinutes();
    
    const fechaHoraTurno = new Date(year, month, day, hora, minutos);
    
    // Calcular diferencia en horas
    const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
    
    console.log('🕐 Validación tiempo mínimo reserva:', {
        ahora: ahora.toISOString(),
        fechaHoraTurno: fechaHoraTurno.toISOString(),
        diferenciaHoras: diferenciaHoras.toFixed(2)
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
    
    // Construir fecha+hora completa del turno
    const year = fechaTurno.getFullYear();
    const month = fechaTurno.getMonth();
    const day = fechaTurno.getDate();
    const hora = horaTurno.getUTCHours();
    const minutos = horaTurno.getUTCMinutes();
    
    const fechaHoraTurno = new Date(year, month, day, hora, minutos);
    
    // Calcular diferencia en horas
    const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
    
    console.log('🕐 Validación tiempo mínimo cancelación:', {
        ahora: ahora.toISOString(),
        fechaHoraTurno: fechaHoraTurno.toISOString(),
        diferenciaHoras: diferenciaHoras.toFixed(2)
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
    
    // Construir fecha+hora completa del turno + 2 horas
    const year = fechaTurno.getFullYear();
    const month = fechaTurno.getMonth();
    const day = fechaTurno.getDate();
    const hora = horaTurno.getUTCHours();
    const minutos = horaTurno.getUTCMinutes();
    
    const fechaHoraTurno = new Date(year, month, day, hora, minutos);
    const limitePago = new Date(fechaHoraTurno.getTime() + (2 * 60 * 60 * 1000)); // +2 horas
    
    return ahora >= limitePago;
}
