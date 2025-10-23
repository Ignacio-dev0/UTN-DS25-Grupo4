import cors from 'cors'

export default function corsValidation(allowedOrigins: string[]) {
  return cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como Postman)
      if (!origin) return callback(null, true);
      
      // Permitir todos los localhost durante desarrollo
      if (origin.startsWith('http://localhost:')) {
          return callback(null, true);
      }
      
      // Verificar origins específicos en producción
      if (allowedOrigins.includes(origin)) {
          return callback(null, true);
      }
      
      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}