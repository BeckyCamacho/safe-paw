
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase"; // 👈 asegúrate de que apunte a lib/firebase

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, "users", uid), (snap) => {
      setProfile(snap.data() || null);
    });
  }, [uid]);

  return profile;
}
