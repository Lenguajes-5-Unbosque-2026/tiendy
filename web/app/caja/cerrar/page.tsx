"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertBanner } from "@/components/tiendy/AlertBanner";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { leerPesos, pesos } from "@/lib/formato";
import type { MotivoDiferencia } from "@/lib/mock/tipos";
import { cajaDelTurno } from "@/lib/tienda/calculos";
import { filtrosHoy } from "@/lib/tienda/cuaderno";
import { useTienda } from "@/lib/tienda/store";

const MOTIVOS_FALTANTE: { valor: MotivoDiferencia; etiqueta: string }[] = [
  { valor: "olvide_un_gasto", etiqueta: "Olvidé anotar un gasto" },
  { valor: "di_mal_vueltas", etiqueta: "Di mal unas vueltas" },
  { valor: "no_se", etiqueta: "No sé" },
];

// Si sobra plata no aplica "olvidé un gasto"
const MOTIVOS_SOBRANTE = MOTIVOS_FALTANTE.filter((m) => m.valor !== "olvide_un_gasto");

/** Cierre de caja (18): se cuenta el efectivo y queda la diferencia con su motivo. */
export default function CerrarCajaPage() {
  const router = useRouter();
  const { ventas, gastos, turnoAbierto, cerrarTurno, setFiltros } = useTienda();
  const [contado, setContado] = useState<number | null>(null);
  const [motivo, setMotivo] = useState<MotivoDiferencia | null>(null);
  const [cerrando, setCerrando] = useState(false);

  // Al confirmar, el turno deja de estar abierto mientras se pasa a 19
  if (cerrando) return null;

  if (!turnoAbierto) {
    return (
      <AppScreen title="Cerrar caja" back="/caja" withNav={false}>
        <p className="text-cuerpo text-texto-secundario">No hay una caja abierta.</p>
      </AppScreen>
    );
  }

  const caja = cajaDelTurno(turnoAbierto, ventas, gastos);
  const diferencia = contado === null ? null : contado - caja.esperado;

  const confirmar = () => {
    if (contado === null) return;
    setCerrando(true);
    cerrarTurno(contado, motivo);
    router.replace("/caja/cerrada");
  };

  return (
    <AppScreen
      title="Cerrar caja"
      back="/caja"
      withNav={false}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Button disabled={contado === null} onClick={confirmar}>
            Confirmar cierre
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFiltros({ ...filtrosHoy, turnoId: turnoAbierto.id });
              router.push("/cuaderno");
            }}
          >
            Revisar movimientos
          </Button>
        </div>
      }
    >
      <dl className="flex flex-col gap-espacio-3 rounded-xl bg-fondo-tarjeta p-espacio-4">
        <div className="flex items-center justify-between gap-espacio-3 border-b border-borde-default pb-espacio-3">
          <dt className="text-cuerpo text-texto-secundario">Debería haber en efectivo</dt>
          <dd className="text-monto-m text-texto-principal">{pesos(caja.esperado)}</dd>
        </div>
        <div className="flex items-center justify-between gap-espacio-3">
          <dt className="text-cuerpo text-texto-secundario">Transferencias del día</dt>
          <dd className="text-cuerpo-fuerte text-texto-principal">
            {pesos(caja.porMedio.transferencia)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-espacio-2">
        <label htmlFor="contado" className="text-valor text-texto-principal">
          ¿Cuánto efectivo contaste?
        </label>
        <p className="text-secundario text-texto-secundario">
          Base + ventas en efectivo − gastos en efectivo. Cuenta billetes y monedas.
        </p>
        <Input
          id="contado"
          inputMode="numeric"
          placeholder="$0"
          value={contado === null ? "" : pesos(contado)}
          onChange={(e) => {
            setContado(leerPesos(e.target.value));
            setMotivo(null);
          }}
          className="text-valor"
        />
      </div>

      {diferencia !== null && diferencia === 0 && (
        <AlertBanner tono="exito" titulo="La caja cuadra" detalle="Tienes justo lo que debería haber" />
      )}

      {diferencia !== null && diferencia !== 0 && (
        <>
          <AlertBanner
            tono="advertencia"
            titulo={diferencia < 0 ? `Faltan ${pesos(-diferencia)}` : `Sobran ${pesos(diferencia)}`}
            detalle={
              diferencia < 0
                ? "Revisa si olvidaste anotar algún gasto"
                : "Revisa si olvidaste anotar alguna venta"
            }
          />
          <div className="flex flex-col gap-espacio-3">
            <p className="text-cuerpo-fuerte text-texto-principal">
              ¿Por qué crees que {diferencia < 0 ? "falta" : "sobra"}? (le avisamos a la dueña)
            </p>
            <ChoiceChips
              etiqueta="Motivo de la diferencia"
              opciones={diferencia < 0 ? MOTIVOS_FALTANTE : MOTIVOS_SOBRANTE}
              valor={motivo}
              onChange={setMotivo}
            />
          </div>
        </>
      )}
    </AppScreen>
  );
}
