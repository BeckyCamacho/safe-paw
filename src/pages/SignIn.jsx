import { useAuth } from "../context/AuthProvider.jsx";

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  return (
    <section className="grid gap-3">
      <h2 className="text-2xl font-semibold">Entrar</h2>
      <button
        onClick={signInWithGoogle}
        className="border rounded px-4 py-2 hover:bg-gray-100 w-max"
      >
        Entrar con Google
      </button>
    </section>
  );
}
