"use client";

import { Camera, List, Pencil } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";

/** Cómo cargar productos (10): a mano, con fotos o desde el listado sugerido. */
export default function CargarProductosPage() {
  return (
    <AppScreen title="Cargar productos" back="/inventario" withNav={false}>
      <h2 className="text-titulo-2 text-texto-principal">¿Cómo quieres cargar tus productos?</h2>

      <div className="flex flex-col gap-espacio-3">
        <ListItem
          leading={<IconBadge icon={Pencil} />}
          titulo="Uno por uno, a mano"
          detalle="Escribe nombre, precio y cantidad"
          flecha
          href="/inventario/cargar/manual"
        />
        <ListItem
          leading={<IconBadge icon={Camera} />}
          titulo="Con fotos"
          detalle="De los productos o de la factura"
          flecha
          href="/inventario/cargar/foto"
        />
        <ListItem
          elegida
          leading={<IconBadge icon={List} />}
          titulo="Desde un listado"
          detalle="Marca productos típicos de tienda"
          flecha
          href="/inventario/cargar/listado"
        />
      </div>
      <p className="text-secundario font-bold text-texto-primario">
        Recomendado: desde un listado, es lo más rápido
      </p>

      <p className="mt-auto text-center text-secundario text-texto-secundario">
        Puedes combinar métodos y agregar más productos después.
      </p>
    </AppScreen>
  );
}
