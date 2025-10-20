import { Request, Response, NextFunction } from 'express';

// Cache para evitar requests duplicados
interface RequestCacheEntry {
    timestamp: number;
    inProgress: boolean;
    result?: any;
}

const requestCache = new Map<string, RequestCacheEntry>();
const CACHE_DURATION = 5000; // 5 segundos

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
export function deduplicateRequests(req: Request, res: Response, next: NextFunction) {
    // Generar clave única basada en URL, método y parámetros
    const cacheKey = `${req.method}:${req.originalUrl}:${JSON.stringify(req.params)}`;
    
    // Limpiar cache expirado
    cleanExpiredRequests();
    
    const cached = requestCache.get(cacheKey);
    
    if (cached) {
        if (cached.inProgress) {
            // Si hay un request en progreso, esperar un poco y devolver error de duplicado
            console.log(`⚠️ Request duplicado detectado: ${cacheKey}`);
            return res.status(429).json({ 
                error: 'Request duplicado detectado, espere un momento',
                retryAfter: 1 
            });
        }
        
        if (cached.result && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            // Si tenemos resultado cached reciente, devolverlo
            console.log(`⚡ Devolviendo resultado cached para: ${cacheKey}`);
            return res.json(cached.result);
        }
    }
    
    // Marcar request como en progreso
    requestCache.set(cacheKey, {
        timestamp: Date.now(),
        inProgress: true
    });
    
    // Interceptar res.json para cachear el resultado
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
        // Guardar resultado en cache
        requestCache.set(cacheKey, {
            timestamp: Date.now(),
            inProgress: false,
            result: data
        });
        
        return originalJson(data);
    };
    
    // Continuar con el siguiente middleware
    next();
}