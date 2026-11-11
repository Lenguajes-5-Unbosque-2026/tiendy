"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useTienda } from "@/lib/tienda/store";

// La misma foto de Fiados próximamente (37): el tendero atendiendo a un cliente
import foto from "@/public/img/fiados-proximamente.jpg";
// Último cuadro del video: se muestra si el video no se puede reproducir
import finalSplash from "@/public/img/splash-final.jpg";

/** Tope del Splash: aunque el video se quede cargando, se sigue a Bienvenida. */
const DURACION_MAXIMA = 6000;
/** Lo que se ve el último cuadro cuando el video no se puede reproducir. */
const DURACION_RESPALDO = 1800;

/** Splash (01) animado y después Bienvenida (02). */
export default function BienvenidaPage() {
  const [splash, setSplash] = useState(true);
  const terminar = useCallback(() => setSplash(false), []);
  return splash ? <Splash alTerminar={terminar} /> : <Bienvenida />;
}

/**
 * Splash (01): el video de public/img/splash.mp4 (4 s, sin sonido) y, al
 * terminar, Bienvenida. Si el celular no deja reproducirlo (sin conexión, ahorro
 * de batería), se ve su último cuadro: el logo de Tiendy.
 */
function Splash({ alTerminar }: { alTerminar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [respaldo, setRespaldo] = useState(false);

  // Algunos celulares bloquean la reproducción automática: entonces va el respaldo
  useEffect(() => {
    video.current?.play().catch(() => setRespaldo(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(alTerminar, respaldo ? DURACION_RESPALDO : DURACION_MAXIMA);
    return () => clearTimeout(t);
  }, [respaldo, alTerminar]);

  return (
    <main className="relative flex-1 overflow-hidden bg-fondo-splash">
      {respaldo ? (
        <Image
          src={finalSplash}
          alt="Tiendy · Tu tienda, al día"
          priority
          fill
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <video
          ref={video}
          src="/img/splash.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          role="img"
          aria-label="Tiendy · Tu tienda, al día"
          onEnded={alTerminar}
          onError={() => setRespaldo(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </main>
  );
}

function Bienvenida() {
  const { setModoEntrada } = useTienda();
  return (
    <div className="flex flex-1 flex-col bg-fondo-encabezado pt-alto-barra-estado">
      <main className="flex flex-1 flex-col gap-espacio-4 rounded-t-2xl bg-fondo-app px-margen-pantalla pt-espacio-6 pb-espacio-6">
        <Image src={foto} alt="Tendero atendiendo a un cliente con el celular en la mano" priority className="h-auto w-full rounded-xl" />
        <h1 className="text-titulo-1 text-texto-principal">
          Tu tienda en orden,
          <br />
          sin cuaderno
        </h1>
        <p className="text-cuerpo text-texto-secundario">
          Anota ventas y gastos con un toque o hablando. Siempre sabrás cuánta plata tienes y qué se
          te está acabando.
        </p>
        <div className="mt-auto flex flex-col gap-espacio-3">
          <Link href="/registro/celular" onClick={() => setModoEntrada("crear")} className={buttonVariants()}>
            Empezar
          </Link>
          {/* Quien ya tiene tienda solo inicia sesión: no pasa por Tu tienda (06) */}
          <Link
            href="/registro/celular"
            onClick={() => setModoEntrada("entrar")}
            className={buttonVariants({ variant: "secondary" })}
          >
            Ya tengo cuenta · Iniciar sesión
          </Link>
          <p className="text-center text-caption text-texto-secundario">
            Al continuar aceptas los Términos y la Política de datos.
          </p>
        </div>
      </main>
    </div>
  );
}
