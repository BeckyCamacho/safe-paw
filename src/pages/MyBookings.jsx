// imports...
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function MyBookings() {   // ← export default aquí
  const { user, authLoading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { nav("/signin?redirect=/my-bookings"); return; }
    const q = query(collection(db, "bookings"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user, authLoading, nav]);

  async function cancel(id) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    await updateDoc(doc(db, "bookings", id), { status: "cancelled" });
  }

  return (
    <section className="py-6">
      <h2 className="text-xl font-semibold mb-4">Mis reservas</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">
          No tienes reservas. <Link to="/caregivers" className="underline">Buscar cuidadores</Link>
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map(b => (
            <article
              key={b.id}
              className="border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                
                <div>
                  <div className="font-medium">{b.caregiverName}</div>
                  <div className="text-sm text-gray-600">{b.date} • {b.time} • {b.address}</div>
                  <div className="text-xs mt-1">Estado: <b>{b.status}</b></div>
                </div>
              </div>

              {b.status === "new" && (
                <div className="mt-2 sm:mt-0 flex gap-2">
                  <button onClick={() => cancel(b.id)} className="border rounded-lg px-3 py-1">Cancelar</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

