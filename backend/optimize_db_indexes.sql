-- Optimizaciones de índices para mejorar rendimiento de queries comunes
-- Ejecutar estos comandos después de hacer el migrate

-- Índices para búsquedas frecuentes en Usuario
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuario_correo ON "Usuario"(correo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuario_dni ON "Usuario"(dni);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuario_rol ON "Usuario"(rol);

-- Índices para relaciones frecuentes en Complejo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_complejo_usuario ON "Complejo"(usuarioId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_complejo_solicitud ON "Complejo"(solicitudId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_complejo_domicilio ON "Complejo"(domicilioId);

-- Índices para búsquedas en Cancha
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cancha_complejo ON "Cancha"(complejoId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cancha_deporte ON "Cancha"(deporteId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cancha_activa ON "Cancha"(activa);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cancha_complejo_activa ON "Cancha"(complejoId, activa);

-- Índices para Alquiler (queries de reportes y historial)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alquiler_cliente ON "Alquiler"(clienteId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alquiler_estado ON "Alquiler"(estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alquiler_created_at ON "Alquiler"(createdAt);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alquiler_cliente_estado ON "Alquiler"(clienteId, estado);

-- Índices para Turno (ya existen algunos pero agregamos más)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_turno_fecha ON "Turno"(fecha);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_turno_alquiler ON "Turno"(alquilerId);

-- Índices para Solicitud
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_estado ON "Solicitud"(estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_admin ON "Solicitud"(adminId);

-- Índices para HorarioCronograma
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_horario_cronograma_cancha ON "HorarioCronograma"(canchaId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_horario_cronograma_dia ON "HorarioCronograma"(diaSemana);

-- Índices para Reseña
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resenia_alquiler ON "Resenia"(alquilerId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_resenia_puntaje ON "Resenia"(puntaje);

-- Índices para Pago
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pago_alquiler ON "Pago"(alquilerId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pago_metodo ON "Pago"(metodoPago);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pago_fecha ON "Pago"(fechaHora);

-- Optimización de estadísticas para el optimizador de query
ANALYZE;