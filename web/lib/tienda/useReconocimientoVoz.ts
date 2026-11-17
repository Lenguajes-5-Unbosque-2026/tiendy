"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// El micrófono de Vender hablando (21a) y Gasto por voz (28). Dos formas:
//
// · Por API (si el servidor tiene OPENAI_API_KEY): graba con el micrófono, corta
//   sola cuando la persona deja de hablar y manda el audio a /api/transcribir.
//   Funciona en cualquier navegador que deje usar el micrófono.
// · Del navegador (si no): Web Speech API. Chrome y Edge la traen; en iPhone,
//   Safari con el dictado de Siri activo. Si no la tiene, el micrófono no se activa.

export type EstadoVoz = "listo" | "escuchando" | "error";
/** Por qué falló: sin permiso del micrófono, no se oyó nada, o no se pudo pasar a texto. */
export type FallaVoz = "microfono" | "no-escuche" | "servicio";

// ── Voz del navegador (Web Speech API) ───────────────────────────
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
  abort: () => void;
};
type ConstructorReconocimiento = new () => Reconocimiento;

function vozDelNavegador(): ConstructorReconocimiento | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: ConstructorReconocimiento;
    webkitSpeechRecognition?: ConstructorReconocimiento;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── Voz por API ──────────────────────────────────────────────────
const puedeGrabar = () =>
  typeof window !== "undefined" &&
  typeof window.MediaRecorder !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia);

/** Si el servidor tiene la voz por API lista. Se pregunta una vez por visita. */
let apiActiva: boolean | null = null;
const avisarApi = new Set<() => void>();
function revisarApi() {
  if (apiActiva !== null || typeof window === "undefined") return;
  apiActiva = false;
  fetch("/api/transcribir")
    .then((r) => (r.ok ? r.json() : { activo: false }))
    .then((d: { activo?: boolean }) => {
      apiActiva = d.activo === true;
      avisarApi.forEach((f) => f());
    })
    .catch(() => {
      // Sin conexión: se vuelve a preguntar la próxima vez
      apiActiva = null;
    });
}
const suscribirApi = (f: () => void) => {
  avisarApi.add(f);
  revisarApi();
  return () => avisarApi.delete(f);
};

/** El formato que graba este celular: webm en Android y Chrome, mp4 en iPhone. */
function formato() {
  for (const tipo of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported(tipo)) return tipo;
  }
  return "";
}

/** Volumen desde el que se cuenta como voz (0 a 1) y cuánto silencio corta. */
const UMBRAL_VOZ = 0.025;
const SILENCIO_PARA_CORTAR = 1400;
const ESPERA_SIN_HABLAR = 8000;
const MAXIMO_GRABANDO = 25000;

type Grabacion = { cortar: (enviar: boolean) => void };

/**
 * Escucha una frase y devuelve el texto. `pista` son palabras que la persona
 * puede decir (los productos de la tienda) y ayudan a la API a entenderlas.
 */
export function useReconocimientoVoz(alEscuchar: (texto: string) => void, pista = "") {
  const conApi = useSyncExternalStore(suscribirApi, () => apiActiva === true && puedeGrabar(), () => false);
  const conNavegador = useSyncExternalStore(
    suscribirApi,
    () => vozDelNavegador() !== null,
    () => false
  );
  const disponible = conApi || conNavegador;
  const [estado, setEstado] = useState<EstadoVoz>("listo");
  /** Lo que va entendiendo (solo con la voz del navegador). */
  const [parcial, setParcial] = useState("");
  /** El audio ya se grabó y se está pasando a texto (solo por API). */
  const [procesando, setProcesando] = useState(false);
  const [falla, setFalla] = useState<FallaVoz | null>(null);
  const fallar = useCallback((f: FallaVoz) => {
    setFalla(f);
    setEstado("error");
  }, []);
  const navegador = useRef<Reconocimiento | null>(null);
  const grabacion = useRef<Grabacion | null>(null);
  /** Cada vez que se empieza o se cancela: un resultado viejo no se usa. */
  const turno = useRef(0);
  const callback = useRef(alEscuchar);
  const pistaActual = useRef(pista);

  useEffect(() => {
    callback.current = alEscuchar;
    pistaActual.current = pista;
  }, [alEscuchar, pista]);

  /** Graba hasta que la persona se calla y manda el audio a /api/transcribir. */
  const escucharPorApi = useCallback(async () => {
    const mio = ++turno.current;
    setParcial("");
    setFalla(null);
    setEstado("escuchando");
    let microfono: MediaStream;
    try {
      microfono = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      if (turno.current === mio) fallar("microfono");
      return;
    }
    if (turno.current !== mio) {
      microfono.getTracks().forEach((t) => t.stop());
      return;
    }

    const tipo = formato();
    const grabadora = new MediaRecorder(microfono, tipo ? { mimeType: tipo } : undefined);
    const partes: Blob[] = [];
    grabadora.ondataavailable = (e) => e.data.size > 0 && partes.push(e.data);

    // Cuándo dejó de hablar: se mide el volumen del micrófono
    const audio = new AudioContext();
    const medidor = audio.createAnalyser();
    medidor.fftSize = 1024;
    audio.createMediaStreamSource(microfono).connect(medidor);
    const muestras = new Float32Array(medidor.fftSize);
    const inicio = Date.now();
    let hablo = false;
    let ultimaVoz = inicio;
    let enviar = true;

    const reloj = setInterval(() => {
      medidor.getFloatTimeDomainData(muestras);
      let suma = 0;
      for (const m of muestras) suma += m * m;
      const ahora = Date.now();
      if (Math.sqrt(suma / muestras.length) > UMBRAL_VOZ) {
        hablo = true;
        ultimaVoz = ahora;
      }
      const callado = hablo && ahora - ultimaVoz > SILENCIO_PARA_CORTAR;
      const nunca = !hablo && ahora - inicio > ESPERA_SIN_HABLAR;
      if (callado || nunca || ahora - inicio > MAXIMO_GRABANDO) grabacion.current?.cortar(true);
    }, 100);

    const terminado = new Promise<void>((listo) => (grabadora.onstop = () => listo()));
    grabacion.current = {
      cortar: (conEnvio) => {
        enviar = conEnvio;
        if (grabadora.state !== "inactive") grabadora.stop();
      },
    };
    grabadora.start(250);
    await terminado;

    clearInterval(reloj);
    microfono.getTracks().forEach((t) => t.stop());
    void audio.close();
    grabacion.current = null;
    if (turno.current !== mio) return;
    if (!enviar) return setEstado("listo");
    // No dijo nada: como la voz del navegador, "no te escuché"
    if (!hablo || partes.length === 0) return fallar("no-escuche");

    setProcesando(true);
    try {
      const blob = new Blob(partes, { type: grabadora.mimeType || tipo || "audio/webm" });
      const datos = new FormData();
      datos.append("audio", blob, blob.type.includes("mp4") ? "voz.mp4" : blob.type.includes("ogg") ? "voz.ogg" : "voz.webm");
      datos.append("pista", pistaActual.current);
      const r = await fetch("/api/transcribir", { method: "POST", body: datos });
      if (!r.ok) throw new Error(`transcribir respondió ${r.status}`);
      const { texto } = (await r.json()) as { texto?: string };
      if (turno.current !== mio) return;
      if (!texto) return fallar("no-escuche");
      setEstado("listo");
      callback.current(texto);
    } catch (error) {
      console.error("No se pudo pasar la voz a texto", error);
      if (turno.current === mio) fallar("servicio");
    } finally {
      if (turno.current === mio) setProcesando(false);
    }
  }, [fallar]);

  const escucharEnNavegador = useCallback(() => {
    const Clase = vozDelNavegador();
    if (!Clase) return;
    const mio = ++turno.current;
    const r = new Clase();
    r.lang = "es-CO";
    r.interimResults = true;
    r.maxAlternatives = 1;
    // Lo último que se entendió. En algunos celulares (iPhone, algunos Android) la
    // frase nunca llega "terminada": al apagarse el micrófono se usa esto
    let ultimo = "";
    let entregado = false;
    const entregar = (texto: string) => {
      if (entregado || !texto) return;
      entregado = true;
      setParcial("");
      callback.current(texto);
    };
    r.onresult = (e) => {
      if (turno.current !== mio) return;
      const resultados = Array.from(e.results);
      const texto = resultados.map((x) => x[0]?.transcript ?? "").join(" ").trim();
      ultimo = texto;
      if (resultados.every((x) => x.isFinal)) entregar(texto);
      else setParcial(texto);
    };
    r.onerror = (e) => {
      if (turno.current !== mio) return;
      fallar(
        e.error === "not-allowed" || e.error === "audio-capture" || e.error === "service-not-allowed"
          ? "microfono"
          : e.error === "no-speech"
            ? "no-escuche"
            : "servicio"
      );
    };
    r.onend = () => {
      if (turno.current !== mio) return;
      // Si alcanzó a entender algo, se usa aunque el navegador haya marcado error
      const alcanzo = !entregado && ultimo !== "";
      entregar(ultimo);
      setEstado((s) => (alcanzo || s === "escuchando" ? "listo" : s));
    };
    navegador.current = r;
    setParcial("");
    setFalla(null);
    setEstado("escuchando");
    r.start();
  }, [fallar]);

  const escuchar = useCallback(() => {
    if (apiActiva === true && puedeGrabar()) void escucharPorApi();
    else escucharEnNavegador();
  }, [escucharPorApi, escucharEnNavegador]);

  /** "Listo, ya terminé": deja de escuchar y usa lo que alcanzó a decir. */
  const detener = useCallback(() => {
    if (grabacion.current) return grabacion.current.cortar(true);
    navegador.current?.stop();
    setEstado("listo");
  }, []);

  /** Cerrar la hoja: deja de escuchar y no usa nada de lo dicho. */
  const cancelar = useCallback(() => {
    turno.current++;
    grabacion.current?.cortar(false);
    navegador.current?.abort();
    navegador.current = null;
    setParcial("");
    setProcesando(false);
    setEstado("listo");
  }, []);

  // Al salir de la pantalla no se queda el micrófono prendido
  useEffect(
    () => () => {
      turno.current++;
      grabacion.current?.cortar(false);
      navegador.current?.abort();
    },
    []
  );

  return { disponible, estado, falla, parcial, procesando, escuchar, detener, cancelar };
}
