import { Banknote, Package, Receipt, Wallet } from "lucide-react";

import { IconBadge, type TonoBadge } from "@/components/tiendy/IconBadge";
import type { TipoMovimiento } from "@/lib/tienda/cuaderno";

const iconos: Record<TipoMovimiento, { icon: typeof Banknote; tono: TonoBadge }> = {
  venta: { icon: Banknote, tono: "primario" },
  // El gasto va en naranja (ícono y monto) para distinguirlo de las ventas y la ganancia
  gasto: { icon: Receipt, tono: "advertenciaSuave" },
  mercancia: { icon: Package, tono: "primario" },
  caja: { icon: Wallet, tono: "neutro" },
};

/** Ícono en círculo de cada tipo de movimiento del cuaderno (33, 36). */
export function MovimientoIcono({ tipo, tamano }: { tipo: TipoMovimiento; tamano?: "m" | "l" }) {
  return <IconBadge {...iconos[tipo]} tamano={tamano} />;
}
