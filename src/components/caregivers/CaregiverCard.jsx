import { Link } from "react-router-dom";

export default function CaregiverCard({ c }) {
  const min = Number(c.minPrice || 0);
  const stars = c.ratingAvg ? Number(c.ratingAvg).toFixed(1) : "N/A";

  return (
    <div className="rounded-2xl border p-4 flex items-center gap-4">
      <img
        src={c.photoUrl || "https://placehold.co/96x96?text=🐾"}
        alt={c.displayName}
        className="w-20 h-20 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{c.displayName}</h3>
          <span className="text-yellow-600 text-sm">⭐ {stars}</span>
        </div>
        <p className="text-sm text-gray-500">{c.city}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(c.services || {})
            .filter(([, v]) => Number(v?.price) > 0)
            .map(([k]) => (
              <span key={k} className="text-xs px-2 py-1 rounded-full bg-gray-100">
                {k}
              </span>
            ))}
        </div>
        <p className="mt-2 text-sm">
          Desde{" "}
          <span className="font-semibold">
            {min > 0 ? `$${min.toLocaleString("es-CO")}` : "—"}
          </span>
        </p>
      </div>
      <Link
        to={`/caregivers/${c.id || c.uid}`}
        className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Ver perfil
      </Link>
    </div>
  );
}
