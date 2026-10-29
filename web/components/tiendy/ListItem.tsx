import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const tonosTexto = {
  principal: "text-texto-principal",
  secundario: "text-texto-secundario",
  primario: "text-texto-primario",
  advertencia: "text-texto-advertencia",
  peligro: "text-texto-peligro",
} as const;

type ListItemProps = {
  /** Ícono en círculo o avatar a la izquierda. */
  leading?: React.ReactNode;
  titulo: React.ReactNode;
  detalle?: React.ReactNode;
  /** Valor a la derecha ("Quedan 2", "24 und.", "$3.900"). */
  valor?: React.ReactNode;
  valorTono?: keyof typeof tonosTexto;
  /** Cualquier otra cosa a la derecha (una etiqueta, un botón). */
  trailing?: React.ReactNode;
  flecha?: boolean;
  /** Opción elegida: borde verde de 2px. */
  elegida?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/** Fila de lista (UI kit §7): ícono · título · detalle · valor y/o flecha. */
export function ListItem({
  leading,
  titulo,
  detalle,
  valor,
  valorTono = "principal",
  trailing,
  flecha = false,
  elegida = false,
  href,
  onClick,
  className,
}: ListItemProps) {
  const clases = cn(
    "flex w-full items-center gap-espacio-3 rounded-lg border-transparent bg-fondo-tarjeta p-espacio-4 text-left [border-width:var(--borde-ancho-foco)]",
    elegida && "border-borde-foco",
    className
  );

  const contenido = (
    <>
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-espacio-1">
        <span className="text-cuerpo-fuerte text-texto-principal">{titulo}</span>
        {detalle && <span className="text-secundario text-texto-secundario">{detalle}</span>}
      </span>
      {valor !== undefined && (
        <span className={cn("shrink-0 text-cuerpo-fuerte font-bold", tonosTexto[valorTono])}>
          {valor}
        </span>
      )}
      {trailing}
      {flecha && <ChevronRight className="size-icono-sm shrink-0 text-texto-secundario" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={clases}>
        {contenido}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={elegida} className={clases}>
        {contenido}
      </button>
    );
  }
  return <div className={clases}>{contenido}</div>;
}
