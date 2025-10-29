
import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Caregivers from "./pages/Caregivers.jsx";
import CaregiverDetail from "./pages/CaregiverDetail.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import CaregiverInbox from "./pages/CaregiverInbox.jsx";
import CaregiverRequests from "./pages/CaregiverRequests.jsx";
import MyProfile from "./pages/MyProfile.jsx";

import { useAuth } from "./context/AuthProvider.jsx";
import { useCaregiverPendingCount } from "./hooks/useCaregiverPendingCount.js";
import { Toaster } from "react-hot-toast";
import logo from "./assets/mi-logo.png";
import CaregiverRoute from "./components/CaregiverRoute.jsx";


export default function App() {
  const { user, authLoading, signOut, profile } = useAuth(); 
  const pending = useCaregiverPendingCount();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ✅ HEADER con logo y control por rol */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Safe Paw"
              className="w-7 h-7 md:w-8 md:h-8 object-contain"
            />
            <span className="text-xl font-bold">Safe Paw</span>
          </Link>

          {/* Navegación */}
          <nav className="text-sm flex gap-4 items-center relative">
            <Link to="/">Inicio</Link>
            <Link to="/caregivers">Cuidadores</Link>

            {!authLoading && user ? (
              <>
                <Link to="/my-bookings">Mis reservas</Link>
                <Link to="/profile" className="hover:underline">
                  Mi perfil
                </Link>

                {/* 👇 Solo cuidadores ven “Solicitudes” */}
                {profile?.isCaregiver && (
                  <Link to="/requests" className="relative">
                    Solicitudes
                    {pending > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {pending > 99 ? "99+" : pending}
                      </span>
                    )}
                  </Link>
                )}

                <span className="text-gray-500 hidden sm:inline">
                  ({user.email})
                </span>
                <button
                  onClick={signOut}
                  className="border rounded px-2 py-1 hover:bg-gray-100"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/signin">Entrar</Link>
                <Link to="/signup">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ✅ Contenido principal */}
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/caregivers" element={<Caregivers />} />
          <Route path="/caregivers/:id" element={<CaregiverDetail />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/caregiver/inbox" element={<CaregiverInbox />} />
          <Route
  path="/requests"
  element={
    <CaregiverRoute>
      <CaregiverRequests />
    </CaregiverRoute>
  }
/>

          <Route path="/profile" element={<MyProfile />} />
        </Routes>
      </main>

      {/* ✅ Footer */}
      <footer className="max-w-5xl mx-auto p-4 text-center text-xs text-gray-500">
        © {year} Safe Paw
      </footer>

      {/* ✅ Toasts globales */}
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
    </div>
  );
}

