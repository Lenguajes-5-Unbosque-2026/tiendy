"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  /** Botón volver: a una ruta o con una acción propia. */
  back?: string | (() => void);
};

/**
 * Header verde oscuro con título centrado (UI kit §7 · Header).
 * La hoja crema que sube encima la pone AppScreen.
 */
export function AppHeader({ title, subtitle, back }: AppHeaderProps) {
  const claseVolver =
    "absolute left-margen-pantalla top-alto-barra-estado mt-espacio-5 flex size-boton-volver items-center justify-center rounded-full bg-fondo-primario text-texto-inverso";

  return (
    <header
      className={`relative flex flex-col items-center gap-espacio-1 bg-fondo-encabezado px-margen-pantalla pt-alto-barra-estado text-center ${
        subtitle ? "min-h-alto-header-subtitulo" : "min-h-alto-header"
      }`}
    >
      {typeof back === "string" && (
        <Link href={back} aria-label="Volver" className={claseVolver}>
          <ChevronLeft className="size-icono-sm" />
        </Link>
      )}
      {typeof back === "function" && (
        <button type="button" onClick={back} aria-label="Volver" className={claseVolver}>
          <ChevronLeft className="size-icono-sm" />
        </button>
      )}
      <h1
        className={`pt-espacio-6 text-monto-m text-texto-inverso ${
          back ? "px-boton-volver" : ""
        }`}
      >
        {title}
      </h1>
      {subtitle && <p className="text-secundario text-texto-inverso-suave">{subtitle}</p>}
    </header>
  );
}
