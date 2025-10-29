
import { useAuth } from "../context/AuthProvider.jsx";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";

export default function MyProfile() {
  const { user, profile } = useAuth();
  if (!user) return <p className="text-center mt-4">Inicia sesión.</p>;

  const isCaregiver = !!profile?.isCaregiver;

  async function toggleCaregiver() {
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { isCaregiver: !isCaregiver }, { merge: true });
      toast.success(
        !isCaregiver
          ? "Rol de cuidador activado"
          : "Rol de cuidador desactivado"
      );
    } catch (e) {
      toast.error("No se pudo actualizar el rol");
      console.error(e);
    }
  }

  return (
    <section className="max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Mi perfil</h2>

      <div className="border rounded-2xl p-4 space-y-3 bg-white shadow-sm">
        <div className="text-sm">
          <span className="font-medium">Email:</span>{" "}
          <b className="text-gray-700">{user.email}</b>
        </div>

        <div className="text-sm">
          <span className="font-medium">Rol cuidador:</span>{" "}
          <b className={isCaregiver ? "text-green-700" : "text-red-700"}>
            {isCaregiver ? "Sí" : "No"}
          </b>
        </div>

        <button
          onClick={toggleCaregiver}
          className={`border rounded-lg px-3 py-1 text-sm font-medium transition ${
            isCaregiver
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {isCaregiver ? "Quitar rol de cuidador" : "Hacerme cuidador (demo)"}
        </button>
      </div>
    </section>
  );
}
