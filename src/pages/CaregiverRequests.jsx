import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function CaregiverRequests() {
  const [services, setServices] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Traer servicios del cuidador sin orderBy para evitar índices compuestos
    const q = query(
      collection(db, "services"),
      where("caregiverId", "==", user.uid)
    );

    const off = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordena en cliente por fecha si existe
      rows.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setServices(rows);
    });

    return () => off();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">
        ¡Hola cuidador/a! <span className="ml-2">🐾</span>
      </h1>

      <p className="text-center mt-2 text-gray-700">
        Bienvenido/a a Safe Paw
      </p>

      {/* Acciones */}
      <div className="flex justify-center gap-3 mt-6">
        <Link
          to="/caregiver/services/new"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + Agregar servicio
        </Link>
        <Link
          to="/profile"
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Editar perfil
        </Link>
      </div>

      {/* Listado de servicios */}
      <div className="mt-8 bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Servicios disponibles</h2>

        {services.length === 0 ? (
          <p className="text-gray-500">No hay servicios registrados aún.</p>
        ) : (
          <ul className="divide-y">
            {services.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {s.type} · {s.city}
                  </div>
                  <div className="text-sm text-gray-500">{s.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {typeof s.price === "number"
                      ? s.price.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        })
                      : s.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.isActive ? "Activo" : "Inactivo"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
