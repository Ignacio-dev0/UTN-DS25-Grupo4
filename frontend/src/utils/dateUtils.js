/**
 * Utilidades para manejo consistente de fechas en todo el frontend
 * 
 * PROBLEMA: Las fechas vienen del backend como ISO strings en UTC (ej: "2025-11-02T00:00:00.000Z")
 * Cuando JavaScript las parsea con new Date(), las convierte a timezone local (Argentina UTC-3),
 * resultando en un día anterior (ej: 1/11/2025 21:00:00).
 * 
 * SOLUCIÓN: Extraer solo la parte de la fecha (YYYY-MM-DD) y crear Date objects sin conversión de timezone.
 */

/**
 * Parsea una fecha ISO string del backend a un Date object en timezone local
 * sin hacer conversión de timezone.
 * 
 * @param {string} fechaISO - Fecha en formato ISO: "2025-11-02T00:00:00.000Z"
 * @returns {Date} - Date object con la fecha correcta en timezone local
 * 
 * @example
 * parseFechaBackend("2025-11-02T00:00:00.000Z") 
 * // Retorna: Date object para 2/11/2025 00:00:00 (local), no 1/11/2025 21:00:00
 */
export function parseFechaBackend(fechaISO) {
    if (!fechaISO) return null;
    
    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    const fechaString = typeof fechaISO === 'string' && fechaISO.includes('T') 
        ? fechaISO.split('T')[0] 
        : fechaISO;
    
    // Parsear componentes
    const [year, month, day] = fechaString.split('-').map(Number);
    
    // Crear Date con componentes individuales (mes es 0-indexed)
    return new Date(year, month - 1, day);
}

/**
 * Parsea una hora ISO string del backend a string "HH:MM"
 * 
 * @param {string} horaISO - Hora en formato ISO: "1970-01-01T14:00:00.000Z"
 * @returns {string} - Hora en formato "HH:MM"
 * 
 * @example
 * parseHoraBackend("1970-01-01T14:00:00.000Z") // Retorna: "14:00"
 */
export function parseHoraBackend(horaISO) {
    if (!horaISO) return '00:00';
    
    if (typeof horaISO === 'string') {
        // Intentar extraer con regex primero
        const timeMatch = horaISO.match(/T(\d{2}:\d{2})/);
        if (timeMatch) {
            return timeMatch[1]; // "14:00"
        }
        
        // Si no funciona, usar Date con UTC
        const d = new Date(horaISO);
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    } else if (horaISO instanceof Date) {
        const d = new Date(horaISO);
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    }
    
    return '00:00';
}

/**
 * Formatea una fecha a DD/MM/YYYY
 * 
 * @param {Date} fecha - Date object
 * @returns {string} - Fecha formateada como "DD/MM/YYYY"
 * 
 * @example
 * formatearFecha(new Date(2025, 10, 2)) // Retorna: "02/11/2025"
 */
export function formatearFecha(fecha) {
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
        console.warn('formatearFecha recibió fecha inválida:', fecha);
        return '';
    }
    
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
}

/**
 * Calcula la hora de fin sumando N horas a una hora de inicio
 * 
 * @param {string} horaInicio - Hora en formato "HH:MM"
 * @param {number} duracion - Duración en horas (default: 1)
 * @returns {string} - Hora de fin en formato "HH:MM"
 * 
 * @example
 * calcularHoraFin("14:00", 1) // Retorna: "15:00"
 * calcularHoraFin("23:00", 2) // Retorna: "01:00"
 */
export function calcularHoraFin(horaInicio, duracion = 1) {
    if (!horaInicio || typeof horaInicio !== 'string') {
        console.warn('calcularHoraFin recibió hora inválida:', horaInicio);
        return '00:00';
    }
    
    const [hora, minutos] = horaInicio.split(':').map(Number);
    const horaFin = (hora + duracion) % 24;
    
    return `${horaFin.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

/**
 * Crea un Date object combinando fecha y hora para comparaciones
 * 
 * @param {Date} fecha - Date object con la fecha
 * @param {string} hora - Hora en formato "HH:MM"
 * @returns {Date} - Date object con fecha y hora combinadas
 * 
 * @example
 * combinarFechaHora(new Date(2025, 10, 2), "14:00")
 * // Retorna: Date object para 2/11/2025 14:00:00
 */
export function combinarFechaHora(fecha, hora) {
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
        console.warn('combinarFechaHora recibió fecha inválida:', fecha);
        return new Date();
    }
    
    if (!hora || typeof hora !== 'string') {
        console.warn('combinarFechaHora recibió hora inválida:', hora);
        hora = '00:00';
    }
    
    const [horas, minutos] = hora.split(':').map(Number);
    
    return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        horas,
        minutos,
        0,
        0
    );
}

/**
 * Verifica si un turno ya pasó (para auto-finalización)
 * 
 * @param {string} fechaISO - Fecha del turno en formato ISO
 * @param {string} horaFinISO - Hora de fin en formato ISO o "HH:MM"
 * @returns {boolean} - true si el turno ya pasó
 * 
 * @example
 * turnoYaPaso("2025-11-02T00:00:00.000Z", "14:00") // false si son las 13:00 del 2/11/2025
 */
export function turnoYaPaso(fechaISO, horaFinISO) {
    const fecha = parseFechaBackend(fechaISO);
    if (!fecha) return false;
    
    // Si horaFinISO es string "HH:MM", usar directamente
    const horaFin = horaFinISO.includes(':') && !horaFinISO.includes('T') 
        ? horaFinISO 
        : parseHoraBackend(horaFinISO);
    
    const fechaHoraFin = combinarFechaHora(fecha, horaFin);
    const ahora = new Date();
    
    return ahora > fechaHoraFin;
}
