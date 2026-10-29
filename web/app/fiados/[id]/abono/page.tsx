import { Suspense } from "react";

import { RegistrarAbono } from "./RegistrarAbono";

/** Registrar abono (39) y Deuda saldada (40). */
export default function AbonoPage({ params }: PageProps<"/fiados/[id]/abono">) {
  // Leer `params` dentro de Suspense deja la navegación instantánea
  return (
    <Suspense>
      <Abono params={params} />
    </Suspense>
  );
}

async function Abono({ params }: Pick<PageProps<"/fiados/[id]/abono">, "params">) {
  const { id } = await params;
  return <RegistrarAbono id={id} />;
}
