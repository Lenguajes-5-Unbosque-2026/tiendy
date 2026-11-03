"use client";

import { useState } from "react";
import Link from "next/link";

import { BaseDelDia } from "@/components/caja/BaseDelDia";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useTienda } from "@/lib/tienda/store";

type AbrirCajaSheetProps = {
  abierta: boolean;
  onOpenChange: (abierta: boolean) => void;
};

/**
 * Abrir caja en hoja (09a), desde el Home: el atajo de la dueña. Si atiende
 * otra persona o quiere escribir otro monto, va a la pantalla completa (16a → 16).
 */
export function AbrirCajaSheet({ abierta, onOpenChange }: AbrirCajaSheetProps) {
  const { personas, abrirTurno } = useTienda();
  const [base, setBase] = useState(0);
  const duena = personas.find((p) => p.rol === "duena" && p.activo);

  return (
    <Drawer open={abierta} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="mx-auto w-full max-w-pantalla border-0 bg-fondo-app data-[swipe-direction=down]:rounded-t-2xl">
        <div className="flex flex-col gap-espacio-4 px-espacio-5 pt-espacio-3 pb-[max(var(--espacio-5),env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-titulo-2 text-texto-principal">Abrir caja</DrawerTitle>
            <DrawerClose className="text-cuerpo-fuerte text-texto-primario">Cancelar</DrawerClose>
          </div>
          <h2 className="text-titulo-2 text-texto-principal">¿Con cuánto efectivo empiezas hoy?</h2>

          <BaseDelDia base={base} onChange={setBase} />

          <Link
            href="/caja/abrir"
            onClick={() => onOpenChange(false)}
            className="text-secundario font-bold text-texto-primario"
          >
            Atiende otra persona u otro monto
          </Link>

          <Button
            disabled={!duena}
            onClick={() => {
              abrirTurno(duena!.id, base);
              onOpenChange(false);
            }}
          >
            Abrir caja
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
