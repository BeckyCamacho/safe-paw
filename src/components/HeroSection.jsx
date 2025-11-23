import { useNavigate } from "react-router-dom";
import PetCarousel from "./PetCarousel";
import { HERO_CONTENT, ROUTES } from "../constants/navigation";

/**
 * Componente Hero Section con el diseño de la landing page
 */
export default function HeroSection() {
  const navigate = useNavigate();

  const handleBuscar = () => {
    navigate(ROUTES.CAREGIVERS);
  };

  return (
    <section className="w-full py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 xl:gap-20 max-w-7xl mx-auto relative">
        {/* División decorativa */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary-light to-transparent -translate-x-1/2 z-10"></div>
        
        {/* Contenido izquierdo */}
        <div className="px-6 lg:px-10 xl:px-16 lg:pr-6 flex flex-col justify-center min-h-[500px] lg:min-h-[600px] py-8 lg:py-12">
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-gray-900 leading-tight">
              {HERO_CONTENT.title}
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-2xl">
              {HERO_CONTENT.description}
            </p>

            <div className="pt-4">
              <button
                onClick={handleBuscar}
                className="inline-flex items-center gap-2 px-8 py-4 lg:px-10 lg:py-5 rounded-full bg-primary-light text-primary-DEFAULT hover:bg-primary-light/80 transition-colors font-medium text-base lg:text-lg"
              >
                {HERO_CONTENT.ctaButton}
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carrusel de mascotas - ocupa toda la parte derecha */}
        <div className="px-6 lg:px-10 xl:px-16 lg:pl-6 flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
          <div className="w-full h-full max-w-full aspect-square lg:aspect-auto lg:h-full">
            <PetCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

