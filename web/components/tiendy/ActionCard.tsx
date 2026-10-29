import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { IconBadge, type TonoBadge } from "@/components/tiendy/IconBadge";
import { cn } from "@/lib/utils";

type ActionCardProps = {
  icon: LucideIcon;
  titulo: string;
  detalle?: string;
  /** Primaria: la tarjeta verde "Vender". Clara: las demás. */
  variante?: "primaria" | "clara";
  /** Vertical: las tarjetas pequeñas de dos columnas del Home. */
  vertical?: boolean;
  iconTono?: TonoBadge;
  href?: string;
  onClick?: () => void;
};

/** Tarjeta de acción grande del Home (Vender, Registrar gasto, Llegó mercancía). */
export function ActionCard({
  icon,
  titulo,
  detalle,
  variante = "clara",
  vertical = false,
  iconTono,
  href,
  onClick,
}: ActionCardProps) {
  const primaria = variante === "primaria";
  const clases = cn(
    "flex rounded-xl p-espacio-5 text-left",
    vertical ? "flex-col items-start gap-espacio-3" : "items-center gap-espacio-4",
    primaria ? "bg-fondo-primario text-texto-inverso" : "bg-fondo-tarjeta text-texto-principal"
  );
  const contenido = (
    <>
      <IconBadge icon={icon} tamano="l" tono={iconTono ?? (primaria ? "sobreVerde" : "primario")} />
      <span className="flex flex-col gap-espacio-1">
        <span className={primaria ? "text-titulo-2" : "text-cuerpo-fuerte"}>{titulo}</span>
        {detalle && (
          <span className={cn("text-secundario", primaria ? "text-texto-inverso-suave" : "text-texto-secundario")}>
            {detalle}
          </span>
        )}
      </span>
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
      <button type="button" onClick={onClick} className={clases}>
        {contenido}
      </button>
    );
  }
  return <div className={clases}>{contenido}</div>;
}
