"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Clock, Smartphone } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { pesos } from "@/lib/formato";
import type { MedioPagoGasto } from "@/lib/mock/tipos";
import { enDias, nombreCategoria, proximaVisita } from "@/lib/tienda/gastos";
import { useTienda } from "@/lib/tienda/store";

type Plazo = "visita" | "8" | "15";

/** ¿Cómo lo pagaste? (31): efectivo de la caja, transferencia o quedé debiendo. */
export default function PagoGastoPage() {
  const router = useRouter();
  const { borradorGasto: b, proveedores, anotarGasto } = useTienda();
  const [medio, setMedio] = useState<MedioPagoGasto | null>(null);
  const [plazo, setPlazo] = useState<Plazo | null>(null);
  const [guardado, setGuardado] = useState(false);

  // Al registrar, el borrador se vacía mientras se pasa a 32
  if (guardado) return null;

  if (b.monto === 0 || !b.categoria) {
    return (
      <AppScreen title="¿Cómo lo pagaste?" back="/gasto" withNav={false}>
        <p className="text-cuerpo text-texto-secundario">
          Primero anota cuánto fue el gasto.{" "}
          <Link href="/gasto" className="font-bold text-texto-primario">
            Registrar gasto
          </Link>
        </p>
      </AppScreen>
    );
  }

  const proveedor = proveedores.find((p) => p.id === b.proveedorId);
  const visita = proximaVisita(proveedor);
  const fechas: Record<Plazo, string | null> = { visita, "8": enDias(8), "15": enDias(15) };
  const listo = medio !== null && (medio !== "quede_debiendo" || plazo !== null);

  const registrar = () => {
    if (!medio) return;
    setGuardado(true);
    anotarGasto({ medio, pagarAntesDe: plazo ? fechas[plazo] : null });
    router.replace("/gasto/listo");
  };

  const opciones: { valor: MedioPagoGasto; titulo: string; detalle?: string; icono: typeof Banknote }[] = [
    { valor: "efectivo", titulo: "Efectivo de la caja", icono: Banknote },
    { valor: "transferencia", titulo: "Transferencia", detalle: "Nequi, Daviplata o banco", icono: Smartphone },
    { valor: "quede_debiendo", titulo: "Quedé debiendo", detalle: "Se guarda como cuenta por pagar", icono: Clock },
  ];

  return (
    <AppScreen
      title="¿Cómo lo pagaste?"
      back={() => router.back()}
      withNav={false}
      footer={
        <Button disabled={!listo} onClick={registrar}>
          Registrar gasto
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-espacio-1 rounded-xl bg-fondo-tarjeta p-espacio-5 text-center">
        <span className="text-secundario text-texto-secundario">Gasto</span>
        <span className="text-monto-xl text-texto-principal">{pesos(b.monto)}</span>
        <span className="text-secundario text-texto-secundario">
          {[nombreCategoria(b.categoria), proveedor?.nombre].filter(Boolean).join(" · ")}
        </span>
      </div>

      <div role="radiogroup" aria-label="Cómo lo pagaste" className="flex flex-col gap-espacio-3">
        {opciones.map((o) => (
          <ListItem
            key={o.valor}
            leading={<IconBadge icon={o.icono} />}
            titulo={o.titulo}
            detalle={o.detalle}
            elegida={medio === o.valor}
            onClick={() => setMedio(o.valor)}
          />
        ))}
      </div>

      {medio === "quede_debiendo" && (
        <div className="flex flex-col gap-espacio-3">
          <h2 className="text-cuerpo-fuerte text-texto-principal">¿Cuándo tienes que pagar?</h2>
          <ChoiceChips
            etiqueta="Cuándo tienes que pagar"
            opciones={[
              // Sin proveedor con día de visita no hay "próxima visita"
              { valor: "visita", etiqueta: "Próxima visita", disabled: !visita },
              { valor: "8", etiqueta: "En 8 días" },
              { valor: "15", etiqueta: "En 15 días" },
            ]}
            valor={plazo}
            onChange={setPlazo}
          />
        </div>
      )}
    </AppScreen>
  );
}
