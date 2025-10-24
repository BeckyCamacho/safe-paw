import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";
import { useEffect, useState } from "react";

export default function CaregiverDetail() {
  const { id } = useParams();
  const [cg, setCg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [petName, setPetName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "caregivers", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setErr("No se encontró el cuidador");
          return;
        }
        setCg({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error("Firestore error:", e.code, e.message);
        setErr(e?.message || "Error al cargar cuidador");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 🔹 Enviar reserva
  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      nav(`/signin?redirect=${location.pathname}`);
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "bookings"), {
        caregiverId: id,
        caregiverName: cg?.name || null,
        userId: user.uid,
        userEmail: user.email,
        petName,
        date,
        time,
        address,
        status: "new",
        createdAt: serverTimestamp(),
      });

      alert("Reserva creada ✅");
      nav("/my-bookings");
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Cargando cuidador…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-1">{cg.name}</h1>
      <p className="text-gray-600 mb-4">{cg.city}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre de tu mascota"
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 w-full"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 w-full"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Dirección de recogida"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 w-full"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 w-full mt-2 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Reservar"}
        </button>
      </form>
    </div>
  );
}
