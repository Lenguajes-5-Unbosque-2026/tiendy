import datos from "@/lib/mock/datos.json";

// Los clientes de los datos de prueba se generan al compilar; los que se creen
// en el celular se muestran al abrirlos.
export function generateStaticParams() {
  return datos.clientes.map((c) => ({ id: c.id }));
}

export default function ClienteLayout({ children }: LayoutProps<"/fiados/[id]">) {
  return children;
}
