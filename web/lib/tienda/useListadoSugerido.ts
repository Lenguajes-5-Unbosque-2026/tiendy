"use client";

import { useCallback, useEffect, useState } from "react";

import datos from "@/lib/mock/datos.json";
import type { DatosMock, ProductoSugerido } from "@/lib/mock/tipos";
import { supabase } from "@/lib/supabase";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; listado: ProductoSugerido[] };

/** Postgres: la columna no existe (la base todavía no tiene supabase/listado.sql). */
const SIN_COLUMNA = "42703";

/** El listado de data/mock/, con la URL pública de cada foto del bucket "imagenes". */
function listadoIncluido(): ProductoSugerido[] {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagenes/`;
  return (datos as unknown as DatosMock).listado.map((s) => ({
    ...s,
    imagen: s.imagen ? base + s.imagen : null,
  }));
}

/**
 * Listado sugerido (13), leído de la tabla listado_sugerido de Supabase. Si la base
 * todavía no tiene la columna de la foto, usa el listado que viene con la app.
 */
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
        if (error?.code === SIN_COLUMNA) return setEstado({ tipo: "listo", listado: listadoIncluido() });
        if (error) {
          console.error("No se pudo leer el listado sugerido", error);
          return setEstado({ tipo: "error" });
        }
        setEstado({ tipo: "listo", listado: data as ProductoSugerido[] });
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
