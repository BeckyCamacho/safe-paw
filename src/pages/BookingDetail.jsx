import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getBookingById,
  subscribeBookingById,
  updateBookingStatus,
} from "../services/bookings";
import { useAuth } from "../context/AuthProvider.jsx";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const unsub = subscribeBookingById(id, (data) => {
      setBooking(data);
      setLoading(false);
    });

    getBookingById(id)
      .then((data) => {
        if (data) setBooking((prev) => prev || data);
      })
      .finally(() => setLoading(false));

    return () => unsub && unsub();
  }, [id]);

  if (loading) return <p className="p-4">Cargando reserva…</p>;
  if (!booking) return <p className="p-4">No se encontró la reserva.</p>;

  const isOwner = user && booking.ownerId === user.uid;
  const isCaregiver = user && booking.caregiverId === user.uid;
  const canCancel =
    isOwner && ["REQUESTED", "ACCEPTED"].includes(booking.status);
  const canAcceptOrDecline =
    isCaregiver && booking.status === "REQUESTED";

  // Debug info (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log("Booking Detail Debug:", {
      userId: user?.uid,
      bookingCaregiverId: booking.caregiverId,
      bookingOwnerId: booking.ownerId,
      bookingStatus: booking.status,
      isCaregiver,
      isOwner,
      canAcceptOrDecline,
    });
  }

  const handleCancel = async () => {
    const ok = window.confirm("¿Seguro que quieres cancelar esta reserva?");
    if (!ok) return;

    try {
      setCanceling(true);
      await updateBookingStatus(id, "CANCELLED");
      alert("Tu reserva fue cancelada.");
    } catch (e) {
      console.error(e);
      alert("No se pudo cancelar la reserva. Intenta de nuevo.");
    } finally {
      setCanceling(false);
    }
  };

  const handleAccept = async () => {
    const ok = window.confirm("¿Aceptar esta solicitud?");
    if (!ok) return;

    try {
      setUpdating(true);
      await updateBookingStatus(id, "ACCEPTED");
      alert("Solicitud aceptada exitosamente.");
    } catch (e) {
      console.error(e);
      alert("No se pudo aceptar la solicitud. Intenta de nuevo.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDecline = async () => {
    const ok = window.confirm("¿Rechazar esta solicitud?");
    if (!ok) return;

    try {
      setUpdating(true);
      await updateBookingStatus(id, "DECLINED");
      alert("Solicitud rechazada.");
    } catch (e) {
      console.error(e);
      alert("No se pudo rechazar la solicitud. Intenta de nuevo.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Reserva #{booking.id}</h1>
      <p className="text-sm text-gray-600 mb-4">
        Estado: <strong>{booking.status}</strong>
      </p>

      {/* Información general de la reserva */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Información de la reserva
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Servicio:</span>
            <p className="text-gray-900 font-semibold">
              {booking.service === "hospedaje" && "🏠 Hospedaje nocturno"}
              {booking.service === "guarderia" && "🌞 Guardería diurna"}
              {booking.service === "paseos 30 minutos" && "🚶 Paseos 30 minutos"}
              {booking.service === "visitas" && "🏡 Visitas a domicilio"}
              {booking.service === "cuidado_casa_dueno" && "🏘️ Cuidado en casa del dueño"}
              {!["hospedaje", "guarderia", "paseos 30 minutos", "visitas", "cuidado_casa_dueno"].includes(booking.service) && booking.service}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha inicio:</span>
              <p className="text-gray-900">
                {booking.startDate} {booking.startTime && `a las ${booking.startTime}`}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha fin:</span>
              <p className="text-gray-900">
                {booking.endDate} {booking.endTime && `a las ${booking.endTime}`}
              </p>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">Dirección:</span>
            <p className="text-gray-900">{booking.address}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">Total:</span>
            <p className="text-lg font-bold text-primary-DEFAULT">
              {booking.priceInCents
                ? `${(booking.priceInCents / 100).toLocaleString("es-CO")} COP`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Información detallada de la mascota */}
      <div className="bg-gradient-to-br from-primary-light/30 to-primary-DEFAULT/10 border border-primary-light rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Información de la mascota
        </h2>
        
        {booking.photoUrl && (
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600 block mb-2">Foto:</span>
            <img
              src={booking.photoUrl}
              alt={`Foto de ${booking.petName || "la mascota"}`}
              className="w-40 h-40 object-cover rounded-lg border-2 border-white shadow-md"
            />
          </div>
        )}

        <div className="space-y-3">
          {booking.petType && (
            <div>
              <span className="text-sm font-medium text-gray-600">Tipo de animal:</span>
              <p className="text-gray-900 font-semibold flex items-center gap-2">
                {booking.petType === "perro" && "🐕 Perro"}
                {booking.petType === "gato" && "🐱 Gato"}
                {!["perro", "gato"].includes(booking.petType) && booking.petType}
              </p>
            </div>
          )}

          {booking.petName && (
            <div>
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <p className="text-gray-900 font-semibold text-lg">{booking.petName}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.petAge && (
              <div>
                <span className="text-sm font-medium text-gray-600">Edad:</span>
                <p className="text-gray-900">{booking.petAge}</p>
              </div>
            )}

            {booking.petWeight && (
              <div>
                <span className="text-sm font-medium text-gray-600">Peso:</span>
                <p className="text-gray-900">{booking.petWeight}</p>
              </div>
            )}
          </div>

          {booking.friendly !== undefined && (
            <div>
              <span className="text-sm font-medium text-gray-600">Comportamiento:</span>
              <p className="text-gray-900 flex items-center gap-2">
                {booking.friendly ? (
                  <>
                    <span className="text-green-600">✓</span>
                    <span>Es amigable con otros perros/personas</span>
                  </>
                ) : (
                  <>
                    <span className="text-orange-600">⚠</span>
                    <span>Puede ser reservado con otros perros/personas</span>
                  </>
                )}
              </p>
            </div>
          )}

          {booking.meds && (
            <div>
              <span className="text-sm font-medium text-gray-600">Medicamentos / Condiciones especiales:</span>
              <p className="text-gray-900 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-1">
                {booking.meds}
              </p>
            </div>
          )}

          {booking.notes && (
            <div>
              <span className="text-sm font-medium text-gray-600">Notas para el cuidador:</span>
              <p className="text-gray-900 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1 whitespace-pre-wrap">
                {booking.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {booking.status === "REQUESTED" && isOwner && (
        <p className="text-sm text-gray-600 mb-4">
          Tu solicitud fue enviada al cuidador. Cuando la acepte, verás el estado actualizado aquí.
        </p>
      )}

      {booking.status === "REQUESTED" && isCaregiver && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            ⚠️ Tienes una solicitud pendiente. Puedes aceptarla o rechazarla.
          </p>
        </div>
      )}

      {booking.status === "REQUESTED" && !isCaregiver && !isOwner && user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            Esta solicitud no te pertenece. Solo el cuidador asignado puede aceptarla o rechazarla.
          </p>
        </div>
      )}

      {booking.status === "ACCEPTED" && (
        <p className="text-sm text-primary-DEFAULT mb-4 font-medium">
          ¡Tu reserva fue aceptada por el cuidador! 
        </p>
      )}

      {booking.status === "DECLINED" && (
        <p className="text-sm text-red-600 mb-4">
          El cuidador rechazó esta solicitud.
        </p>
      )}

      {booking.status === "CANCELLED" && (
        <p className="text-sm text-gray-500 mb-4">Cancelaste esta reserva.</p>
      )}

      {/* Botones de acción para el cuidador */}
      {canAcceptOrDecline && (
        <div className="bg-white border-2 border-primary-DEFAULT rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones disponibles</h3>
          <div className="flex flex-col sm:flex-row gap-3">

          <button
            onClick={handleAccept}
            disabled={updating}
            className="flex-1 px-6 py-3 rounded-full border-2 disabled:opacity-60 transition-colors font-medium text-base shadow-md"
            style={{
              backgroundColor: '#E4F0FF',
              color: '#3B82F6',
              borderColor: '#3B82F6'
            }}
          >
            {updating ? "Actualizando…" : " Aceptar solicitud"}
          </button>


            <button
              onClick={handleDecline}
              disabled={updating}
              className="flex-1 px-6 py-3 rounded-full border-2 disabled:opacity-60 transition-colors font-medium text-base shadow-md"
              style={{
                backgroundColor: '#FFE5E5',
                color: '#EF4444',
                borderColor: '#EF4444'
              }}
            >
              Rechazar solicitud
            </button>
          </div>
        </div>
      )}

      {/* Mensaje si debería aparecer pero no aparece */}
      {!canAcceptOrDecline && isCaregiver && booking.status === "REQUESTED" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ Error: Deberías poder aceptar/rechazar esta solicitud, pero los botones no están disponibles.
          </p>
          <p className="text-xs text-red-600 mt-2">
            ID del cuidador en la reserva: {booking.caregiverId || "No definido"}<br/>
            Tu ID de usuario: {user?.uid || "No logueado"}
          </p>
        </div>
      )}

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={canceling}
          className="mt-2 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors font-medium"
        >
          {canceling ? "Cancelando…" : "Cancelar reserva"}
        </button>
      )}
    </div>
  );
}
