"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button, buttonVariants } from "@/components/ui/button";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { SuccessHero } from "@/components/tiendy/SuccessHero";
import { hora, pesos } from "@/lib/formato";
import { HOY, resultadoDelTurno, ultimoCierre } from "@/lib/tienda/calculos";
import { filtrosHoy } from "@/lib/tienda/cuaderno";
import { useTienda } from "@/lib/tienda/store";

/** Resultado del cierre (19): el turno que se acaba de cerrar. */
export default function CajaCerradaPage() {
  const router = useRouter();
  const { turnos, personas, ventas, ventaProductos, gastos, setFiltros } = useTienda();
  const turno = ultimoCierre(turnos);

  if (!turno) {
    return (
      <AppScreen title="Caja cerrada">
        <p className="text-cuerpo text-texto-secundario">Todavía no hay cierres de caja.</p>
      </AppScreen>
    );
  }

  const persona = personas.find((p) => p.id === turno.persona_id);
  const resultado = resultadoDelTurno(turno, ventas, ventaProductos, gastos);
  const { diferencia } = resultado;
  const dia = turno.fecha === HOY ? "Hoy" : turno.fecha;

  return (
    <AppScreen
      title="Caja cerrada"
      subtitle={`${dia} · ${hora(turno.abierto_en)} a ${hora(turno.cerrado_en!)}`}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Button
            variant="secondary"
            onClick={() => {
              setFiltros({ ...filtrosHoy, turnoId: turno.id });
              router.push("/cuaderno");
            }}
          >
            Ver el cuaderno del día
          </Button>
          <Link href="/" className={buttonVariants()}>
            Finalizar
          </Link>
        </div>
      }
    >
      <SuccessHero titulo={`Turno cerrado, ${persona?.nombre_corto ?? ""}`} />

      <div className="grid grid-cols-2 gap-espacio-3">
        <AmountCard compacta montoPrimario etiqueta="Vendido" monto={pesos(resultado.vendido)} />
        <AmountCard compacta etiqueta="Gastos" monto={pesos(resultado.gastos)} />
        <AmountCard
          compacta
          montoPrimario
          etiqueta="Ganancia del día"
          monto={pesos(resultado.ganancia)}
          className="bg-fondo-exito-suave"
        />
        {/* Naranja solo si faltó plata: es una alerta, no un gasto */}
        <AmountCard
          compacta
          montoAdvertencia={diferencia < 0}
          etiqueta="Diferencia de caja"
          monto={diferencia > 0 ? `+${pesos(diferencia)}` : pesos(diferencia)}
          className={diferencia < 0 ? "bg-fondo-advertencia-suave" : undefined}
        />
      </div>
    </AppScreen>
  );
}
