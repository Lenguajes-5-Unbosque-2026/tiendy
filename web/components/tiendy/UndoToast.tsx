"use client";

import { useTienda } from "@/lib/tienda/store";
import { pesos } from "@/lib/formato";
import type { MedioPago } from "@/lib/mock/tipos";

const nombreMedio: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  fiado: "Fiado",
};

/** Aviso con Deshacer (22): "Venta anotada · $11.500 · Efectivo · inventario actualizado". */
export function UndoToast() {
  const { aviso, deshacerVenta } = useTienda();
  if (!aviso) return null;

  const medio =
    aviso.medioPago === "fiado" && aviso.cliente
      ? `Fiado a ${aviso.cliente}`
      : nombreMedio[aviso.medioPago];

  return (
    <div className="absolute inset-x-0 bottom-full px-espacio-4 pb-espacio-3">
      <div
        role="status"
        className="flex items-center gap-espacio-3 rounded-lg bg-fondo-aviso py-espacio-3 pr-espacio-3 pl-espacio-4 text-texto-inverso"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-cuerpo-fuerte">Venta anotada · {pesos(aviso.total)}</span>
          <span className="truncate text-secundario text-texto-inverso/70">
            {medio} · inventario actualizado
          </span>
        </span>
        <button
          type="button"
          onClick={() => deshacerVenta(aviso.ventaId)}
          className="h-alto-chip shrink-0 rounded-md bg-texto-inverso/15 px-espacio-4 text-chip text-texto-inverso"
        >
          Deshacer
        </button>
      </div>
    </div>
  );
}
