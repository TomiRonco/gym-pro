# Estandarización de Notificaciones

## Cambios Realizados

### 1. Configuración de API
- **Antes**: URL hardcodeada `http://localhost:8001/api`
- **Ahora**: Variable de entorno `VITE_API_URL` con fallback a localhost
- **Archivos**: 
  - `frontend/src/config/api.js`
  - `frontend/.env` (nuevo)
  - `frontend/.env.example` (nuevo)

### 2. Formato Estandarizado de Notificaciones
**Formato**: `función(título, mensaje)`
- **título**: Corto y descriptivo (ej: "Socio Creado", "Error al Guardar")
- **mensaje**: Detallado y específico (ej: "El nuevo socio ha sido registrado correctamente")

### 3. Notificaciones Actualizadas por Componente

#### Settings.jsx - Configuración del Gimnasio
- ✅ `success('Configuración Actualizada', 'Los datos del gimnasio se han guardado exitosamente')`
- ✅ `error('Error al Cargar', 'No se pudieron cargar los datos del gimnasio')`
- ✅ `error('Error al Guardar', 'No se pudieron actualizar los datos del gimnasio')`

#### Settings.jsx - Gestión de Horarios
- ✅ `success('Horario Creado', 'Se ha agregado "[nombre]" para [día]')`
- ✅ `success('Horario Actualizado', 'El horario "[nombre]" ha sido modificado exitosamente')`
- ✅ `success('Horario Eliminado', '"[nombre]" ha sido eliminado del sistema')`
- ✅ `success('Limpieza Completa', 'Se eliminaron exitosamente [N] horarios del sistema')`
- ✅ `error('Error de Conexión', 'No se pudieron cargar los horarios. Verifique su conexión a internet')`
- ✅ `error('Error de Validación', err.message || 'Verifique los datos ingresados')`
- ✅ `error('Error al Eliminar', 'No se pudo eliminar "[nombre]". Intente nuevamente')`
- ✅ `error('Error al Limpiar', 'No se pudieron eliminar todos los horarios. Algunos pueden permanecer')`

#### Members.jsx
- ✅ `success('Socio Creado', 'El nuevo socio ha sido registrado correctamente')`
- ✅ `success('Socio Actualizado', 'Los cambios se han guardado correctamente')`
- ✅ `error('Error al Crear', 'Verifique los datos e intente nuevamente')`
- ✅ `error('Error al Actualizar', err.message)`

#### Attendance.jsx
- ✅ `success('Check-in Registrado', 'Entrada registrada para [nombre]')`
- ✅ `error('Campo Requerido', 'Por favor ingresa el nombre del socio')`

### 4. Estructura de Variables de Entorno

#### Desarrollo (.env)
```
VITE_API_URL=http://localhost:8001/api
VITE_APP_NAME="Gym Management System"
VITE_APP_VERSION="2.0.0"
```

#### Producción (ejemplo)
```
VITE_API_URL=https://tu-api-servidor.com/api
VITE_APP_NAME="Gym Management System"
VITE_APP_VERSION="2.0.0"
```

## Beneficios

1. **Consistencia**: Todas las notificaciones siguen el mismo formato
2. **Flexibilidad**: URL de API configurable por entorno
3. **Mantenibilidad**: Fácil de actualizar y extender
4. **UX Mejorada**: Títulos claros y mensajes descriptivos con contexto
5. **Escalabilidad**: Preparado para diferentes entornos (dev, test, prod)
6. **Información contextual**: Los mensajes incluyen datos específicos (nombres, cantidades, días)

## Ejemplos de Notificaciones Contextuales

### Horarios - Mensajes Dinámicos
```javascript
// Crear horario
success('Horario Creado', `Se ha agregado "Horario Mañana" para Lunes`)

// Actualizar horario  
success('Horario Actualizado', `El horario "Horario Tarde" ha sido modificado exitosamente`)

// Eliminar horario específico
success('Horario Eliminado', `"Horario Noche" ha sido eliminado del sistema`)

// Limpiar todos los horarios
success('Limpieza Completa', `Se eliminaron exitosamente 7 horarios del sistema`)

// Error con contexto
error('Error de Validación', 'El horario se solapa con el horario "Horario Principal" (06:00-22:00)')
```

## Uso

### Para desarrolladores:
- Usar siempre `success(título, mensaje)` y `error(título, mensaje)`
- Mantener títulos cortos (2-3 palabras)
- Mensajes descriptivos y orientados al usuario

### Para deployment:
- Copiar `.env.example` a `.env`
- Configurar `VITE_API_URL` según el entorno
- Compilar con `npm run build`