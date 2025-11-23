import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";
import { uploadToCloudinary } from "../services/cloudinary";
import { SERVICE_OPTIONS } from "../constants/navigation";

export default function SerCuidador() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); 

  const [form, setForm] = useState({
    displayName: "",
    city: "",
    bio: "",
    services: [],
    servicePrices: {}, // Objeto para almacenar precios por servicio
    minPrice: "", // Mantener para compatibilidad hacia atrás
    avatarUrl: "", 
  });

  
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const load = async () => {
      try {
        setError(null);
        const ref = doc(db, "caregivers", user.uid);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          // Hay datos existentes, cargar el formulario
          const data = snap.data();
          // Si tiene servicePrices, usarlo; si no, migrar de minPrice
          const servicePrices = data.servicePrices || {};
          // Si hay minPrice pero no servicePrices, inicializar con minPrice para todos los servicios
          if (data.minPrice && Object.keys(servicePrices).length === 0 && Array.isArray(data.services)) {
            data.services.forEach(service => {
              servicePrices[service] = data.minPrice;
            });
          }
          setForm({
            displayName: data.displayName || user.displayName || "",
            city: data.city || "",
            bio: data.bio || "",
            services: Array.isArray(data.services) ? data.services : [],
            servicePrices: servicePrices,
            minPrice: data.minPrice ? String(data.minPrice) : "",
            avatarUrl: data.avatarUrl || "", 
          });
        } else {
          // No hay datos, pero no es un error, es un estado normal
          setForm({
            displayName: user.displayName || "",
            city: "",
            bio: "",
            services: [],
            servicePrices: {},
            minPrice: "",
            avatarUrl: "",
          });
        }
      } catch (e) {
        // Solo mostrar error si hay una excepción real (problema de red, permisos, etc.)
        console.error("Error cargando perfil de cuidador:", e);
        setError("No se pudo cargar tu perfil. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user]);

  
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleServiceToggle = (value) => {
    setForm((prev) => {
      const exists = prev.services.includes(value);
      const newServices = exists
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value];
      
      // Si se elimina un servicio, eliminar también su precio
      const newServicePrices = { ...prev.servicePrices };
      if (exists) {
        delete newServicePrices[value];
      }
      
      return {
        ...prev,
        services: newServices,
        servicePrices: newServicePrices,
      };
    });
  };

  const handleServicePriceChange = (service, value) => {
    setForm((prev) => ({
      ...prev,
      servicePrices: {
        ...prev.servicePrices,
        [service]: value ? Number(value) : 0,
      },
    }));
  };

  
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB.");
      return;
    }
    
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido.");
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      const uploadedUrl = await uploadToCloudinary(file);
      setForm((p) => ({ ...p, avatarUrl: uploadedUrl }));
    } catch (e) {
      console.error("Error subiendo imagen:", e);
      setError(e.message || "No se pudo subir la imagen. Por favor, intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Debes iniciar sesión para crear un perfil de cuidador.");
      return;
    }
    
    // Validaciones
    if (!form.displayName?.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }
    
    if (!form.city?.trim()) {
      setError("La ciudad es obligatoria.");
      return;
    }
    
    if (form.services.length === 0) {
      setError("Debes seleccionar al menos un servicio.");
      return;
    }

    // Validar que todos los servicios seleccionados tengan precio
    const missingPrices = form.services.filter(
      (service) => !form.servicePrices[service] || form.servicePrices[service] <= 0
    );
    
    if (missingPrices.length > 0) {
      setError("Debes establecer un precio para todos los servicios seleccionados.");
      return;
    }

    // Validar que los precios no sean negativos
    const hasNegativePrice = Object.values(form.servicePrices).some(price => price < 0);
    if (hasNegativePrice) {
      setError("Los precios no pueden ser negativos.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Calcular precio mínimo para compatibilidad hacia atrás
      const prices = Object.values(form.servicePrices).filter(p => p > 0);
      const minPriceNumber = prices.length > 0 ? Math.min(...prices) : 0;

      const ref = doc(db, "caregivers", user.uid);
      await setDoc(
        ref,
        {
          uid: user.uid,
          email: user.email,
          displayName: form.displayName.trim(),
          city: form.city.trim(),
          bio: form.bio.trim() || null,
          services: form.services,
          servicePrices: form.servicePrices, // Nuevo campo con precios por servicio
          minPrice: minPriceNumber, // Mantener para compatibilidad
          avatarUrl: form.avatarUrl || null,
          photoURL: user.photoURL || null, // Foto de Google como fallback
          rating: 4.8, 
          status: "APPROVED",
          updatedAt: new Date(),
        },
        { merge: true }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (e) {
      console.error("Error guardando perfil:", e);
      setError("No se pudo guardar tu perfil. Por favor, intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-primary-DEFAULT mx-auto mb-4"
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
          <p className="text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {form.displayName ? "Editar perfil de cuidador" : "Conviértete en cuidador"}
        </h1>
        <p className="text-gray-600">
          Completa tu perfil para que los dueños de mascotas puedan encontrarte y enviarte solicitudes de reserva.
        </p>
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-green-800">
            ¡Tu perfil se ha guardado correctamente! Redirigiendo...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre completo <span className="text-red-500">*</span>
            </span>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
              placeholder="Tu nombre completo"
              value={form.displayName}
              onChange={handleChange("displayName")}
              required
            />
          </label>
        </div>

        {/* Ciudad */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Ciudad <span className="text-red-500">*</span>
            </span>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
              placeholder="Ej: Bogotá, Medellín, Cali"
              value={form.city}
              onChange={handleChange("city")}
              required
            />
          </label>
        </div>

        {/* Biografía */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Sobre ti
            </span>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="Cuenta tu experiencia con mascotas, tu hogar, qué hace especial tu cuidado..."
              value={form.bio}
              onChange={handleChange("bio")}
            />
          </label>
        </div>

        {/* Foto de perfil */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-3">
              Foto de perfil
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 overflow-hidden flex items-center justify-center">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <svg
                      className="animate-spin h-6 w-6 text-white"
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
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-DEFAULT hover:bg-primary-light/10 cursor-pointer transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? "Subiendo..." : form.avatarUrl ? "Cambiar foto" : "Subir foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Máximo 5MB. Formatos: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Servicios con precios */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-gray-700 mb-4">
              Servicios que ofreces <span className="text-red-500">*</span>
            </legend>
            <p className="text-xs text-gray-500 mb-4">
              Selecciona los servicios que ofreces y establece el precio para cada uno.
            </p>
            <div className="space-y-4">
              {SERVICE_OPTIONS.map((s) => {
                const isSelected = form.services.includes(s.value);
                const price = form.servicePrices[s.value] || "";
                return (
                  <div
                    key={s.value}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary-DEFAULT bg-primary-light/20"
                        : "border-gray-200"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleServiceToggle(s.value)}
                        className="w-4 h-4 text-primary-DEFAULT focus:ring-primary-DEFAULT rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 flex-1">{s.label}</span>
                    </label>
                    {isSelected && (
                      <div className="ml-7">
                        <label className="block">
                          <span className="block text-xs font-medium text-gray-600 mb-1">
                            Precio (COP)
                          </span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                              placeholder="Ej: 40000"
                              value={price}
                              onChange={(e) => handleServicePriceChange(s.value, e.target.value)}
                              required
                            />
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Botón de envío */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 rounded-full bg-primary-DEFAULT text-white hover:bg-primary-DEFAULT/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {saving ? (
              <>
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
                Guardando...
              </>
            ) : (
              "Guardar perfil"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
