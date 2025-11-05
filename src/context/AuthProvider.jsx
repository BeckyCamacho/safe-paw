import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";           // ← tu inicialización
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setStatus("ready");
        return;
      }

      // Perfil básico en Firestore (opcional)
      const ref = doc(db, "users", fbUser.uid);
      const snap = await getDoc(ref);
      const profile = snap.exists()
        ? snap.data()
        : {
            email: fbUser.email ?? "",
            displayName: fbUser.displayName ?? "",
            role: "user",
          };

      if (!snap.exists()) await setDoc(ref, profile, { merge: true });

      setUser({ uid: fbUser.uid, ...profile });
      setStatus("ready");
    });

    return () => unsub();
  }, []);

  const value = {
    user,
    status,
    logout: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
