# Safe Paw API Server

Servidor backend para manejar la subida de imágenes a Cloudinary y otros servicios.

## Configuración

1. **Crea un archivo `.env` en esta carpeta** con las siguientes variables:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

2. **Obtén tus credenciales de Cloudinary:**
   - Ve a https://cloudinary.com/
   - Crea una cuenta o inicia sesión
   - Ve al Dashboard
   - Copia tu `Cloud Name`, `API Key` y `API Secret`

3. **Instala las dependencias** (si no lo has hecho):
```bash
npm install
```

## Ejecutar el servidor

### Opción 1: En segundo plano (recomendado - no necesitas terminal abierta):
```powershell
.\start-background.ps1
```
**Ventaja:** Puedes cerrar la terminal y el servidor seguirá corriendo.

Para detenerlo después:
```powershell
.\stop-server.ps1
```

### Opción 2: Terminal visible (ver logs en tiempo real):
```powershell
.\start-server.ps1
```
O directamente:
```bash
npm run dev
```

### Opción 3: Modo producción:
```bash
npm run build
npm start
```

El servidor estará disponible en `http://localhost:4000`

**⚠️ IMPORTANTE:** El servidor debe estar corriendo mientras uses la aplicación. Si se detiene, las subidas de imágenes no funcionarán.

## Verificar que funciona

Abre en tu navegador: `http://localhost:4000/api/health`

Deberías ver:
```json
{
  "ok": true,
  "timestamp": "...",
  "service": "safe-paw-api"
}
```

## Solución de problemas

- **Error: "Configuración de Cloudinary incompleta"**
  - Verifica que todas las variables de entorno estén en el archivo `.env`
  - Asegúrate de que el archivo `.env` esté en la carpeta `server/`

- **Error: "Puerto ya en uso"**
  - Cambia el `PORT` en el archivo `.env` a otro puerto (ej: 4001)
  - Actualiza `VITE_API_BASE` en el frontend si cambias el puerto

- **Error de CORS**
  - Verifica que `FRONTEND_ORIGIN` en `.env` coincida con la URL de tu frontend
  - Por defecto es `http://localhost:5173` (puerto de Vite)

