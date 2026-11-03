"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useTienda } from "@/lib/tienda/store";

const esRegistro = (ruta: string) => ruta === "/bienvenida" || ruta.startsWith("/registro");

/** Sin sesión, todo lleva al registro (CU-01). */
export function GuardaSesion() {
  const router = useRouter();
  const pathname = usePathname();
  const { cargado, sesion } = useTienda();

  useEffect(() => {
    if (cargado && !sesion && !esRegistro(pathname)) router.replace("/bienvenida");
  }, [cargado, sesion, pathname, router]);

  // Mientras se revisa la sesión, la pantalla queda tapada para no mostrar datos sin entrar
  if (esRegistro(pathname) || (cargado && sesion)) return null;
  return <div aria-hidden="true" className="fixed inset-0 z-50 bg-fondo-app" />;
}
