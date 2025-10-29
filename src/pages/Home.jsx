// src/pages/Home.jsx
import { Link } from "react-router-dom";
import logo from "../assets/mi-logo.png";

export default function Home() {
  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Texto principal */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Cuidado responsable para tu mascota
          </h1>
          <p className="text-gray-600 mb-5">
            Encuentra cuidadores verificados para paseos, guardería y hospedaje. 
            Filtra por ciudad y servicio para encontrar la mejor opción para tu amigo peludo.
          </p>
          <div className="flex gap-3">
            <Link
              to="/caregivers"
              className="px-4 py-2 rounded-xl border border-gray-300 hover:shadow hover:bg-gray-50 transition"
            >
              Buscar cuidadores
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl border border-gray-300 hover:shadow hover:bg-gray-50 transition"
            >
              Crear cuenta
            </Link>
          </div>
        </div>

        {/* Imagen / logo */}
        <div className="rounded-2xl border p-6 flex items-center justify-center bg-gray-50">
          <img
            src={logo}
            alt="Safe Paw"
            className="w-28 h-28 md:w-40 md:h-40 object-contain opacity-80"
          />
        </div>
      </div>
    </section>
  );
}
