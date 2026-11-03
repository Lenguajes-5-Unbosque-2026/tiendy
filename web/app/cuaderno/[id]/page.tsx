import { Suspense } from "react";

import datos from "@/lib/mock/datos.json";

import { DetalleMovimiento } from "./DetalleMovimiento";

export function generateStaticParams() {
  return [
    ...datos.ventas.map((v) => ({ id: v.id })),
    ...datos.gastos.map((g) => ({ id: g.id })),
    ...datos.entradas.map((e) => ({ id: e.id })),
    ...datos.turnos.flatMap((t) => [{ id: `${t.id}-apertura` }, { id: `${t.id}-cierre` }]),
  ];
}

/** Detalle de movimiento (36). */
export default function MovimientoPage({ params }: PageProps<"/cuaderno/[id]">) {
  // Leer `params` dentro de Suspense deja la navegación instantánea
  return (
    <Suspense>
      <Movimiento params={params} />
    </Suspense>
  );
}

async function Movimiento({ params }: Pick<PageProps<"/cuaderno/[id]">, "params">) {
  const { id } = await params;
  return <DetalleMovimiento id={id} />;
}
