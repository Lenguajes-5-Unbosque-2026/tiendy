"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip, ChoiceChips } from "@/components/tiendy/ChoiceChips";
import type { MedioPagoGasto } from "@/lib/mock/tipos";
import {
  filtrar,
  type Filtros,
  filtrosHoy,
  movimientos,
  nombreMedio,
  type TipoMovimiento,
} from "@/lib/tienda/cuaderno";
import { useTienda } from "@/lib/tienda/store";

const TIPOS: { valor: TipoMovimiento; etiqueta: string }[] = [
  { valor: "venta", etiqueta: "Ventas" },
  { valor: "gasto", etiqueta: "Gastos" },
  { valor: "mercancia", etiqueta: "Mercancía" },
  { valor: "caja", etiqueta: "Aperturas y cierres" },
];

const MEDIOS = Object.entries(nombreMedio) as [MedioPagoGasto, string][];

/** Quita o agrega un valor de una lista de filtros. */
function alternar<T>(lista: T[], valor: T) {
  return lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];
}

/** Filtros del cuaderno (34): tipo, medio de pago, fechas y turno. */
export default function FiltrosCuadernoPage() {
  const router = useRouter();
  const tienda = useTienda();
  const [f, setF] = useState<Filtros>(tienda.filtros);
  const resultados = filtrar(movimientos(tienda), f, tienda.turnos).length;

  const aplicar = () => {
    tienda.setFiltros(f);
    router.push("/cuaderno");
  };

  return (
    <AppScreen
      title="Filtrar"
      back="/cuaderno"
      withNav={false}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Button onClick={aplicar}>
            Ver {resultados} {resultados === 1 ? "resultado" : "resultados"}
          </Button>
          <Button variant="outline" onClick={() => setF({ ...filtrosHoy, busqueda: f.busqueda })}>
            Limpiar filtros
          </Button>
        </div>
      }
    >
      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte text-texto-principal">Tipo de movimiento</h2>
        <div className="flex flex-wrap gap-espacio-2">
          <Chip elegido={f.tipos.length === 0} onClick={() => setF({ ...f, tipos: [] })}>
            Todo
          </Chip>
          {TIPOS.map((t) => (
            <Chip
              key={t.valor}
              aria-pressed={f.tipos.includes(t.valor)}
              elegido={f.tipos.includes(t.valor)}
              onClick={() => setF({ ...f, tipos: alternar(f.tipos, t.valor) })}
            >
              {t.etiqueta}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte text-texto-principal">Medio de pago</h2>
        <div className="flex flex-wrap gap-espacio-2">
          {MEDIOS.map(([valor, etiqueta]) => (
            <Chip
              key={valor}
              aria-pressed={f.medios.includes(valor)}
              elegido={f.medios.includes(valor)}
              onClick={() => setF({ ...f, medios: alternar(f.medios, valor) })}
            >
              {etiqueta}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte text-texto-principal">Fechas</h2>
        <div className="grid grid-cols-2 gap-espacio-3">
          <label className="flex flex-col gap-espacio-2">
            <span className="text-secundario font-bold text-texto-principal">Desde</span>
            <Input
              type="date"
              value={f.desde}
              max={f.hasta}
              onChange={(e) => e.target.value && setF({ ...f, desde: e.target.value, turnoId: null })}
            />
          </label>
          <label className="flex flex-col gap-espacio-2">
            <span className="text-secundario font-bold text-texto-principal">Hasta</span>
            <Input
              type="date"
              value={f.hasta}
              min={f.desde}
              onChange={(e) => e.target.value && setF({ ...f, hasta: e.target.value, turnoId: null })}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte text-texto-principal">Turno</h2>
        <ChoiceChips
          etiqueta="Turno"
          valor={f.franja}
          onChange={(franja) => setF({ ...f, franja })}
          opciones={[
            { valor: "todos", etiqueta: "Todos" },
            { valor: "manana", etiqueta: "Mañana" },
            { valor: "tarde", etiqueta: "Tarde" },
          ]}
        />
      </section>
    </AppScreen>
  );
}
