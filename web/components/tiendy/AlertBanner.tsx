import Link from "next/link";
import { ChevronRight, CircleCheck, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const tonos = {
  advertencia: {
    fondo: "bg-fondo-advertencia-suave",
    icono: "bg-fondo-advertencia text-texto-inverso",
    Icono: TriangleAlert,
  },
  peligro: {
    fondo: "bg-fondo-peligro-suave",
    icono: "text-texto-peligro",
    Icono: TriangleAlert,
  },
  exito: {
    fondo: "bg-fondo-exito-suave",
    icono: "bg-fondo-exito text-texto-inverso",
    Icono: CircleCheck,
  },
} as const;

type AlertBannerProps = {
  tono: keyof typeof tonos;
  titulo: string;
  detalle?: string;
  href?: string;
};

/** Alerta (UI kit §7): Advertencia / Peligro / Éxito, con flecha si lleva a otra pantalla. */
export function AlertBanner({ tono, titulo, detalle, href }: AlertBannerProps) {
  const { fondo, icono, Icono } = tonos[tono];
  const contenido = (
    <>
      <span
        aria-hidden="true"
        className={cn("flex size-icono-circulo-m shrink-0 items-center justify-center rounded-full", icono)}
      >
        <Icono className="size-icono-sm" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-espacio-1">
        <span className="text-cuerpo-fuerte text-texto-principal">{titulo}</span>
        {detalle && <span className="text-secundario text-texto-secundario">{detalle}</span>}
      </span>
      {href && <ChevronRight className="size-icono-sm shrink-0 text-texto-secundario" />}
    </>
  );
  const clases = cn("flex items-center gap-espacio-3 rounded-lg p-espacio-4", fondo);

  return href ? (
    <Link href={href} className={clases}>
      {contenido}
    </Link>
  ) : (
    <div role="status" className={clases}>
      {contenido}
    </div>
  );
}
