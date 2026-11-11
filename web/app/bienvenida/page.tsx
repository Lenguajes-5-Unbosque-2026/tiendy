"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useTienda } from "@/lib/tienda/store";

// La misma foto de Fiados próximamente (37): el tendero atendiendo a un cliente
import foto from "@/public/img/fiados-proximamente.jpg";

const DURACION_SPLASH = 1800;

/** Splash (01) unos segundos y después Bienvenida (02). */
export default function BienvenidaPage() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), DURACION_SPLASH);
    return () => clearTimeout(t);
  }, []);

  return splash ? <Splash /> : <Bienvenida />;
}

function Splash() {
  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-fondo-app pb-espacio-6">
      {/* Toldo de tienda arriba */}
      <div aria-hidden="true" className="flex w-full bg-fondo-primario pt-alto-barra-estado">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={`-mb-espacio-4 h-espacio-6 flex-1 rounded-b-full ${i % 2 ? "bg-fondo-tarjeta" : "bg-fondo-primario"}`}
          />
        ))}
      </div>
      <span aria-hidden="true" className="absolute top-1/4 -right-espacio-6 size-voz-halo scale-150 rounded-full bg-fondo-primario-suave" />
      <span aria-hidden="true" className="absolute -bottom-espacio-6 -left-espacio-6 size-voz-halo scale-[2] rounded-full bg-fondo-sutil" />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-espacio-4 text-center">
        <span className="flex size-voz-halo items-center justify-center rounded-2xl bg-fondo-tarjeta text-texto-primario">
          <Store className="size-voz p-espacio-5" />
        </span>
        <h1 className="text-display text-texto-principal">Tiendy</h1>
        <p className="text-cuerpo text-texto-secundario">Tu tienda en orden, sin cuaderno</p>
      </div>
      <p className="relative text-secundario text-texto-secundario">Hecho para las tiendas de barrio</p>
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
