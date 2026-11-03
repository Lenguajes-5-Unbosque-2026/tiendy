"use client";

import { useCallback, useEffect, useState } from "react";

/** Segundos que faltan para poder reenviar el código (04, 05). */
export function useCuentaRegresiva(segundos: number) {
  const [quedan, setQuedan] = useState(segundos);

  useEffect(() => {
    if (quedan <= 0) return;
    const t = setTimeout(() => setQuedan((q) => q - 1), 1000);
    return () => clearTimeout(t);
  }, [quedan]);

  const reiniciar = useCallback(() => setQuedan(segundos), [segundos]);
  const texto = `${Math.floor(quedan / 60)}:${String(quedan % 60).padStart(2, "0")}`;

  return { quedan, texto, reiniciar };
}
