import personImage from "../assets/person.png";

/**
 * Componente de ilustración de cuidador
 * Muestra la imagen de persona con diseño decorativo
 */
export default function CaregiverIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pt-8">
      {/* Imagen de persona */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
        <div className="w-full h-full max-w-5xl max-h-5xl flex items-center justify-center">
          <img
            src={personImage}
            alt="Cuidador de mascotas"
            className="w-full h-full object-contain drop-shadow-2xl scale-125"
            style={{
              filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.1))",
            }}
          />
        </div>
      </div>

      {/* Icono de pata decorativo - Izquierda superior */}
      <div className="absolute top-8 left-8 w-12 h-12 text-purple-300 opacity-60">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>

      {/* Icono de pata decorativo - Derecha inferior */}
      <div className="absolute bottom-8 right-8 w-12 h-12 text-orange-300 opacity-60">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
    </div>
  );
}

