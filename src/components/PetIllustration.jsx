import dogImage from "../assets/dog.png";
import catImage from "../assets/cat.png";

/**
 * Componente de ilustración de mascotas
 * Muestra la imagen de perro o gato con diseño decorativo
 * @param {Object} props
 * @param {"dog"|"cat"} [props.type="dog"] - Tipo de mascota
 * @param {string} [props.className=""] - Clases CSS adicionales
 */
export default function PetIllustration({ 
  type = "dog",
  className = "" 
}) {
  const imageSrc = type === "dog" ? dogImage : catImage;
  const altText = type === "dog" ? "Perro" : "Gato";

  return (
    <div className={`relative ${className}`}>
      {/* Forma de fondo morada orgánica que se extiende */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundColor: "#E8D5FF",
          borderRadius: "50%",
          clipPath: "ellipse(70% 60% at 50% 50%)",
          transform: "scale(0.9)",
        }}
      />

      {/* Imagen de mascota */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
        <img
          src={imageSrc}
          alt={altText}
          className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl"
          style={{
            filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.1))",
          }}
        />
      </div>
    </div>
  );
}

