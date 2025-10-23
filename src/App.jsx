import { Link, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Caregivers from "./pages/Caregivers.jsx";
import CaregiverDetail from "./pages/CaregiverDetail.jsx"; // crea este archivo si aún no

export default function App() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">Safe Paw</Link>
          <nav className="text-sm flex gap-4">
            <Link to="/">Inicio</Link>
            <Link to="/caregivers">Cuidadores</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/caregivers" element={<Caregivers />} />
          <Route path="/caregivers/:id" element={<CaregiverDetail />} />
        </Routes>
      </main>

      <footer className="max-w-5xl mx-auto p-4 text-center text-xs text-gray-500">
        © {year} Safe Paw
      </footer>
    </div>
  );
}

