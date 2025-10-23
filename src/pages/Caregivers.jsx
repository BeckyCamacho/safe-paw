import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Caregivers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [service, setService] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "caregivers"));
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cities = useMemo(() => [...new Set(items.map(x => x.city))].sort(), [items]);
  const services = useMemo(() => [...new Set(items.flatMap(x => x.services || []))].sort(), [items]);
  const filtered = items.filter(c =>
    (city ? c.city === city : true) &&
    (service ? (c.services || []).includes(service) : true)
  );

  return (
    <section className="py-6">
      <h2 className="text-xl font-semibold mb-4">Cuidadores</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={city} onChange={e=>setCity(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">Todas las ciudades</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={service} onChange={e=>setService(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">Todos los servicios</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(city || service) && (
          <button onClick={()=>{setCity(""); setService("");}} className="border rounded-lg px-3 py-2">
            Limpiar filtros
          </button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i)=><div key={i} className="p-4 rounded-2xl border animate-pulse h-40"/>)}
        </div>
      )}

      {!loading && filtered.length === 0 && <p className="text-gray-600">No hay cuidadores para esos filtros.</p>}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <article key={c.id} className="rounded-2xl border p-4 flex flex-col">
              <div className="flex gap-3 items-center">
                <img src={c.photoUrl} alt={`Foto de ${c.name}`} className="w-16 h-16 rounded-xl object-cover" loading="lazy"/>
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.city} • ⭐ {c.rating ?? "-"}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(c.services || []).map(s => <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s}</span>)}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">Desde <b>${c.price_from?.toLocaleString?.() || c.price_from}</b></span>
                <Link to={`/caregivers/${c.id}`} className="text-sm border rounded-lg px-3 py-1 hover:shadow">
  Ver perfil
</Link>

              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
