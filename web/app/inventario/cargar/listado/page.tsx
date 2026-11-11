"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Search, WifiOff } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { plural, pesos } from "@/lib/formato";
import { useListadoSugerido } from "@/lib/tienda/useListadoSugerido";
import { useTienda } from "@/lib/tienda/store";
import { normalizar } from "@/lib/tienda/voz";
import { cn } from "@/lib/utils";

/** Carga desde listado (13): se marcan productos típicos de tienda. */
export default function CargaListadoPage() {
  const router = useRouter();
  const { productos, categorias, agregarProductos } = useTienda();
  const { estado, reintentar } = useListadoSugerido();
  const listado = estado.tipo === "listo" ? estado.listado : [];
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());

  // Lo que ya está en el inventario no se vuelve a ofrecer
  const yaEstan = new Set(productos.map((p) => normalizar(p.nombre).trim()));
  const disponibles = listado.filter((s) => !yaEstan.has(normalizar(s.nombre).trim()));
  const conProductos = [...categorias]
    .filter((c) => disponibles.some((s) => s.categoria_id === c.id))
    .sort((a, b) => a.orden - b.orden);

  const q = normalizar(busqueda).trim();
  const visibles = disponibles.filter(
    (s) =>
      (categoria === "todos" || s.categoria_id === categoria) &&
      (!q || normalizar(s.nombre).includes(q))
  );
  const todosElegidos = visibles.length > 0 && visibles.every((s) => elegidos.has(s.id));

  const alternar = (id: string) =>
    setElegidos((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });

  const elegirVisibles = () =>
    setElegidos((actual) => {
      const nuevo = new Set(actual);
      for (const s of visibles) {
        if (todosElegidos) nuevo.delete(s.id);
        else nuevo.add(s.id);
      }
      return nuevo;
    });

  const agregar = () => {
    agregarProductos(
      disponibles
        .filter((s) => elegidos.has(s.id))
        .map((s) => ({
          categoria_id: s.categoria_id,
          nombre: s.nombre,
          nombre_corto: s.nombre_corto,
          alias: [s.nombre_corto.toLowerCase()],
          precio_venta: s.precio_sugerido,
          // El listado no pide costo ni cantidad: se completan en 42 o al llegar mercancía
          costo: null,
          unidades: 0,
          minimo: 0,
          venta_rapida: false,
          origen: "listado",
          // La foto del listado queda como foto del producto
          imagen: s.imagen,
        }))
    );
    router.push("/inventario");
  };

  return (
    <AppScreen
      title="Listado sugerido"
      back="/inventario/cargar"
      withNav={false}
      footer={
        <Button disabled={elegidos.size === 0} onClick={agregar}>
          Agregar {plural(elegidos.size, "producto", "productos")}
        </Button>
      }
    >
      {estado.tipo === "cargando" && (
        <p role="status" className="flex items-center gap-espacio-2 text-cuerpo text-texto-secundario">
          <LoaderCircle className="size-icono-sm animate-spin" />
          Cargando el listado…
        </p>
      )}

      {estado.tipo === "error" && (
        <EmptyState
          icon={WifiOff}
          titulo="No pudimos cargar el listado"
          texto="Revisa tu conexión a internet e intenta de nuevo."
          accion={
            <Button variant="secondary" className="w-full" onClick={reintentar}>
              Intentar de nuevo
            </Button>
          }
        />
      )}

      {estado.tipo === "listo" && (
        <>
          <div className="relative">
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

          <ChoiceChips
            etiqueta="Categoría"
            valor={categoria}
            onChange={setCategoria}
            opciones={[
              { valor: "todos", etiqueta: "Todos" },
              ...conProductos.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
            ]}
          />

          <div className="flex items-center justify-between">
            <span className="text-secundario text-texto-secundario">
              {plural(elegidos.size, "seleccionado", "seleccionados")}
            </span>
            {visibles.length > 0 && (
              <button type="button" onClick={elegirVisibles} className="text-cuerpo-fuerte font-bold text-texto-primario">
                {todosElegidos ? "Quitar todos" : "Seleccionar todos"}
              </button>
            )}
          </div>

          {visibles.length === 0 ? (
            <p className="text-cuerpo text-texto-secundario">
              {disponibles.length === 0
                ? "Ya tienes todos los productos del listado."
                : "No hay productos con ese nombre."}
            </p>
          ) : (
            <ul className="flex flex-col gap-espacio-3">
              {visibles.map((s) => {
                const elegido = elegidos.has(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={elegido}
                      onClick={() => alternar(s.id)}
                      className="flex w-full items-center gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-icono-sm shrink-0 items-center justify-center rounded-sm",
                          elegido
                            ? "bg-fondo-primario text-texto-inverso"
                            : "border border-borde-fuerte bg-fondo-tarjeta"
                        )}
                      >
                        {elegido && <Check className="size-full" />}
                      </span>
                      <span className="flex flex-col gap-espacio-1">
                        <span className="text-cuerpo-fuerte text-texto-principal">{s.nombre}</span>
                        <span className="text-secundario text-texto-secundario">
                          Precio sugerido: {pesos(s.precio_sugerido)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </AppScreen>
  );
}
