"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, TriangleAlert } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { QuantityStepper } from "@/components/tiendy/QuantityStepper";
import { leerPesos, pesos } from "@/lib/formato";
import { ventasUltimos7Dias } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";
import { useInventario } from "@/lib/tienda/useInventario";
import { cn } from "@/lib/utils";

/** Ver y editar producto (42). */
export function ProductoDetalle({ id }: { id: string }) {
  const { items } = useInventario();
  const item = items.find((i) => i.producto.id === id);

  if (!item) {
    return (
      <AppScreen title="Producto" back="/inventario">
        <p className="text-cuerpo text-texto-secundario">No encontramos este producto.</p>
      </AppScreen>
    );
  }

  // La key reinicia el formulario si cambia el producto guardado
  return <EditarProducto key={`${item.producto.id}-${item.producto.unidades}`} item={item} />;
}

function EditarProducto({ item }: { item: ReturnType<typeof useInventario>["items"][number] }) {
  const router = useRouter();
  const { ventas, ventaProductos, guardarProducto } = useTienda();
  const { producto, categoria, stock } = item;

  const [precio, setPrecio] = useState<number | null>(producto.precio_venta);
  const [costo, setCosto] = useState<number | null>(producto.costo);
  const [unidades, setUnidades] = useState(producto.unidades);

  const cambio =
    precio !== producto.precio_venta || costo !== producto.costo || unidades !== producto.unidades;
  const valido = precio !== null && precio > 0;

  const dias = ventasUltimos7Dias(producto.id, ventas, ventaProductos);
  const maximo = Math.max(1, ...dias.map((d) => d.unidades));
  const promedio = Math.round(stock.promedio);

  const guardar = () => {
    if (!valido) return;
    guardarProducto(producto.id, { precio_venta: precio, costo, unidades });
    router.push("/inventario");
  };

  return (
    <AppScreen
      title={producto.nombre}
      subtitle={categoria}
      back="/inventario"
      footer={
        <Button disabled={!cambio || !valido} onClick={guardar}>
          Guardar cambios
        </Button>
      }
    >
      <div className="flex items-center gap-espacio-4 rounded-lg bg-fondo-tarjeta p-espacio-4">
        {stock.porAgotarse ? (
          <IconBadge icon={TriangleAlert} tono="peligro" tamano="l" />
        ) : (
          <IconBadge icon={Package} tamano="l" />
        )}
        <div className="flex flex-col gap-espacio-1">
          <p
            className={cn(
              "text-valor",
              !stock.porAgotarse
                ? "text-texto-principal"
                : stock.nivel === "critico"
                  ? "text-texto-peligro"
                  : "text-texto-advertencia"
            )}
          >
            {producto.unidades === 0
              ? "Agotado"
              : `${stock.porAgotarse ? "Quedan" : "Tienes"} ${producto.unidades} ${
                  producto.unidades === 1 ? "unidad" : "unidades"
                }`}
          </p>
          <p className="text-secundario text-texto-secundario">
            Mínimo {producto.minimo} ·{" "}
            {promedio > 0 ? `vendes unas ${promedio} al día` : "todavía sin ventas"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-espacio-3">
        <CampoPesos etiqueta="Precio de venta" valor={precio} onChange={setPrecio} />
        <CampoPesos etiqueta="Costo" valor={costo} onChange={setCosto} />
      </div>

      <div className="flex items-center justify-between gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4">
        <div className="flex flex-col gap-espacio-1">
          <span className="text-cuerpo-fuerte">Unidades</span>
          <span className="text-secundario text-texto-secundario">Ajustar si contaste distinto</span>
        </div>
        <QuantityStepper
          valor={unidades}
          etiqueta={producto.nombre}
          onMenos={() => setUnidades((u) => Math.max(0, u - 1))}
          onMas={() => setUnidades((u) => u + 1)}
          masRelleno
        />
      </div>

      <section className="flex flex-col gap-espacio-2">
        <h2 className="text-secundario text-texto-secundario">Ventas de los últimos 7 días</h2>
        <div className="rounded-lg bg-fondo-tarjeta p-espacio-4">
          <ol className="grid h-alto-grafica grid-cols-7 items-end gap-espacio-3">
            {dias.map((d, i) => (
              <li key={d.fecha} className="flex h-full flex-col items-center justify-end gap-espacio-2">
                <span
                  title={`${d.unidades} vendidas`}
                  className={cn(
                    "w-full rounded-sm",
                    i === dias.length - 1 ? "bg-chart-2" : "bg-chart-1"
                  )}
                  style={{ height: `${(d.unidades / maximo) * 100}%` }}
                />
                <span className="text-caption text-texto-secundario">{d.etiqueta}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </AppScreen>
  );
}

function CampoPesos({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: number | null;
  onChange: (valor: number | null) => void;
}) {
  return (
    <label className="flex flex-col gap-espacio-2">
      <span className="text-cuerpo-fuerte">{etiqueta}</span>
      <Input
        inputMode="numeric"
        value={valor === null ? "" : pesos(valor)}
        onChange={(e) => onChange(leerPesos(e.target.value))}
        placeholder="$0"
      />
    </label>
  );
}
