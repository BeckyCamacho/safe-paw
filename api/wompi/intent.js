/**
 * Crea un intent de pago en Wompi
 * POST /api/wompi/intent
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { amountInCents, currency = "COP", bookingId } = req.body;

    if (!amountInCents || typeof amountInCents !== "number" || amountInCents <= 0) {
      return res.status(400).json({ error: "amountInCents requerido y debe ser un número positivo" });
    }

    // Generar referencia única
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
    const reference = `SAFEPAW-${timestamp}-${random}`;

    res.status(200).json({
      reference,
      currency,
      amountInCents,
      bookingId: bookingId || null,
    });
  } catch (error) {
    console.error("Error creando intent:", error);
    res.status(500).json({ error: error.message || "Error al crear el intent de pago" });
  }
}


