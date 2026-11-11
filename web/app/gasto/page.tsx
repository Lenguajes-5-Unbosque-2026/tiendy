"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Mic, Pencil, Wallet } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/tiendy/ChoiceChips";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { CATEGORIAS_GASTO } from "@/lib/tienda/gastos";
import { borradorGastoVacio, useTienda } from "@/lib/tienda/store";

/** Registrar gasto (27): por voz, a mano o con la foto del recibo. */
export default function RegistrarGastoPage() {
  const router = useRouter();
  const { turnoAbierto, setBorradorGasto } = useTienda();

  if (!turnoAbierto) {
    return (
      <AppScreen title="Registrar gasto" back="/" withNav={false}>
        {/* Cada gasto queda en un turno, como las ventas */}
        <EmptyState
          icon={Wallet}
          titulo="La caja está cerrada"
          texto="Para anotar un gasto primero abre la caja."
          accion={
            <Link href="/caja/abrir" className={buttonVariants()}>
              Abrir caja
            </Link>
          }
        />
      </AppScreen>
    );
  }

  const empezar = (ruta: string, canal: "voz" | "manual" | "foto") => {
    setBorradorGasto({ ...borradorGastoVacio, canal });
    router.push(ruta);
  };

  return (
    <AppScreen title="Registrar gasto" back="/" withNav={false}>
      <h2 className="text-titulo-2 text-texto-principal">¿Cómo quieres anotar el gasto?</h2>

      <div className="flex flex-col gap-espacio-3">
        <ListItem
          elegida
          leading={<IconBadge icon={Mic} />}
          titulo="Por voz"
          detalle='Di: "pagué 20.000 de transporte"'
          flecha
          onClick={() => empezar("/gasto/voz", "voz")}
        />
        <ListItem
          leading={<IconBadge icon={Pencil} />}
          titulo="A mano"
          detalle="Monto y categoría"
          flecha
          onClick={() => empezar("/gasto/manual", "manual")}
        />
        <ListItem
          leading={<IconBadge icon={Camera} />}
          titulo="Foto del recibo"
          detalle="Toma la foto y revisa el monto"
          flecha
          onClick={() => empezar("/gasto/foto", "foto")}
        />
      </div>

      <div className="flex flex-col gap-espacio-3">
        <h3 className="text-secundario text-texto-secundario">Gastos frecuentes</h3>
        {/* Un gasto frecuente abre el gasto a mano con la categoría ya elegida */}
        <div className="flex flex-wrap gap-espacio-2">
          {CATEGORIAS_GASTO.map((c) => (
            <Chip
              key={c.valor}
              onClick={() => {
                setBorradorGasto({ ...borradorGastoVacio, categoria: c.valor });
                router.push("/gasto/manual");
              }}
            >
              {c.etiqueta}
            </Chip>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
