import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";
import { SERVICE_LABELS } from "../constants/navigation";

export default function CaregiverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "caregivers", id);
        const snap = await getDoc(ref);
        setCaregiver(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        console.error(e);
        alert("Error cargando el cuidador.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleReserve = () => {
    if (!user) return navigate(`/signin?redirect=/caregivers/${id}`);
    navigate(`/reservar/${id}`);
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
          <p className="text-gray-600">Cargando información del cuidador...</p>
        </div>
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No se encontró el cuidador.</p>
          <button
            onClick={() => navigate("/caregivers")}
            className="px-6 py-2 rounded-full bg-primary-DEFAULT text-white hover:bg-primary-DEFAULT/90 transition-colors font-medium"
          >
            Volver a cuidadores
          </button>
        </div>
      </div>
    );
  }

  const rating = caregiver.rating || 4.8;
  const displayRating = Math.min(5, Math.max(0, rating));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header del perfil */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar grande */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
              <img
                src={caregiver.avatarUrl || caregiver.photoURL || "https://place-puppy.com/150x150"}
                alt={caregiver.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Información principal */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {caregiver.displayName || "Cuidador"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {caregiver.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{caregiver.city}</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < displayRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">/ 5.0</span>
              </div>
            </div>

            {/* Botón de reserva */}
            
        <button
          onClick={handleReserve}
          className="px-8 py-3 rounded-full bg-white text-primary-DEFAULT border border-primary-DEFAULT 
                    hover:bg-primary-DEFAULT hover:text-slate-900 transition-colors font-medium text-base shadow-sm"
        >
          Reservar ahora
        </button>







          </div>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biografía */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sobre {caregiver.displayName?.split(" ")[0] || "el cuidador"}
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {caregiver.bio ||
                "Cuidador responsable y amante de los animales, listo para cuidar de tu mascota con amor y dedicación."}
            </p>
          </div>

          {/* Servicios */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Servicios ofrecidos
            </h2>
            {Array.isArray(caregiver.services) && caregiver.services.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {caregiver.services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary-DEFAULT rounded-full text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {SERVICE_LABELS[service] || service}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Servicios no especificados</p>
            )}
          </div>

          {/* Opiniones */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Opiniones
            </h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-light transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Laura G.</p>
                    <p className="text-xs text-gray-500">Hace 2 semanas</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Mi perro estuvo feliz todo el fin de semana, recibí fotos y actualizaciones constantes. Muy recomendado."
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5 hover:border-primary-light transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Andrés P.</p>
                    <p className="text-xs text-gray-500">Hace 1 mes</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Muy puntual y organizado. Lo volvería a contratar sin dudarlo."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Precios por servicio */}
          <div className="bg-gradient-to-br from-primary-light/30 to-primary-DEFAULT/10 border border-primary-light rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Precios
            </h3>
            {caregiver.servicePrices && Object.keys(caregiver.servicePrices).length > 0 ? (
              <div className="space-y-3">
                {Array.isArray(caregiver.services) && caregiver.services.map((service) => {
                  const price = caregiver.servicePrices[service];
                  if (!price || price <= 0) return null;
                  return (
                    <div key={service} className="flex justify-between items-center py-2 border-b border-primary-light/30 last:border-0">
                      <span className="text-sm text-gray-700">
                        {SERVICE_LABELS[service] || service}
                      </span>
                      <span className="text-base font-bold text-primary-DEFAULT">
                        ${price.toLocaleString("es-CO")}
                      </span>
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-primary-light/30">
                  Precios en COP. El total se calcula según las fechas seleccionadas.
                </p>
              </div>
            ) : caregiver.minPrice ? (
              <div>
                <p className="text-3xl font-bold text-primary-DEFAULT mb-1">
                  ${caregiver.minPrice.toLocaleString("es-CO")}
                </p>
                <p className="text-sm text-gray-600">COP por servicio</p>
                <p className="text-xs text-gray-500 mt-2">
                  Precio base. Puede variar según el tipo de servicio.
                </p>
              </div>
            ) : (
              <p className="text-gray-600">Precio a convenir</p>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Información</h3>
            <div className="space-y-3 text-sm">
              {caregiver.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{caregiver.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verificado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

