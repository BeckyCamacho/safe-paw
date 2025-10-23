import { collection, setDoc, doc, serverTimestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// ========================
// 🔹 Normalizador de texto
// ========================
const norm = (s = "") =>
  s.toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ").trim();

const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-");

// ========================
// 🔹 Datos de ejemplo
// ========================
const demoCaregivers = [
  { name: "Paola Rojas", city: "Bogotá", services: ["Paseo", "Guardería diurna"], price_from: 30000, photoUrl: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format", rating: 4.8, hours: { start: "08:00", end: "18:00" } },
  { name: "Carlos Mejía", city: "Medellín", services: ["Cuidado en casa", "Peluquería básica"], price_from: 40000, photoUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format", rating: 4.6, hours: { start: "09:00", end: "19:00" } },
  { name: "Sara López", city: "Cali", services: ["Paseo", "Entrenamiento básico"], price_from: 35000, photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format", rating: 4.9, hours: { start: "07:00", end: "17:00" } },
  { name: "Julián Pérez", city: "Barranquilla", services: ["Hospedaje nocturno"], price_from: 50000, photoUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=800&auto=format", rating: 4.7, hours: { start: "10:00", end: "20:00" } },
  { name: "Camila Díaz", city: "Bucaramanga", services: ["Cuidado en casa", "Paseo"], price_from: 28000, photoUrl: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=800&auto=format", rating: 4.5, hours: { start: "08:00", end: "16:00" } },
];

// ========================
// 🔹 Sembrar cuidadores (sin duplicar)
// ========================
async function seedCaregivers() {
  for (const c of demoCaregivers) {
    const id = `${slug(c.name)}--${slug(c.city)}`;
    await setDoc(doc(db, "caregivers", id), { ...c, createdAt: serverTimestamp() }, { merge: true });
  }
  alert("Cuidadores demo actualizados ✅ (sin duplicar)");
}

// ========================
// 🔹 Previsualizar duplicados
// ========================
async function previewDupes() {
  const snap = await getDocs(collection(db, "caregivers"));
  const groups = new Map();
  snap.forEach(d => {
    const data = d.data();
    const key = `${norm(data.name)}|${norm(data.city)}`;
    groups.set(key, [...(groups.get(key) || []), d]);
  });
  const dupes = [...groups.values()].filter(arr => arr.length > 1);
  console.log("Duplicados →", dupes.map(arr => arr.map(d => d.id)));
  alert(`Encontrados ${dupes.reduce((n, arr) => n + (arr.length - 1), 0)} duplicados (ver consola).`);
}

// ========================
// 🔹 Eliminar duplicados
// ========================
async function cleanupDuplicateCaregivers() {
  if (!confirm("¿Eliminar duplicados? (deja 1 por nombre+ciudad)")) return;

  const snap = await getDocs(collection(db, "caregivers"));
  const groups = new Map();
  snap.forEach(d => {
    const data = d.data();
    const key = `${norm(data.name)}|${norm(data.city)}`;
    groups.set(key, [...(groups.get(key) || []), d]);
  });

  let removed = 0;
  for (const docs of groups.values()) {
    if (docs.length <= 1) continue;

    // Conserva el más antiguo por createdAt (o por id si no hay createdAt)
    docs.sort((a, b) => {
      const ca = a.data().createdAt?.toMillis?.() || 0;
      const cb = b.data().createdAt?.toMillis?.() || 0;
      return ca - cb || a.id.localeCompare(b.id);
    });

    for (let i = 1; i < docs.length; i++) {
      await deleteDoc(doc(db, "caregivers", docs[i].id));
      removed++;
    }
  }
  alert(`Listo ✅ Eliminados ${removed} duplicados.`);
}

// ========================
// 🔹 Componente principal
// ========================
export default function Home() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-2xl font-semibold">Safe Paw 🐾</h1>
      <p className="text-gray-600 mt-1">Haz clic para cargar datos de prueba en Firestore.</p>

      {import.meta.env.DEV && (
        <>
          <button onClick={seedCaregivers} className="mt-6 px-6 py-3 rounded-xl border hover:shadow">
            Cargar cuidadores demo
          </button>

          <div className="mt-4 flex gap-3 justify-center">
            <button onClick={previewDupes} className="px-4 py-2 rounded-xl border">
              Previsualizar duplicados
            </button>
            <button onClick={cleanupDuplicateCaregivers} className="px-4 py-2 rounded-xl border hover:shadow">
              Eliminar duplicados
            </button>
          </div>
        </>
      )}
    </section>
  );
}
