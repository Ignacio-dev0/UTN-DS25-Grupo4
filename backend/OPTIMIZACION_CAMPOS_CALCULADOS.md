# 🚀 Optimización: Campos Calculados

## 📋 Descripción
Esta optimización implementa campos calculados en la base de datos para almacenar valores que anteriormente se calculaban en tiempo real, mejorando significativamente el rendimiento del sistema.

## ⚡ Campos Agregados

### Tabla `Cancha`
- **`precioDesde`** (Float): Precio mínimo de la cancha basado en sus turnos disponibles
- **`puntaje`** (Float): Promedio de reseñas de la cancha (campo existente, ahora calculado)

### Tabla `Complejo`
- **`precioDesde`** (Float): Precio mínimo del complejo basado en todas sus canchas
- **`puntaje`** (Float): Promedio de puntajes de todas las canchas del complejo (campo existente, ahora calculado)

## 🔄 Actualización Automática

Los campos se actualizan automáticamente cuando:

1. **Se crea/actualiza una reseña** → Actualiza puntajes de cancha y complejo
2. **Se crea/actualiza/elimina un turno** → Actualiza precios "desde" de cancha y complejo
3. **Se modifica el cronograma** → Actualiza precios "desde"

## 📁 Archivos Creados/Modificados

### Servicios
- **`src/services/camposCalculados.service.js`** - Funciones para calcular campos
- **`src/services/resenas.service.ts`** - Auto-actualización tras reseñas
- **`src/services/cancha.service.ts`** - Auto-actualización de precios

### Scripts
- **`src/scripts/poblarCamposCalculados.js`** - Poblar valores iniciales
- **`src/scripts/verificarConexion.js`** - Verificar estado de la migración

### Base de Datos
- **`prisma/migrations/20251012161715_add_precio_calculado_fields/`** - Migración SQL
- **`prisma/schema.prisma`** - Schema actualizado

## 🚀 Instrucciones de Despliegue

### 1. Aplicar Migración
```bash
cd backend
npx prisma migrate deploy
```

### 2. Poblar Datos Iniciales
```bash
node src/scripts/poblarCamposCalculados.js
```

### 3. Verificar Instalación
```bash
node src/scripts/verificarConexion.js
```

## 📊 Beneficios Esperados

- **🏃‍♂️ Rendimiento**: Eliminación de cálculos repetitivos en tiempo real
- **⚡ Velocidad**: Carga más rápida de listados de canchas y complejos
- **🔄 Actualización**: Datos siempre actualizados automáticamente
- **💾 Eficiencia**: Menor carga en la base de datos
- **🎯 UX**: Mejor experiencia de usuario con tiempos de respuesta reducidos

## 🔧 Funciones Principales

### `actualizarCamposCalculadosCancha(canchaId)`
Actualiza todos los campos calculados de una cancha específica y su complejo.

### `actualizarCamposCalculadosComplejo(complejoId)`
Actualiza todos los campos calculados de un complejo y todas sus canchas.

### `recalcularPrecioDesde(canchaId)`
Actualiza solo el precio "desde" de una cancha específica.

## 🔍 Monitoreo

Los servicios incluyen logging detallado para monitorear las actualizaciones:

```
✅ Puntaje de cancha 123 actualizado a: 4.5
✅ Precio desde de cancha 123 actualizado a: $1500
✅ Puntaje de complejo 45 actualizado a: 4.2
✅ Precio desde de complejo 45 actualizado a: $1200
```

## ⚠️ Notas Importantes

1. **Compatibilidad**: El campo `precioHora` se mantiene actualizado para compatibilidad con código existente
2. **Graceful Degradation**: Si fallan las actualizaciones automáticas, no afectan la operación principal
3. **Transaccionalidad**: Las actualizaciones de campos calculados son independientes de las operaciones principales
4. **Performance**: Las actualizaciones se ejecutan de forma asíncrona cuando es posible

## 🔄 Rollback

Si necesitas revertir los cambios:

1. Remover campos del schema
2. Crear nueva migración
3. Actualizar servicios para volver a cálculo en tiempo real

## 📈 Métricas de Impacto

Antes de la optimización:
- Cálculo de reseñas en cada request
- Cálculo de precios mínimos en cada request
- Múltiples consultas por cancha/complejo

Después de la optimización:
- Valores precalculados en base de datos
- Una sola consulta por cancha/complejo
- Actualización solo cuando es necesario