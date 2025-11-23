import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  getDocs,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Estados posibles de una reserva
 * @typedef {"REQUESTED" | "ACCEPTED" | "PENDING_PAYMENT" | "PAID" | "DECLINED" | "CANCELLED"} BookingStatus
 */

/**
 * Crea una nueva reserva en Firestore
 * @param {Object} data - Datos de la reserva
 * @param {string} data.caregiverId - ID del cuidador
 * @param {string} data.ownerId - ID del dueño
 * @param {BookingStatus} [data.status="REQUESTED"] - Estado inicial
 * @param {...any} data - Otros campos de la reserva
 * @returns {Promise<string>} ID del documento creado
 */
export async function createBooking(data) {
  const bookingData = {
    ...data,
    status: data.status || "REQUESTED",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "bookings"), bookingData);
  return ref.id;
}

/**
 * Obtiene una reserva por su ID
 * @param {string} id - ID de la reserva
 * @returns {Promise<Object|null>} Datos de la reserva o null si no existe
 */
export async function getBookingById(id) {
  if (!id) {
    throw new Error("El ID de la reserva es requerido");
  }

  const snap = await getDoc(doc(db, "bookings", id));
  if (!snap.exists()) return null;
  
  return { id: snap.id, ...snap.data() };
}

/**
 * Suscribe a cambios en tiempo real de una reserva
 * @param {string} id - ID de la reserva
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @returns {Function} Función para cancelar la suscripción
 */
export function subscribeBookingById(id, callback) {
  if (!id) {
    throw new Error("El ID de la reserva es requerido");
  }
  if (typeof callback !== "function") {
    throw new Error("El callback debe ser una función");
  }

  const ref = doc(db, "bookings", id);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() });
  });
}

/**
 * Actualiza el estado de una reserva
 * @param {string} id - ID de la reserva
 * @param {BookingStatus} status - Nuevo estado
 * @param {Object} [extraData={}] - Datos adicionales a actualizar
 * @returns {Promise<void>}
 */
export async function updateBookingStatus(id, status, extraData = {}) {
  if (!id) {
    throw new Error("El ID de la reserva es requerido");
  }
  if (!status) {
    throw new Error("El estado es requerido");
  }

  await updateDoc(doc(db, "bookings", id), {
    status,
    updatedAt: serverTimestamp(),
    ...extraData,
  });
}

/**
 * Obtiene todas las reservas pendientes de un cuidador
 * @param {string} caregiverId - ID del cuidador
 * @returns {Promise<Array>} Lista de reservas pendientes
 */
export async function getPendingBookingsForCaregiver(caregiverId) {
  if (!caregiverId) {
    throw new Error("El ID del cuidador es requerido");
  }

  const q = query(
    collection(db, "bookings"),
    where("caregiverId", "==", caregiverId),
    where("status", "==", "REQUESTED")
  );
  
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Obtiene todas las reservas de un dueño
 * @param {string} ownerId - ID del dueño
 * @returns {Promise<Array>} Lista de reservas del dueño
 */
export async function getBookingsByOwner(ownerId) {
  if (!ownerId) {
    throw new Error("El ID del dueño es requerido");
  }

  const q = query(
    collection(db, "bookings"),
    where("ownerId", "==", ownerId)
  );
  
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Obtiene todas las reservas de un cuidador (cualquier estado)
 * @param {string} caregiverId - ID del cuidador
 * @returns {Promise<Array>} Lista de reservas del cuidador
 */
export async function getBookingsByCaregiver(caregiverId) {
  if (!caregiverId) {
    throw new Error("El ID del cuidador es requerido");
  }

  const q = query(
    collection(db, "bookings"),
    where("caregiverId", "==", caregiverId)
  );
  
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
