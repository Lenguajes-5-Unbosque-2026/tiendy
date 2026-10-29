import { Suspense } from "react";

import datos from "@/lib/mock/datos.json";

import { ProductoDetalle } from "./ProductoDetalle";

export function generateStaticParams() {
  return datos.productos.map((p) => ({ id: p.id }));
}

/** Ver y editar producto (42). */
export default function ProductoPage({ params }: PageProps<"/inventario/[id]">) {
  // Leer `params` dentro de Suspense deja la navegación instantánea
  return (
    <Suspense>
      <Producto params={params} />
    </Suspense>
  );
}

async function Producto({ params }: Pick<PageProps<"/inventario/[id]">, "params">) {
  const { id } = await params;
  return <ProductoDetalle id={id} />;
}
