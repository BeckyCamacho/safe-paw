import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthProvider.jsx";

export default function MyProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    city: "",
    phone: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) return;
      setLoading(true);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!ignore) {
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            displayName: data.displayName ?? user.displayName ?? "",
            city: data.city ?? "",
            phone: data.phone ?? "",
          });
        } else {
          setForm({
            displayName: user.displayName ?? "",
            city: "",
            phone: "",
          });
        }
        setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [user]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg("");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: form.displayName.trim(),
          city: form.city.trim(),
          phone: form.phone.trim(),
          updatedAt: new Date(),
          email: user.email,
        },
        { merge: true }
      );
      setMsg("Perfil actualizado ✅");
    } catch (err) {
      setMsg("No se pudo guardar. Intenta nuevamente.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <div className="p-6">Inicia sesión para ver tu perfil.</div>;
  if (loading) return <div className="p-6">Cargando…</div>;

  return (
    <section className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Mi perfil</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Ciudad</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Ej: Bogotá"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Teléfono</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Ej: 3001234567"
          />
        </div>

        <button
          disabled={saving}
          className="bg-black text-white rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>

        {!!msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </section>
  );
}
