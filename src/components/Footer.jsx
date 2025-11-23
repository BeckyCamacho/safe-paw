/**
 * Componente Footer con información de copyright
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} Safe Paw. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a
              href="#"
              className="hover:text-primary-DEFAULT transition-colors"
            >
              Términos de servicio
            </a>
            <a
              href="#"
              className="hover:text-primary-DEFAULT transition-colors"
            >
              Política de privacidad
            </a>
            <a
              href="#"
              className="hover:text-primary-DEFAULT transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

