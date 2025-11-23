import { Link } from "react-router-dom";

/**
 * Componente de tarjeta de cuidador
 * @param {Object} props
 * @param {Object} props.caregiver - Datos del cuidador
 * @param {Function} props.formatServices - Función para formatear servicios
 */
export default function CaregiverCard({ caregiver, formatServices }) {
  const rating = caregiver.rating || 5;
  const displayRating = Math.min(5, Math.max(0, rating));

  return (
    <Link
      to={`/caregivers/${caregiver.id}`}
      className="flex items-start gap-6 p-6 md:p-7 border-b border-gray-200 last:border-b-0 hover:bg-primary-light/10 transition-colors group"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={caregiver.avatarUrl || caregiver.photoURL || "https://place-puppy.com/80x80"}
          alt={caregiver.displayName}
          className="w-20 h-20 object-cover rounded-full"
        />
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-lg mb-1">
          {caregiver.displayName || "Cuidador"}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          {formatServices(caregiver.services)}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${
                i < displayRating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </Link>
  );
}

