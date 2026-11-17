"use client";

import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { BarraTeclado } from "@/components/tiendy/BarraTeclado";
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
  /**
   * Si se pasa, el número también se escribe con el teclado (11a): al tocarlo
   * se abre el teclado numérico con la barra "Escribe la cantidad · Listo".
   */
  onCambiar?: (valor: number) => void;
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
  onCambiar,
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
      {onCambiar ? (
        <CantidadEscrita valor={valor} etiqueta={etiqueta} minimo={minimo} maximo={maximo} onCambiar={onCambiar} />
      ) : (
        <span aria-live="polite" className="min-w-espacio-4 text-center text-valor text-texto-principal">
          {valor}
        </span>
      )}
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

/** El número del selector, que se puede tocar y escribir (11a). */
function CantidadEscrita({
  valor,
  etiqueta,
  minimo,
  maximo,
  onCambiar,
}: {
  valor: number;
  etiqueta: string;
  minimo: number;
  maximo?: number;
  onCambiar: (valor: number) => void;
}) {
  const campo = useRef<HTMLInputElement>(null);
  /** Lo que se está escribiendo (puede quedar vacío mientras se borra). */
  const [texto, setTexto] = useState<string | null>(null);
  const editando = texto !== null;
  const limitar = (n: number) => Math.min(maximo ?? Infinity, Math.max(minimo, n));

  return (
    <>
      <input
        ref={campo}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        autoComplete="off"
        aria-label={`Cantidad de ${etiqueta}`}
        value={editando ? texto : String(valor)}
        onFocus={(e) => {
          setTexto(String(valor));
          e.currentTarget.select();
        }}
        onChange={(e) => {
          const digitos = e.target.value.replace(/\D/g, "").slice(0, 5);
          setTexto(digitos);
          onCambiar(limitar(Number(digitos || 0)));
        }}
        onBlur={() => setTexto(null)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className={cn(
          "h-alto-chip w-alto-campo rounded-md text-center text-valor text-texto-principal outline-none [border-width:var(--borde-ancho-foco)]",
          editando ? "border-borde-foco bg-fondo-tarjeta" : "border-transparent bg-transparent"
        )}
      />
      {editando && <BarraTeclado texto="Escribe la cantidad" onListo={() => campo.current?.blur()} />}
    </>
  );
}
