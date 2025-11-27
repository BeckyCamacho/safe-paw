import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [dateError, setDateError] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingCaregiver, setLoadingCaregiver] = useState(true);

  // Obtener la fecha mínima (hoy) en formato YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  // Cargar servicios del cuidador
  useEffect(() => {
    const loadCaregiverServices = async () => {
      try {
        const caregiverRef = doc(db, "caregivers", caregiverId);
        const caregiverSnap = await getDoc(caregiverRef);
        
        if (caregiverSnap.exists()) {
          const caregiver = caregiverSnap.data();
          const caregiverServices = Array.isArray(caregiver.services) ? caregiver.services : [];
          
          // Filtrar SERVICE_OPTIONS para mostrar solo los servicios que el cuidador ofrece
          const filtered = SERVICE_OPTIONS.filter(option => 
            caregiverServices.includes(option.value)
          );
          
          setAvailableServices(filtered);
          
          // Si hay servicios disponibles, actualizar el servicio seleccionado
          if (filtered.length > 0) {
            setForm(prev => {
              // Solo actualizar si no hay servicio seleccionado
              if (!prev.service) {
                return {
                  ...prev,
                  service: filtered[0].value
                };
              }
              return prev;
            });
          }
        } else {
          // Si no existe el cuidador, mostrar todos los servicios como fallback
          setAvailableServices(SERVICE_OPTIONS);
        }
      } catch (error) {
        console.error("Error cargando servicios del cuidador:", error);
        // En caso de error, mostrar todos los servicios como fallback
        setAvailableServices(SERVICE_OPTIONS);
      } finally {
        setLoadingCaregiver(false);
      }
    };

    if (caregiverId) {
      loadCaregiverServices();
    }
  }, [caregiverId]);

  const [form, setForm] = useState({
    service: "",
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
    
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Validar fechas cuando cambian
      if (field === "startDate") {
        setDateError("");
        // Si la fecha de fin es anterior a la nueva fecha de inicio, ajustarla
        if (updated.endDate && updated.endDate < value) {
          updated.endDate = value;
        }
      } else if (field === "endDate") {
        setDateError("");
        // Si la fecha de fin es anterior a la fecha de inicio, mostrar error
        if (updated.startDate && value < updated.startDate) {
          setDateError("La fecha de fin no puede ser anterior a la fecha de inicio");
          return prev; // No actualizar si hay error
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      return navigate(`/iniciar-sesion?redirect=${redirect}`);
    }

    if (!form.service) {
      return alert("Por favor selecciona un servicio.");
    }

    if (!form.startDate || !form.endDate || !form.address || !form.petName) {
      return alert("Por favor completa fechas, dirección y nombre de tu mascota.");
    }

    if (!form.startTime) {
      return alert("Por favor selecciona la hora de inicio.");
    }

    // Validar que la fecha de inicio no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(form.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setDateError("No puedes hacer una reserva para fechas pasadas");
      return;
    }

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    const endDate = new Date(form.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < startDate) {
      setDateError("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    // Si la fecha de inicio es hoy, validar que la hora no sea en el pasado
    if (startDate.getTime() === today.getTime()) {
      const now = new Date();
      const [startHour, startMinute] = form.startTime.split(":").map(Number);
      const startDateTime = new Date();
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      if (startDateTime < now) {
        setDateError("No puedes hacer una reserva para una hora que ya pasó hoy");
        return;
      }
    }

    // Si las fechas son iguales, validar que la hora de fin sea posterior a la de inicio
    if (startDate.getTime() === endDate.getTime() && form.endTime) {
      const [startHour, startMinute] = form.startTime.split(":").map(Number);
      const [endHour, endMinute] = form.endTime.split(":").map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      
      if (endTimeMinutes <= startTimeMinutes) {
        setDateError("La hora de fin debe ser posterior a la hora de inicio cuando las fechas son iguales");
        return;
      }
    }

    setDateError(""); // Limpiar errores si todo está bien

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

     
      const totalCOP = basePriceCOP * days;
      const priceInCents = totalCOP * 100;

      
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

  if (loadingCaregiver) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-DEFAULT" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Cargando servicios disponibles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (availableServices.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            Este cuidador no tiene servicios disponibles en este momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Reservar cuidador</h1>
      <p className="mb-6 text-sm text-gray-600">
        Completa los datos de tu mascota y las fechas en las que necesitas el servicio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium">Servicio <span className="text-red-500">*</span></span>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.service || availableServices[0]?.value || ""}
            onChange={handleChange("service")}
            required
          >
            {availableServices.map((option) => (
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
              min={getTodayString()}
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
              min={form.startDate || getTodayString()}
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

        {dateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {dateError}
          </div>
        )}

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
