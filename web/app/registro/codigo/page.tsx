"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { useCuentaRegresiva } from "@/lib/tienda/useCuentaRegresiva";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

const LARGO = 6;

/** "+573001234567" → "+57 300 ••• 4567". */
const enmascarar = (cel: string) => `+57 ${cel.slice(3, 6)} ••• ${cel.slice(-4)}`;

/** Verificación (04): seis dígitos del SMS. */
export default function CodigoPage() {
  const router = useRouter();
  const { celularPendiente, iniciarSesion, modoEntrada } = useTienda();
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState(false);
  const [enfocado, setEnfocado] = useState(true);
  const campo = useRef<HTMLInputElement>(null);
  const reenvio = useCuentaRegresiva(45);

  if (!celularPendiente) {
    return (
      <AppScreen title="Verificación" back="/registro/celular" withNav={false}>
        <Link href="/registro/celular" className="text-cuerpo-fuerte text-texto-primario">
          Primero escribe tu número
        </Link>
      </AppScreen>
    );
  }

  const verificar = async () => {
    setVerificando(true);
    setError(false);
    // Si el número ya tiene tienda entra al Home con sus datos; si es nuevo, sigue a Tu tienda (06)
    const entro = await iniciarSesion(celularPendiente);
    if (entro) return router.push("/");
    if (modoEntrada === "crear") return router.push("/registro/tienda");
    // Iniciar sesión nunca crea tienda: sin encontrarla se queda aquí
    setVerificando(false);
    setError(true);
  };

  return (
    <AppScreen
      title="Verificación"
      back="/registro/celular"
      withNav={false}
      footer={
        <Button disabled={codigo.length < LARGO || verificando} onClick={verificar}>
          {verificando ? "Entrando a tu tienda…" : "Verificar"}
        </Button>
      }
    >
      <div className="flex flex-col gap-espacio-2">
        <h2 className="text-titulo-1 text-texto-principal">Escribe el código</h2>
        <p className="text-cuerpo text-texto-secundario">
          Lo enviamos por SMS al {enmascarar(celularPendiente)}
        </p>
      </div>

      {/* Un solo campo invisible encima de las casillas: el celular puede autocompletar el SMS */}
      <div className="relative" onClick={() => campo.current?.focus()}>
        <input
          ref={campo}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Código de verificación"
          value={codigo}
          maxLength={LARGO}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, LARGO))}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          className="absolute inset-0 opacity-0"
        />
        <div aria-hidden="true" className="flex justify-between gap-espacio-2">
          {Array.from({ length: LARGO }, (_, i) => {
            const activa = enfocado && i === Math.min(codigo.length, LARGO - 1);
            return (
              <span
                key={i}
                className={cn(
                  "flex h-casilla-codigo flex-1 items-center justify-center rounded-md text-monto-m text-texto-principal [border-width:var(--borde-ancho-foco)]",
                  codigo[i] ? "bg-fondo-tarjeta" : "bg-fondo-sutil",
                  activa ? "border-borde-foco" : "border-transparent"
                )}
              >
                {codigo[i] ?? ""}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-espacio-3">
        {reenvio.quedan > 0 ? (
          <span className="text-secundario text-texto-secundario">Reenviar en {reenvio.texto}</span>
        ) : (
          <button type="button" onClick={reenvio.reiniciar} className="text-secundario font-bold text-texto-primario">
            Reenviar código
          </button>
        )}
        <Link href="/registro/no-llego" className="text-secundario font-bold text-texto-primario">
          No me llegó el código
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-secundario text-texto-peligro">
          No pudimos encontrar tu tienda. Revisa tu conexión a internet e intenta de nuevo.
        </p>
      )}

      {/* Todavía no hay servicio de SMS (llega con Supabase Auth) */}
      <p className="rounded-lg bg-fondo-primario-suave p-espacio-4 text-secundario text-texto-primario">
        Versión de prueba: sirve cualquier código de 6 dígitos.
      </p>
    </AppScreen>
  );
}
