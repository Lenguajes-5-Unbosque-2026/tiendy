"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useTienda } from "@/lib/tienda/store";

/** /vender abre la hoja "Nueva venta" (20) sobre el Home. */
export default function VenderPage() {
  const router = useRouter();
  const { setVenderAbierto } = useTienda();

  useEffect(() => {
    setVenderAbierto(true);
    router.replace("/");
  }, [router, setVenderAbierto]);

  return null;
}
