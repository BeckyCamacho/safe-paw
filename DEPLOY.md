# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar Safe Paw en Vercel.

## 📋 Requisitos Previos

1. **Cuenta de Vercel**: Crea una cuenta en [vercel.com](https://vercel.com)
2. **Cuenta de Firebase**: Ya deberías tener tu proyecto Firebase configurado
3. **Cuenta de Cloudinary**: Para subir imágenes
4. **GitHub/GitLab/Bitbucket**: Para conectar tu repositorio con Vercel

## 🔧 Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en un repositorio Git (GitHub, GitLab o Bitbucket)
2. Verifica que el archivo `vercel.json` esté en la raíz del proyecto `safe-paw/`

## 🔑 Paso 2: Configurar Variables de Entorno en Vercel

Una vez que despliegues en Vercel, necesitarás configurar las siguientes variables de entorno:

### Variables de Firebase (Frontend)
En la configuración del proyecto en Vercel, ve a **Settings → Environment Variables** y agrega:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Variables de Cloudinary (Backend - Funciones Serverless)
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Variables de Wompi (Opcional - si usas pagos)
```
WOMPI_BASE_URL=https://production.wompi.co/v1
WOMPI_PUBLIC_KEY=tu_public_key
WOMPI_EVENTS_SECRET=tu_events_secret
```

**⚠️ IMPORTANTE**: 
- Asegúrate de agregar estas variables para **Production**, **Preview** y **Development**
- No necesitas configurar `VITE_API_BASE` en producción, ya que las funciones serverless están en el mismo dominio

## 🚀 Paso 3: Desplegar en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Conecta tu repositorio de Git
3. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `safe-paw` (si tu proyecto está en una subcarpeta)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Agrega las variables de entorno (Paso 2)
5. Haz clic en **Deploy**

### Opción B: Desde la Terminal (CLI)

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Inicia sesión:
```bash
vercel login
```

3. Navega a la carpeta del proyecto:
```bash
cd safe-paw
```

4. Despliega:
```bash
vercel
```

5. Sigue las instrucciones en pantalla
6. Para producción:
```bash
vercel --prod
```

## 📁 Estructura de Archivos para Vercel

Vercel detectará automáticamente:
- **Frontend**: Se construye desde `safe-paw/` usando Vite
- **API Routes**: Las funciones serverless están en `safe-paw/api/`:
  - `/api/cloudinary/sign` → `api/cloudinary/sign.js`
  - `/api/wompi/acceptance-token` → `api/wompi/acceptance-token.js`
  - `/api/wompi/intent` → `api/wompi/intent.js`
  - `/api/wompi/webhook` → `api/wompi/webhook.js`

## ✅ Paso 4: Verificar el Despliegue

1. Una vez desplegado, Vercel te dará una URL (ej: `tu-proyecto.vercel.app`)
2. Verifica que el frontend carga correctamente
3. Prueba subir una imagen para verificar que las funciones serverless funcionan
4. Revisa los logs en el dashboard de Vercel si hay errores

## 🔍 Solución de Problemas

### Error: "Faltan variables de entorno de Firebase"
- Verifica que todas las variables `VITE_FIREBASE_*` estén configuradas en Vercel
- Asegúrate de que estén marcadas para **Production**, **Preview** y **Development**

### Error: "Configuración de Cloudinary incompleta"
- Verifica que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` estén configuradas
- Estas variables NO necesitan el prefijo `VITE_` porque son para funciones serverless

### Las imágenes no se suben
- Revisa los logs de las funciones serverless en el dashboard de Vercel
- Verifica que las credenciales de Cloudinary sean correctas
- Asegúrate de que la función `/api/cloudinary/sign` esté desplegada correctamente

### Error de CORS
- Vercel maneja CORS automáticamente para las funciones serverless
- Si ves errores de CORS, verifica que estés usando la URL correcta (sin `http://localhost:4000`)

## 📝 Notas Importantes

1. **El servidor backend local NO es necesario en producción**: Las funciones serverless de Vercel reemplazan el servidor Express
2. **Variables de entorno**: Todas las variables que empiezan con `VITE_` son para el frontend. Las demás son para funciones serverless
3. **Dominio personalizado**: Puedes configurar un dominio personalizado en Settings → Domains
4. **Re-despliegues automáticos**: Cada push a tu repositorio desplegará automáticamente (si está configurado)

## 🔄 Actualizar el Despliegue

Cada vez que hagas cambios:
1. Haz commit y push a tu repositorio
2. Vercel desplegará automáticamente (si tienes auto-deploy activado)
3. O ejecuta `vercel --prod` desde la terminal

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)



