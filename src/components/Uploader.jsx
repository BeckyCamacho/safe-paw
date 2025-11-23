import { useState } from "react";
import { uploadToCloudinary } from "../services/cloudinary";

export default function Uploader({ onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB.");
      return;
    }
    
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido (JPG, PNG, GIF).");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setUrl(uploadedUrl);
      onUploaded && onUploaded(uploadedUrl);
    } catch (e) {
      console.error("Error subiendo imagen:", e);
      const errorMessage = e.message || "No se pudo subir la imagen. Intenta de nuevo.";
      setError(errorMessage);
      // También mostrar alerta para que el usuario lo vea
      alert(`Error al subir la imagen: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-DEFAULT hover:bg-primary-light/10 cursor-pointer transition-colors w-full">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">
            {loading ? "Subiendo foto..." : url ? "Cambiar foto" : "Haz clic para subir una foto"}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">
            JPG, PNG o GIF (máximo 5MB)
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
          disabled={loading}
        />
      </label>
      
      {loading && (
        <div className="flex items-center gap-2 text-sm text-primary-DEFAULT">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Subiendo imagen...</span>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">⚠️ Error</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      )}
      
      {url && !loading && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-green-700">✅ Foto subida correctamente</p>
          <div className="relative inline-block">
            <img
              src={url}
              alt="Foto de tu mascota"
              className="w-32 h-32 object-cover rounded-lg border-2 border-green-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setError("");
                onUploaded && onUploaded("");
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              title="Eliminar foto"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
