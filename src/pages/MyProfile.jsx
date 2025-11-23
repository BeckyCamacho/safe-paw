import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getBookingsByOwner } from "../services/bookings";
import { ROUTES, SERVICE_OPTIONS } from "../constants/navigation";
import { uploadToCloudinary } from "../services/cloudinary";

export default function MyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isCaregiver, setIsCaregiver] = useState(false);
  const [caregiverData, setCaregiverData] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
  });
  
  // Estado del formulario de edición
  const [editForm, setEditForm] = useState({
    displayName: "",
    city: "",
    bio: "",
    services: [],
    servicePrices: {},
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Reset photoError cuando cambia el usuario
    setPhotoError(false);

    // Debug: Verificar photoURL
    if (import.meta.env.DEV) {
      console.log("MyProfile - User photoURL:", user.photoURL);
      console.log("MyProfile - User object:", { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL });
    }

    const loadProfile = async () => {
      setError(null);
      
      // Verificar si es cuidador (no crítico si falla)
      try {
        const caregiverRef = doc(db, "caregivers", user.uid);
        const caregiverSnap = await getDoc(caregiverRef);
        
        if (caregiverSnap.exists()) {
          const data = caregiverSnap.data();
          setIsCaregiver(true);
          setCaregiverData(data);
          // Inicializar formulario de edición con los datos existentes
          const servicePrices = data.servicePrices || {};
          setEditForm({
            displayName: data.displayName || user.displayName || "",
            city: data.city || "",
            bio: data.bio || "",
            services: Array.isArray(data.services) ? data.services : [],
            servicePrices: servicePrices,
            avatarUrl: data.avatarUrl || "",
          });
        }
      } catch (caregiverError) {
        // Si falla cargar perfil de cuidador, no es crítico, solo logueamos
        console.warn("No se pudo verificar el perfil de cuidador:", caregiverError);
        // Continuamos sin marcar como cuidador
      }

      // Cargar estadísticas de reservas (no crítico si falla)
      try {
        const ownerBookings = await getBookingsByOwner(user.uid);
        const active = ownerBookings.filter(
          (b) => ["REQUESTED", "ACCEPTED", "PENDING_PAYMENT"].includes(b.status)
        );
        const completed = ownerBookings.filter((b) => b.status === "PAID");

        setStats({
          totalBookings: ownerBookings.length,
          activeBookings: active.length,
          completedBookings: completed.length,
        });
      } catch (bookingsError) {
        // Si falla cargar reservas, no es crítico, solo logueamos
        console.warn("No se pudieron cargar las estadísticas de reservas:", bookingsError);
        // Mantenemos las estadísticas en 0
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Inicia sesión para ver tu perfil.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleEditChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (value) => {
    setEditForm((prev) => {
      const exists = prev.services.includes(value);
      const newServices = exists
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value];
      
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
    setEditForm((prev) => ({
      ...prev,
      servicePrices: {
        ...prev.servicePrices,
        [service]: value ? Number(value) : 0,
      },
    }));
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB.");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido.");
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      const uploadedUrl = await uploadToCloudinary(file);
      setEditForm((p) => ({ ...p, avatarUrl: uploadedUrl }));
    } catch (e) {
      console.error("Error subiendo imagen:", e);
      setError(e.message || "No se pudo subir la imagen. Por favor, intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Debes iniciar sesión para editar tu perfil.");
      return;
    }

    if (!editForm.displayName?.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    if (!editForm.city?.trim()) {
      setError("La ciudad es obligatoria.");
      return;
    }

    if (editForm.services.length === 0) {
      setError("Debes seleccionar al menos un servicio.");
      return;
    }

    const missingPrices = editForm.services.filter(
      (service) => !editForm.servicePrices[service] || editForm.servicePrices[service] <= 0
    );
    
    if (missingPrices.length > 0) {
      setError("Debes establecer un precio para todos los servicios seleccionados.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const prices = Object.values(editForm.servicePrices).filter(p => p > 0);
      const minPriceNumber = prices.length > 0 ? Math.min(...prices) : 0;

      const ref = doc(db, "caregivers", user.uid);
      await setDoc(
        ref,
        {
          uid: user.uid,
          email: user.email,
          displayName: editForm.displayName.trim(),
          city: editForm.city.trim(),
          bio: editForm.bio.trim() || null,
          services: editForm.services,
          servicePrices: editForm.servicePrices,
          minPrice: minPriceNumber,
          avatarUrl: editForm.avatarUrl || null,
          photoURL: user.photoURL || null,
          rating: caregiverData?.rating || 4.8,
          status: "APPROVED",
          updatedAt: new Date(),
        },
        { merge: true }
      );
      
      // Recargar datos
      const caregiverSnap = await getDoc(ref);
      if (caregiverSnap.exists()) {
        setCaregiverData(caregiverSnap.data());
      }
      
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Error guardando perfil:", e);
      setError("No se pudo guardar tu perfil. Por favor, intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restaurar valores originales
    if (caregiverData) {
      const servicePrices = caregiverData.servicePrices || {};
      setEditForm({
        displayName: caregiverData.displayName || user.displayName || "",
        city: caregiverData.city || "",
        bio: caregiverData.bio || "",
        services: Array.isArray(caregiverData.services) ? caregiverData.services : [],
        servicePrices: servicePrices,
        avatarUrl: caregiverData.avatarUrl || "",
      });
    }
    setEditing(false);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Mensaje de error */}
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

      {/* Mensaje de éxito */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-green-800">
            ¡Tu perfil se ha actualizado correctamente!
          </p>
        </div>
      )}

      {/* Advertencia si no es cuidador - solo cuando no hay error */}
      {!isCaregiver && !loading && !error && (
        <div className="mb-6 p-4 bg-primary-light/30 border border-primary-light rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-primary-DEFAULT flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 mb-2">
              ¿Quieres ser cuidador?
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Completa tu perfil de cuidador para que los dueños de mascotas puedan encontrarte y enviarte solicitudes de reserva.
            </p>
          </div>
        </div>
      )}

      {/* Header del perfil */}
      <div className="relative mb-8">
        {/* Banner de fondo con gradiente */}
        <div className="h-32 bg-gradient-to-r from-primary-DEFAULT to-primary-light rounded-t-2xl"></div>
        
        {/* Contenido del perfil */}
        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {(isCaregiver && caregiverData?.avatarUrl) || (user.photoURL && !photoError) ? (
                  <img
                    src={isCaregiver && caregiverData?.avatarUrl ? caregiverData.avatarUrl : user.photoURL}
                    alt={user.displayName || "Usuario"}
                    className="w-full h-full object-cover"
                    onError={() => {
                      // Si la imagen falla al cargar, mostrar iniciales
                      console.warn("Error cargando foto de perfil:", isCaregiver && caregiverData?.avatarUrl ? caregiverData.avatarUrl : user.photoURL);
                      setPhotoError(true);
                    }}
                    onLoad={() => {
                      // Si la imagen carga correctamente, asegurar que photoError sea false
                      setPhotoError(false);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-DEFAULT to-primary-light flex items-center justify-center text-4xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
              {isCaregiver && (
                <div className="absolute -bottom-2 -right-2 bg-accent-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  ✓ Cuidador
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="flex-1 pt-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.displayName || "Usuario"}
              </h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              {isCaregiver && caregiverData && (
                <div className="flex flex-wrap gap-2">
                  {caregiverData.city && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light text-primary-DEFAULT rounded-full text-sm font-medium">
                      📍 {caregiverData.city}
                    </span>
                  )}
                  {caregiverData.minPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-accent-orange rounded-full text-sm font-medium">
                      💰 Desde ${caregiverData.minPrice.toLocaleString("es-CO")} COP
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Botón de acción */}
            <div className="pt-4 w-full md:w-auto">
              {isCaregiver ? (

            <button
              onClick={() => setEditing(!editing)}
              className="w-full md:w-auto px-6 py-3 rounded-full bg-[#D7B8FF] text-slate-900 hover:bg-[#B89CF2] active:bg-[#AA84E6] transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {editing ? "Cancelar edición" : "Editar perfil"}
            </button>

           

              ) : (
                <button
                  onClick={() => navigate(ROUTES.BECOME_CAREGIVER)}
                  className="w-full md:w-auto px-6 py-3 rounded-full bg-primary-light text-primary-DEFAULT hover:bg-primary-light/80 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Ser cuidador
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total reservas</h3>
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Reservas activas</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Completadas</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información personal */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información personal
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nombre completo</p>
              <p className="font-medium text-gray-900">
                {user.displayName || "No especificado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Correo electrónico</p>
              <p className="font-medium text-gray-900">{user.email || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ID de usuario</p>
              <p className="font-mono text-xs text-gray-600 break-all">{user.uid}</p>
            </div>
          </div>
        </div>

        {/* Información de cuidador (si aplica) */}
        {isCaregiver && caregiverData && !editing && (
          <div className="bg-gradient-to-br from-primary-light/30 to-primary-DEFAULT/10 border border-primary-light rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Perfil de cuidador
              </h2>
          
           <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-lg bg-[#D7B8FF] text-slate-900 hover:bg-[#C7A0FF] active:bg-[#B48CFF] transition-colors font-medium text-sm shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>


            </div>
            <div className="space-y-3">
              {caregiverData.bio && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Biografía</p>
                  <p className="text-gray-900">{caregiverData.bio}</p>
                </div>
              )}
              {caregiverData.services && caregiverData.services.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servicios ofrecidos</p>
                  <div className="flex flex-wrap gap-2">
                    {caregiverData.services.map((service) => {
                      const price = caregiverData.servicePrices?.[service];
                      return (
                        <span
                          key={service}
                          className="px-3 py-1 bg-white/80 text-primary-DEFAULT rounded-full text-xs font-medium"
                        >
                          {SERVICE_OPTIONS.find(s => s.value === service)?.label || service}
                          {price && ` - $${price.toLocaleString("es-CO")}`}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario de edición de perfil de cuidador */}
        {isCaregiver && editing && (
          <div className="bg-gradient-to-br from-primary-light/30 to-primary-DEFAULT/10 border border-primary-light rounded-xl p-6 shadow-sm col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar perfil de cuidador
            </h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
                  value={editForm.displayName}
                  onChange={handleEditChange("displayName")}
                  required
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
                  placeholder="Ej: Bogotá, Medellín, Cali"
                  value={editForm.city}
                  onChange={handleEditChange("city")}
                  required
                />
              </div>

              {/* Biografía */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sobre ti
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Cuenta tu experiencia con mascotas..."
                  value={editForm.bio}
                  onChange={handleEditChange("bio")}
                />
              </div>

              {/* Foto de perfil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Foto de perfil
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-300 overflow-hidden flex items-center justify-center">
                    {editForm.avatarUrl ? (
                      <img
                        src={editForm.avatarUrl}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-DEFAULT hover:bg-primary-light/10 cursor-pointer transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {uploading ? "Subiendo..." : editForm.avatarUrl ? "Cambiar foto" : "Subir foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Máximo 5MB. Formatos: JPG, PNG, GIF
                </p>
              </div>

              {/* Servicios con precios */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Servicios que ofreces <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {SERVICE_OPTIONS.map((s) => {
                    const isSelected = editForm.services.includes(s.value);
                    const price = editForm.servicePrices[s.value] || "";
                    return (
                      <div
                        key={s.value}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-primary-DEFAULT bg-primary-light/20"
                            : "border-gray-200"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer mb-2">
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
                                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
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
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Acciones rápidas
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/reservas")}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-DEFAULT hover:bg-primary-light/10 transition-colors flex items-center justify-between group"
            >
              <span className="font-medium text-gray-700 group-hover:text-primary-DEFAULT">
                Ver mis reservas
              </span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {isCaregiver && (
              <button
                onClick={() => navigate("/solicitudes")}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-DEFAULT hover:bg-primary-light/10 transition-colors flex items-center justify-between group"
              >
                <span className="font-medium text-gray-700 group-hover:text-primary-DEFAULT">
                  Ver solicitudes
                </span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button
              onClick={() => navigate("/caregivers")}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-DEFAULT hover:bg-primary-light/10 transition-colors flex items-center justify-between group"
            >
              <span className="font-medium text-gray-700 group-hover:text-primary-DEFAULT">
                Buscar cuidadores
              </span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
