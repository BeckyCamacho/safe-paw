import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function SignUp(){
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const nav = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      nav("/caregivers");
    } catch(e){
      alert(e.message);
    }
  }

  return (
    <section className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-semibold mb-4">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input type="email" placeholder="correo" className="border rounded-lg px-3 py-2"
               value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="contraseña (mín. 6)"
               className="border rounded-lg px-3 py-2"
               value={pass} onChange={e=>setPass(e.target.value)} required />
        <button className="border rounded-xl px-4 py-2">Crear cuenta</button>
      </form>
    </section>
  );
}
