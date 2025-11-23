import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import Logo from "./Logo";
import { NAV_ITEMS, ROUTES } from "../constants/navigation";

/**
 * Componente Header reutilizable
 * @param {Object} props
 * @param {boolean} props.isCaregiver - Si el usuario es cuidador
 * @param {number} props.pendingCount - Número de solicitudes pendientes
 */
export default function Header({ isCaregiver = false, pendingCount = 0 }) {
  const { user, status, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-8 justify-between">
        <Logo />

        <div className="flex items-center gap-6 text-sm text-gray-700">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  active
                    ? "text-primary-DEFAULT font-semibold border-b-2 border-primary-DEFAULT pb-1"
                    : "hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {(() => {
            if (status === "loading") {
              return <span className="text-gray-500">…</span>;
            }

            if (user) {
              return (
                <>
                  <Link to="/reservas" className="hover:text-gray-900 transition-colors">
                    Mis reservas
                  </Link>

                  {isCaregiver && (
                    <Link to="/solicitudes" className="relative hover:text-gray-900 transition-colors">
                      Solicitudes
                      {pendingCount > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none px-2 py-0.5">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )}

                  <Link to="/profile" className="hover:text-gray-900 transition-colors">
                    Mi perfil
                  </Link>

                  {!isCaregiver && (
                    <Link
                      to={ROUTES.BECOME_CAREGIVER}
                      className="hover:text-gray-900 transition-colors"
                    >
                      Ser cuidador
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="border rounded px-3 py-1.5 hover:bg-gray-100 transition-colors"
                  >
                    Salir
                  </button>
                </>
              );
            }

            return (
              <>
                <Link
                  to={ROUTES.SIGN_IN}
                  className="hover:text-gray-900 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to={ROUTES.BECOME_CAREGIVER}
                  className="px-4 py-2 rounded-full bg-primary-DEFAULT text-white hover:bg-primary-DEFAULT/90 transition-colors font-medium"
                >
                  Ser cuidador
                </Link>
              </>
            );
          })()}
        </div>
      </nav>
    </header>
  );
}

