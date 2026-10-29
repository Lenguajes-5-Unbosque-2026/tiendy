import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tonos = {
  primario: "bg-fondo-primario-suave text-texto-primario",
  oscuro: "bg-fondo-encabezado text-texto-inverso",
  neutro: "bg-fondo-sutil text-texto-secundario",
  advertencia: "bg-fondo-advertencia text-texto-inverso",
  peligro: "bg-fondo-peligro-suave text-texto-peligro",
  exito: "bg-fondo-exito text-texto-inverso",
  // Sobre una tarjeta verde (botón Vender del Home)
  sobreVerde: "bg-texto-inverso/20 text-texto-inverso",
} as const;

export type TonoBadge = keyof typeof tonos;

type IconBadgeProps = {
  icon?: LucideIcon;
  /** Inicial del nombre, cuando la fila no tiene ícono (41, 43). */
  letra?: string;
  tono?: TonoBadge;
  tamano?: "m" | "l";
  className?: string;
};

/** Ícono en círculo (UI kit §7): M de 40px para filas, L de 48px para opciones grandes. */
export function IconBadge({
  icon: Icon,
  letra,
  tono = "primario",
  tamano = "m",
  className,
}: IconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        tamano === "m" ? "size-icono-circulo-m text-cuerpo-fuerte" : "size-icono-circulo-l text-valor",
        tonos[tono],
        className
      )}
    >
      {Icon ? (
        <Icon className={tamano === "m" ? "size-icono-sm" : "size-icono-md"} />
      ) : (
        letra
      )}
    </span>
  );
}
