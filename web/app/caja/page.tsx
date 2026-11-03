"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { List, Wallet } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { buttonVariants } from "@/components/ui/button";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { hora, plural, pesos } from "@/lib/formato";
import { cajaDelTurno } from "@/lib/tienda/calculos";
import { filtrosHoy } from "@/lib/tienda/cuaderno";
import { useTienda } from "@/lib/tienda/store";

/** Caja del día (17): cuánta plata debe haber en caja y por qué medio entró. */
export default function CajaPage() {
  const router = useRouter();
  const { ventas, gastos, turnoAbierto, setFiltros } = useTienda();

  if (!turnoAbierto) {
    return (
      <AppScreen title="Caja del día" back="/">
        <EmptyState
          icon={Wallet}
          titulo="La caja está cerrada"
          texto="Ábrela con el efectivo que tienes para empezar a anotar ventas."
          accion={
            <Link href="/caja/abrir" className={buttonVariants()}>
              Abrir caja
            </Link>
          }
        />
      </AppScreen>
    );
  }

  const caja = cajaDelTurno(turnoAbierto, ventas, gastos);

  return (
    <AppScreen
      title="Caja del día"
      subtitle={`Abierta ${hora(turnoAbierto.abierto_en)}`}
      back="/"
      footer={
        <Link href="/caja/cerrar" className={buttonVariants()}>
          Cerrar caja
        </Link>
      }
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
        <AmountCard
          compacta
          etiqueta="Gastos en efectivo"
          monto={pesos(caja.gastosEfectivo)}
          className="col-span-2"
        />
      </div>

      <section className="flex flex-col gap-espacio-2 rounded-lg bg-fondo-tarjeta p-espacio-4">
        <h2 className="text-cuerpo-fuerte text-texto-secundario">Por medio de pago</h2>
        <dl className="flex flex-col gap-espacio-2 text-cuerpo">
          {(
            [
              ["Efectivo", caja.porMedio.efectivo],
              ["Transferencia", caja.porMedio.transferencia],
            ] as const
          ).map(([medio, monto]) => (
            <div key={medio} className="flex justify-between">
              <dt className="text-texto-secundario">{medio}</dt>
              <dd className="font-bold text-texto-principal">{pesos(monto)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ListItem
        leading={<IconBadge icon={List} />}
        titulo="Movimientos de hoy"
        detalle={`${plural(caja.cantidadVentas, "venta", "ventas")} · ${plural(
          caja.cantidadGastos,
          "gasto",
          "gastos"
        )}`}
        flecha
        onClick={() => {
          setFiltros({ ...filtrosHoy, turnoId: turnoAbierto.id });
          router.push("/cuaderno");
        }}
      />
    </AppScreen>
  );
}
