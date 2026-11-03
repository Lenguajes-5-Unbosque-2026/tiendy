"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { Chip } from "@/components/tiendy/ChoiceChips";
import { ListItem } from "@/components/tiendy/ListItem";
import { MovimientoIcono } from "@/components/tiendy/MovimientoIcono";
import { pesos } from "@/lib/formato";
import {
  filtrar,
  filtrosHoy,
  type Movimiento,
  movimientos,
  nombreDia,
  PERIODOS,
  totales,
} from "@/lib/tienda/cuaderno";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

/** Mi cuaderno (33): todo lo que entró y salió, por día. */
export default function CuadernoPage() {
  const router = useRouter();
  const tienda = useTienda();
  const { filtros, setFiltros, turnos, personas } = tienda;

  const lista = filtrar(movimientos(tienda), filtros, turnos);
  const { entro, salio } = totales(lista);
  const turno = turnos.find((t) => t.id === filtros.turnoId);
  const masFiltros =
    filtros.tipos.length > 0 || filtros.medios.length > 0 || filtros.franja !== "todos";

  const periodo = (Object.keys(PERIODOS) as (keyof typeof PERIODOS)[]).find(
    (p) => !filtros.turnoId && PERIODOS[p].desde === filtros.desde && PERIODOS[p].hasta === filtros.hasta
  );

  // Agrupa por día, en el orden en que vienen (del más reciente al más viejo)
  const porDia = new Map<string, Movimiento[]>();
  for (const m of lista) {
    const dia = m.fechaHora.slice(0, 10);
    porDia.set(dia, [...(porDia.get(dia) ?? []), m]);
  }

  return (
    <AppScreen title="Mi cuaderno" back="/caja">
      <div className="flex flex-wrap gap-espacio-2">
        {(
          [
            ["hoy", "Hoy"],
            ["semana", "Semana"],
            ["mes", "Mes"],
          ] as const
        ).map(([clave, etiqueta]) => (
          <Chip
            key={clave}
            elegido={periodo === clave}
            onClick={() => setFiltros({ ...filtros, ...PERIODOS[clave], turnoId: null })}
          >
            {etiqueta}
          </Chip>
        ))}
        <Chip onClick={() => router.push("/cuaderno/turnos")}>Turnos</Chip>
      </div>

      {turno && (
        <div className="flex items-center justify-between gap-espacio-3 rounded-lg bg-fondo-primario-suave p-espacio-4">
          <span className="text-cuerpo-fuerte text-texto-primario">
            Turno de {personas.find((p) => p.id === turno.persona_id)?.nombre_corto} · {nombreDia(turno.fecha)}
          </span>
          <button
            type="button"
            aria-label="Quitar filtro de turno"
            onClick={() => setFiltros(filtrosHoy)}
            className="text-texto-primario"
          >
            <X className="size-icono-sm" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-espacio-3">
        <AmountCard compacta montoPrimario etiqueta="Entró" monto={pesos(entro)} />
        <AmountCard compacta etiqueta="Salió" monto={pesos(salio)} />
      </div>

      <div className="flex items-center gap-espacio-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-espacio-4 size-icono-sm -translate-y-1/2 text-texto-sutil" />
          <Input
            type="search"
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            placeholder="Buscar movimiento"
            aria-label="Buscar movimiento"
            className="pl-[calc(var(--espacio-4)+var(--icono-sm)+var(--espacio-2))]"
          />
        </div>
        <Link
          href="/cuaderno/filtros"
          className={cn(
            buttonVariants({ variant: masFiltros ? "default" : "secondary", size: "sm" }),
            "h-alto-campo"
          )}
        >
          <SlidersHorizontal /> Filtros
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="text-cuerpo text-texto-secundario">No hay movimientos con estos filtros.</p>
      ) : (
        [...porDia].map(([dia, delDia]) => (
          <section key={dia} className="flex flex-col gap-espacio-3">
            <h2 className="text-secundario text-texto-secundario">{nombreDia(dia)}</h2>
            <ul className="flex flex-col gap-espacio-3">
              {delDia.map((m) => (
                <li key={m.id}>
                  <ListItem
                    leading={<MovimientoIcono tipo={m.tipo} />}
                    titulo={m.titulo}
                    detalle={m.detalle}
                    valor={m.monto === null ? undefined : `${m.monto > 0 ? "+" : ""}${pesos(m.monto)}`}
                    valorTono={m.monto !== null && m.monto > 0 ? "primario" : "principal"}
                    href={`/cuaderno/${m.id}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </AppScreen>
  );
}
