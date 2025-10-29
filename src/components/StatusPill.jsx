// src/components/StatusPill.jsx
export default function StatusPill({ value }) {
  const map = {
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    new: "bg-blue-100 text-blue-800",
  };

  const cls = map[value] ?? "bg-slate-100 text-slate-800";

  // Traducción de estados a español
  const labels = {
    accepted: "Aceptada",
    rejected: "Rechazada",
    cancelled: "Cancelada",
    new: "Nueva",
  };

  const label = labels[value] ?? value;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}
