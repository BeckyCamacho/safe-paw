import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";

function StatusBadge({ status }) {
  const map = {
    new: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function CaregiverInbox() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [filter, setFilter] = useState("pending"); // pending | all

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bookings"),
      where("caregiverId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    // Nota: Si Firestore pide índice, créalo (caregiverId asc + createdAt desc).
    return onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(next);
    });
  }, [user]);

  const visible = useMemo(() => {
    if (filter === "pending") {
      return items.filter((b) => b.status === "new");
    }
    return items;
  }, [items, filter]);

  async function setStatus(id, status) {
    try {
      setLoadingIds((s) => new Set(s).add(id));
      // Optimistic UI
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status } : x))
      );
      await updateDoc(doc(db, "bookings", id), { status });
    } catch (e) {
      // revertir en caso de error
      setItems((prev) => prev); // (ya vendrá el snapshot a corregir)
      alert("No se pudo actualizar el estado. Revisa reglas/índices y vuelve a intentar.");
      console.error(e);
    } finally {
      setLoadingIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  }

  if (!user) {
    return <div className="p-6">Debes iniciar sesión.</div>;
  }

  return (
    <section className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Solicitudes de cuidado</h2>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">Solo pendientes</option>
          <option value="all">Todas</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-600">No hay solicitudes que mostrar.</p>
      ) : (
        <div className="grid gap-3">
          {visible.map((b) => {
            const busy = loadingIds.has(b.id);
            return (
              <article
                key={b.id}
                className="border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{b.userEmail}</div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-sm text-gray-600">
                    {b.petName} • {b.date} • {b.time}
                  </div>
                  <div className="text-sm text-gray-600">{b.address}</div>
                </div>

                <div className="flex gap-2">
                  {b.status === "new" && (
                    <>
                      <button
                        disabled={busy}
                        onClick={() => setStatus(b.id, "declined")}
                        className="border rounded-lg px-3 py-1.5 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => setStatus(b.id, "confirmed")}
                        className="bg-black text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <button
                      disabled={busy}
                      onClick={() => setStatus(b.id, "completed")}
                      className="bg-blue-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                    >
                      Marcar como completado
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
