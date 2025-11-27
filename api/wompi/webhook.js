import crypto from "crypto";

/**
 * Webhook para recibir eventos de Wompi
 * POST /api/wompi/webhook
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const secret = process.env.WOMPI_EVENTS_SECRET;

    if (!secret) {
      console.warn("WOMPI_EVENTS_SECRET no configurado, webhook no validado");
      return res.status(200).send("OK");
    }

    const signature = req.headers["x-signature"] || req.headers["integrity-signature"];

    if (!signature) {
      console.warn("Webhook recibido sin firma");
      return res.status(400).json({ error: "Sin firma" });
    }

    // Obtener el body como string (Vercel ya lo parsea, pero necesitamos el raw para validar)
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    // Validar firma HMAC SHA256
    const computed = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (!signature.includes(computed)) {
      console.warn("Firma de webhook inválida");
      return res.status(400).json({ error: "Firma inválida" });
    }

    // Procesar evento
    const event = typeof req.body === "object" ? req.body : JSON.parse(body);
    console.log("✅ Evento Wompi recibido y validado:", {
      event: event.event,
      reference: event.data?.transaction?.reference,
      status: event.data?.transaction?.status,
    });

    // TODO: Aquí deberías actualizar el estado de la reserva en Firestore
    // Ejemplo: await updateBookingStatus(event.data.transaction.reference, "PAID");

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error procesando webhook:", error);
    // Siempre responder 200 para evitar reintentos de Wompi
    res.status(200).send("OK");
  }
}


