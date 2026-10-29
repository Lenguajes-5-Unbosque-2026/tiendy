"use client";

import { List } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { hora, plural, pesos } from "@/lib/formato";
import { cajaDelTurno } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";

/** Caja del día (17): cuánta plata debe haber en caja y por qué medio entró. */
export default function CajaPage() {
  const { ventas, gastos, turnoAbierto } = useTienda();

  if (!turnoAbierto) {
    return (
      <AppScreen title="Caja del día" back="/">
        <p className="text-cuerpo text-texto-secundario">No hay una caja abierta.</p>
      </AppScreen>
    );
  }

  const caja = cajaDelTurno(turnoAbierto, ventas, gastos);

  return (
    <AppScreen
      title="Caja del día"
      subtitle={`Abierta ${hora(turnoAbierto.abierto_en)}`}
      back="/"
      // Cerrar caja (18) es parte de CU-03 y queda fuera del MVP
      footer={<Button disabled>Cerrar caja</Button>}
    >
      <AmountCard centrada etiqueta="Efectivo esperado en caja" monto={pesos(caja.esperado)} />

      <div className="grid grid-cols-2 gap-espacio-3">
        <AmountCard compacta etiqueta="Base" monto={pesos(caja.base)} />
        <AmountCard
          compacta
          montoPrimario
          etiqueta="Ventas en efectivo"
          monto={pesos(caja.ventasEfectivo)}
        />
        <AmountCard compacta etiqueta="Gastos en efectivo" monto={pesos(caja.gastosEfectivo)} />
        <AmountCard
          compacta
          etiqueta="Fiado · no está en caja"
          monto={pesos(caja.porMedio.fiado)}
        />
      </div>

      <section className="flex flex-col gap-espacio-2 rounded-lg bg-fondo-tarjeta p-espacio-4">
        <h2 className="text-cuerpo-fuerte text-texto-secundario">Por medio de pago</h2>
        <dl className="flex flex-col gap-espacio-2 text-cuerpo">
          {(
            [
              ["Efectivo", caja.porMedio.efectivo],
              ["Transferencia", caja.porMedio.transferencia],
              ["Fiado", caja.porMedio.fiado],
            ] as const
          ).map(([medio, monto]) => (
            <div key={medio} className="flex justify-between">
              <dt className="text-texto-secundario">{medio}</dt>
              <dd className="font-bold text-texto-principal">{pesos(monto)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Mi cuaderno (CU-06) queda fuera del MVP: la fila solo resume */}
      <ListItem
        leading={<IconBadge icon={List} />}
        titulo="Movimientos de hoy"
        detalle={`${plural(caja.cantidadVentas, "venta", "ventas")} · ${plural(
          caja.cantidadGastos,
          "gasto",
          "gastos"
        )}`}
      />
    </AppScreen>
  );
}
