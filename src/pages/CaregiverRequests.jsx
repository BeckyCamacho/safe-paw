import { useAuth } from "../hooks/useAuth";
import { collection, where, orderBy, query as q, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import usePaginatedCollection from "../hooks/usePaginatedCollection";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const STATUS = [
  { key: "all", label: "Todas" },
  { key: "new", label: "Pendientes" },
  { key: "accepted", label: "Aceptadas" },
  { key: "rejected", label: "Rechazadas" },
  { key: "cancelled", label: "Canceladas" },
];

const chipClass = (s) =>
  ({
    accepted: "bg-green-100 text-green-700 border-green-300",
    rejected: "bg-red-100 text-red-700 border-red-300",
    cancelled: "bg-yellow-100 text-yellow-700 border-yellow-300",
    new: "bg-blue-100 text-blue-700 border-blue-300",
  }[s] || "bg-gray-100 text-gray-700 border-gray-300");

export default function CaregiverRequests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const buildQuery = useMemo(
    () => () => {
      const base = [
        where("caregiverId", "==", user.uid),
        orderBy("createdAt", "desc"),
      ];
      if (filter !== "all") base.unshift(where("status", "==", filter));
      return q(collection(db, "bookings"), ...base);
    },
    [user?.uid, filter]
  );

  const { items, loading, hasMore, loadMore, error } = usePaginatedCollection({
    buildQuery,
    pageSize: 10,
    deps: [user?.uid, filter],
  });

  // 🔹 Funciones para actualizar el estado con toast
  async function handleAccept(id) {
    const ref = doc(db, "bookings", id);
    await updateDoc(ref, { status: "accepted" });
    toast.success("Solicitud aceptada ✅");
  }

  async function handleReject(id) {
    const ref = doc(db, "bookings", id);
    await updateDoc(ref, { status: "rejected" });
    toast("Solicitud rechazada", { icon: "🟥" });
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">Solicitudes</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full border text-sm ${
              filter === key
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {items.map((bk) => (
          <div key={bk.id} className="border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {bk.petName} • {bk.userEmail}
                </p>
                <p className="text-xs text-gray-500">
                  {bk.date} • {bk.time} • {bk.address}
                </p>
              </div>

              <span
                className={`px-2 py-1 rounded-full text-xs border ${chipClass(bk.status)}`}
              >
                {bk.status === "accepted"
                  ? "Aceptada"
                  : bk.status === "rejected"
                  ? "Rechazada"
                  : bk.status === "cancelled"
                  ? "Cancelada"
                  : "Pendiente"}
              </span>
            </div>

            {/* Botones de acción */}
            {bk.status === "new" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAccept(bk.id)}
                  className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleReject(bk.id)}
                  className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}

        {!loading && items.length === 0 && (
          <p className="text-gray-500 text-sm">
            No hay solicitudes para este filtro.
          </p>
        )}
      </div>

      {/* Paginación */}
      <div className="mt-4">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Cargar más"}
          </button>
        ) : (
          items.length > 0 && (
            <p className="text-gray-400 text-xs">No hay más resultados.</p>
          )
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2">Error: {error.message}</p>
      )}
    </div>
  );
}
