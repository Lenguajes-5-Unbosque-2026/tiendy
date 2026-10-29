import datos from "@/lib/mock/datos.json";

import { ProductoDetalle } from "./ProductoDetalle";

export function generateStaticParams() {
  return datos.productos.map((p) => ({ id: p.id }));
}

/** Ver y editar producto (42). */
export default async function ProductoPage({ params }: PageProps<"/inventario/[id]">) {
  const { id } = await params;
  return <ProductoDetalle id={id} />;
}
