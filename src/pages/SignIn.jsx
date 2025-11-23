import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import Logo from "../components/Logo";

export default function SignIn() {
  const { signInGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir
  if (user) {
    const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
    navigate(redirectTo, { replace: true });
    return null;
  }

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInGoogle();
      const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
          {/* Logo y título */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Bienvenido de nuevo
            </h1>
            <p className="text-gray-600 text-base">
              Inicia sesión para continuar cuidando de tu mascota
            </p>
          </div>

          {/* Botón de Google */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white border-2 border-gray-300 hover:border-primary-DEFAULT hover:bg-primary-light/10 transition-all font-medium text-gray-700 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-primary-DEFAULT"
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
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </p>
          </div>
        </div>

        {/* Enlace para registrarse */}
        <div className="mt-8 text-center">
          <p className="text-base text-gray-600">
            ¿No tienes cuenta?{" "}
            <button
              onClick={handleSignIn}
              className="text-primary-DEFAULT hover:text-primary-DEFAULT/80 font-medium underline"
            >
              Crea una cuenta con Google
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

