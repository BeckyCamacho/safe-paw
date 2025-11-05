
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useIsCaregiver(uid) {
  const [isCaregiver, setIsCaregiver] = useState(false);

  useEffect(() => {
    if (!uid) return setIsCaregiver(false);

   
    return onSnapshot(doc(db, "caregivers", uid), (snap) => {
      setIsCaregiver(snap.exists());
    });
  }, [uid]);

  return isCaregiver;
}
