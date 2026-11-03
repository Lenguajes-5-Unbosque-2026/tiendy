"use client";

import { Chip } from "@/components/tiendy/ChoiceChips";
import { pesos } from "@/lib/formato";
import { HOY, ultimoCierre } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";

const BASES = [50000, 80000, 100000];

type BaseDelDiaProps = {
  base: number;
  onChange: (base: number) => void;
};

/** Base del día con montos rápidos e "Igual que ayer" (16 y la hoja 09a). */
export function BaseDelDia({ base, onChange }: BaseDelDiaProps) {
  const { turnos } = useTienda();
  const cierre = ultimoCierre(turnos);
  const igualQueAyer = cierre?.efectivo_contado ?? null;

  return (
    <>
      <div className="flex flex-col items-center gap-espacio-1 rounded-xl bg-fondo-tarjeta p-espacio-5 text-center">
        <span className="text-cuerpo text-texto-secundario">Base del día</span>
        <span aria-live="polite" className="text-monto-xl text-texto-principal">
          {pesos(base)}
        </span>
        {cierre && igualQueAyer !== null && (
          <span className="text-secundario text-texto-secundario">
            {cierre.fecha === HOY ? "Hoy cerraste con" : "Ayer cerraste con"} {pesos(igualQueAyer)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-espacio-2">
        {BASES.map((monto) => (
          <Chip key={monto} elegido={base === monto} onClick={() => onChange(monto)}>
            {pesos(monto)}
          </Chip>
        ))}
        {igualQueAyer !== null && (
          <Chip
            elegido={base === igualQueAyer && !BASES.includes(igualQueAyer)}
            onClick={() => onChange(igualQueAyer)}
          >
            Igual que ayer
          </Chip>
        )}
      </div>
    </>
  );
}
