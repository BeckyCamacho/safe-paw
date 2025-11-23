import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cloudinaryRoutes from "./cloudinary.js";
import wompiRoutes from "./wompi.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN?.split(",") ?? "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    service: "safe-paw-api"
  });
});

// Routes
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/wompi", wompiRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const port = Number(process.env.PORT || 4000);

// Manejo de errores no capturados
process.on("uncaughtException", (error) => {
  console.error("❌ Error no capturado:", error);
  // No cerrar el proceso, solo loguear
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada no manejada:", reason);
  // No cerrar el proceso, solo loguear
});

const server = app.listen(port, () => {
  console.log(`✅ Safe Paw API corriendo en puerto ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/health`);
  console.log(`🔒 Cloudinary configurado: ${process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌"}`);
});

// Manejo de errores del servidor
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Puerto ${port} ya está en uso. Intenta con otro puerto.`);
  } else {
    console.error("❌ Error del servidor:", error);
  }
});
