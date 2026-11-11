"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProductoSugerido } from "@/lib/mock/tipos";
import { supabase } from "@/lib/supabase";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; listado: ProductoSugerido[] };

/** Listado sugerido (13), leído de la tabla listado_sugerido de Supabase. */
export function useListadoSugerido() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    supabase
      .from("listado_sugerido")
      .select("id, categoria_id, nombre, nombre_corto, precio_sugerido, imagen")
      .order("id")
      .then(({ data, error }) => {
        if (!vigente) return;
        setEstado(error ? { tipo: "error" } : { tipo: "listo", listado: data as ProductoSugerido[] });
      });
    return () => {
      vigente = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setEstado({ tipo: "cargando" });
    setIntento((n) => n + 1);
  }, []);

  return { estado, reintentar };
}
