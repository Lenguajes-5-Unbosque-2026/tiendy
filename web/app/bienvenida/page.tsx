"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

// La misma foto de Fiados próximamente (37): el tendero atendiendo a un cliente
import foto from "@/public/img/fiados-proximamente.jpg";
// Último cuadro del video: se muestra si el video no se puede reproducir
import finalSplash from "@/public/img/splash-final.jpg";

// Entrada del Splash (01a → 01c): el lápiz en verde, el ícono y el logo
import splashLapiz from "@/public/img/splash-lapiz.png";
import splashIcono from "@/public/img/splash-icono.png";
import splashLogo from "@/public/img/splash-logo.png";

/** Cada cuadro de la entrada: el lápiz sobre verde, el ícono "Ti" y el logo. */
const ENTRADA = [
  { src: splashLapiz, fondo: "bg-fondo-encabezado", alt: "Lápiz de Tiendy" },
  { src: splashIcono, fondo: "bg-fondo-splash", alt: "Ícono de Tiendy" },
  { src: splashLogo, fondo: "bg-fondo-splash", alt: "Tiendy" },
];
/** Lo que se ve cada cuadro de la entrada. */
const POR_CUADRO = 800;
/** Segundo del video en que aparece el logo, como en el último cuadro de la entrada. */
const VIDEO_DESDE = 1.2;
/** Tope del Splash: aunque el video se quede cargando, se sigue a Bienvenida. */
const DURACION_MAXIMA = 8000;
/** Lo que se ve el último cuadro cuando el video no se puede reproducir. */
const DURACION_RESPALDO = 1800;

/** Splash (01) animado y después Bienvenida (02). */
export default function BienvenidaPage() {
  const [splash, setSplash] = useState(true);
  const terminar = useCallback(() => setSplash(false), []);
  return splash ? <Splash alTerminar={terminar} /> : <Bienvenida />;
}

/**
 * Splash (01): primero la entrada (01a lápiz en verde, 01b ícono, 01c logo) y
 * después el video de public/img/splash.mp4 (sin sonido) desde que aparece el
 * logo, hasta "Tu tienda, al día" con sus tres etiquetas (02a). Al terminar,
 * Bienvenida. Si el celular no deja reproducir el video (sin conexión, ahorro de
 * batería), se ve su último cuadro.
 */
function Splash({ alTerminar }: { alTerminar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  /** Cuadro de la entrada que se ve; al pasar el último, el video. */
  const [paso, setPaso] = useState(0);
  const [respaldo, setRespaldo] = useState(false);
  const enVideo = paso >= ENTRADA.length;

  // La entrada avanza sola, un cuadro tras otro
  useEffect(() => {
    if (enVideo) return;
    const t = setTimeout(() => setPaso((n) => n + 1), POR_CUADRO);
    return () => clearTimeout(t);
  }, [paso, enVideo]);

  // Al terminar la entrada sigue el video desde el logo. Algunos celulares
  // bloquean la reproducción automática: entonces va el respaldo
  useEffect(() => {
    const v = video.current;
    if (!enVideo || !v) return;
    try {
      v.currentTime = VIDEO_DESDE;
    } catch {
      // Sin datos del video todavía: arranca desde el principio
    }
    v.play().catch(() => setRespaldo(true));
  }, [enVideo]);

  useEffect(() => {
    if (!enVideo) return;
    const t = setTimeout(alTerminar, respaldo ? DURACION_RESPALDO : DURACION_MAXIMA);
    return () => clearTimeout(t);
  }, [enVideo, respaldo, alTerminar]);

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
      {/* La entrada va encima del video y se funde de un cuadro al siguiente */}
      {ENTRADA.map((cuadro, i) => (
        <div
          key={cuadro.alt}
          aria-hidden={i !== paso}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            cuadro.fondo,
            i <= paso && !enVideo ? "opacity-100" : "opacity-0"
          )}
        >
          <Image src={cuadro.src} alt={cuadro.alt} priority fill sizes="100vw" className="object-cover" />
        </div>
      ))}
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
