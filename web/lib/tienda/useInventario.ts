"use client";

import { useMemo } from "react";

import { estadoStock, promedioDiario } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";

/** Productos con su categoría y su estado de stock (41, 42, 43 y la alerta del Home). */
export function useInventario() {
  const { productos, categorias, ventas, ventaProductos } = useTienda();

  return useMemo(() => {
    const nombreCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));
    const items = productos.map((producto) => ({
      producto,
      categoria: nombreCategoria.get(producto.categoria_id) ?? "",
      stock: estadoStock(producto, promedioDiario(producto.id, ventas, ventaProductos)),
    }));
    // Los críticos primero y, entre iguales, el que se acaba antes
    const porAgotarse = items
      .filter((i) => i.stock.porAgotarse)
      .sort(
        (a, b) =>
          (a.stock.nivel === "critico" ? 0 : 1) - (b.stock.nivel === "critico" ? 0 : 1) ||
          (a.stock.dias ?? 0) - (b.stock.dias ?? 0)
      );
    return { items, porAgotarse };
  }, [productos, categorias, ventas, ventaProductos]);
}

export type ItemInventario = ReturnType<typeof useInventario>["items"][number];

/** "Quedan 2", "Agotado", "24 und." o "−2 und." (vendido de más) con su color. */
export function textoUnidades({ producto, stock }: ItemInventario) {
  // Vendido de más: en naranja, con el signo (−2 und.)
  if (producto.unidades < 0)
    return { texto: `−${-producto.unidades} und.`, tono: "advertencia" as const };
  if (producto.unidades === 0 && producto.minimo === 0)
    return { texto: "Sin contar", tono: "secundario" as const };
  if (producto.unidades === 0) return { texto: "Agotado", tono: "peligro" as const };
  if (!stock.porAgotarse) return { texto: `${producto.unidades} und.`, tono: "principal" as const };
  return {
    texto: `Quedan ${producto.unidades}`,
    tono: stock.nivel === "critico" ? ("peligro" as const) : ("advertencia" as const),
  };
}
