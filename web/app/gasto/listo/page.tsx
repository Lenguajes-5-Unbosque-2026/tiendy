"use client";

import Link from "next/link";
import { Package } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { buttonVariants } from "@/components/ui/button";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { SuccessHero } from "@/components/tiendy/SuccessHero";
import { fechaLarga, pesos } from "@/lib/formato";
import { nombreCategoria, nombreMedioGasto } from "@/lib/tienda/gastos";
import { useTienda } from "@/lib/tienda/store";

/** Gasto registrado (32): el resumen del gasto que se acaba de anotar. */
export default function GastoListoPage() {
  const { gastos, proveedores } = useTienda();
  const gasto = gastos.at(-1);

  if (!gasto) {
    return (
      <AppScreen title="Listo">
        <p className="text-cuerpo text-texto-secundario">Todavía no hay gastos.</p>
      </AppScreen>
    );
  }

  const proveedor = proveedores.find((p) => p.id === gasto.proveedor_id);
  const filas: [string, string][] = [
    ["Monto", pesos(gasto.monto)],
    ["Categoría", nombreCategoria(gasto.categoria)],
    ...(proveedor ? [["Proveedor", proveedor.nombre] as [string, string]] : []),
    ["Pago", nombreMedioGasto[gasto.medio_pago]],
    ...(gasto.pagar_antes_de
      ? [["Pagar antes de", fechaLarga(gasto.pagar_antes_de)] as [string, string]]
      : []),
  ];

  return (
    <AppScreen
      title="Listo"
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Link href="/gasto" className={buttonVariants()}>
            Registrar otro gasto
          </Link>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Ir al inicio
          </Link>
        </div>
      }
    >
      <SuccessHero titulo="¡Gasto anotado!" />

      <dl className="flex flex-col gap-espacio-2 rounded-xl bg-fondo-tarjeta p-espacio-4">
        {filas.map(([etiqueta, valor], i) => (
          <div key={etiqueta} className="flex items-center justify-between gap-espacio-3">
            <dt className="text-cuerpo text-texto-secundario">{etiqueta}</dt>
            <dd className={i === 0 ? "text-monto-m text-texto-principal" : "text-cuerpo-fuerte font-bold text-texto-principal"}>
              {valor}
            </dd>
          </div>
        ))}
      </dl>

      {/* Un gasto no suma productos: la mercancía para vender entra por Llegó mercancía (41a) */}
      {gasto.categoria === "mercancia" && (
        <ListItem
          leading={<IconBadge icon={Package} />}
          titulo="¿Llegaron productos para vender?"
          detalle="Súmalos en Llegó mercancía"
          flecha
          href="/inventario/llego"
          className="bg-fondo-primario-suave"
        />
      )}
    </AppScreen>
  );
}
