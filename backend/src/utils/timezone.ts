import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Zona horaria de Argentina
export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Obtiene la fecha/hora actual en Argentina
 */
export function getNowInArgentina(): Date {
  const now = new Date();
  return toZonedTime(now, ARGENTINA_TIMEZONE);
}

/**
 * Convierte una fecha UTC a hora de Argentina
 */
export function toArgentinaTime(date: Date): Date {
  return toZonedTime(date, ARGENTINA_TIMEZONE);
}

/**
 * Convierte una fecha de Argentina a UTC
 */
export function toUTC(date: Date): Date {
  return fromZonedTime(date, ARGENTINA_TIMEZONE);
}

/**
 * Obtiene el inicio del día de hoy en Argentina (00:00:00)
 */
export function getTodayStartInArgentina(): Date {
  const now = getNowInArgentina();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Obtiene el fin del día de hoy en Argentina (23:59:59)
 */
export function getTodayEndInArgentina(): Date {
  const now = getNowInArgentina();
  now.setHours(23, 59, 59, 999);
  return now;
}
