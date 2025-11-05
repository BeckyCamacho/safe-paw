import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const SERVICE_TYPES = [
  { value: "Paseo", label: "Paseo" },
  { value: "Guardería diurna", label: "Guardería diurna" },
  { value: "Hospedaje", label: "Hospedaje" },
  { value: "Entrenamiento", label: "Entrenamiento" },
];

export default function NewService() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  if (!user) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <p className="mb-4">Debes iniciar sesión para crear servicios.</p>
        <Link className="text-indigo-600 underline" to="/signin">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mínimas
    if (!type || !city || !price) {
      toast.error("Completa tipo, ciudad y precio.");
      return;
    }
    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      toast.error("El precio debe ser un número mayor a 0.");
      return;
    }

    try {
      await addDoc(collection(db, "services"), {
        caregiverId: user.uid,
        type,
        city,
        price: priceNumber,
        description: description || "",
        isActive: true,
        createdAt: serverTimestamp(),
      });

      toast.success("Servicio creado");
      navigate("/requests");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear el servicio");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo servicio</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-2xl shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de servicio</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Selecciona...</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Bogotá, Medellín, ..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Precio (COP)</label>
          <input
            type="number"
            min="0"
            step="1000"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="30000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Se mostrará como “Desde {`$${Number(price || 0).toLocaleString("es-CO")}`}”
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
          <textarea
            rows="3"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Cuéntanos brevemente tu servicio…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Guardar
          </button>
          <Link to="/requests" className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
