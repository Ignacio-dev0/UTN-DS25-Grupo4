import { Request, Response, NextFunction } from 'express';

// Cache para evitar requests duplicados
interface RequestCacheEntry {
    timestamp: number;
    inProgress: boolean;
    result?: any;
}

const requestCache = new Map<string, RequestCacheEntry>();
const CACHE_DURATION = 500; // 500ms - muy corto para evitar bloqueos

// Función para limpiar cache expirado
function cleanExpiredRequests() {
    const now = Date.now();
    for (const [key, entry] of requestCache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
            requestCache.delete(key);
        }
    }
}

// Middleware para evitar requests duplicados
// export function deduplicateRequests(req: Request, res: Response, next: NextFunction) {
//     // MODO DEBUGGING: Temporalmente solo logear y permitir todos los requests
//     console.log(`🔍 Request recibido: ${req.method} ${req.originalUrl}`);
//     return next();
    
//     // Excluir rutas críticas de edición del middleware de deduplicación
//     const excludedPatterns = [
//         /\/api\/canchas\/\d+$/, // PUT /api/canchas/:id
//         /\/api\/cronograma\/cancha\/\d+$/, // PUT /api/cronograma/cancha/:id
//         /\/api\/complejos\/\d+$/, // PUT /api/complejos/:id
//     ];
    
//     const shouldExclude = excludedPatterns.some(pattern => pattern.test(req.originalUrl));
//     if (shouldExclude && req.method === 'PUT') {
//         console.log(`🔓 Ruta de edición excluida del rate limiting: ${req.method} ${req.originalUrl}`);
//         return next();
//     }
    
//     // Ser menos restrictivo con operaciones de edición (PUT/PATCH/DELETE)
//     const isModificationRequest = ['PUT', 'PATCH', 'DELETE'].includes(req.method);
    
//     // Para operaciones de modificación, usar una ventana de tiempo más pequeña
//     const timeWindow = isModificationRequest ? 500 : 1000; // 500ms para PUT/PATCH/DELETE, 1s para otros
    
//     // Generar clave única basada en URL, método y parámetros
//     const cacheKey = `${req.method}:${req.originalUrl}:${JSON.stringify(req.params)}`;
    
//     // Limpiar cache expirado
//     cleanExpiredRequests();
    
//     const cached = requestCache.get(cacheKey);
    
//     if (cached) {
//         if (cached.inProgress) {
//             // Usar ventana de tiempo variable según el tipo de operación
//             const timeDiff = Date.now() - cached.timestamp;
//             if (timeDiff < timeWindow) {
//                 console.log(`⚠️ Request duplicado detectado: ${cacheKey} (${timeDiff}ms) - Método: ${req.method}`);
//                 // En lugar de bloquear, solo logear y continuar para requests de modificación
//                 if (isModificationRequest) {
//                     console.log(`🔓 Permitiendo request de modificación a pesar del duplicado: ${req.method}`);
//                 } else {
//                     return res.status(429).json({ 
//                         error: 'Request duplicado detectado, espere un momento',
//                         retryAfter: 0.5
//                     });
//                 }
//             } else {
//                 // Si ha pasado suficiente tiempo, permitir el request
//                 console.log(`🔄 Request permitido después de ${timeDiff}ms - Método: ${req.method}: ${cacheKey}`);
//             }
//         }
        
//         // Solo usar cache para requests GET, no para modificaciones
//         if (!isModificationRequest && cached.result && (Date.now() - cached.timestamp) < CACHE_DURATION) {
//             // Si tenemos resultado cached reciente, devolverlo
//             console.log(`⚡ Devolviendo resultado cached para: ${cacheKey}`);
//             return res.json(cached.result);
//         }
//     }
    
//     // Marcar request como en progreso solo para requests no críticos
//     if (!isModificationRequest) {
//         requestCache.set(cacheKey, {
//             timestamp: Date.now(),
//             inProgress: true
//         });
//     }
    
//     // Interceptar res.json para cachear el resultado solo para requests GET
//     if (!isModificationRequest) {
//         const originalJson = res.json.bind(res);
//         res.json = function(data: any) {
//             // Guardar resultado en cache solo para requests GET
//             requestCache.set(cacheKey, {
//                 timestamp: Date.now(),
//                 inProgress: false,
//                 result: data
//             });
            
//             return originalJson(data);
//         };
//     }
    
//     // Continuar con el siguiente middleware
//     next();
// }