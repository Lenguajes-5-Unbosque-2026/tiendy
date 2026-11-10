"use client";

import { useTienda } from "@/lib/tienda/store";
import { pesos } from "@/lib/formato";
import type { MedioPago } from "@/lib/mock/tipos";

const nombreMedio: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};

const botonAviso =
  "h-alto-chip shrink-0 rounded-md bg-texto-inverso/15 px-espacio-4 text-chip text-texto-inverso";

/**
 * Aviso con Deshacer (22): "Venta anotada · $11.500 · Efectivo · inventario actualizado".
 * Mientras se guarda en Supabase dice "Guardando…"; si falla, ofrece reintentar.
 */
export function UndoToast() {
  const { aviso, deshacerVenta, reintentarVenta, cerrarAviso } = useTienda();
  if (!aviso) return null;

  let titulo: string;
  let detalle: string;
  let boton: { texto: string; accion: () => void };

  if (aviso.tipo === "error") {
    titulo = aviso.texto;
    detalle = "Revisa tu conexión a internet";
    boton = { texto: "Cerrar", accion: cerrarAviso };
  } else if (aviso.guardado === "error") {
    titulo = `No pudimos guardar la venta · ${pesos(aviso.total)}`;
    detalle = "Quedó en este celular. Revisa tu conexión";
    boton = { texto: "Reintentar", accion: () => reintentarVenta(aviso.ventaId) };
  } else {
    titulo = `Venta anotada · ${pesos(aviso.total)}`;
    detalle =
      aviso.guardado === "guardando"
        ? "Guardando…"
        : `${nombreMedio[aviso.medioPago]} · inventario actualizado`;
    boton = { texto: "Deshacer", accion: () => deshacerVenta(aviso.ventaId) };
  }

  return (
    <div className="absolute inset-x-0 bottom-full px-espacio-4 pb-espacio-3">
      <div
        role={aviso.tipo === "error" || aviso.guardado === "error" ? "alert" : "status"}
        className="flex items-center gap-espacio-3 rounded-lg bg-fondo-aviso py-espacio-3 pr-espacio-3 pl-espacio-4 text-texto-inverso"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-cuerpo-fuerte">{titulo}</span>
          <span className="truncate text-secundario text-texto-inverso/70">{detalle}</span>
        </span>
        <button type="button" onClick={boton.accion} className={botonAviso}>
          {boton.texto}
        </button>
      </div>
    </div>
  );
}
