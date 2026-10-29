"use client";

import { useMemo, useState } from "react";
import { HandCoins, Search } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { inicial, pesos } from "@/lib/formato";
import { deudaCliente, estadoFiado, pagaEstaSemana } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

type Filtro = "todos" | "vencidos" | "semana";

const tonoDetalle = {
  exito: "text-texto-exito",
  peligro: "text-texto-peligro",
  secundario: "text-texto-secundario",
} as const;

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Fiados (37): a quién le has fiado y cuánto te debe cada uno. */
export default function FiadosPage() {
  const { clientes, ventas, abonos } = useTienda();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  // Los que deben primero, de mayor a menor deuda; al final los que están al día
  const lista = useMemo(
    () =>
      clientes
        .map((cliente) => {
          const deuda = deudaCliente(cliente.id, ventas, abonos);
          return { cliente, deuda, estado: estadoFiado(cliente, deuda, abonos) };
        })
        .sort((a, b) => b.deuda - a.deuda),
    [clientes, ventas, abonos]
  );
  const totalDeben = lista.reduce((s, i) => s + i.deuda, 0);

  const q = normalizar(busqueda.trim());
  const visibles = lista.filter(
    (i) =>
      (!q || normalizar(i.cliente.nombre).includes(q)) &&
      (filtro === "todos" ||
        (filtro === "vencidos" && i.estado.vencido) ||
        (filtro === "semana" && i.deuda > 0 && pagaEstaSemana(i.cliente)))
  );

  return (
    <AppScreen title="Fiados" subtitle={`En total te deben ${pesos(totalDeben)}`}>
      {lista.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          titulo="Nadie te debe"
          texto="Cuando vendas fiado, aquí verás a quién y cuánto."
        />
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-espacio-4 size-icono-sm -translate-y-1/2 text-texto-sutil" />
            <Input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cliente"
              aria-label="Buscar cliente"
              className="pl-[calc(var(--espacio-4)+var(--icono-sm)+var(--espacio-2))]"
            />
          </div>

          <ChoiceChips
            etiqueta="Filtrar fiados"
            valor={filtro}
            onChange={setFiltro}
            opciones={[
              { valor: "todos", etiqueta: "Todos" },
              { valor: "vencidos", etiqueta: "Vencidos" },
              { valor: "semana", etiqueta: "Esta semana" },
            ]}
          />

          <ul className="flex flex-col gap-espacio-3">
            {visibles.map(({ cliente, deuda, estado }) => (
              <li key={cliente.id}>
                <ListItem
                  leading={<IconBadge letra={inicial(cliente.nombre)} />}
                  titulo={cliente.nombre}
                  detalle={<span className={cn(tonoDetalle[estado.tono])}>{estado.texto}</span>}
                  valor={pesos(deuda)}
                  flecha
                  href={`/fiados/${cliente.id}`}
                />
              </li>
            ))}
          </ul>

          {visibles.length === 0 && (
            <p className="text-cuerpo text-texto-secundario">
              {q ? "No hay clientes con ese nombre." : "No hay clientes en este filtro."}
            </p>
          )}
        </>
      )}
    </AppScreen>
  );
}
