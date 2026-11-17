"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button, buttonVariants } from "@/components/ui/button";
import { enviarCodigo, ErrorCodigo } from "@/lib/tienda/acceso";
import { useTienda } from "@/lib/tienda/store";
import { useCuentaRegresiva } from "@/lib/tienda/useCuentaRegresiva";

const CAUSAS = [
  "El número quedó mal escrito",
  "No tienes señal en este momento",
  "El celular tiene la bandeja de SMS llena",
];

/** ¿No te llegó? (05): causas comunes y otras salidas. */
export default function NoLlegoPage() {
  const router = useRouter();
  const reenvio = useCuentaRegresiva(30);
  const { celularPendiente } = useTienda();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Manda otro SMS (si el login por SMS está prendido) y vuelve a Verificación (04). */
  const reenviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      if (celularPendiente) await enviarCodigo(celularPendiente);
      router.push("/registro/codigo");
    } catch (e) {
      setEnviando(false);
      setError(
        e instanceof ErrorCodigo && e.falla === "muchos-intentos"
          ? "Pediste muchos códigos seguidos. Espera un minuto e intenta de nuevo."
          : "No pudimos enviar el SMS. Revisa tu conexión a internet e intenta de nuevo."
      );
    }
  };

  return (
    <AppScreen title="¿No te llegó?" back="/registro/codigo" withNav={false}>
      <p className="text-cuerpo text-texto-secundario">
        A veces el SMS tarda un poco. Revisa esto antes de pedir otro:
      </p>

      <section className="flex flex-col gap-espacio-2 rounded-xl bg-fondo-tarjeta p-espacio-4">
        <h2 className="text-secundario font-bold text-texto-secundario">Causas comunes</h2>
        <ul className="flex list-disc flex-col gap-espacio-2 pl-espacio-5 text-cuerpo text-texto-principal">
          {CAUSAS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-espacio-3">
        <Button disabled={reenvio.quedan > 0 || enviando} onClick={reenviar}>
          {enviando ? "Enviando…" : reenvio.quedan > 0 ? `Reenviar SMS (${reenvio.texto})` : "Reenviar SMS"}
        </Button>
        {error && (
          <p role="alert" className="text-secundario text-texto-peligro">
            {error}
          </p>
        )}
        {/* Sin servicio de llamadas todavía */}
        <Button variant="secondary" disabled>
          Llamarme con el código
        </Button>
        <Link href="/registro/celular" className={buttonVariants({ variant: "outline" })}>
          Cambiar mi número
        </Link>
      </div>

      <p className="mt-auto text-center text-secundario text-texto-primario">
        ¿Sigues sin código? Escríbenos por WhatsApp
      </p>
    </AppScreen>
  );
}
