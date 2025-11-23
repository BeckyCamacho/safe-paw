import { useState } from "react";

/**
 * Componente de botón de filtro con dropdown
 * @param {Object} props
 * @param {string} props.label - Etiqueta del filtro
 * @param {Array} props.options - Opciones del dropdown
 * @param {string} props.value - Valor seleccionado
 * @param {Function} props.onChange - Callback cuando cambia el valor
 */
export default function FilterButton({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || label;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors font-medium text-sm"
      >
        <span>{selectedLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
            role="button"
            tabIndex={-1}
            aria-label="Cerrar menú"
          />
          <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-20 min-w-[200px]">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                  value === option.value ? "bg-orange-50 text-orange-700 font-medium" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

