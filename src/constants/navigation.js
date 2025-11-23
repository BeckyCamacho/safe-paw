/**
 * Constantes de navegación y textos reutilizables
 */

export const NAV_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Cuidadores", path: "/caregivers" },
];

export const ROUTES = {
  HOME: "/",
  CAREGIVERS: "/caregivers",
  SERVICES: "/caregivers",
  SIGN_IN: "/signin",
  BECOME_CAREGIVER: "/ser-cuidador",
};

export const HERO_CONTENT = {
  title: "Tu amigo merece la mejor compañía con Safe Paw",
  description: "Encuentra la compañía ideal para tu mascota con nosotros. Te ayudaremos a encontrar la compañía perfecta para tu peludito. Podrás estar tranquilo con nosotros, garantizándole compañía, seguridad y amor a tu mejor amigo.",
  ctaButton: "Buscar ahora",
};

export const COLORS = {
  primary: {
    light: "#E8D5FF", // Morado claro
    DEFAULT: "#A855F7", // Morado
  },
  accent: {
    orange: "#FB923C", // Naranja
  },
  text: {
    dark: "#1F2937", // Gris oscuro
    DEFAULT: "#4B5563", // Gris medio
  },
};

export const SERVICE_LABELS = {
  hospedaje: "Hospedaje nocturno",
  guarderia: "Guardería diurna",
  paseos: "Paseos 30 minutos",
  visitas: "Visitas a domicilio",
  cuidado_casa_dueno: "Cuidado en casa del dueño",
};

export const SERVICE_OPTIONS = [
  { value: "hospedaje", label: "Hospedaje nocturno" },
  { value: "guarderia", label: "Guardería diurna" },
  { value: "paseos 30 minutos", label: "Paseos 30 minutos" },
  { value: "visitas", label: "Visitas a domicilio" },
  { value: "cuidado_casa_dueno", label: "Cuidado en casa del dueño" },
];

