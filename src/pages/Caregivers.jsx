import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import FilterButton from "../components/FilterButton";
import CaregiverCard from "../components/CaregiverCard";
import CaregiverIllustration from "../components/CaregiverIllustration";
import { SERVICE_LABELS, SERVICE_OPTIONS } from "../constants/navigation";

export default function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState("todas");
  const [selectedService, setSelectedService] = useState("todos");

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "caregivers"),
          where("status", "==", "APPROVED")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCaregivers(list);
      } catch (err) {
        console.error(err);
        alert("Error al cargar cuidadores.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueCities = useMemo(() => {
    const set = new Set(
      caregivers
        .map((c) => c.city)
        .filter((c) => typeof c === "string" && c.trim() !== "")
    );
    return Array.from(set).sort();
  }, [caregivers]);

  const cityOptions = useMemo(() => {
    return [
      { value: "todas", label: "Ciudad" },
      ...uniqueCities.map((city) => ({ value: city, label: city })),
    ];
  }, [uniqueCities]);

  const serviceOptions = useMemo(() => {
    return [
      { value: "todos", label: "Servicio" },
      ...SERVICE_OPTIONS,
    ];
  }, []);

  const filtered = useMemo(() => {
    return caregivers.filter((c) => {
      if (selectedCity !== "todas" && c.city !== selectedCity) return false;
      if (
        selectedService !== "todos" &&
        (!Array.isArray(c.services) || !c.services.includes(selectedService))
      ) {
        return false;
      }
      return true;
    });
  }, [caregivers, selectedCity, selectedService]);

  const formatServices = (services) => {
    if (!Array.isArray(services) || services.length === 0) {
      return "Cuidadora";
    }
    const labels = services
      .map((s) => SERVICE_LABELS[s] || s)
      .map((label) => label.toLowerCase());
    
    if (labels.length === 0) return "Cuidadora";
    
    // Formato: "Cuidadora | paseadora | hospedaje nocturno"
    return ["Cuidadora", ...labels].join(" | ");
  };

  const stats = useMemo(() => {
    return {
      total: caregivers.length,
      filtered: filtered.length,
      cities: uniqueCities.length,
    };
  }, [caregivers.length, filtered.length, uniqueCities.length]);

  return (
    <section className="w-full py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 max-w-7xl mx-auto pt-8">
        {/* Columna izquierda - Lista de cuidadores */}
        <div className="px-6 lg:px-12 xl:px-16 space-y-8 pt-6 pb-10 bg-gray-50 rounded-2xl shadow-sm">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Cuidadores
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Encuentra el cuidador perfecto para tu mascota. Todos nuestros cuidadores están verificados y listos para brindar el mejor cuidado.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-DEFAULT">{stats.filtered}</p>
              <p className="text-xs text-gray-600 mt-1">
                {stats.filtered === 1 ? "Cuidador" : "Cuidadores"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-DEFAULT">{stats.cities}</p>
              <p className="text-xs text-gray-600 mt-1">
                {stats.cities === 1 ? "Ciudad" : "Ciudades"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-DEFAULT">{SERVICE_OPTIONS.length}</p>
              <p className="text-xs text-gray-600 mt-1">Servicios</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <FilterButton
              label="Ciudad"
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
            />
            <FilterButton
              label="Servicio"
              options={serviceOptions}
              value={selectedService}
              onChange={setSelectedService}
            />
          </div>

          {/* Lista de cuidadores */}
          {(() => {
            if (loading) {
              return (
                <div className="py-12 text-center text-gray-500">
                  Cargando cuidadores…
                </div>
              );
            }

            if (filtered.length === 0) {
              return (
                <div className="py-12 text-center text-gray-500">
                  No hay cuidadores para esos filtros todavía.
                </div>
              );
            }

            return (
              <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
                {filtered.map((caregiver) => (
                  <CaregiverCard
                    key={caregiver.id}
                    caregiver={caregiver}
                    formatServices={formatServices}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        {/* Columna derecha - Ilustración */}
        <div className="hidden lg:block relative h-[600px] px-6 lg:px-8 xl:px-12 pt-16">
          <CaregiverIllustration />
        </div>
      </div>
    </section>
  );
}
