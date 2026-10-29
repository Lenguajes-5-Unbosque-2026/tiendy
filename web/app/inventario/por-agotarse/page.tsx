"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { inicial, plural } from "@/lib/formato";
import { useInventario } from "@/lib/tienda/useInventario";

type Filtro = "todos" | "critico" | "bajo";

/** Alertas de agotado (43): los productos en su mínimo o debajo. */
export default function PorAgotarsePage() {
  const { porAgotarse } = useInventario();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const visibles = porAgotarse.filter((i) => filtro === "todos" || i.stock.nivel === filtro);

  return (
    <AppScreen
      title="Por agotarse"
      subtitle={plural(porAgotarse.length, "producto", "productos")}
      back="/inventario"
      // Sugerencias de compra (44) queda fuera del MVP
      footer={porAgotarse.length > 0 && <Button disabled>Ver sugerencia de compra</Button>}
    >
      {porAgotarse.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          titulo="Nada por agotarse"
          texto="Todos tus productos están por encima de su mínimo."
        />
      ) : (
        <>
          <ChoiceChips
            etiqueta="Qué tan urgente"
            valor={filtro}
            onChange={setFiltro}
            opciones={[
              { valor: "todos", etiqueta: "Todos" },
              { valor: "critico", etiqueta: "Críticos" },
              { valor: "bajo", etiqueta: "Bajos" },
            ]}
          />
          <ul className="flex flex-col gap-espacio-3">
            {visibles.map(({ producto, stock }) => (
              <li key={producto.id}>
                <ListItem
                  leading={<IconBadge letra={inicial(producto.nombre)} />}
                  titulo={producto.nombre}
                  detalle={
                    producto.unidades === 0
                      ? "Agotado"
                      : [`Quedan ${producto.unidades}`, stock.alcance].filter(Boolean).join(" · ")
                  }
                  trailing={
                    <span className="shrink-0 rounded-full border border-borde-fuerte px-espacio-3 py-espacio-1 text-chip text-texto-principal">
                      {stock.nivel === "critico" ? "Crítico" : "Bajo"}
                    </span>
                  }
                  href={`/inventario/${producto.id}`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </AppScreen>
  );
}
