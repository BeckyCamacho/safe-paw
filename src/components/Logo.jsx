import { Link } from "react-router-dom";

/**
 * Componente de logo reutilizable
 * Muestra un corazón con pata (usando el logo existente o un placeholder)
 * @param {Object} props
 * @param {string} [props.className=""] - Clases CSS adicionales
 */
export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="font-bold text-xl text-gray-900">Safe Paw</span>
    </Link>
  );
}

