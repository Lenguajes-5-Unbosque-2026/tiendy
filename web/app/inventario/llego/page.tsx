"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { leerPesos, pesos } from "@/lib/formato";
import type { MedioPagoGasto } from "@/lib/mock/tipos";
import { enDias, proximaVisita } from "@/lib/tienda/gastos";
import { type LineaEntrada, useTienda } from "@/lib/tienda/store";

const claseCampo =
  "h-alto-campo w-full rounded-md bg-fondo-sutil px-espacio-4 text-cuerpo text-texto-principal";

/** Llegó mercancía (41a): suma unidades al inventario y actualiza el costo de cada producto. */
export default function LlegoMercanciaPage() {
  const router = useRouter();
  const { productos, proveedores, anotarEntrada } = useTienda();
  const [proveedorId, setProveedorId] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineaEntrada[]>([]);
  const [medio, setMedio] = useState<MedioPagoGasto | null>(null);
  const [agregando, setAgregando] = useState(true);
  const [nueva, setNueva] = useState<{ productoId: string; cantidad: number | null; costo: number | null }>({
    productoId: "",
    cantidad: null,
    costo: null,
  });

  const proveedor = proveedores.find((p) => p.id === proveedorId);
  const visita = proximaVisita(proveedor);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.costo, 0);
  const nombreDe = (id: string) => productos.find((p) => p.id === id)?.nombre ?? "";
  const nuevaLista = nueva.productoId && (nueva.cantidad ?? 0) > 0 && nueva.costo !== null;

  const agregar = () => {
    if (!nuevaLista) return;
    const linea = { productoId: nueva.productoId, cantidad: nueva.cantidad!, costo: nueva.costo! };
    // Si el producto ya está en el pedido, se reemplaza
    setLineas((ls) => [...ls.filter((l) => l.productoId !== linea.productoId), linea]);
    setNueva({ productoId: "", cantidad: null, costo: null });
    setAgregando(false);
  };

  const sumar = () => {
    if (!medio) return;
    anotarEntrada(proveedorId, lineas, {
      medio,
      // Si queda debiendo, se paga en la próxima visita del proveedor (o en 8 días)
      pagarAntesDe: medio === "quede_debiendo" ? (visita ?? enDias(8)) : null,
    });
    router.push("/inventario");
  };

  return (
    <AppScreen
      title="Llegó mercancía"
      subtitle="Suma al inventario y actualiza costos"
      back="/inventario"
      footer={
        <Button disabled={lineas.length === 0 || !medio} onClick={sumar}>
          Sumar al inventario
        </Button>
      }
    >
      <label className="flex flex-col gap-espacio-2">
        <span className="text-secundario text-texto-secundario">Proveedor</span>
        <select
          value={proveedorId ?? ""}
          onChange={(e) => setProveedorId(e.target.value || null)}
          className={claseCampo}
        >
          <option value="">Sin proveedor</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>

      <section className="flex flex-col gap-espacio-3 rounded-xl bg-fondo-tarjeta p-espacio-4">
        {lineas.map((l) => (
          <div key={l.productoId} className="flex items-center gap-espacio-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-cuerpo-fuerte text-texto-principal">{nombreDe(l.productoId)}</span>
              <span className="text-secundario text-texto-secundario">
                {l.cantidad} und × costo {pesos(l.costo)}
              </span>
            </div>
            <span className="text-cuerpo-fuerte font-bold text-texto-principal">
              {pesos(l.cantidad * l.costo)}
            </span>
            <button
              type="button"
              aria-label={`Quitar ${nombreDe(l.productoId)}`}
              onClick={() => setLineas((ls) => ls.filter((x) => x.productoId !== l.productoId))}
              className="text-texto-secundario"
            >
              <X className="size-icono-sm" />
            </button>
          </div>
        ))}

        {agregando ? (
          <div className="flex flex-col gap-espacio-2">
            <select
              aria-label="Producto"
              value={nueva.productoId}
              onChange={(e) => {
                const p = productos.find((x) => x.id === e.target.value);
                // El costo arranca con el último que se pagó
                setNueva({ ...nueva, productoId: e.target.value, costo: p?.costo ?? null });
              }}
              className={claseCampo}
            >
              <option value="">Elige un producto</option>
              {[...productos]
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>
            <div className="grid grid-cols-2 gap-espacio-2">
              <Input
                aria-label="Unidades que llegaron"
                inputMode="numeric"
                placeholder="Unidades"
                value={nueva.cantidad ?? ""}
                onChange={(e) => setNueva({ ...nueva, cantidad: leerPesos(e.target.value) })}
              />
              <Input
                aria-label="Costo por unidad"
                inputMode="numeric"
                placeholder="Costo c/u"
                value={nueva.costo === null ? "" : pesos(nueva.costo)}
                onChange={(e) => setNueva({ ...nueva, costo: leerPesos(e.target.value) })}
              />
            </div>
            <Button variant="secondary" size="sm" disabled={!nuevaLista} onClick={agregar}>
              Agregar al pedido
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAgregando(true)}
            className="flex items-center gap-espacio-1 text-cuerpo-fuerte font-bold text-texto-primario"
          >
            <Plus className="size-icono-sm" /> Agregar producto
          </button>
        )}

        <div className="flex items-center justify-between border-t border-borde-default pt-espacio-3">
          <span className="text-cuerpo-fuerte text-texto-principal">Total del pedido</span>
          <span className="text-monto-m text-texto-principal">{pesos(total)}</span>
        </div>
      </section>

      <div className="flex flex-col gap-espacio-3">
        <h2 className="text-secundario text-texto-secundario">¿Cómo lo pagaste?</h2>
        <ChoiceChips
          etiqueta="Cómo lo pagaste"
          valor={medio}
          onChange={setMedio}
          opciones={[
            { valor: "efectivo", etiqueta: "Efectivo de la caja" },
            { valor: "transferencia", etiqueta: "Transferencia" },
            {
              valor: "quede_debiendo",
              etiqueta: proveedor?.dia_visita
                ? `Quedé debiendo · ${proveedor.dia_visita}`
                : "Quedé debiendo",
            },
          ]}
        />
        <p className="text-secundario text-texto-secundario">
          Suma cantidades y actualiza el costo de cada producto. No cuenta como gasto del día.
        </p>
      </div>
    </AppScreen>
  );
}
