import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import Uploader from "../components/Uploader.jsx";
import { createBooking } from "../services/bookings";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SERVICE_OPTIONS } from "../constants/navigation";

export default function BookingForm() {
  const { id: caregiverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    service: SERVICE_OPTIONS[0]?.value || "hospedaje",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    address: "",
    petType: "perro",
    petName: "",
    petAge: "",
    petWeight: "",
    friendly: true,
    meds: "",
    notes: "",
  });

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      return navigate(`/iniciar-sesion?redirect=${redirect}`);
    }

    if (!form.startDate || !form.endDate || !form.address || !form.petName) {
      return alert("Por favor completa fechas, dirección y nombre de tu mascota.");
    }

    if (!form.startTime) {
      return alert("Por favor selecciona la hora de inicio.");
    }

    setSubmitting(true);
    try {
      
      const caregiverRef = doc(db, "caregivers", caregiverId);
      const caregiverSnap = await getDoc(caregiverRef);
      const caregiver = caregiverSnap.exists() ? caregiverSnap.data() : null;
      
      // Obtener el precio del servicio seleccionado
      // Primero intentar usar servicePrices, si no existe usar minPrice (compatibilidad hacia atrás)
      let basePriceCOP = 0;
      if (caregiver?.servicePrices && caregiver.servicePrices[form.service]) {
        basePriceCOP = caregiver.servicePrices[form.service];
      } else if (caregiver?.minPrice) {
        basePriceCOP = caregiver.minPrice;
      }

      const d1 = new Date(form.startDate);
      const d2 = new Date(form.endDate);
      const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));

      // Para servicios como paseos o visitas, el precio puede ser por sesión, no por día
      // Por ahora, multiplicamos por días para todos los servicios
      // En el futuro se puede ajustar la lógica según el tipo de servicio
      const totalCOP = basePriceCOP * days;
      const priceInCents = totalCOP * 100;

      // Crear reserva usando el servicio
      const bookingId = await createBooking({
        caregiverId,
        ownerId: user.uid,
        ...form,
        photoUrl,
        priceInCents,
      });

      alert("Solicitud enviada al cuidador 🐾");
      navigate(`/reserva/${bookingId}`);
    } catch (err) {
      console.error(err);
      alert("No pudimos crear la reserva, intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Reservar cuidador</h1>
      <p className="mb-6 text-sm text-gray-600">
        Completa los datos de tu mascota y las fechas en las que necesitas el servicio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium">Servicio</span>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.service}
            onChange={handleChange("service")}
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium">Fecha inicio <span className="text-red-500">*</span></span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.startDate}
              onChange={handleChange("startDate")}
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Hora inicio <span className="text-red-500">*</span></span>
            <input
              type="time"
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.startTime}
              onChange={handleChange("startTime")}
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium">Fecha fin <span className="text-red-500">*</span></span>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.endDate}
              onChange={handleChange("endDate")}
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Hora fin</span>
            <input
              type="time"
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.endTime}
              onChange={handleChange("endTime")}
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-medium">Dirección de recogida / cuidado</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Ej: Calle 123 #45-67, apto 201"
            value={form.address}
            onChange={handleChange("address")}
          />
        </label>

        <fieldset className="border rounded px-3 py-3 space-y-3">
          <legend className="px-1 text-sm font-semibold">Tu mascota</legend>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Tipo de animal <span className="text-red-500">*</span></span>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.petType}
              onChange={handleChange("petType")}
              required
            >
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
            </select>
          </label>

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nombre de tu mascota"
            value={form.petName}
            onChange={handleChange("petName")}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border rounded px-3 py-2"
              placeholder="Edad (ej: 3 años)"
              value={form.petAge}
              onChange={handleChange("petAge")}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Peso (ej: 12 kg)"
              value={form.petWeight}
              onChange={handleChange("petWeight")}
            />
          </div>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.friendly}
              onChange={handleChange("friendly")}
            />
            <span>Es amigable con otros perros/personas</span>
          </label>

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Medicamentos, condiciones especiales, etc."
            value={form.meds}
            onChange={handleChange("meds")}
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Notas para el cuidador (horarios, rutinas, etc.)"
            value={form.notes}
            onChange={handleChange("notes")}
          />
        </fieldset>

        <div>
          <span className="block text-sm font-medium mb-1">
            Foto de tu mascota (opcional)
          </span>
          <Uploader onUploaded={setPhotoUrl} />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#C084FC] text-white hover:bg-[#A855F7] active:bg-[#9333EA] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-base shadow-lg hover:shadow-xl"
            style={{ backgroundColor: submitting ? '#A855F7' : '#C084FC' }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <span>Confirmar reserva</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
