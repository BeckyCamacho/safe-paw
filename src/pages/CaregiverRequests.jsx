import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc, where, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

export default function CaregiverRequests() {
  const { user, authLoading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { nav("/signin?redirect=/requests"); return; }

    // Solicitudes asignadas a este cuidador
    const q = query(
      collection(db, "bookings"),
      where("caregiverId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user, authLoading, nav]);

  async function setStatus(id, status) {
    await updateDoc(doc(db, "bookings", id), {
      status,
      updatedAt: serverTimestamp(),
      ...(status === "accepted" ? { acceptedAt: serverTimestamp() } : {}),
      ...(status === "rejected" ? { rejectedAt: serverTimestamp() } : {}),
    });
  }

  return (
    <section className="max-w-3xl mx-auto py-6">
      <h2 className="text-xl font-semibold mb-4">Solicitudes</h2>

      {items.length === 0 ? (
        <p className="text-gray-600">No tienes solicitudes por ahora.</p>
      ) : (
        <div className="grid gap-3">
          {items.map(b => (
            <article key={b.id} className="border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{b.petName} • {b.userEmail}</div>
                <div className="text-sm text-gray-600">
                  {b.date} • {b.time} • {b.address}
                </div>
                <div className="text-xs mt-1">
                  Estado: <b>{b.status}</b>
                </div>
              </div>

              {b.status === "new" && (
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <button
                    onClick={() => setStatus(b.id, "accepted")}
                    className="px-3 py-1 rounded-lg border border-green-600 text-green-700"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => setStatus(b.id, "rejected")}
                    className="px-3 py-1 rounded-lg border border-red-600 text-red-700"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
