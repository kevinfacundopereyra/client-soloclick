# 🚀 Instrucciones de Despliegue en Render

## Configurar tu Cliente Static Site en Render

Sigue estos pasos para que tu cliente se conecte correctamente a tu API en Render:

### Paso 1: Variables de Entorno en Render

1. **Accede a tu Render Dashboard**
   - Ve a https://dashboard.render.com

2. **Selecciona tu servicio de Static Site** (cliente-soloclick)

3. **Abre la sección "Environment"**
   - Click en **"Add Environment Variable"**

4. **Agrega esta variable:**
   ```
   Key:   VITE_API_BASE_URL
   Value: https://api-soloclick.onrender.com
   ```

5. **Guarda y redeploy:**
   - Click en **"Save"**
   - Tu aplicación se redesplegará automáticamente

### Paso 2: Verifica que Funcione

1. **Espera a que termine el deploy** (1-2 minutos)
   
2. **Abre tu cliente** en el navegador
   ```
   https://tu-cliente-render.onrender.com
   ```

3. **Abre DevTools** (F12)
   
4. **Ve a la pestaña Network**
   
5. **Realiza una acción que haga una petición a la API** (ej: login, cargar profesionales)
   
6. **Verifica que las peticiones vayan a:**
   ```
   https://api-soloclick.onrender.com/...
   ```
   
   ❌ **NO** debe ser `http://localhost:3000/...`

### Paso 3: Si Aún No Funciona

#### Solución 1: Limpia caché
```bash
# En la consola del navegador (F12):
localStorage.clear()
location.reload()
```

#### Solución 2: Limpia caché de Render
1. Ve al Dashboard de Render
2. Abre tu Static Site
3. Click en **"Clear Build Cache"**
4. Click en **"Redeploy"**

#### Solución 3: Verifica el archivo .env
```bash
# En tu repositorio, en client-soloclick/.env
# Debe tener:
VITE_API_BASE_URL=https://api-soloclick.onrender.com

# NO debe tener:
VITE_API_BASE_URL=http://localhost:3000
```

### Paso 4: Configura CORS en tu API

Tu backend debe permitir requests desde tu cliente. En tu NestJS (api-soloclick):

```typescript
// main.ts o app.module.ts
app.enableCors({
  origin: [
    'https://tu-cliente-render.onrender.com', // Tu cliente en Render
    'http://localhost:5173'  // Para desarrollo local
  ],
  credentials: true,
});
```

---

## 📋 Checklist de Verificación

- [ ] `.env` tiene `VITE_API_BASE_URL=https://api-soloclick.onrender.com`
- [ ] Render Environment tiene variable `VITE_API_BASE_URL`
- [ ] Has hecho redeploy después de cambiar variables
- [ ] DevTools Network muestra peticiones a `api-soloclick.onrender.com`
- [ ] No hay errores de CORS en la consola
- [ ] Backend tiene CORS configurado correctamente
- [ ] El login funciona y se conecta a la API

---

## 🆘 Errores Comunes

### Error: "Cannot GET /reviews" o "Cannot POST /users/register"
**Causa**: La API URL sigue siendo `localhost:3000`  
**Solución**: Limpia caché → Redeploy → Verifica DevTools Network

### Error: "CORS policy blocked"
**Causa**: Backend no tiene CORS configurado  
**Solución**: Actualiza el `enableCors` en tu API

### Error: "Connection refused" o "No puede alcanzar la API"
**Causa**: URL es incorrecta o API está caída  
**Solución**: 
- Verifica que la URL sea: `https://api-soloclick.onrender.com`
- Verifica que tu API esté activa en Render

---

## ✅ ¡Listo!

Una vez que verifices que todo funciona en DevTools Network, tu aplicación está completamente configurada. 🎉

**¡No vuelvas a tener problemas de localhost:3000!**
