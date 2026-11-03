"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTienda } from "@/lib/tienda/store";

/** "3001234567" → "300 123 4567" mientras se escribe. */
const conEspacios = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");

/** Tu celular (03): sirve para crear cuenta o para iniciar sesión. */
export default function CelularPage() {
  const router = useRouter();
  const { celularPendiente, setCelularPendiente } = useTienda();
  const [digitos, setDigitos] = useState(celularPendiente.replace(/^\+57/, ""));
  // Los celulares en Colombia tienen 10 dígitos y empiezan por 3
  const valido = /^3\d{9}$/.test(digitos);

  const enviar = () => {
    setCelularPendiente(`+57${digitos}`);
    router.push("/registro/codigo");
  };

  return (
    <AppScreen
      title="Tu celular"
      back="/bienvenida"
      withNav={false}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Button disabled={!valido} onClick={enviar}>
            Enviar código
          </Button>
          <p className="text-center text-caption text-texto-secundario">
            Al continuar aceptas los Términos y la Política de datos.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-espacio-2">
        <h2 className="text-titulo-1 text-texto-principal">¿Cuál es tu número?</h2>
        <p className="text-cuerpo text-texto-secundario">
          Te enviaremos un código por SMS para verificar que eres tú. Con este número también
          recuperas tu cuenta.
        </p>
      </div>

      <label className="flex flex-col gap-espacio-2">
        <span className="text-cuerpo-fuerte">Número de celular</span>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-espacio-4 -translate-y-1/2 text-cuerpo text-texto-principal">
            +57
          </span>
          <Input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="300 123 4567"
            value={conEspacios(digitos)}
            onChange={(e) => setDigitos(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="pl-[calc(var(--espacio-4)+var(--espacio-6)+var(--espacio-3))]"
          />
        </div>
      </label>
      <p className="text-secundario text-texto-secundario">Sirve para crear cuenta o para iniciar sesión.</p>
    </AppScreen>
  );
}
