"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { pesos } from "@/lib/formato";
import { CATEGORIAS_GASTO, interpretarGasto, nombreCategoria } from "@/lib/tienda/gastos";
import { useTienda } from "@/lib/tienda/store";
import { useReconocimientoVoz } from "@/lib/tienda/useReconocimientoVoz";
import { cn } from "@/lib/utils";

const EJEMPLO = "Pagué 20.000 de transporte";

/** Gasto por voz (28): "pagué 20.000 de transporte" → monto y categoría. */
export default function GastoVozPage() {
  const router = useRouter();
  const { borradorGasto: b, setBorradorGasto } = useTienda();
  const [oido, setOido] = useState<string | null>(b.loQueDijo);
  const [cambiando, setCambiando] = useState(false);

  const alEscuchar = useCallback(
    (texto: string) => {
      const { monto, categoria } = interpretarGasto(texto);
      setOido(texto);
      setCambiando(false);
      setBorradorGasto((actual) => ({
        ...actual,
        canal: "voz",
        loQueDijo: texto,
        monto: monto ?? 0,
        categoria: categoria ?? actual.categoria,
      }));
    },
    [setBorradorGasto]
  );
  const voz = useReconocimientoVoz(alEscuchar);
  const escuchando = voz.estado === "escuchando";
  const listo = b.monto > 0 && b.categoria !== null;

  let estadoMic = "Toca para hablar";
  if (escuchando) estadoMic = "Escuchando…";
  else if (!voz.disponible) estadoMic = "Este navegador no tiene micrófono: usa el ejemplo o anótalo a mano";
  else if (voz.estado === "error") estadoMic = "No te escuché. Toca para intentar de nuevo";
  else if (oido) estadoMic = "Toca para decirlo otra vez";

  return (
    <AppScreen
      title="Gasto por voz"
      back="/gasto"
      withNav={false}
      footer={
        <Button disabled={!listo} onClick={() => router.push("/gasto/pago")}>
          Continuar
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-espacio-3 text-center">
        <button
          type="button"
          onClick={escuchando ? voz.detener : voz.escuchar}
          disabled={!voz.disponible}
          aria-label={escuchando ? "Dejar de escuchar" : "Hablar"}
          className={cn(
            "flex size-voz-halo items-center justify-center rounded-full bg-fondo-primario-suave",
            escuchando && "animate-pulse"
          )}
        >
          <span className="flex size-voz items-center justify-center rounded-full bg-fondo-primario text-texto-inverso">
            <Mic className="size-icono-xl" />
          </span>
        </button>
        <p aria-live="polite" className="text-cuerpo-fuerte text-texto-primario">
          {estadoMic}
        </p>
      </div>

      {oido && (
        <section className="flex flex-col gap-espacio-2 rounded-xl bg-fondo-tarjeta p-espacio-4">
          <h2 className="text-secundario font-bold text-texto-secundario">
            {b.monto > 0 ? "Entendí esto" : `No entendí el monto en “${oido}”`}
          </h2>
          <dl className="flex flex-col gap-espacio-2">
            <div className="flex items-center justify-between">
              <dt className="text-cuerpo text-texto-secundario">Monto</dt>
              <dd className="text-monto-m text-texto-principal">{pesos(b.monto)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-cuerpo text-texto-secundario">Categoría</dt>
              <dd>
                <button
                  type="button"
                  onClick={() => setCambiando((c) => !c)}
                  className="text-cuerpo-fuerte font-bold text-texto-primario"
                >
                  {b.categoria ? nombreCategoria(b.categoria) : "Elegir"}
                </button>
              </dd>
            </div>
          </dl>
          {cambiando || !b.categoria ? (
            <ChoiceChips
              etiqueta="Categoría del gasto"
              opciones={CATEGORIAS_GASTO}
              valor={b.categoria}
              onChange={(categoria) => {
                setBorradorGasto({ ...b, categoria });
                setCambiando(false);
              }}
            />
          ) : (
            <p className="text-caption text-texto-secundario">Toca la categoría para cambiarla</p>
          )}
          {b.monto === 0 && (
            <Link href="/gasto/manual" className="text-cuerpo-fuerte text-texto-primario">
              Escribir el monto a mano
            </Link>
          )}
        </section>
      )}

      <div className="flex flex-col items-center gap-espacio-3">
        <p className="text-cuerpo text-texto-secundario">¿No sabes qué decir? Prueba con:</p>
        <button
          type="button"
          onClick={() => alEscuchar(EJEMPLO)}
          className="w-full rounded-full bg-fondo-primario-suave px-espacio-4 py-espacio-4 text-cuerpo-fuerte font-bold text-texto-primario"
        >
          “{EJEMPLO}”
        </button>
      </div>
    </AppScreen>
  );
}
