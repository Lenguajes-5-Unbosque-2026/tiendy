"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { inicial, pesos } from "@/lib/formato";
import type { AcuerdoPago } from "@/lib/mock/tipos";
import { deudaCliente } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";

const acuerdos: { valor: AcuerdoPago; etiqueta: string }[] = [
  { valor: "esta_semana", etiqueta: "Esta semana" },
  { valor: "quincena", etiqueta: "Quincena" },
  { valor: "fin_de_mes", etiqueta: "Fin de mes" },
];

const CLIENTES_A_LA_VISTA = 3;

/** Venta fiada (23): a quién se le fía y cuándo paga. */
export default function VentaFiadaPage() {
  const router = useRouter();
  const {
    borrador,
    productos,
    clientes,
    ventas,
    abonos,
    anotarVenta,
    guardarCliente,
    setVenderAbierto,
  } = useTienda();

  const total = borrador.lineas.reduce((s, l) => {
    const p = productos.find((x) => x.id === l.productoId);
    return s + (p ? p.precio_venta * l.cantidad : 0);
  }, 0);

  // Primero los que fiaron más recientemente
  const ordenados = useMemo(() => {
    const ultimoFiado = new Map<string, string>();
    for (const v of ventas) {
      if (v.medio_pago === "fiado" && v.cliente_id) ultimoFiado.set(v.cliente_id, v.fecha_hora);
    }
    return [...clientes].sort((a, b) =>
      (ultimoFiado.get(b.id) ?? b.creado_en).localeCompare(ultimoFiado.get(a.id) ?? a.creado_en)
    );
  }, [clientes, ventas]);

  const [clienteId, setClienteId] = useState<string | null>(ordenados[0]?.id ?? null);
  const [verTodos, setVerTodos] = useState(false);
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const elegido = clientes.find((c) => c.id === clienteId);
  const [acuerdo, setAcuerdo] = useState<AcuerdoPago | null>(elegido?.acuerdo_pago ?? null);

  // Sin venta armada no hay nada que fiar: vuelve al Home
  const sinVenta = borrador.lineas.length === 0;
  useEffect(() => {
    if (sinVenta) router.replace("/");
  }, [sinVenta, router]);
  if (sinVenta) return null;

  const elegirCliente = (id: string) => {
    setClienteId(id);
    setNombre("");
    setCelular("");
    setAcuerdo(clientes.find((c) => c.id === id)?.acuerdo_pago ?? null);
  };

  const escribirNombre = (valor: string) => {
    setNombre(valor);
    if (valor.trim()) setClienteId(null);
  };

  const listo = (clienteId !== null || nombre.trim() !== "") && acuerdo !== null;

  const registrar = () => {
    if (!listo || !acuerdo) return;
    const digitos = celular.replace(/\D/g, "");
    const id = clienteId
      ? guardarCliente({ id: clienteId, acuerdo })
      : guardarCliente({
          nombre: nombre.trim(),
          celular: digitos ? `+57${digitos}` : null,
          acuerdo,
        });
    anotarVenta({
      ...borrador,
      medioPago: "fiado",
      clienteId: id,
      clienteNombre: elegido?.nombre ?? nombre.trim(),
    });
    router.push("/");
  };

  const volverALaHoja = () => {
    router.push("/");
    setVenderAbierto(true);
  };

  const visibles = verTodos ? ordenados : ordenados.slice(0, CLIENTES_A_LA_VISTA);

  return (
    <AppScreen
      title="Venta fiada"
      back={volverALaHoja}
      withNav={false}
      footer={
        <Button disabled={!listo} onClick={registrar}>
          Registrar fiado
        </Button>
      }
    >
      <AmountCard centrada etiqueta="Fiado" monto={pesos(total)} />

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte">¿A quién le fías?</h2>
        <ul className="flex flex-col gap-espacio-2">
          {visibles.map((c) => {
            const deuda = deudaCliente(c.id, ventas, abonos);
            return (
              <li key={c.id}>
                <ListItem
                  leading={<IconBadge letra={inicial(c.nombre)} />}
                  titulo={c.nombre}
                  detalle={deuda > 0 ? `Ya te debe ${pesos(deuda)}` : "Al día"}
                  elegida={c.id === clienteId}
                  onClick={() => elegirCliente(c.id)}
                />
              </li>
            );
          })}
        </ul>
        {ordenados.length > CLIENTES_A_LA_VISTA && (
          <Button variant="ghost" size="sm" className="self-start px-0" onClick={() => setVerTodos(!verTodos)}>
            {verTodos ? "Ver menos clientes" : `Ver los ${ordenados.length} clientes`}
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-secundario text-texto-secundario">O crea un cliente nuevo</h2>
        <Input
          value={nombre}
          onChange={(e) => escribirNombre(e.target.value)}
          placeholder="Nombre del cliente"
          aria-label="Nombre del cliente"
          autoComplete="off"
        />
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-espacio-4 -translate-y-1/2 text-cuerpo text-texto-principal">
            +57
          </span>
          <Input
            type="tel"
            inputMode="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Celular (opcional)"
            aria-label="Celular (opcional)"
            className="pl-[calc(var(--espacio-4)+var(--espacio-6)+var(--espacio-3))]"
          />
        </div>
      </section>

      <section className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte">¿Cuándo te paga?</h2>
        <ChoiceChips etiqueta="¿Cuándo te paga?" opciones={acuerdos} valor={acuerdo} onChange={setAcuerdo} />
      </section>
    </AppScreen>
  );
}
