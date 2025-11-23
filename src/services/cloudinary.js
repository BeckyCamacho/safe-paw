/**
 * Sube un archivo a Cloudinary usando el endpoint seguro del backend
 * @param {File} file - Archivo a subir
 * @returns {Promise<string>} URL segura de la imagen subida
 * @throws {Error} Si falla la subida o falta configuración
 */
export async function uploadToCloudinary(file) {
  if (!file) {
    throw new Error("No se proporcionó un archivo");
  }

  // En producción, usar la misma URL del frontend (Vercel maneja las rutas /api)
  // En desarrollo, usar el servidor local
  const apiBase = import.meta.env.PROD
    ? "" // En producción, las rutas /api están en el mismo dominio
    : import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

  // Obtener firma del backend
  const timestamp = Math.floor(Date.now() / 1000);
  
  let signResponse;
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Intentando conectar con: ${apiBase}/cloudinary/sign (intento ${attempt}/${maxRetries})`);
      
      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      signResponse = await fetch(`${apiBase}/cloudinary/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Respuesta del servidor: ${signResponse.status} ${signResponse.statusText}`);
      
      // Si la respuesta es exitosa, salir del loop
      if (signResponse.ok) {
        break;
      }
      
      // Si no es exitosa pero es un error del servidor (no de conexión), no reintentar
      if (signResponse.status >= 400 && signResponse.status < 500) {
        break;
      }
      
      // Si es error 5xx o de red, reintentar
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Esperar 1s, 2s, 3s
        console.log(`Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (fetchError) {
      lastError = fetchError;
      console.error(`Error de conexión (intento ${attempt}/${maxRetries}):`, fetchError);
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        console.error("URL intentada:", `${apiBase}/cloudinary/sign`);
        throw new Error(
          `No se pudo conectar con el servidor después de ${maxRetries} intentos. ` +
          `Asegúrate de que el servidor backend esté corriendo en ${apiBase}. ` +
          `Error: ${fetchError.message}. ` +
          `Verifica que el servidor esté corriendo y que no haya problemas de CORS.`
        );
      }
      
      // Esperar antes de reintentar
      const delay = attempt * 1000;
      console.log(`Reintentando en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Si después de todos los intentos no hay respuesta, lanzar error
  if (!signResponse) {
    throw lastError || new Error("No se pudo obtener respuesta del servidor");
  }

  if (!signResponse.ok) {
    const errorText = await signResponse.text();
    console.error("Error del servidor:", signResponse.status, errorText);
    throw new Error(
      `No se pudo obtener la firma para subir la imagen. ` +
      `El servidor respondió con error ${signResponse.status}: ${errorText || "Error desconocido"}`
    );
  }

  const { cloudName, apiKey, signature } = await signResponse.json();

  // Subir archivo a Cloudinary con firma
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Error subiendo imagen: ${errorText}`);
  }

  const result = await uploadResponse.json();
  return result.secure_url;
}
