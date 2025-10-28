// src/components/StatusPill.jsx
export default function StatusPill({ value }) {
  const map = {
    accepted: 'bg-green-100 text-green-800 border border-green-300',
    rejected: 'bg-red-100 text-red-800 border border-red-300',
    cancelled: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    new: 'bg-blue-100 text-blue-800 border border-blue-300',
  };

  const cls = map[value] ?? 'bg-slate-100 text-slate-800 border border-slate-300';

  // Traducimos los valores para mostrar en español
  const labels = {
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
    new: 'Nueva',
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
