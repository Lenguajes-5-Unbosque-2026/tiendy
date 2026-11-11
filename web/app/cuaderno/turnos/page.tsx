"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { hora, iniciales, pesos } from "@/lib/formato";
import { HOY, resultadoDelTurno } from "@/lib/tienda/calculos";
import { diaCorto, filtrosHoy, PERIODOS, resultadoCaja } from "@/lib/tienda/cuaderno";
import { useTienda } from "@/lib/tienda/store";

/** Turnos (35): cada apertura y cierre, con quién atendió y cómo quedó la caja. */
export default function TurnosPage() {
  const router = useRouter();
  const { turnos, personas, ventas, ventaProductos, gastos, setFiltros } = useTienda();
  const [rango, setRango] = useState<"semana" | "mes">("semana");
  const { desde, hasta } = PERIODOS[rango];

  const visibles = turnos
    .filter((t) => t.fecha >= desde && t.fecha <= hasta)
    .sort((a, b) => (a.abierto_en < b.abierto_en ? 1 : -1));
  // Si un día tuvo dos turnos, se dice cuál fue
  const turnosPorDia = new Map<string, number>();
  for (const t of visibles) turnosPorDia.set(t.fecha, (turnosPorDia.get(t.fecha) ?? 0) + 1);

  const verMovimientos = (turnoId: string) => {
    setFiltros({ ...filtrosHoy, turnoId });
    router.push("/cuaderno");
  };

  return (
    <AppScreen title="Turnos" back="/cuaderno">
      <ChoiceChips
        etiqueta="Periodo"
        valor={rango}
        onChange={setRango}
        opciones={[
          { valor: "semana", etiqueta: "Esta semana" },
          { valor: "mes", etiqueta: "Este mes" },
        ]}
      />

      {visibles.length === 0 ? (
        <p className="text-cuerpo text-texto-secundario">No hay turnos en este periodo.</p>
      ) : (
        <ul className="flex flex-col gap-espacio-3">
          {visibles.map((t) => {
            const persona = personas.find((p) => p.id === t.persona_id);
            const { vendido } = resultadoDelTurno(t, ventas, ventaProductos, gastos);
            const franja = (turnosPorDia.get(t.fecha) ?? 0) > 1 ? ` · ${t.franja === "manana" ? "mañana" : "tarde"}` : "";

            if (t.estado === "abierto") {
              return (
                <li key={t.id}>
                  <ListItem
                    elegida
                    leading={<IconBadge letra={iniciales(persona?.nombre_corto ?? "")} tono="oscuro" />}
                    titulo={`${t.fecha === HOY ? "Hoy" : diaCorto(t.fecha)} · ${hora(t.abierto_en)}`}
                    detalle={`Base ${pesos(t.base)} · vendido ${pesos(vendido)}`}
                    trailing={<span className="shrink-0 text-cuerpo-fuerte font-bold text-texto-primario">En curso</span>}
                    href="/caja"
                  />
                </li>
              );
            }

            const diferencia = t.diferencia ?? 0;
            return (
              <li key={t.id}>
                <ListItem
                  leading={<IconBadge letra={iniciales(persona?.nombre_corto ?? "")} />}
                  titulo={`${diaCorto(t.fecha)}${franja}`}
                  detalle={
                    // Naranja solo cuando faltó plata (alerta)
                    <span className={diferencia < 0 ? "text-texto-advertencia" : undefined}>
                      {persona?.nombre_corto} · {resultadoCaja(diferencia)}
                    </span>
                  }
                  valor={`+${pesos(vendido)}`}
                  valorTono="primario"
                  flecha
                  onClick={() => verMovimientos(t.id)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </AppScreen>
  );
}
