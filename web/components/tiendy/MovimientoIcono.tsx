import { Banknote, Package, Receipt, Wallet } from "lucide-react";

import { IconBadge, type TonoBadge } from "@/components/tiendy/IconBadge";
import type { TipoMovimiento } from "@/lib/tienda/cuaderno";

const iconos: Record<TipoMovimiento, { icon: typeof Banknote; tono: TonoBadge }> = {
  venta: { icon: Banknote, tono: "primario" },
  // El gasto se distingue por el monto en negativo; el ícono ya no va en rojo (diseño v4)
  gasto: { icon: Receipt, tono: "neutro" },
  mercancia: { icon: Package, tono: "primario" },
  caja: { icon: Wallet, tono: "neutro" },
};

/** Ícono en círculo de cada tipo de movimiento del cuaderno (33, 36). */
export function MovimientoIcono({ tipo, tamano }: { tipo: TipoMovimiento; tamano?: "m" | "l" }) {
  return <IconBadge {...iconos[tipo]} tamano={tamano} />;
}
