
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider.jsx";

import Home from "./pages/Home.jsx";
import Caregivers from "./pages/Caregivers.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import SignIn from "./pages/SignIn.jsx";

function ProtectedRoute({ children }) {
  const { user, status } = useAuth();           // ← status en vez de authLoading
  if (status === "loading") return <div className="p-6">Cargando…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export default function App() {
  const { user, status, logout } = useAuth();   // ← logout en vez de signOut

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b bg-white sticky top-0">
        <nav className="max-w-5xl mx-auto p-4 flex items-center gap-4 justify-between">
          <Link to="/" className="font-bold text-xl">Safe Paw</Link>

          <div className="flex items-center gap-4">
            <Link to="/">Inicio</Link>
            <Link to="/caregivers">Cuidadores</Link>

            {status === "loading" ? (
              <span className="text-gray-500">…</span>
            ) : user ? (
              <>
                <Link to="/profile">Mi perfil</Link>
                <button
                  onClick={logout}
                  className="border rounded px-2 py-1 hover:bg-gray-100"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link to="/signin">Entrar</Link>
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/caregivers" element={<Caregivers />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="max-w-5xl mx-auto p-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Safe Paw
      </footer>
    </div>
  );
}
