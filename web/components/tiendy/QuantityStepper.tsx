import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  valor: number;
  onMenos: () => void;
  onMas: () => void;
  /** Qué se cuenta, para el lector de pantalla ("Leche Alquería 1 L"). */
  etiqueta: string;
  minimo?: number;
  maximo?: number;
  /** El "+" relleno en verde, como en 42. */
  masRelleno?: boolean;
};

/** Selector de cantidad (− número +). */
export function QuantityStepper({
  valor,
  onMenos,
  onMas,
  etiqueta,
  minimo = 0,
  maximo,
  masRelleno = false,
}: QuantityStepperProps) {
  const boton =
    "flex size-alto-chip items-center justify-center rounded-full bg-fondo-primario-suave text-texto-primario disabled:bg-fondo-sutil disabled:text-texto-sutil";
  return (
    <div className="flex items-center gap-espacio-3">
      <button
        type="button"
        aria-label={`Quitar uno de ${etiqueta}`}
        onClick={onMenos}
        disabled={valor <= minimo}
        className={boton}
      >
        <Minus className="size-icono-sm" />
      </button>
      <span aria-live="polite" className="min-w-espacio-4 text-center text-valor text-texto-principal">
        {valor}
      </span>
      <button
        type="button"
        aria-label={`Agregar uno de ${etiqueta}`}
        onClick={onMas}
        disabled={maximo !== undefined && valor >= maximo}
        className={cn(boton, masRelleno && "bg-fondo-primario text-texto-inverso")}
      >
        <Plus className="size-icono-sm" />
      </button>
    </div>
  );
}
