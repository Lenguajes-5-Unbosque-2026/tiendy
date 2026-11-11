"use client";

import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  /** Botón volver: a una ruta o con una acción propia. */
  back?: string | (() => void);
  /** Botón redondo a la derecha (Mi tienda desde el Home). */
  accion?: { href: string; icon: LucideIcon; etiqueta: string };
  /** Header bajo sin título visible (Mi tienda, 46): la tarjeta de la tienda hace de título. */
  compacto?: boolean;
};

/**
 * Header verde oscuro con título centrado (UI kit §7 · Header).
 * La hoja crema que sube encima la pone AppScreen.
 */
export function AppHeader({ title, subtitle, back, accion, compacto = false }: AppHeaderProps) {
  if (compacto) {
    return (
      <header className="min-h-[calc(var(--alto-barra-estado)+var(--espacio-solape-hoja)+var(--espacio-6))] bg-fondo-encabezado pt-alto-barra-estado">
        <h1 className="sr-only">{title}</h1>
      </header>
    );
  }

  const claseBoton =
    "absolute top-alto-barra-estado mt-espacio-5 flex size-boton-volver items-center justify-center rounded-full bg-fondo-primario text-texto-inverso";
  const claseVolver = `${claseBoton} left-margen-pantalla`;

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
      {accion && (
        <Link href={accion.href} aria-label={accion.etiqueta} className={`${claseBoton} right-margen-pantalla`}>
          <accion.icon className="size-icono-sm" />
        </Link>
      )}
      <h1
        className={`pt-espacio-6 text-monto-m text-texto-inverso ${
          back || accion ? "px-boton-volver" : ""
        }`}
      >
        {title}
      </h1>
      {subtitle && <p className="text-secundario text-texto-inverso-suave">{subtitle}</p>}
    </header>
  );
}
