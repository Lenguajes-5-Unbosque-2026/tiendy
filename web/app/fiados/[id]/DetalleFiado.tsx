"use client";

import Link from "next/link";
import { Coins, HandCoins } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { buttonVariants } from "@/components/ui/button";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { celular, fechaCorta, pesos } from "@/lib/formato";
import { HOY, deudaCliente, movimientosCliente, textoAcuerdo } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

export function DetalleFiado({ id }: { id: string }) {
  const { clientes, ventas, ventaProductos, productos, abonos } = useTienda();
  const cliente = clientes.find((c) => c.id === id);

  if (!cliente) {
    return (
      <AppScreen title="Fiado" back="/fiados">
        <p className="text-cuerpo text-texto-secundario">No encontramos este cliente.</p>
      </AppScreen>
    );
  }

  const deuda = deudaCliente(cliente.id, ventas, abonos);
  const movimientos = movimientosCliente(cliente.id, ventas, ventaProductos, productos, abonos);
  const numero = cliente.celular?.replace(/\D/g, "");

  const acuerdo = cliente.acuerdo_pago
    ? `Acordó pagar ${cliente.acuerdo_pago === "quincena" ? "en quincena" : textoAcuerdo(cliente.acuerdo_pago)}${
        cliente.fecha_acuerdo ? ` (${fechaCorta(cliente.fecha_acuerdo)})` : ""
      }`
    : null;

  const accion = cn(buttonVariants({ variant: "secondary" }), "flex-1");

  return (
    <AppScreen
      title={cliente.nombre}
      subtitle={cliente.celular ? celular(cliente.celular) : undefined}
      back="/fiados"
      footer={
        deuda > 0 && (
          <Link href={`/fiados/${cliente.id}/abono`} className={buttonVariants()}>
            Abonar o pagar
          </Link>
        )
      }
    >
      <AmountCard centrada etiqueta={deuda > 0 ? "Te debe" : "Está a paz y salvo"} monto={pesos(deuda)}>
        {acuerdo && deuda > 0 && <span className="text-secundario text-texto-secundario">{acuerdo}</span>}
      </AmountCard>

      {/* Sin celular no se puede llamar ni escribir (cl03) */}
      {numero && (
        <div className="flex gap-espacio-3">
          <a href={`tel:+${numero}`} className={accion}>
            Llamar
          </a>
          <a href={`https://wa.me/${numero}`} target="_blank" rel="noreferrer" className={accion}>
            WhatsApp
          </a>
        </div>
      )}

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-secundario text-texto-secundario">Movimientos</h2>
        {movimientos.length === 0 ? (
          <p className="text-cuerpo text-texto-secundario">Todavía no hay movimientos.</p>
        ) : (
          <ul className="flex flex-col gap-espacio-3">
            {movimientos.map((m) => (
              <li key={m.id}>
                <ListItem
                  leading={
                    m.tipo === "fiado" ? (
                      <IconBadge icon={HandCoins} tono="neutro" />
                    ) : (
                      <IconBadge icon={Coins} />
                    )
                  }
                  titulo={m.titulo}
                  detalle={m.fecha.startsWith(HOY) ? "Hoy" : fechaCorta(m.fecha)}
                  valor={`${m.tipo === "fiado" ? "+" : "−"}${pesos(m.monto)}`}
                  valorTono={m.tipo === "abono" ? "primario" : "principal"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppScreen>
  );
}
