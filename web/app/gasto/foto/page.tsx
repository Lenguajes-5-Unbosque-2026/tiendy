"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { leerPesos, pesos } from "@/lib/formato";
import { CATEGORIAS_GASTO } from "@/lib/tienda/gastos";
import { useTienda } from "@/lib/tienda/store";

/**
 * Foto del recibo (30). Todavía no hay lectura automática del recibo: la foto
 * queda de referencia y la persona revisa proveedor, monto y categoría.
 */
export default function GastoFotoPage() {
  const router = useRouter();
  const { borradorGasto: b, setBorradorGasto, proveedores } = useTienda();
  const [foto, setFoto] = useState<string | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const listo = b.monto > 0 && b.categoria !== null;

  useEffect(() => () => {
    if (foto) URL.revokeObjectURL(foto);
  }, [foto]);

  return (
    <AppScreen
      title="Foto del recibo"
      back="/gasto"
      withNav={false}
      footer={
        <Button disabled={!listo} onClick={() => router.push("/gasto/pago")}>
          Continuar
        </Button>
      }
    >
      <button
        type="button"
        onClick={() => archivo.current?.click()}
        className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-fondo-aviso p-espacio-6"
      >
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto local recién tomada
          <img src={foto} alt="Foto del recibo" className="max-h-full rounded-md object-contain" />
        ) : (
          <span className="flex size-full items-center justify-center rounded-lg border-2 border-dashed border-texto-inverso px-espacio-4 text-cuerpo text-texto-inverso">
            Encuadra la factura o el recibo
          </span>
        )}
      </button>
      <input
        ref={archivo}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFoto(URL.createObjectURL(f));
        }}
      />

      <section className="flex flex-col gap-espacio-3 rounded-xl bg-fondo-tarjeta p-espacio-4">
        <h2 className="text-secundario font-bold text-texto-secundario">
          Revisa lo del recibo · puedes corregirlo
        </h2>
        <label className="flex flex-col gap-espacio-1">
          <span className="text-cuerpo text-texto-secundario">Proveedor</span>
          <select
            value={b.proveedorId ?? ""}
            onChange={(e) => {
              const proveedorId = e.target.value || null;
              // Lo que se le compra a un proveedor casi siempre es mercancía
              setBorradorGasto({
                ...b,
                proveedorId,
                categoria: proveedorId && !b.categoria ? "mercancia" : b.categoria,
              });
            }}
            className="h-alto-campo rounded-md bg-fondo-sutil px-espacio-4 text-cuerpo text-texto-principal"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-espacio-1">
          <span className="text-cuerpo text-texto-secundario">Monto</span>
          <Input
            inputMode="numeric"
            placeholder="$0"
            value={b.monto ? pesos(b.monto) : ""}
            onChange={(e) => setBorradorGasto({ ...b, monto: leerPesos(e.target.value) ?? 0 })}
            className="text-valor"
          />
        </label>
        <div className="flex flex-col gap-espacio-2">
          <span className="text-cuerpo text-texto-secundario">Categoría</span>
          <ChoiceChips
            etiqueta="Categoría del gasto"
            opciones={CATEGORIAS_GASTO}
            valor={b.categoria}
            onChange={(categoria) => setBorradorGasto({ ...b, categoria })}
          />
        </div>
      </section>

      <p className="text-secundario text-texto-secundario">
        ¿Es mercancía para vender? Anótala en{" "}
        <Link href="/inventario/llego" className="font-bold text-texto-primario">
          Inventario › Llegó mercancía
        </Link>
        .
      </p>
    </AppScreen>
  );
}
