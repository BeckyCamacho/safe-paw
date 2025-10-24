import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function SignIn(){
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [sp] = useSearchParams();
  const nav = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav(sp.get("redirect") || "/caregivers");
    } catch(e){
      alert(e.message);
    }
  }

  return (
    <section className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input type="email" placeholder="correo" className="border rounded-lg px-3 py-2"
               value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="contraseña"
               className="border rounded-lg px-3 py-2"
               value={pass} onChange={e=>setPass(e.target.value)} required />
        <button className="border rounded-xl px-4 py-2">Entrar</button>
      </form>
      <p className="text-sm mt-3">¿No tienes cuenta? <Link to="/signup" className="underline">Regístrate</Link></p>
    </section>
  );
}
