import { Suspense } from "react";

import { DetalleFiado } from "./DetalleFiado";

/** Detalle del fiado (38). */
export default function DetalleFiadoPage({ params }: PageProps<"/fiados/[id]">) {
  // Leer `params` dentro de Suspense deja la navegación instantánea
  return (
    <Suspense>
      <Detalle params={params} />
    </Suspense>
  );
}

async function Detalle({ params }: Pick<PageProps<"/fiados/[id]">, "params">) {
  const { id } = await params;
  return <DetalleFiado id={id} />;
}
