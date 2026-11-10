"use client";

import { useState } from "react";
import Image from "next/image";

import { IconBadge } from "@/components/tiendy/IconBadge";
import { inicial } from "@/lib/formato";
import type { Producto } from "@/lib/mock/tipos";
import { cn } from "@/lib/utils";

type FotoProductoProps = {
  producto: Pick<Producto, "nombre" | "imagen">;
  /** M de 40px para filas, L de 48px para la tarjeta de 42 (mismas medidas que IconBadge). */
  tamano?: "m" | "l";
};

/** Foto del producto (bucket "imagenes" de Supabase) en círculo; sin foto, su inicial. */
export function FotoProducto({ producto, tamano = "m" }: FotoProductoProps) {
  const [fallo, setFallo] = useState(false);

  // Los datos de prueba sin Supabase traen solo el nombre del archivo, no la URL
  if (!producto.imagen?.startsWith("https://") || fallo) {
    return <IconBadge letra={inicial(producto.nombre)} tamano={tamano} />;
  }

  const px = tamano === "m" ? 40 : 48;
  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-borde-default bg-fondo-tarjeta",
        tamano === "m" ? "size-icono-circulo-m" : "size-icono-circulo-l"
      )}
    >
      <Image
        src={producto.imagen}
        alt=""
        width={px}
        height={px}
        sizes={`${px}px`}
        onError={() => setFallo(true)}
        className="size-full object-contain"
      />
    </span>
  );
}
