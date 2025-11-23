import { useState, useEffect } from "react";
import dogImage from "../assets/dog.png";
import catImage from "../assets/cat.png";

/**
 * Componente de carrusel para mostrar imágenes de mascotas
 * Cambia automáticamente cada cierto tiempo
 */
export default function PetCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const pets = [
    { image: dogImage, alt: "Perro" },
    { image: catImage, alt: "Gato" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pets.length);
    }, 5000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [pets.length]);

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      {/* Contenedor del carrusel con fondo morado y esquinas redondeadas */}
      <div className="w-full h-full bg-primary-light rounded-3xl overflow-hidden shadow-xl">
        <div className="relative w-full h-full">
          {pets.map((pet, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center p-2 md:p-4 lg:p-6">
                <img
                  src={pet.image}
                  alt={pet.alt}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  style={{
                    filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.1))",
                    transform: "scale(1.2)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {pets.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary-DEFAULT w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

