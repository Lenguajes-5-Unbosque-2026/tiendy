"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { DetailCard } from "@/components/tiendy/DetailCard";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { SuccessHero } from "@/components/tiendy/SuccessHero";
import { leerPesos, pesos } from "@/lib/formato";
import type { Abono } from "@/lib/mock/tipos";
import { deudaCliente } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";

type Medio = Abono["medio_pago"];
type Rapido = "todo" | "mitad" | "10000" | "20000";

const medios: { valor: Medio; etiqueta: string }[] = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Transferencia" },
];

/** Nombre corto para los textos: "Don Carlos Pérez" → "Don Carlos". */
const nombreCorto = (nombre: string) => nombre.split(/\s+/).slice(0, 2).join(" ");

export function RegistrarAbono({ id }: { id: string }) {
  const { clientes, ventas, abonos, tienda, registrarAbono } = useTienda();
  const cliente = clientes.find((c) => c.id === id);
  const [monto, setMonto] = useState<number | null>(null);
  const [rapido, setRapido] = useState<Rapido | null>(null);
  const [medio, setMedio] = useState<Medio>("efectivo");
  const [guardado, setGuardado] = useState<{ monto: number; medio: Medio; queda: number } | null>(null);

  if (!cliente) {
    return (
      <AppScreen title="Abono" back="/fiados">
        <p className="text-cuerpo text-texto-secundario">No encontramos este cliente.</p>
      </AppScreen>
    );
  }

  const nombre = nombreCorto(cliente.nombre);

  // 40 · Resultado del abono
  if (guardado) {
    const saldada = guardado.queda === 0;
    const numero = cliente.celular?.replace(/\D/g, "");
    const comprobante = `Hola ${nombre}, en ${tienda.nombre} recibimos tu pago de ${pesos(guardado.monto)}. ${
      saldada ? "Quedaste a paz y salvo." : `Quedas debiendo ${pesos(guardado.queda)}.`
    }`;
    return (
      <AppScreen
        title="Listo"
        footer={
          <Link href="/fiados" className={buttonVariants()}>
            Volver a fiados
          </Link>
        }
      >
        <SuccessHero
          titulo={saldada ? `¡${nombre} quedó a paz y salvo!` : `Abono anotado`}
          texto={
            saldada
              ? "El pago ya está sumado a la caja de hoy. No cuenta como venta nueva."
              : `${nombre} queda debiendo ${pesos(guardado.queda)}. El pago ya está sumado a la caja de hoy.`
          }
        />
        <DetailCard
          filas={[
            { etiqueta: "Pagó", valor: pesos(guardado.monto) },
            { etiqueta: "Medio", valor: guardado.medio === "efectivo" ? "Efectivo" : "Transferencia" },
            { etiqueta: "Se anotó como", valor: "Pago de fiado", tono: "primario" },
            { etiqueta: "Deuda pendiente", valor: pesos(guardado.queda) },
          ]}
        />
        {numero && (
          <ListItem
            leading={<IconBadge icon={MessageSquare} />}
            titulo="Mandarle comprobante"
            detalle="Por WhatsApp"
            flecha
            href={`https://wa.me/${numero}?text=${encodeURIComponent(comprobante)}`}
          />
        )}
      </AppScreen>
    );
  }

  // 39 · Registrar abono
  const deuda = deudaCliente(cliente.id, ventas, abonos);
  const montos: Record<Rapido, number> = {
    todo: deuda,
    mitad: Math.round(deuda / 2),
    "10000": 10000,
    "20000": 20000,
  };
  const opciones = (
    [
      { valor: "todo", etiqueta: "Pagó todo" },
      { valor: "mitad", etiqueta: "La mitad" },
      { valor: "10000", etiqueta: "$10.000" },
      { valor: "20000", etiqueta: "$20.000" },
    ] as const
  ).filter((o) => montos[o.valor] <= deuda);

  const valido = monto !== null && monto > 0 && monto <= deuda;
  const queda = Math.max(0, deuda - (monto ?? 0));

  const guardar = () => {
    if (!valido) return;
    registrarAbono({ clienteId: cliente.id, monto, medioPago: medio });
    setGuardado({ monto, medio, queda: deuda - monto });
  };

  return (
    <AppScreen
      title="Abono"
      subtitle={`${nombre} · debe ${pesos(deuda)}`}
      back={`/fiados/${cliente.id}`}
      withNav={false}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <p className="text-center text-secundario text-texto-secundario">
            Este pago entra a la caja. No es una venta nueva.
          </p>
          <Button disabled={!valido} onClick={guardar}>
            Guardar abono
          </Button>
        </div>
      }
    >
      <label className="flex flex-col items-center gap-espacio-1 rounded-xl bg-fondo-tarjeta p-espacio-5 text-center">
        <span className="text-cuerpo text-texto-secundario">¿Cuánto te paga?</span>
        <input
          inputMode="numeric"
          value={monto === null ? "" : pesos(monto)}
          onChange={(e) => {
            setMonto(leerPesos(e.target.value));
            setRapido(null);
          }}
          placeholder="$0"
          className="w-full bg-transparent text-center text-monto-xl text-texto-principal outline-none placeholder:text-texto-sutil"
        />
      </label>

      <ChoiceChips
        etiqueta="Montos rápidos"
        valor={rapido}
        onChange={(v) => {
          setRapido(v);
          setMonto(montos[v]);
        }}
        opciones={[...opciones]}
      />

      {monto !== null && monto > deuda && (
        <p className="text-secundario text-texto-peligro">
          El abono es mayor que la deuda ({pesos(deuda)}).
        </p>
      )}

      <DetailCard
        filas={[
          { etiqueta: "Deuda actual", valor: pesos(deuda) },
          { etiqueta: "Abono", valor: `−${pesos(monto ?? 0)}`, tono: "primario" },
          { etiqueta: "Queda debiendo", valor: pesos(queda), total: true },
        ]}
      />

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte">¿Cómo te paga?</h2>
        <ChoiceChips etiqueta="¿Cómo te paga?" opciones={medios} valor={medio} onChange={setMedio} />
      </section>
    </AppScreen>
  );
}
