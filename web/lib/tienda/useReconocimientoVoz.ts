"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Web Speech API: Chrome y Edge la traen como webkitSpeechRecognition; en iPhone
// funciona en Safari. Si el navegador no la tiene, el micrófono no se muestra activo.
type Reconocimiento = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type ConstructorReconocimiento = new () => Reconocimiento;

function constructor(): ConstructorReconocimiento | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: ConstructorReconocimiento;
    webkitSpeechRecognition?: ConstructorReconocimiento;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const nada = () => () => {};

export type EstadoVoz = "listo" | "escuchando" | "error";

/** Escucha una frase y devuelve el texto; mientras tanto, lo que va entendiendo (21a). */
export function useReconocimientoVoz(alEscuchar: (texto: string) => void) {
  // En el servidor no hay micrófono; en el navegador se revisa una vez
  const disponible = useSyncExternalStore(nada, () => constructor() !== null, () => false);
  const [estado, setEstado] = useState<EstadoVoz>("listo");
  const [parcial, setParcial] = useState("");
  const actual = useRef<Reconocimiento | null>(null);
  const callback = useRef(alEscuchar);

  useEffect(() => {
    callback.current = alEscuchar;
  }, [alEscuchar]);

  useEffect(() => () => actual.current?.stop(), []);

  const escuchar = useCallback(() => {
    const Clase = constructor();
    if (!Clase) return;
    const r = new Clase();
    r.lang = "es-CO";
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const resultados = Array.from(e.results);
      const texto = resultados.map((x) => x[0]?.transcript ?? "").join(" ").trim();
      if (resultados.every((x) => x.isFinal)) {
        setParcial("");
        if (texto) callback.current(texto);
      } else {
        setParcial(texto);
      }
    };
    r.onerror = () => setEstado("error");
    r.onend = () => setEstado((s) => (s === "escuchando" ? "listo" : s));
    actual.current = r;
    setParcial("");
    setEstado("escuchando");
    r.start();
  }, []);

  const detener = useCallback(() => {
    actual.current?.stop();
    setEstado("listo");
  }, []);

  return { disponible, estado, parcial, escuchar, detener };
}
