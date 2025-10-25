# Feature: Badge de Estado y Ocultar/Mostrar Complejos

## 📋 Funcionalidades Implementadas

### 1. Badge de Estado en Complejos Aprobados

**Ubicación**: Panel de Administración → Pestaña "Complejos Aprobados"

**Descripción**: Cada card de complejo ahora muestra un badge circular con el estado actual del complejo.

**Estados y Colores**:
- 🟢 **APROBADO**: Verde (`bg-secondary text-white`)
- 🟡 **PENDIENTE**: Amarillo (`bg-canchaYellow text-white`)
- 🔴 **RECHAZADO**: Rojo (`bg-canchaRed text-white`)
- ⚫ **OCULTO**: Gris (`bg-gray-400 text-white`)

**Estilo**: Similar al badge de "Mis Reservas" (Pendiente, Confirmada, Cancelada, Finalizada)

```jsx
// frontend/src/components/ComplejosAprobadosLista.jsx
<span className={`font-bold text-xs px-3 py-1 rounded-full ${getStatusClass(complejo.estado)}`}>
  {complejo.estado}
</span>
```

### 2. Botón Ocultar/Mostrar Complejo

**Ubicación**: Al lado del botón "Eliminar" en cada card de complejo

**Iconos**:
- 👁️ **FaEye** (verde): Mostrar complejo oculto
- 👁️‍🗨️ **FaEyeSlash** (amarillo): Ocultar complejo activo

**Colores**:
- **Ocultar**: Botón amarillo (`bg-yellow-500 hover:bg-yellow-600`)
- **Mostrar**: Botón verde (`bg-green-500 hover:bg-green-600`)

**Comportamiento**:
```jsx
<button 
  onClick={() => onToggleVisibility(complejo)}
  className={`${complejo.estado === 'OCULTO' ? 'bg-green-500' : 'bg-yellow-500'} ...`}
  title={complejo.estado === 'OCULTO' ? 'Mostrar complejo' : 'Ocultar complejo'}
>
  {complejo.estado === 'OCULTO' ? <FaEye /> : <FaEyeSlash />}
</button>
```

## 🔧 Lógica de Ocultar/Mostrar

### Función `handleToggleVisibility`

**Archivo**: `frontend/src/pages/AdminPage.jsx`

**Flujo de Ejecución**:

1. **Confirmación del usuario**:
   ```javascript
   const accion = nuevoEstado === 'OCULTO' ? 'ocultar' : 'mostrar';
   confirm(`¿Estás seguro de que quieres ${accion} el complejo "${complejo.nombre}"?
   
   Esto ${accion === 'ocultar' ? 'ocultará' : 'mostrará'} también todas sus canchas.`)
   ```

2. **Actualizar estado del complejo**:
   ```javascript
   await fetch(`${API_BASE_URL}/complejos/${complejo.id}`, {
     method: 'PUT',
     body: JSON.stringify({ estado: nuevoEstado }) // OCULTO o APROBADO
   });
   ```

3. **Obtener canchas del complejo**:
   ```javascript
   const canchasResponse = await fetch(`${API_BASE_URL}/canchas?complejoId=${complejo.id}`);
   const canchas = canchasData.canchas || canchasData || [];
   ```

4. **Actualizar estado de cada cancha**:
   ```javascript
   const nuevaActiva = nuevoEstado === 'APROBADO'; // true si se muestra, false si se oculta
   
   const updatePromises = canchas.map(cancha => 
     fetch(`${API_BASE_URL}/canchas/${cancha.id}`, {
       method: 'PUT',
       body: JSON.stringify({ activa: nuevaActiva })
     })
   );
   
   await Promise.all(updatePromises);
   ```

5. **Mensaje de confirmación**:
   ```javascript
   alert(`Complejo ${accion === 'ocultar' ? 'ocultado' : 'mostrado'} correctamente junto con sus canchas`);
   ```

### Diagrama de Flujo

```
Usuario hace clic en botón 🔴 Ocultar
    ↓
Confirmación: "¿Ocultar complejo X y sus canchas?"
    ↓ [Sí]
PUT /api/complejos/:id { estado: 'OCULTO' }
    ↓
GET /api/canchas?complejoId=:id
    ↓
Para cada cancha:
    PUT /api/canchas/:id { activa: false }
    ↓
Alert: "Complejo ocultado correctamente junto con sus canchas"
    ↓
Recargar lista de complejos
```

## 🎯 Casos de Uso

### Caso 1: Ocultar complejo por mantenimiento

**Escenario**: El complejo "La Plata Sports" necesita mantenimiento en todas sus canchas.

**Pasos**:
1. Admin va a "Complejos Aprobados"
2. Encuentra la card de "La Plata Sports"
3. Ve el badge 🟢 **APROBADO**
4. Hace clic en el botón 🟡 **Ocultar** (FaEyeSlash)
5. Confirma en el modal: "¿Ocultar complejo y sus canchas?"
6. El complejo cambia a ⚫ **OCULTO**
7. Todas las canchas del complejo se desactivan (`activa: false`)
8. Las canchas ya NO aparecen en la búsqueda de canchas disponibles

### Caso 2: Mostrar complejo después de mantenimiento

**Escenario**: El mantenimiento terminó, el complejo está listo para volver a operar.

**Pasos**:
1. Admin va a "Complejos Aprobados"
2. Encuentra la card de "La Plata Sports"
3. Ve el badge ⚫ **OCULTO**
4. Hace clic en el botón 🟢 **Mostrar** (FaEye)
5. Confirma en el modal: "¿Mostrar complejo y sus canchas?"
6. El complejo vuelve a 🟢 **APROBADO**
7. Todas las canchas del complejo se activan (`activa: true`)
8. Las canchas vuelven a aparecer en la búsqueda de canchas disponibles

## 🔍 Detalles Técnicos

### Endpoints Utilizados

#### 1. Actualizar estado del complejo
```http
PUT /api/complejos/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "OCULTO" | "APROBADO"
}
```

**Backend**: `backend/src/services/complejo.service.ts::updateComplejo()`
- Acepta cualquier campo del modelo Complejo, incluyendo `estado`
- Actualiza directamente en la base de datos

#### 2. Obtener canchas del complejo
```http
GET /api/canchas?complejoId=:id
Authorization: Bearer {token}
```

**Backend**: `backend/src/services/cancha.service.ts::getCanchas()`
- Filtra canchas por `complejoId`
- Retorna todas las canchas del complejo

#### 3. Actualizar estado de cancha
```http
PUT /api/canchas/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "activa": true | false
}
```

**Backend**: `backend/src/services/cancha.service.ts::actualizarCancha()`
- Acepta cualquier campo del modelo Cancha, incluyendo `activa`
- Cuando `activa: false`, la cancha no aparece en búsquedas

### Modelos de Base de Datos

#### Modelo Complejo
```prisma
model Complejo {
  id              Int               @id @default(autoincrement())
  nombre          String
  estado          EstadoComplejo    @default(PENDIENTE)
  activo          Boolean           @default(true)
  // ... otros campos
}

enum EstadoComplejo {
  PENDIENTE
  APROBADO
  RECHAZADO
  OCULTO
}
```

#### Modelo Cancha
```prisma
model Cancha {
  id          Int      @id @default(autoincrement())
  activa      Boolean  @default(true)
  complejoId  Int
  complejo    Complejo @relation(fields: [complejoId], references: [id])
  // ... otros campos
}
```

## 📦 Archivos Modificados

### Frontend

1. **`frontend/src/components/ComplejosAprobadosLista.jsx`**
   - Agregado badge de estado con `getStatusClass()`
   - Agregado botón de ocultar/mostrar con iconos FaEye/FaEyeSlash
   - Importado `react-icons/fa` para iconos
   - Agregado prop `onToggleVisibility`

2. **`frontend/src/pages/AdminPage.jsx`**
   - Implementada función `handleToggleVisibility()`
   - Lógica para actualizar complejo y canchas
   - Pasada prop `onToggleVisibility` a ComplejosAprobadosLista

### Backend

**No requiere cambios** - Los endpoints existentes ya soportan las operaciones necesarias:
- `PUT /api/complejos/:id` acepta campo `estado`
- `GET /api/canchas?complejoId=:id` filtra por complejo
- `PUT /api/canchas/:id` acepta campo `activa`

## ✅ Testing Manual

### Test 1: Verificar badge de estado
- [ ] Ir a "Complejos Aprobados"
- [ ] Verificar que cada complejo muestra su badge de estado
- [ ] Badge APROBADO debe ser verde
- [ ] Badge OCULTO debe ser gris

### Test 2: Ocultar complejo
- [ ] Hacer clic en botón amarillo (FaEyeSlash) de un complejo APROBADO
- [ ] Verificar modal de confirmación aparece
- [ ] Confirmar acción
- [ ] Verificar badge cambia a OCULTO (gris)
- [ ] Verificar botón cambia a verde (FaEye)
- [ ] Ir a búsqueda de canchas
- [ ] Verificar que las canchas del complejo NO aparecen

### Test 3: Mostrar complejo
- [ ] Hacer clic en botón verde (FaEye) de un complejo OCULTO
- [ ] Verificar modal de confirmación aparece
- [ ] Confirmar acción
- [ ] Verificar badge cambia a APROBADO (verde)
- [ ] Verificar botón cambia a amarillo (FaEyeSlash)
- [ ] Ir a búsqueda de canchas
- [ ] Verificar que las canchas del complejo SÍ aparecen

### Test 4: Cancelar acción
- [ ] Hacer clic en botón de ocultar/mostrar
- [ ] Cancelar en el modal de confirmación
- [ ] Verificar que el estado NO cambió
- [ ] Verificar que las canchas mantienen su estado

## 🎨 Comparación Visual

### Antes
```
┌──────────────────────────────────────────┐
│ La Plata Sports                          │
│ Calle 50 Nro 123, La Plata              │
│ CUIT: 20-12345678-9                     │
│                                          │
│         [Ver Detalles]  [🗑️ Eliminar]   │
└──────────────────────────────────────────┘
```

### Después
```
┌──────────────────────────────────────────┐
│ La Plata Sports  [🟢 APROBADO]          │
│ Calle 50 Nro 123, La Plata              │
│ CUIT: 20-12345678-9                     │
│                                          │
│   [Ver Detalles]  [👁️‍🗨️]  [🗑️]          │
│                    Ocultar  Eliminar     │
└──────────────────────────────────────────┘

Cuando se oculta:

┌──────────────────────────────────────────┐
│ La Plata Sports  [⚫ OCULTO]            │
│ Calle 50 Nro 123, La Plata              │
│ CUIT: 20-12345678-9                     │
│                                          │
│   [Ver Detalles]  [👁️]  [🗑️]             │
│                    Mostrar  Eliminar     │
└──────────────────────────────────────────┘
```

## 💡 Notas Adicionales

### Diferencia entre "Ocultar" y "Eliminar"

- **Ocultar** (OCULTO):
  - El complejo sigue existiendo en la base de datos
  - Estado cambia a `OCULTO`
  - Canchas se desactivan temporalmente
  - Se puede **revertir** haciendo clic en "Mostrar"
  - Útil para mantenimiento temporal

- **Eliminar** (DELETE):
  - El complejo se elimina permanentemente de la base de datos
  - Todas las canchas se eliminan
  - Todos los turnos y reservas se eliminan
  - **NO se puede revertir**
  - Útil para complejos que cierran definitivamente

### Comportamiento con Reservas Existentes

Cuando se oculta un complejo:
- Las reservas **existentes** se mantienen (no se cancelan)
- Los turnos **futuros** ya no estarán disponibles para nuevas reservas
- Los usuarios con reservas confirmadas pueden seguir asistiendo
- Solo se bloquean nuevas reservas mientras esté oculto

## 🔗 Commits Relacionados

### Commit Anterior
```
Fix: Usar getImageUrl() para renderizar imágenes de complejos
- Resuelve problema de imágenes que no son base64
```

### Commit Actual
```
Feature: Badge de estado y botón ocultar/mostrar en complejos aprobados
- Badge de estado con colores (APROBADO/PENDIENTE/RECHAZADO/OCULTO)
- Botón ocultar/mostrar con iconos FaEye/FaEyeSlash
- Actualización automática de canchas al ocultar/mostrar complejo
```

## 📚 Referencias

- **Inspiración UI**: Componente `ListaReservas.jsx` (badges de estado)
- **Inspiración funcional**: Componente `ListaCanchasComplejo.jsx` (botón ocultar/mostrar canchas)
- **Iconos**: `react-icons/fa` (FaEye, FaEyeSlash)
- **Colores**: Tailwind CSS classes personalizadas (`bg-secondary`, `bg-canchaYellow`, `bg-canchaRed`)
