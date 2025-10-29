import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // tu inicialización

export async function updateBookingStatus(bookingId, nextStatus) {
  const ref = doc(db, "bookings", bookingId);
  await updateDoc(ref, {
    status: nextStatus,
    statusUpdatedAt: serverTimestamp(),
  });
}
