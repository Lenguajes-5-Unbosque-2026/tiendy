"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertBanner } from "@/components/tiendy/AlertBanner";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { inicial, plural, pesos } from "@/lib/formato";
import { useTienda } from "@/lib/tienda/store";
import { textoUnidades, useInventario } from "@/lib/tienda/useInventario";

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Mi inventario (41): qué queda en el estante. */
export default function InventarioPage() {
  const { categorias } = useTienda();
  const { items, porAgotarse } = useInventario();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");

  // Solo las categorías que tienen productos
  const conProductos = categorias
    .filter((c) => items.some((i) => i.producto.categoria_id === c.id))
    .sort((a, b) => a.orden - b.orden);

  const q = normalizar(busqueda.trim());
  const visibles = items.filter(
    (i) =>
      (categoria === "todos" || i.producto.categoria_id === categoria) &&
      (!q ||
        [i.producto.nombre, ...(i.producto.alias ?? [])].some((n) => normalizar(n).includes(q)))
  );

  return (
    <AppScreen title="Mi inventario" subtitle={plural(items.length, "producto", "productos")}>
      <div className="flex items-center gap-espacio-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-espacio-4 size-icono-sm -translate-y-1/2 text-texto-sutil" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            className="pl-[calc(var(--espacio-4)+var(--icono-sm)+var(--espacio-2))]"
          />
        </div>
        {/* Cargar productos (CU-02) queda fuera del MVP */}
        <Button variant="secondary" size="sm" disabled className="h-alto-campo">
          <Plus /> Agregar
        </Button>
      </div>

      <ChoiceChips
        etiqueta="Categoría"
        valor={categoria}
        onChange={setCategoria}
        opciones={[
          { valor: "todos", etiqueta: "Todos" },
          ...conProductos.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
        ]}
      />

      {porAgotarse.length > 0 && (
        <AlertBanner
          tono="peligro"
          titulo={`${plural(porAgotarse.length, "producto", "productos")} por agotarse`}
          detalle="Revisa y pide antes de quedarte sin"
          href="/inventario/por-agotarse"
        />
      )}

      <ul className="flex flex-col gap-espacio-3">
        {visibles.map((item) => {
          const unidades = textoUnidades(item);
          return (
            <li key={item.producto.id}>
              <ListItem
                leading={<IconBadge letra={inicial(item.producto.nombre)} />}
                titulo={item.producto.nombre}
                detalle={`${item.categoria} · ${pesos(item.producto.precio_venta)}`}
                valor={unidades.texto}
                valorTono={unidades.tono}
                flecha
                href={`/inventario/${item.producto.id}`}
              />
            </li>
          );
        })}
      </ul>

      {visibles.length === 0 && (
        <p className="text-cuerpo text-texto-secundario">
          No hay productos que coincidan con tu búsqueda.
        </p>
      )}
    </AppScreen>
  );
}
