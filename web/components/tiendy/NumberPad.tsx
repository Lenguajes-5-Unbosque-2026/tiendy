"use client";

import { cn } from "@/lib/utils";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "borrar"] as const;
// Hasta $999.999.999: más que eso no cabe en una caja de tienda
const MAX_DIGITOS = 9;

type NumberPadProps = {
  valor: number;
  onChange: (valor: number) => void;
  className?: string;
};

/** Teclado numérico (UI kit §7 · 16, 29): 1–9, 000, 0 y Borrar, para escribir plata. */
export function NumberPad({ valor, onChange, className }: NumberPadProps) {
  const pulsar = (tecla: (typeof TECLAS)[number]) => {
    const actual = valor === 0 ? "" : String(valor);
    if (tecla === "borrar") {
      onChange(Number(actual.slice(0, -1) || 0));
      return;
    }
    const nuevo = actual + tecla;
    if (nuevo.length <= MAX_DIGITOS) onChange(Number(nuevo));
  };

  return (
    <div className={cn("grid grid-cols-3 gap-espacio-2", className)}>
      {TECLAS.map((tecla) => (
        <button
          key={tecla}
          type="button"
          onClick={() => pulsar(tecla)}
          aria-label={tecla === "borrar" ? "Borrar último número" : undefined}
          className={cn(
            "flex h-alto-tecla items-center justify-center rounded-md bg-fondo-tarjeta text-texto-principal active:bg-fondo-sutil",
            tecla === "borrar" ? "text-cuerpo-fuerte" : "text-monto-m"
          )}
        >
          {tecla === "borrar" ? "Borrar" : tecla}
        </button>
      ))}
    </div>
  );
}
