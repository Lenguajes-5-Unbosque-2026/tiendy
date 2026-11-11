"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buscarTienda } from "@/lib/tienda/nube";
import { useTienda } from "@/lib/tienda/store";

/** "3001234567" → "300 123 4567" mientras se escribe. */
const conEspacios = (d: string) => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");

/**
 * Tu celular (03): crea cuenta ("Empezar") o inicia sesión ("Ya tengo cuenta").
 * Al iniciar sesión primero revisa en Supabase que el número tenga tienda.
 */
export default function CelularPage() {
  const router = useRouter();
  const { celularPendiente, setCelularPendiente, modoEntrada, setModoEntrada } = useTienda();
  const [digitos, setDigitos] = useState(celularPendiente.replace(/^\+57/, ""));
  const [buscando, setBuscando] = useState(false);
  const [sinTienda, setSinTienda] = useState(false);
  const entrar = modoEntrada === "entrar";
  // Los celulares en Colombia tienen 10 dígitos y empiezan por 3
  const valido = /^3\d{9}$/.test(digitos);

  const seguir = () => {
    setCelularPendiente(`+57${digitos}`);
    router.push("/registro/codigo");
  };

  const enviar = async () => {
    if (!entrar) return seguir();
    setBuscando(true);
    try {
      if (await buscarTienda(`+57${digitos}`)) seguir();
      else setSinTienda(true);
    } catch {
      // Sin conexión no se puede revisar: 04 entra con lo guardado en este celular
      seguir();
    } finally {
      setBuscando(false);
    }
  };

  return (
    <AppScreen
      title={entrar ? "Iniciar sesión" : "Tu celular"}
      back="/bienvenida"
      withNav={false}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Button disabled={!valido || buscando} onClick={enviar}>
            {buscando ? "Buscando tu tienda…" : "Enviar código"}
          </Button>
          <p className="text-center text-caption text-texto-secundario">
            Al continuar aceptas los Términos y la Política de datos.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-espacio-2">
        <h2 className="text-titulo-1 text-texto-principal">
          {entrar ? "Entra a tu tienda" : "¿Cuál es tu número?"}
        </h2>
        <p className="text-cuerpo text-texto-secundario">
          {entrar
            ? "Escribe el número con el que creaste tu tienda. Te enviaremos un código por SMS."
            : "Te enviaremos un código por SMS para verificar que eres tú. Con este número también recuperas tu cuenta."}
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
            onChange={(e) => {
              setDigitos(e.target.value.replace(/\D/g, "").slice(0, 10));
              setSinTienda(false);
            }}
            className="pl-[calc(var(--espacio-4)+var(--espacio-6)+var(--espacio-3))]"
          />
        </div>
      </label>
      {sinTienda ? (
        <div role="alert" className="flex flex-col gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4">
          <p className="text-cuerpo-fuerte text-texto-principal">No hay ninguna tienda con este número</p>
          <p className="text-secundario text-texto-secundario">
            Revisa que esté bien escrito o crea tu tienda con este número.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setModoEntrada("crear");
              seguir();
            }}
          >
            Crear mi tienda
          </Button>
        </div>
      ) : (
        <p className="text-secundario text-texto-secundario">
          {entrar ? "Es el mismo número con el que te registraste." : "Sirve para crear cuenta o para iniciar sesión."}
        </p>
      )}
    </AppScreen>
  );
}
