"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button, buttonVariants } from "@/components/ui/button";
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
        <Button disabled={reenvio.quedan > 0} onClick={() => router.push("/registro/codigo")}>
          {reenvio.quedan > 0 ? `Reenviar SMS (${reenvio.texto})` : "Reenviar SMS"}
        </Button>
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
