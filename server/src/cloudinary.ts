import crypto from "crypto";
import express, { type Request, type Response } from "express";

const router = express.Router();

/**
 * Genera una firma para subir archivos a Cloudinary de forma segura
 * POST /api/cloudinary/sign
 */
router.post("/sign", (req: Request, res: Response) => {
  try {
    const { timestamp } = req.body as { timestamp?: number };
    
    if (!timestamp || typeof timestamp !== "number") {
      return res.status(400).json({ error: "timestamp requerido y debe ser un número" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Faltan variables de entorno de Cloudinary");
      return res.status(500).json({ error: "Configuración de Cloudinary incompleta" });
    }

    // Generar firma SHA1
    const toSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    res.json({ cloudName, apiKey, timestamp, signature });
  } catch (error) {
    console.error("Error generando firma de Cloudinary:", error);
    res.status(500).json({ error: "Error al generar la firma" });
  }
});

export default router;
