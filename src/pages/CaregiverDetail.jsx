import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function CaregiverDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [cg, setCg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campos del formulario
  const [userEmail, setUserEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");

  // min para fecha = hoy
  const minDate = useMemo(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "caregivers", id));
        if (snap.exists()) setCg({ id: snap.id, ...snap.data() });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userEmail || !petName || !date || !time || !address) {
      alert("Completa todos los campos.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "bookings"), {
        caregiverId: id,
        caregiverName: cg?.name || null,
        userEmail,
        petName,
        date,
        time,
        address,
        status: "new",
        createdAt: serverTimestamp(),
      });
      alert("Reserva creada ✅");
      nav("/caregivers"); // vuelve al listado
    } catch (e) {
      console.error(e);
      alert("Error creando la reserva: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!cg) return <p className="p-6">Cuidador no encontrado.</p>;

  const fallback = "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=300&auto=format";

  return (
    <section className="max-w-3xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={cg.photoUrl || fallback}
          onError={(e) => (e.currentTarget.src = fallback)}
          alt={`Foto de ${cg.name}`}
          className="w-24 h-24 rounded-2xl object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">{cg.name}</h1>
          <p className="text-gray-600">{cg.city} • ⭐ {cg.rating ?? "-"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(cg.services || []).map((s) => (
              <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Reservar</h2>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Tu correo</span>
            <input value={userEmail} onChange={(e)=>setUserEmail(e.target.value)} type="email" required
              className="border rounded-lg px-3 py-2" placeholder="tucorreo@email.com" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Nombre de tu mascota</span>
            <input value={petName} onChange={(e)=>setPetName(e.target.value)} type="text" required
              className="border rounded-lg px-3 py-2" placeholder="Firulais" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Fecha</span>
            <input value={date} onChange={(e)=>setDate(e.target.value)} type="date" required min={minDate}
              className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Hora</span>
            <input value={time} onChange={(e)=>setTime(e.target.value)} type="time" required
              className="border rounded-lg px-3 py-2" />
          </label>

          <label className="flex flex-col sm:col-span-2">
            <span className="text-sm text-gray-600 mb-1">Dirección</span>
            <input value={address} onChange={(e)=>setAddress(e.target.value)} type="text" required
              className="border rounded-lg px-3 py-2" placeholder="Calle 123 #45-67" />
          </label>

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button disabled={saving} type="submit"
              className="px-5 py-2 rounded-xl border hover:shadow disabled:opacity-60">
              {saving ? "Guardando..." : "Confirmar reserva"}
            </button>
            <button type="button" onClick={()=>nav(-1)} className="px-5 py-2 rounded-xl border">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
