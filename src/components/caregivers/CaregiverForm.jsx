import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthProvider.jsx";

const SERVICES = [
  { key: "paseo", label: "Paseo" },
  { key: "guarderia", label: "Guardería diurna" },
  { key: "hospedaje", label: "Hospedaje" },
  { key: "entrenamiento", label: "Entrenamiento" },
];

export default function CaregiverForm({ onSaved }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    displayName: "",
    city: "",
    phone: "",
    bio: "",
    experienceYears: 0,
    availabilityDays: ["mon", "tue", "wed", "thu", "fri"],
    availabilityHours: "08:00-18:00",
    services: {
      paseo: { price: 0 },
      guarderia: { price: 0 },
      hospedaje: { price: 0 },
      entrenamiento: { price: 0 },
    },
    isActive: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      const ref = doc(db, "caregivers", user.uid);
      const snap = await getDoc(ref);
      if (mounted) {
        setData((prev) => ({
          ...prev,
          displayName: user.displayName || prev.displayName,
          phone: user.phoneNumber || prev.phone,
          ...(snap.exists() ? snap.data() : {}),
        }));
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [user]);

  const handleServicePrice = (k, v) => {
    const price = Number(v) || 0;
    setData((d) => ({ ...d, services: { ...d.services, [k]: { price } } }));
  };

  const minPriceFromServices = (services) => {
    const prices = Object.values(services)
      .map((s) => Number(s?.price) || 0)
      .filter((n) => n > 0);
    return prices.length ? Math.min(...prices) : 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!data.displayName?.trim()) return alert("Nombre es obligatorio");
    if (!data.city?.trim()) return alert("Ciudad es obligatoria");

    setSaving(true);
    try {
      const minPrice = minPriceFromServices(data.services);
      const payload = {
        displayName: data.displayName.trim(),
        city: data.city.trim(),
        phone: data.phone?.trim() || "",
        bio: data.bio?.trim() || "",
        experienceYears: Number(data.experienceYears) || 0,
        availability: { days: data.availabilityDays, hours: data.availabilityHours },
        services: data.services,
        minPrice,
        ratingAvg: data.ratingAvg || 0,
        ratingCount: data.ratingCount || 0,
        isActive: data.isActive ?? true,
        updatedAt: serverTimestamp(),
        createdAt: data.createdAt || serverTimestamp(),
      };
      await setDoc(doc(db, "caregivers", user.uid), payload, { merge: true });
      alert("Perfil de cuidador guardado ✅");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert("Error guardando el cuidador");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nombre público</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={data.displayName}
            onChange={(e) => setData({ ...data, displayName: e.target.value })}
            placeholder="Tu nombre como cuidador"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ciudad</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
            placeholder="Bogotá, Medellín…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="+57 3xx xxx xxxx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Años de experiencia</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
            value={data.experienceYears}
            onChange={(e) =>
              setData({ ...data, experienceYears: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción / Bio</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          placeholder="Cuéntanos sobre ti y cómo cuidas a las mascotas"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Servicios y precios (COP)</p>
        <div className="grid md:grid-cols-4 gap-3">
          {SERVICES.map((s) => (
            <div key={s.key} className="border rounded p-3">
              <label className="block text-sm">{s.label}</label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full border rounded px-2 py-1"
                value={data.services?.[s.key]?.price ?? 0}
                onChange={(e) => handleServicePrice(s.key, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          El “Desde” del listado se calcula con el menor precio &gt; 0.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Días disponibles</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={data.availabilityDays.join(",")}
            onChange={(e) =>
              setData({
                ...data,
                availabilityDays: e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              })
            }
            placeholder="mon,tue,wed,thu,fri"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Horario</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={data.availabilityHours}
            onChange={(e) =>
              setData({ ...data, availabilityHours: e.target.value })
            }
            placeholder="08:00-18:00"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={data.isActive}
          onChange={(e) => setData({ ...data, isActive: e.target.checked })}
        />
        <label htmlFor="isActive" className="text-sm">
          Mostrarme en el listado público
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar cuidador"}
      </button>
    </form>
  );
}
