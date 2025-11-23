import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { getBookingsByOwner } from "../services/bookings";

const STATUS_CONFIG = {
  REQUESTED: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ACCEPTED: {
    label: "Aceptada",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  PENDING_PAYMENT: {
    label: "Pago pendiente",
    color: "bg-orange-100 text-orange-800",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  PAID: {
    label: "Pagada",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  DECLINED: {
    label: "Rechazada",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "Fecha no especificada";
  try {
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export default function MyBookings() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      try {
        const bookings = await getBookingsByOwner(user.uid);
        // Ordenar por fecha de creación (más recientes primero)
        bookings.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        setItems(bookings);
      } catch (err) {
        console.error("Error cargando reservas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Inicia sesión para ver tus reservas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-primary-DEFAULT mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  const pending = items.filter((b) => b.status === "REQUESTED");
  const accepted = items.filter((b) => b.status === "ACCEPTED");
  const paid = items.filter((b) => b.status === "PAID");
  const cancelled = items.filter(
    (b) => b.status === "CANCELLED" || b.status === "DECLINED"
  );

  const renderBookingCard = (booking) => {
    const statusConfig = STATUS_CONFIG[booking.status] || {
      label: booking.status,
      color: "bg-gray-100 text-gray-800",
      icon: null,
    };

    return (
      <Link
        key={booking.id}
        to={`/reserva/${booking.id}`}
        className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary-light transition-all group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-DEFAULT transition-colors">
              {booking.petName || "Tu mascota"}
            </h3>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                </span>
              </div>

              {booking.priceInCents && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-primary-DEFAULT">
                    ${(booking.priceInCents / 100).toLocaleString("es-CO")} COP
                  </span>
                </div>
              )}
            </div>
          </div>

          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-primary-DEFAULT transition-colors flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  };

  const renderSection = (title, bookings, icon) => {
    if (bookings.length === 0) {
      return null;
    }

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">({bookings.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map(renderBookingCard)}
        </div>
      </section>
    );
  };

  const allBookings = items.length;
  const hasBookings = allBookings > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis reservas</h1>
        <p className="text-gray-600">
          {hasBookings
            ? `Tienes ${allBookings} reserva${allBookings !== 1 ? "s" : ""} en total`
            : "Aún no has realizado ninguna reserva"}
        </p>
      </div>

      {!hasBookings ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 mb-4">No tienes reservas todavía</p>
          <Link
            to="/caregivers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-DEFAULT text-white hover:bg-primary-DEFAULT/90 transition-colors font-medium"
          >
            Buscar cuidadores
          </Link>
        </div>
      ) : (
        <>
          {renderSection(
            "Pendientes",
            pending,
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          {renderSection(
            "Aceptadas",
            accepted,
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          {renderSection(
            "Pagadas",
            paid,
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}

          {renderSection(
            "Canceladas / Rechazadas",
            cancelled,
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </>
      )}
    </div>
  );
}
