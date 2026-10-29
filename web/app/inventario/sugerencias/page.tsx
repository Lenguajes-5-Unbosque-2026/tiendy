"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { QuantityStepper } from "@/components/tiendy/QuantityStepper";
import { pesos } from "@/lib/formato";
import { DIAS_SUGERENCIA, cantidadSugerida } from "@/lib/tienda/calculos";
import { useInventario } from "@/lib/tienda/useInventario";

/** Sugerencias de compra (44): qué pedir de lo que se está acabando. */
export default function SugerenciasPage() {
  const { porAgotarse } = useInventario();

  const sugeridos = porAgotarse
    .map((i) => ({ ...i, sugerida: cantidadSugerida(i.producto, i.stock.promedio) }))
    .filter((i) => i.sugerida > 0);

  const [cantidades, setCantidades] = useState<Record<string, number>>(() =>
    Object.fromEntries(sugeridos.map((i) => [i.producto.id, i.sugerida]))
  );

  const cantidad = (id: string) => cantidades[id] ?? 0;
  const cambiar = (id: string, delta: number) =>
    setCantidades((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }));

  // Sin costo (p36) no se puede estimar: cuenta como $0
  const total = sugeridos.reduce((s, i) => s + (i.producto.costo ?? 0) * cantidad(i.producto.id), 0);

  const lista = sugeridos
    .filter((i) => cantidad(i.producto.id) > 0)
    .map((i) => `• ${i.producto.nombre}: ${cantidad(i.producto.id)}`)
    .join("\n");
  const mensaje = `Pedido de la tienda:\n${lista}\nTotal estimado: ${pesos(total)}`;

  return (
    <AppScreen
      title="Qué pedir"
      subtitle="Según lo que has vendido"
      back="/inventario/por-agotarse"
      footer={
        sugeridos.length > 0 && (
          <div className="flex flex-col gap-espacio-3">
            {/* Pedir a un proveedor (41a · proveedores) queda fuera del MVP */}
            <Button disabled>Pedir a un proveedor</Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!lista}
              className={buttonVariants({ variant: "secondary" })}
            >
              Compartir lista por WhatsApp
            </a>
          </div>
        )
      }
    >
      {sugeridos.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          titulo="No hace falta pedir nada"
          texto="Tienes suficiente de todo para los próximos días."
        />
      ) : (
        <>
          <p className="text-secundario text-texto-secundario">
            Ajusta las cantidades si quieres. Calculamos para {DIAS_SUGERENCIA} días de venta.
          </p>
          <ul className="flex flex-col gap-espacio-3">
            {sugeridos.map(({ producto }) => (
              <li
                key={producto.id}
                className="flex items-center gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-espacio-1">
                  <span className="text-cuerpo-fuerte">{producto.nombre}</span>
                  <span className="text-secundario text-texto-secundario">
                    {producto.costo === null
                      ? "Sin costo anotado"
                      : `≈ ${pesos(producto.costo * cantidad(producto.id))}`}
                  </span>
                </div>
                <QuantityStepper
                  valor={cantidad(producto.id)}
                  etiqueta={producto.nombre}
                  onMenos={() => cambiar(producto.id, -1)}
                  onMas={() => cambiar(producto.id, 1)}
                  masRelleno
                />
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-lg bg-fondo-tarjeta p-espacio-4">
            <span className="text-cuerpo text-texto-secundario">Total estimado</span>
            <span className="text-valor">{pesos(total)}</span>
          </div>
        </>
      )}
    </AppScreen>
  );
}
