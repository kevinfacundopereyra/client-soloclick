# Configuración de URL de API - SoloClick

## 📋 Resumen

El proyecto ha sido configurado para usar variables de entorno para la URL de la API. Esto permite cambiar fácilmente entre diferentes entornos (desarrollo, staging, producción) sin tocar el código.

## 🔧 Cambios Realizados

### 1. Archivo de Configuración Centralizada
- **Ubicación**: `src/config/api.ts`
- **Función**: Lee la variable de entorno `VITE_API_BASE_URL` y la exporta para que todos los servicios la usen
- Todos los servicios ahora importan esta configuración en lugar de tener URLs hardcodeadas

### 2. Servicios Actualizados
Los siguientes servicios ahora usan `API_CONFIG` del archivo `src/config/api.ts`:
- ✅ `src/services/authService.ts`
- ✅ `src/services/appointmentsService.ts`
- ✅ `src/services/paymentsService.ts`
- ✅ `src/services/profileService.ts`
- ✅ `src/services/reviewsService.ts`
- ✅ `src/services/servicesService.ts`
- ✅ `src/professionals/services/professionalsService.ts`

### 3. Componentes Actualizados
- ✅ `src/professionals/pages/ProfessionalDetailPage.tsx`
- ✅ `src/professionals/pages/BookingConfirmation.tsx`

## 🚀 Cómo Usar

### Para Desarrollo Local
El archivo `.env` ya contiene la configuración para desarrollo:
```
VITE_API_BASE_URL=http://localhost:3000
```

Simplemente ejecuta:
```bash
npm run dev
```

### Para Producción en Render

#### 1. **Edita el archivo `.env` de tu cliente**
```
VITE_API_BASE_URL=https://tu-api-render.onrender.com
```

Reemplaza `tu-api-render` con el nombre real de tu servicio de API en Render.

#### 2. **Variables de Entorno en Render (Panel web)**
Si usas el panel de Render para desplegar:
1. Ve a tu servicio de Static Site
2. Dirígete a **Environment** 
3. Añade una nueva variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://tu-api-render.onrender.com`
4. Guarda y redeploy

#### 3. **Si usas archivo `.env` en producción**
Asegúrate de que el archivo `.env` esté sincronizado con la URL correcta de tu API antes de hacer build:
```bash
npm run build
```

El build de Vite incluirá la variable de entorno en el HTML compilado.

## ✅ Verificación

### Verificar que está funcionando:
1. Abre tu navegador en modo desarrollo (F12 → Network)
2. Navega por la aplicación
3. Verifica que las peticiones vayan a la URL correcta:
   - **Local**: `http://localhost:3000/...`
   - **Producción**: `https://tu-api-render.onrender.com/...`

### Verificar la variable de entorno en tiempo de ejecución:
En la consola del navegador, ejecuta:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

Debería mostrar la URL de tu API.

## 🔒 Consideraciones de CORS

Asegúrate de que tu API en Render tenga CORS correctamente configurado:

```javascript
// En tu backend (NestJS)
app.enableCors({
  origin: ['https://tu-client-render.onrender.com', 'http://localhost:5173'],
  credentials: true,
});
```

Reemplaza `tu-client-render` con el nombre real de tu servicio de cliente en Render.

## 📝 Archivo `.env.example`

Este archivo contiene ejemplos de cómo configurar diferentes entornos. Úsalo como referencia.

## ⚡ Notas Importantes

1. **No commits con datos sensibles**: El archivo `.env` puede contener URLs específicas de tu entorno. Ten cuidado al commitear.
2. **Variables dinámicas**: Si necesitas múltiples entornos, crea `.env.local`, `.env.staging`, etc.
3. **Build time**: Las variables de entorno se reemplazan durante el build. Asegúrate de hacer build después de cambiar `.env`.
4. **Prefix VITE_**: Vite solo expone variables que comienzan con `VITE_` por razones de seguridad.

## 🐛 Troubleshooting

### La API aún apunta a localhost:3000
1. Verifica que el archivo `.env` tenga la URL correcta
2. Ejecuta `npm run build` nuevamente si estás en producción
3. Limpia el caché del navegador (Ctrl+Shift+Del)
4. Verifica en DevTools (Network tab) qué URL se está usando

### CORS error
1. Asegúrate de que tu API tenga CORS habilitado
2. Verifica que la URL del cliente en Render esté en la lista blanca de tu API

### La API URL sigue siendo localhost en producción
1. El build de Render debe ejecutarse después de que `.env` esté actualizado
2. Verifica que Render esté usando el comando correcto: `npm run build`
3. Revisa los logs de Render para confirmar que la variable se está inyectando

---

¡Listo! Tu cliente ahora está completamente configurado para trabajar con URLs dinámicas de API. 🎉
