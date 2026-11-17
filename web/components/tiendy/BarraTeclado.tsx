"use client";

import { useEffect, useState } from "react";

type BarraTecladoProps = {
  /** Qué se está escribiendo ("Escribe la cantidad"). */
  texto: string;
  /** "Listo": cierra el teclado. */
  onListo: () => void;
};

/**
 * Barra encima del teclado del celular (11a): dice qué se escribe y "Listo"
 * para cerrar el teclado. Se pega al borde de arriba del teclado: el navegador
 * achica la parte visible de la pantalla cuando el teclado se abre.
 */
export function BarraTeclado({ texto, onListo }: BarraTecladoProps) {
  /** Lo que tapa el teclado por debajo de la parte visible. */
  const [tapado, setTapado] = useState(0);

  useEffect(() => {
    const vista = window.visualViewport;
    if (!vista) return;
    const medir = () => setTapado(Math.max(0, window.innerHeight - vista.height - vista.offsetTop));
    medir();
    vista.addEventListener("resize", medir);
    vista.addEventListener("scroll", medir);
    return () => {
      vista.removeEventListener("resize", medir);
      vista.removeEventListener("scroll", medir);
    };
  }, []);

  return (
    <div
      style={{ bottom: tapado }}
      className="fixed inset-x-0 z-40 flex items-center justify-between border-t border-borde-default bg-fondo-sutil px-margen-pantalla py-espacio-3"
    >
      <span className="text-secundario text-texto-secundario">{texto}</span>
      <button
        type="button"
        // Sin perder el foco antes de tiempo: el campo se cierra con onListo
        onMouseDown={(e) => e.preventDefault()}
        onClick={onListo}
        className="text-cuerpo-fuerte text-texto-primario"
      >
        Listo
      </button>
    </div>
  );
}
