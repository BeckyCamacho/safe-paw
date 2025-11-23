import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

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

      const ref = doc(db, "users", fbUser.uid);
      const snap = await getDoc(ref);
      
      // Preparar datos del perfil con photoURL de Firebase Auth
      const photoURL = fbUser.photoURL ?? null;
      
      // Debug: Verificar photoURL de Firebase Auth
      if (import.meta.env.DEV) {
        console.log("🔍 AuthProvider - Firebase Auth photoURL:", photoURL);
        console.log("🔍 AuthProvider - Firebase User:", {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      }
      
      const profile = snap.exists()
        ? {
            ...snap.data(),
            // Actualizar photoURL si cambió en Firebase Auth
            photoURL: photoURL,
          }
        : {
            email: fbUser.email ?? "",
            displayName: fbUser.displayName ?? "",
            role: "user",
            photoURL: photoURL, // Guardar foto de Google en Firestore
          };

      // Guardar o actualizar el perfil en Firestore
      await setDoc(ref, profile, { merge: true });
      
      // Debug: Verificar qué se guardó en Firestore
      if (import.meta.env.DEV) {
        console.log("💾 AuthProvider - Perfil guardado en Firestore:", profile);
      }

      // Incluir photoURL de Firebase Auth (foto de perfil de Google) en el objeto user
      const userData = { 
        uid: fbUser.uid, 
        ...profile,
        photoURL: photoURL, // Asegurar que siempre use el photoURL más reciente de Firebase Auth
      };
      
      // Debug: Verificar objeto user final
      if (import.meta.env.DEV) {
        console.log("👤 AuthProvider - Objeto user final:", userData);
      }
      
      setUser(userData);
      setStatus("ready");
    });

    return () => unsub();
  }, []);

 
  const signInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      
      if (
        e.code === "auth/popup-blocked" ||
        e.code === "auth/cancelled-popup-request"
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error("Google Sign-In error:", e.code, e.message);
        alert(`${e.code} - ${e.message}`);
      }
    }
  };

  
  useEffect(() => {
    getRedirectResult(auth).catch((e) =>
      console.error("Redirect error:", e)
    );
  }, []);

  const value = {
    user,
    status,
    logout: () => signOut(auth),
    signInGoogle, // 👈 añadimos la función aquí para usarla en cualquier parte
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
