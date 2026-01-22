# 🔧 Instrucciones para Probar el Sistema Refactorizado

## ✅ Cambios Realizados

Se ha refactorizado completamente el sistema de autenticación JWT para solucionar los problemas de token. Los cambios incluyen:

### Backend (Java/Spring Boot)

1. **JwtService.java** - Mejorado con:
   - Manejo robusto de excepciones (ExpiredJwtException, MalformedJwtException, SignatureException)
   - Logging detallado de cada operación
   - Mejor validación de tokens con mensajes descriptivos

2. **JwtAuthenticationFilter.java** - Actualizado con:
   - Logging completo de cada petición HTTP
   - Detección temprana de rutas públicas
   - Mejor manejo de errores con stack traces
   - Validación mejorada del header Authorization

3. **SecurityConfig.java** - Mejorado con:
   - CORS más permisivo para desarrollo (incluye HTTPS)
   - Headers adicionales permitidos (Origin, Access-Control-Request-\*)
   - Exposed headers ampliados

### Frontend (React/TypeScript)

1. **api.ts** - Refactorizado con:
   - Nueva función `isTokenValid()` para validar tokens antes de cada petición
   - Logging detallado en consola para debugging
   - Mejor manejo de errores 401/403
   - Validación de expiración de token en el cliente
   - Header `credentials: 'include'` en todas las peticiones

2. **Login.tsx** - Mejorado con:
   - Logging de operaciones de login
   - Limpieza de localStorage antes de guardar nuevo token
   - Mejor manejo de errores de autenticación

3. **App.tsx** - Actualizado con:
   - Validación de token al cargar la aplicación
   - Verificación de expiración al restaurar sesión
   - Logging de operaciones de sesión

## 🚀 Pasos para Probar

### 1. Reiniciar el Backend

```powershell
# En el terminal de Java
cd c:\Users\ariel\OneDrive\Documentos\GitHub\churninsight-platform\backend-java
mvn clean compile
mvn spring-boot:run
```

**Logs a verificar:**

- `[JWT] Token generado exitosamente para usuario: ...`
- Sin errores de compilación

### 2. Reiniciar el Frontend

```powershell
# En el terminal de Node
cd c:\Users\ariel\OneDrive\Documentos\GitHub\churninsight-platform\frontend
npm start
```

### 3. Abrir la Consola del Navegador

Presiona `F12` en Chrome/Edge y ve a la pestaña **Console**.

### 4. Prueba de Login

1. Ingresa credenciales válidas
2. **Observa en la consola del navegador:**

   ```
   [LOGIN] Iniciando login para usuario: ...
   [LOGIN] API URL: http://localhost:8080/api/auth/login
   [LOGIN] Respuesta recibida. Status: 200
   [LOGIN] Login exitoso. Token recibido (primeros 30 chars): ...
   [LOGIN] Token guardado en localStorage
   [API] Token añadido a headers (primeros 30 chars): ...
   [APP] Token válido, restaurando sesión
   ```

3. **Observa en la consola del backend:**
   ```
   [JWT] Token generado exitosamente para usuario: ... (expira: ...)
   [JWT-FILTER] Request: POST /api/auth/login
   ```

### 5. Prueba de Predicción

1. Completa el formulario de predicción
2. Haz clic en "Analizar Riesgo"
3. **Observa en la consola del navegador:**

   ```
   [API] Iniciando predicción. URL: http://localhost:8080/api/churn/predict
   [API] Headers de petición: (5) ['Content-Type', 'X-Requested-With', 'Accept', 'Origin', 'Authorization']
   [API] Token añadido a headers (primeros 30 chars): ...
   [API] Respuesta recibida. Status: 200
   ```

4. **Observa en la consola del backend:**
   ```
   [JWT-FILTER] Request: POST /api/churn/predict
   [JWT-FILTER] Authorization header presente: true
   [JWT-FILTER] Username extraído del token: ...
   [JWT-FILTER] ✓ Token VÁLIDO - Autenticando usuario: ...
   [JWT-FILTER] Authentication establecida en SecurityContext
   ```

### 6. Prueba de Stats

1. **Observa en la consola del navegador:**

   ```
   [API] Obteniendo stats. URL: http://localhost:8080/api/stats
   [API] Token añadido a headers (primeros 30 chars): ...
   ```

2. **Observa en la consola del backend:**
   ```
   [JWT-FILTER] Request: GET /api/stats
   [JWT-FILTER] ✓ Token VÁLIDO - Autenticando usuario: ...
   ```

## 🐛 Solución de Problemas

### Problema: Error 403 en /api/churn/predict o /api/stats

**Síntomas:**

```
Failed to load resource: the server responded with a status of 403
```

**Verificación:**

1. **En la consola del navegador:**
   - Busca: `[API] Token añadido a headers`
   - Si NO aparece, el token no está en localStorage

2. **En la consola del backend:**
   - Busca: `[JWT-FILTER] ✗ Token INVÁLIDO`
   - Busca: `[JWT] Error validando token`

**Soluciones:**

A. **Token no encontrado:**

```javascript
// En la consola del navegador:
localStorage.clear();
// Recarga la página y vuelve a hacer login
```

B. **Token inválido o expirado:**

- Cierra sesión
- Vuelve a hacer login
- Los tokens duran 24 horas

C. **Problema de CORS:**

- Verifica que el frontend esté en `http://localhost:3000`
- Verifica que el backend esté en `http://localhost:8080`
- Revisa los logs del backend para errores de CORS

### Problema: "No Bearer token encontrado"

**En la consola del backend:**

```
[JWT-FILTER] No Bearer token encontrado para ruta protegida: /api/churn/predict
```

**Solución:**

1. Verifica en la consola del navegador que el header Authorization se está enviando
2. Verifica que el token esté en localStorage:
   ```javascript
   console.log(localStorage.getItem("token"));
   ```

### Problema: Token expirado

**Síntomas:**

```
[JWT] Token expirado: ...
```

**Solución:**

- El token dura 24 horas
- Cierra sesión y vuelve a iniciar sesión

## 📊 Logging y Debugging

### Ver todos los headers de una petición

En la consola del navegador:

```javascript
// Durante una petición
fetch("http://localhost:8080/api/churn/predict", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    /* datos */
  }),
}).then((r) =>
  console.log("Status:", r.status, "Headers:", [...r.headers.entries()]),
);
```

### Ver el payload del token JWT

En la consola del navegador:

```javascript
const token = localStorage.getItem("token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Token payload:", payload);
console.log("Expira:", new Date(payload.exp * 1000));
console.log("Usuario:", payload.sub);
```

### Activar logging detallado en el backend

En `application.yml`:

```yaml
logging:
  level:
    com.churninsight.security: DEBUG
    org.springframework.security: DEBUG
```

## ✅ Checklist de Verificación

- [ ] Backend arranca sin errores
- [ ] Frontend arranca sin errores (ignora warnings de webpack-dev-server)
- [ ] Login exitoso con logging en consola
- [ ] Token se guarda en localStorage
- [ ] Predicción funciona sin error 403
- [ ] Stats se cargan correctamente
- [ ] No hay errores en la consola del navegador (excepto warnings de MUI Grid)
- [ ] Logs del backend muestran "✓ Token VÁLIDO"

## 🎯 Resultado Esperado

Después de implementar estos cambios, deberías ver:

1. ✅ Login exitoso
2. ✅ Token guardado y válido
3. ✅ Predicciones funcionando (sin error 403)
4. ✅ Stats cargando correctamente
5. ✅ Logging detallado en ambas consolas

## 📝 Notas Adicionales

- Los warnings de MUI Grid (`item`, `xs`, `sm`) son problemas de migración de Material-UI y no afectan la funcionalidad
- El warning de webpack-dev-server sobre `onAfterSetupMiddleware` se puede ignorar por ahora
- Todos los cambios mantienen compatibilidad hacia atrás
