import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase"; // ✅ IMPORT CORRECTO
import { useAuth } from "../context/AuthProvider.jsx"; // ✅ IMPORT CORRECTO

export function useCaregiverPendingCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return setCount(0);

    const q = query(
      collection(db, "bookings"),
      where("caregiverId", "==", user.uid),
      where("status", "in", ["new", "pending"])
    );

    // Escucha los cambios en tiempo real
    return onSnapshot(q, (snap) => setCount(snap.size));
  }, [user?.uid]);

  return count;
}
