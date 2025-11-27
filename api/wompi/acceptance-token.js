/**
 * Obtiene el token de aceptación de Wompi
 * GET /api/wompi/acceptance-token
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const baseUrl = process.env.WOMPI_BASE_URL;
    const publicKey = process.env.WOMPI_PUBLIC_KEY;

    if (!baseUrl || !publicKey) {
      return res.status(500).json({ error: "Configuración de Wompi incompleta" });
    }

    const response = await fetch(`${baseUrl}/v1/merchants/${publicKey}`);

    if (!response.ok) {
      throw new Error(`Wompi API error: ${response.status}`);
    }

    const data = await response.json();
    const acceptanceToken = data.data?.presigned_acceptance?.acceptance_token;

    if (!acceptanceToken) {
      throw new Error("No se pudo obtener el acceptance_token");
    }

    res.status(200).json({ acceptance_token: acceptanceToken });
  } catch (error) {
    console.error("Error obteniendo acceptance token:", error);
    res.status(500).json({ error: error.message || "Error al obtener el token de aceptación" });
  }
}


