# Fix: Imagen y Nombre de Complejo

## 📋 Problema Reportado

Usuario reportó dos issues después de aprobar una solicitud de complejo:

1. **Imagen no visible**: "la foto que tenia asociada el complejo en la solicitud no paso a ser la foto de mi complejo"
2. **Nombre incorrecto**: El complejo se llama "Complejo Pendiente 4" en lugar del nombre esperado

## 🔍 Investigación

### 1. Origen del Nombre "Complejo Pendiente 4"

**Hallazgo**: El nombre proviene del archivo `backend/prisma/seed.ts`

```typescript
// backend/prisma/seed.ts líneas 208-212
{ nombre: 'Complejo Pendiente 1', cuit: '20301234568', ... },
{ nombre: 'Complejo Pendiente 2', cuit: '20301234569', ... },
{ nombre: 'Complejo Pendiente 3', cuit: '20301234570', ... },
{ nombre: 'Complejo Pendiente 4', cuit: '20301234571', ... },  // ← Este complejo
{ nombre: 'Complejo Pendiente 5', cuit: '20301234572', ... }
```

**Conclusión**: El complejo ID 12 fue creado con datos de prueba del seed, no desde una solicitud real del usuario.

Query en la BD local:
```sql
SELECT id, nombre, estado, "usuarioId", image FROM "Complejo" WHERE id = 12;
-- Resultado:
-- id | nombre              | estado   | usuarioId | image
-- 12 | Complejo Pendiente 4| APROBADO | 16        | tenis_6.jpg
```

### 2. Problema de la Imagen

**Hallazgo**: La imagen está guardada como ruta relativa (`tenis_6.jpg`) en lugar de base64.

**Causa**: Los complejos creados con el seed tienen imágenes como rutas relativas, mientras que los creados desde solicitudes reales usan base64.

**Componente afectado**: `frontend/src/components/ComplejoInfo.jsx`

Código ANTERIOR (líneas 174-180):
```jsx
<img 
  src={
    complejo.image && complejo.image.startsWith('data:image')
      ? complejo.image  // Solo usar si es base64 válido
      : "/canchaYa.png" // Usar placeholder para todo lo demás ❌
  } 
```

**Problema**: Solo renderizaba imágenes base64, ignorando rutas relativas.

## ✅ Solución Implementada

### Cambio en ComplejoInfo.jsx

1. **Importar función `getImageUrl()`**:
```jsx
import { API_BASE_URL, getImageUrl } from '../config/api.js';
```

2. **Actualizar renderizado de imagen** (líneas 174-180):
```jsx
<img 
  src={complejo.image ? getImageUrl(complejo.image) : "/canchaYa.png"} 
  alt={`Imagen de ${complejo.nombre}`} 
  className={`w-full h-full object-cover rounded-lg ${isEditing ? 'cursor-pointer' : ''}`}
  onClick={handleImageClick}
  loading="lazy"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/canchaYa.png";
  }}
/>
```

### Cómo Funciona `getImageUrl()`

La función `frontend/src/config/api.js::getImageUrl()` maneja todos los formatos:

```javascript
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // 1. Imágenes base64
  if (imagePath.startsWith('data:')) {
    return validateBase64Image(imagePath);
  }
  
  // 2. URLs absolutas
  if (imagePath.startsWith('http')) return imagePath;
  
  // 3. Rutas relativas con extensión (ej: tenis_6.jpg)
  if (imagePath.includes('.jpg') || imagePath.includes('.png') || imagePath.includes('.jpeg')) {
    const imageBaseUrl = API_BASE_URL.replace('/api', '');
    const cleanImagePath = imagePath.replace(/^api/, '');
    return `${imageBaseUrl}/images/canchas/${cleanImagePath}`;  // ← Construye URL completa
  }
  
  // 4. Otras rutas
  const imageBaseUrl = API_BASE_URL.replace('/api', '');
  return `${imageBaseUrl}/images/${imagePath}`;
};
```

**Resultado**:
- `tenis_6.jpg` → `https://utn-ds25-grupo4-canchaya.up.railway.app/images/canchas/tenis_6.jpg`
- `data:image/jpeg;base64,/9j/4AAQ...` → (base64 validado)
- `null` o inválido → fallback a `/canchaYa.png`

## 🎯 Solución para el Nombre

**Funcionalidad Existente**: El usuario puede editar el nombre del complejo desde "Mi Complejo":

1. Hacer clic en el botón del **lápiz** (icono de edición)
2. Editar el campo "Nombre" del complejo
3. Hacer clic en el botón del **check** (icono de confirmar)
4. El nombre se actualiza en la base de datos vía `PUT /api/complejos/:id`

```jsx
// frontend/src/pages/MiComplejoPage.jsx líneas 220-321
const handleToggleEdit = async () => {
  if(isEditing) {
    // ... preparar datos
    const datosParaActualizar = {
      nombre: infoDelComplejo.nombre?.trim() || "",
      descripcion: infoDelComplejo.descripcion?.trim() || "",
      image: infoDelComplejo.image || null,
      horarios: infoDelComplejo.horarios?.trim() || "",
      servicios: infoDelComplejo.servicios || []
    };
    
    // Actualizar en BD
    const response = await fetch(`${API_BASE_URL}/complejos/${complejoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosParaActualizar),
    });
    // ...
  }
  setIsEditing(!isEditing);
};
```

## 📊 Resultado Final

### Antes
- ❌ Imagen no se mostraba (solo placeholder)
- ❌ Nombre: "Complejo Pendiente 4"

### Después
- ✅ Imagen renderizada correctamente desde `/images/canchas/tenis_6.jpg`
- ✅ Usuario puede editar el nombre a lo que desee

## 🧪 Testing

Para verificar que todo funciona:

1. **Verificar imagen**:
   - Ir a "Mi Complejo"
   - La imagen del complejo debe mostrarse (no solo placeholder)
   - Si falla, debe mostrar fallback `/canchaYa.png`

2. **Editar nombre**:
   - Hacer clic en el icono del lápiz
   - Cambiar el nombre de "Complejo Pendiente 4" a "Mi Complejo Deportivo"
   - Hacer clic en el icono del check
   - Debe mostrar "✅ Información del complejo actualizada correctamente"
   - Recargar la página para verificar que el cambio persiste

3. **Crear nueva solicitud** (flujo completo):
   - Registrarse como dueño con nombre e imagen
   - Admin aprueba solicitud
   - Ir a "Mi Complejo"
   - Verificar que nombre e imagen se muestren correctamente

## 📦 Commit

```
Fix: Usar getImageUrl() para renderizar imágenes de complejos

- ComplejoInfo.jsx ahora usa getImageUrl() para manejar tanto imágenes base64 como rutas relativas
- Esto resuelve el problema de complejos creados con el seed que tienen rutas relativas (ej: tenis_6.jpg)
- Las imágenes ahora se construyen correctamente: /images/canchas/tenis_6.jpg
- Fallback a placeholder (/canchaYa.png) si la imagen no se puede cargar
```

## 🔗 Referencias

- **Archivo modificado**: `frontend/src/components/ComplejoInfo.jsx`
- **Función helper**: `frontend/src/config/api.js::getImageUrl()`
- **Endpoint de actualización**: `PUT /api/complejos/:id` (backend/src/controllers/complejo.controller.ts)
- **Funcionalidad de edición**: `frontend/src/pages/MiComplejoPage.jsx::handleToggleEdit()`

## 💡 Notas Adicionales

### Por qué algunos complejos tienen rutas relativas y otros base64

- **Complejos del seed**: Creados con datos de prueba, usan rutas relativas (ej: `futbol5_1.jpg`, `tenis_6.jpg`)
- **Solicitudes reales**: Creadas desde el frontend, convierten la imagen a base64 antes de enviarla al backend
- **Ambos formatos son válidos**: `getImageUrl()` ahora maneja ambos correctamente

### Imágenes estáticas del backend

Las imágenes referenciadas por rutas relativas deben existir en:
```
backend/public/images/canchas/
├── futbol5_1.jpg
├── futbol5_2.jpg
├── ...
├── tenis_6.jpg
└── ...
```

Estas imágenes se sirven estáticamente desde el backend en producción (Railway) y desarrollo.
