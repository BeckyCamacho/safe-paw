// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // usuario de Firebase
  const [profile, setProfile] = useState(null); // perfil Firestore (roles, etc.)
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        try {
          // 🔹 Buscar perfil en Firestore
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            // Si no existe, crear perfil básico temporal
            setProfile({
              email: u.email,
              isCaregiver: false, // por defecto no es cuidador
              name: u.displayName || "",
            });
          }
        } catch (err) {
          console.error("Error cargando perfil:", err);
          setProfile({ email: u.email, isCaregiver: false });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  async function signOut() {
    await fbSignOut(auth);
  }

  return (
    <AuthCtx.Provider value={{ user, profile, authLoading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
