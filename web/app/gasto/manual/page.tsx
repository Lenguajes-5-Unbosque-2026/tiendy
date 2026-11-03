"use client";

import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { NumberPad } from "@/components/tiendy/NumberPad";
import { pesos } from "@/lib/formato";
import { CATEGORIAS_GASTO } from "@/lib/tienda/gastos";
import { useTienda } from "@/lib/tienda/store";

/** Gasto manual (29): monto con el teclado, categoría y una nota si quiere. */
export default function GastoManualPage() {
  const router = useRouter();
  const { borradorGasto: b, setBorradorGasto } = useTienda();
  const listo = b.monto > 0 && b.categoria !== null;

  return (
    <AppScreen
      title="Gasto manual"
      back="/gasto"
      withNav={false}
      footer={
        <Button disabled={!listo} onClick={() => router.push("/gasto/pago")}>
          Continuar
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-espacio-1 rounded-xl bg-fondo-tarjeta p-espacio-5 text-center">
        <span className="text-secundario text-texto-secundario">¿Cuánto gastaste?</span>
        <span aria-live="polite" className="text-monto-xl text-texto-principal">
          {pesos(b.monto)}
        </span>
      </div>

      <NumberPad valor={b.monto} onChange={(monto) => setBorradorGasto({ ...b, monto, canal: "manual" })} />

      <div className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte text-texto-principal">Categoría</h2>
        <ChoiceChips
          etiqueta="Categoría del gasto"
          opciones={CATEGORIAS_GASTO}
          valor={b.categoria}
          onChange={(categoria) => setBorradorGasto({ ...b, categoria })}
        />
      </div>

      <Input
        aria-label="Nota"
        placeholder="Nota (opcional)"
        value={b.nota}
        maxLength={120}
        onChange={(e) => setBorradorGasto({ ...b, nota: e.target.value })}
      />
    </AppScreen>
  );
}
