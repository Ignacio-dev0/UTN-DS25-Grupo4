# Fix: No se podía rechazar solicitudes de complejos

## 🐛 Problema

Al intentar rechazar una solicitud de complejo desde el panel de administración, la operación fallaba sin mostrar un error claro.

**Síntoma**: El botón "Rechazar" no funcionaba y la solicitud permanecía en estado PENDIENTE.

## 🔍 Causa Raíz

**Inconsistencia entre frontend y backend**:

- **Frontend enviaba**: `'RECHAZADA'` (con A al final)
- **Schema de Prisma espera**: `'RECHAZADO'` (sin A)

### Schema de Prisma

```prisma
// backend/prisma/schema.prisma
enum EstadoComplejo {
  PENDIENTE
  APROBADO
  RECHAZADO  // ✅ Sin A
  OCULTO
}
```

### Código Frontend (ANTES - incorrecto)

```javascript
// frontend/src/pages/AdminPage.jsx
body: JSON.stringify({ estado: 'RECHAZADA' })  // ❌ Con A
```

### Error de Validación

Cuando el frontend enviaba `'RECHAZADA'`, Prisma rechazaba el valor porque no existe en el enum:

```
PrismaClientValidationError: Invalid value 'RECHAZADA' for enum EstadoComplejo.
Expected one of: PENDIENTE, APROBADO, RECHAZADO, OCULTO
```

## ✅ Solución

### 1. Corregir AdminPage.jsx

**Archivo**: `frontend/src/pages/AdminPage.jsx`

**Cambio en handleDecline**:

```javascript
// ANTES ❌
body: JSON.stringify({ estado: 'RECHAZADA' }),

// DESPUÉS ✅
body: JSON.stringify({ estado: 'RECHAZADO' }),
```

**Además, mejoré el manejo de errores**:

```javascript
if (response.ok) {
  alert('Solicitud rechazada correctamente');
  fetchSolicitudes();
} else {
  // Ahora muestra el error específico del servidor
  const errorData = await response.json();
  console.error('Error del servidor:', errorData);
  alert(`Error al rechazar solicitud: ${errorData.error || 'Error desconocido'}`);
}
```

### 2. Corregir EstadoSolicitudPage.jsx

**Archivo**: `frontend/src/pages/EstadoSolicitudPage.jsx`

**Cambio en getStatusInfo**:

```javascript
// ANTES ❌
case 'RECHAZADA':
  return {
    icon: <FaTimesCircle className="..." />,
    title: 'Solicitud Rechazada',
    message: 'Lamentablemente tu solicitud ha sido rechazada...',
    color: 'red'
  };

// DESPUÉS ✅
case 'RECHAZADO':
  return {
    icon: <FaTimesCircle className="..." />,
    title: 'Solicitud Rechazada',
    message: 'Lamentablemente tu solicitud ha sido rechazada...',
    color: 'red'
  };
```

**Nota**: Aunque el case es `'RECHAZADO'`, los textos mostrados al usuario siguen diciendo "Rechazada" (con A) porque es la forma gramaticalmente correcta en español ("solicitud rechazada").

## 📊 Estados del Enum

### EstadoComplejo

| Estado | Descripción | Color Badge |
|--------|-------------|-------------|
| `PENDIENTE` | Solicitud esperando aprobación | 🟡 Amarillo |
| `APROBADO` | Complejo aprobado y activo | 🟢 Verde |
| `RECHAZADO` | Solicitud rechazada | 🔴 Rojo |
| `OCULTO` | Complejo oculto temporalmente | ⚫ Gris |

## 🧪 Testing

### Test 1: Rechazar solicitud

1. **Login como Admin**
2. Ir a "Solicitudes"
3. Seleccionar una solicitud PENDIENTE
4. Hacer clic en "Rechazar"
5. Confirmar en el modal
6. ✅ Debe mostrar: "Solicitud rechazada correctamente"
7. ✅ La solicitud debe desaparecer de la lista de pendientes

### Test 2: Ver estado de solicitud rechazada

1. **Login como Dueño** (usuario cuya solicitud fue rechazada)
2. Ir a "Estado de Solicitud"
3. ✅ Debe mostrar:
   - Ícono: ❌ (círculo rojo con X)
   - Título: "Solicitud Rechazada"
   - Mensaje: "Lamentablemente tu solicitud ha sido rechazada..."

### Test 3: Verificar en base de datos

```sql
-- Consulta para verificar el estado
SELECT id, nombre, estado, "usuarioId" 
FROM "Complejo" 
WHERE estado = 'RECHAZADO';

-- Resultado esperado:
-- id | nombre              | estado    | usuarioId
-- 15 | Complejo Demo       | RECHAZADO | 20
```

## 🔧 Detalles Técnicos

### Endpoint Backend

```http
PUT /api/admin/solicitudes/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "RECHAZADO"  // ✅ Debe ser uno de los valores del enum
}
```

**Backend Service**: `backend/src/services/solicitud.service.ts`

```typescript
export async function updateSolicitud(
  id: number, 
  data: { estado: EstadoComplejo, evaluadorId?: number }
) {
  return prisma.complejo.update({
    where: { id },
    data: {
      estado: data.estado,  // ✅ Validado por Prisma según el enum
      administradorId: data.evaluadorId || null
    },
    include: { 
      usuario: true, 
      domicilio: { include: { localidad: true }}
    }
  });
}
```

### Validación de Prisma

Prisma valida automáticamente que el valor de `estado` sea uno de los definidos en el enum:

```typescript
// Si se envía un valor inválido:
{ estado: 'RECHAZADA' }  // ❌

// Prisma lanza:
PrismaClientValidationError: 
  Invalid value 'RECHAZADA' for enum EstadoComplejo.
  Expected one of: PENDIENTE, APROBADO, RECHAZADO, OCULTO
```

## 📝 Lecciones Aprendidas

### 1. Consistencia entre Frontend y Backend

**Problema**: El frontend usaba `'RECHAZADA'` (femenino) pensando en "solicitud rechazada", pero el backend define el enum sin género.

**Solución**: Usar exactamente los valores del enum del backend, independientemente de cómo se muestren al usuario.

### 2. Separar Lógica de Presentación

```javascript
// ✅ CORRECTO:
// Lógica (valor del enum)
const estado = 'RECHAZADO';  

// Presentación (texto mostrado al usuario)
const textoUsuario = 'Solicitud Rechazada';
```

### 3. Manejo de Errores

**Antes**: Solo mostraba "Error al rechazar solicitud"

**Ahora**: Muestra el error específico del servidor:
```javascript
const errorData = await response.json();
alert(`Error al rechazar solicitud: ${errorData.error || 'Error desconocido'}`);
```

Esto ayuda a detectar problemas más rápido.

## 🔗 Archivos Modificados

1. `frontend/src/pages/AdminPage.jsx`
   - Línea 117: `'RECHAZADA'` → `'RECHAZADO'`
   - Líneas 121-125: Mejor manejo de errores

2. `frontend/src/pages/EstadoSolicitudPage.jsx`
   - Línea 88: `case 'RECHAZADA':` → `case 'RECHAZADO':`

## 📦 Commit

```
Fix: Corregir estado RECHAZADA a RECHAZADO en solicitudes

- AdminPage: handleDecline enviaba 'RECHAZADA' pero schema espera 'RECHAZADO'
- EstadoSolicitudPage: case 'RECHAZADA' corregido a 'RECHAZADO'
- Agregado mejor manejo de errores en handleDecline (muestra error del servidor)
- Ahora las solicitudes se pueden rechazar correctamente
```

## 🎯 Resultado

✅ **Las solicitudes ahora se pueden rechazar correctamente**

✅ **El estado se guarda en la base de datos como `RECHAZADO`**

✅ **El usuario ve "Solicitud Rechazada" en su pantalla de estado**

✅ **Mejor feedback de errores para debugging**

## 📚 Referencias

- **Schema Prisma**: `backend/prisma/schema.prisma` (líneas 210-215)
- **Endpoint Backend**: `backend/src/services/solicitud.service.ts::updateSolicitud()`
- **Componente Admin**: `frontend/src/pages/AdminPage.jsx::handleDecline()`
- **Componente Estado**: `frontend/src/pages/EstadoSolicitudPage.jsx::getStatusInfo()`
