"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { conSms, enviarCodigo, ErrorCodigo, verificarCodigo, type FallaCodigo } from "@/lib/tienda/acceso";
import { useCuentaRegresiva } from "@/lib/tienda/useCuentaRegresiva";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

const LARGO = 6;

/** "+573001234567" → "+57 300 ••• 4567". */
const enmascarar = (cel: string) => `+57 ${cel.slice(3, 6)} ••• ${cel.slice(-4)}`;

const TEXTO_FALLA: Record<FallaCodigo, string> = {
  "codigo-malo": "Ese código no es o ya venció. Revisa el SMS o pide otro.",
  "sin-conexion": "No pudimos revisar el código. Revisa tu conexión a internet e intenta de nuevo.",
  "muchos-intentos": "Hiciste muchos intentos seguidos. Espera un minuto e intenta de nuevo.",
  otra: "No pudimos revisar el código. Intenta de nuevo.",
};

/**
 * Verificación (04): seis dígitos del SMS. Con el login por SMS prendido
 * (acceso.ts) Supabase revisa el código; si no, sirve cualquiera.
 */
export default function CodigoPage() {
  const router = useRouter();
  const { celularPendiente, iniciarSesion, modoEntrada } = useTienda();
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      await verificarCodigo(celularPendiente, codigo);
    } catch (e) {
      const falla = e instanceof ErrorCodigo ? e.falla : "otra";
      if (falla === "codigo-malo") setCodigo("");
      setError(TEXTO_FALLA[falla]);
      setVerificando(false);
      return;
    }
    // Si el número ya tiene tienda entra al Home con sus datos; si es nuevo, sigue a Tu tienda (06)
    const entro = await iniciarSesion(celularPendiente);
    if (entro) return router.push("/");
    if (modoEntrada === "crear") return router.push("/registro/tienda");
    // Iniciar sesión nunca crea tienda: sin encontrarla se queda aquí
    setVerificando(false);
    setError("No pudimos encontrar tu tienda. Revisa tu conexión a internet e intenta de nuevo.");
  };

  const reenviar = async () => {
    reenvio.reiniciar();
    setError(null);
    try {
      await enviarCodigo(celularPendiente);
    } catch (e) {
      const falla = e instanceof ErrorCodigo ? e.falla : "otra";
      setError(
        falla === "muchos-intentos"
          ? "Pediste muchos códigos seguidos. Espera un minuto e intenta de nuevo."
          : "No pudimos enviar el SMS. Revisa tu conexión a internet e intenta de nuevo."
      );
    }
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
          <button type="button" onClick={reenviar} className="text-secundario font-bold text-texto-primario">
            Reenviar código
          </button>
        )}
        <Link href="/registro/no-llego" className="text-secundario font-bold text-texto-primario">
          No me llegó el código
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-secundario text-texto-peligro">
          {error}
        </p>
      )}

      {/* Sin el login por SMS prendido no se envía nada */}
      {!conSms && (
        <p className="rounded-lg bg-fondo-primario-suave p-espacio-4 text-secundario text-texto-primario">
          Versión de prueba: sirve cualquier código de 6 dígitos.
        </p>
      )}
    </AppScreen>
  );
}
