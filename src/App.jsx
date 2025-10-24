import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Caregivers from "./pages/Caregivers.jsx";
import CaregiverDetail from "./pages/CaregiverDetail.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import { useAuth } from "./context/AuthProvider.jsx";

export default function App(){
  const { user, authLoading, signOut } = useAuth();
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">Safe Paw</Link>
          <nav className="text-sm flex gap-4 items-center">
            <Link to="/">Inicio</Link>
            <Link to="/caregivers">Cuidadores</Link>
            {!authLoading && user ? (
              <>
                <Link to="/my-bookings">Mis reservas</Link>
                <span className="text-gray-500 hidden sm:inline">({user.email})</span>
                <button onClick={signOut} className="border rounded px-2 py-1">Salir</button>
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
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/caregivers" element={<Caregivers/>}/>
          <Route path="/caregivers/:id" element={<CaregiverDetail/>}/>
          <Route path="/signin" element={<SignIn/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/my-bookings" element={<MyBookings/>}/>
        </Routes>
      </main>
      <footer className="max-w-5xl mx-auto p-4 text-center text-xs text-gray-500">© {year} Safe Paw</footer>
    </div>
  );
}


