import express, { type Request, type Response } from "express";
import crypto from "crypto";

const router = express.Router();

/**
 * Obtiene el token de aceptación de Wompi
 * GET /api/wompi/acceptance-token
 */
router.get("/acceptance-token", async (_req: Request, res: Response) => {
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

    res.json({ acceptance_token: acceptanceToken });
  } catch (error: any) {
    console.error("Error obteniendo acceptance token:", error);
    res.status(500).json({ error: error.message || "Error al obtener el token de aceptación" });
  }
});

/**
 * Crea un intent de pago en Wompi
 * POST /api/wompi/intent
 */
router.post("/intent", async (req: Request, res: Response) => {
  try {
    const { amountInCents, currency = "COP", bookingId } = req.body;

    if (!amountInCents || typeof amountInCents !== "number" || amountInCents <= 0) {
      return res.status(400).json({ error: "amountInCents requerido y debe ser un número positivo" });
    }

    // Generar referencia única
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
    const reference = `SAFEPAW-${timestamp}-${random}`;

    res.json({ 
      reference, 
      currency, 
      amountInCents, 
      bookingId: bookingId || null 
    });
  } catch (error: any) {
    console.error("Error creando intent:", error);
    res.status(500).json({ error: error.message || "Error al crear el intent de pago" });
  }
});

/**
 * Webhook para recibir eventos de Wompi
 * POST /api/wompi/webhook
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req: Request, res: Response) => {
    try {
      const secret = process.env.WOMPI_EVENTS_SECRET;
      
      if (!secret) {
        console.warn("WOMPI_EVENTS_SECRET no configurado, webhook no validado");
        return res.sendStatus(200);
      }

      const signature = req.header("X-Signature") || req.header("Integrity-Signature");
      
      if (!signature) {
        console.warn("Webhook recibido sin firma");
        return res.status(400).json({ error: "Sin firma" });
      }

      // Validar firma HMAC SHA256
      const computed = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (!signature.includes(computed)) {
        console.warn("Firma de webhook inválida");
        return res.status(400).json({ error: "Firma inválida" });
      }

      // Procesar evento
      const event = JSON.parse(req.body.toString("utf8"));
      console.log("✅ Evento Wompi recibido y validado:", {
        event: event.event,
        reference: event.data?.transaction?.reference,
        status: event.data?.transaction?.status,
      });

      // TODO: Aquí deberías actualizar el estado de la reserva en Firestore
      // Ejemplo: await updateBookingStatus(event.data.transaction.reference, "PAID");

      res.sendStatus(200);
    } catch (error) {
      console.error("Error procesando webhook:", error);
      // Siempre responder 200 para evitar reintentos de Wompi
      res.sendStatus(200);
    }
  }
);

export default router;
