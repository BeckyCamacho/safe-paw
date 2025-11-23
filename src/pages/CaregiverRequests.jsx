import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { updateBookingStatus, getBookingsByCaregiver } from "../services/bookings";
import { Link } from "react-router-dom";

export default function CaregiverRequests() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadBookings = async () => {
      try {
        const bookings = await getBookingsByCaregiver(user.uid);
        setItems(bookings);
      } catch (err) {
        console.error("Error cargando solicitudes:", err);
        alert("Error al cargar tus solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <p className="p-4">Inicia sesión para ver tus solicitudes como cuidador.</p>
    );
  }

  if (loading) {
    return <p className="p-4">Cargando solicitudes…</p>;
  }

  const pending = items.filter((b) => b.status === "REQUESTED");
  const accepted = items.filter((b) => b.status === "ACCEPTED");
  const cancelled = items.filter(
    (b) => b.status === "CANCELLED" || b.status === "DECLINED"
  );

  const handleUpdateStatus = async (id, status) => {
    const confirmMsg =
      status === "ACCEPTED"
        ? "¿Aceptar esta solicitud?"
        : "¿Rechazar esta solicitud?";
    const ok = window.confirm(confirmMsg);
    if (!ok) return;

    try {
      setUpdatingId(id);
      await updateBookingStatus(id, status);
      setItems((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status,
              }
            : b
        )
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar la solicitud.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderList = (list, options = {}) => {
    const { showActions = false } = options;

    if (list.length === 0) {
      return (
        <p className="text-xs text-gray-500">
          No tienes solicitudes en esta sección.
        </p>
      );
    }

    return (
      <ul className="space-y-3">
        {list.map((b) => (
          <li
            key={b.id}
            className="border rounded px-3 py-2 flex justify-between items-start gap-3"
          >
            <div className="text-sm">
              <p className="font-medium">
                {b.petName || "Mascota sin nombre"}
              </p>
              <p className="text-xs text-gray-600">
                {b.startDate || "¿?"} → {b.endDate || "¿?"}
              </p>
              <p className="text-xs text-gray-600">
                Servicio: {b.service || "No especificado"}
              </p>
              {b.address && (
                <p className="text-xs text-gray-600">
                  Dirección: {b.address}
                </p>
              )}
              {b.notes && (
                <p className="text-xs text-gray-600 mt-1">
                  Notas: {b.notes}
                </p>
              )}
              <Link
                to={`/reserva/${b.id}`}
                className="mt-1 inline-block text-xs text-primary-DEFAULT underline hover:text-primary-DEFAULT/80"
              >
                Ver detalle
              </Link>
            </div>

            {showActions && (
              <div className="flex flex-col gap-2 min-w-[120px]">

                  <button
                    onClick={() => handleUpdateStatus(b.id, "ACCEPTED")}
                    disabled={updatingId === b.id}
                    className="px-4 py-2 rounded-full text-sm border-2 disabled:opacity-60 transition-colors font-medium shadow-md"
                    style={{
                      backgroundColor: updatingId === b.id ? '#E4F0FF' : '#E4F0FF',
                      color: '#3B82F6',
                      borderColor: '#3B82F6'
                    }}
                  >
                    {updatingId === b.id ? "Actualizando..." : " Aceptar"}
                  </button>

                
                <button
                  onClick={() => handleUpdateStatus(b.id, "DECLINED")}
                  disabled={updatingId === b.id}
                  className="px-4 py-2 rounded-full text-sm border-2 disabled:opacity-60 transition-colors font-medium shadow-md"
                  style={{
                    backgroundColor: '#FFE5E5',
                    color: '#EF4444',
                    borderColor: '#EF4444'
                  }}
                >
                  Rechazar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Solicitudes de cuidado</h1>

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">Pendientes</h2>
        {renderList(pending, { showActions: true })}
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">Aceptadas</h2>
        {renderList(accepted)}
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">
          Canceladas / Rechazadas
        </h2>
        {renderList(cancelled)}
      </section>
    </div>
  );
}
