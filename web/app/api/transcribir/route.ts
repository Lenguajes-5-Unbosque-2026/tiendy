// Voz por API: recibe lo que se grabó con el micrófono (Vender hablando 21a y
// Gasto por voz 28) y lo pasa a texto con OpenAI. La llave vive solo en el
// servidor (OPENAI_API_KEY en web/.env.local y en Vercel): nunca llega al celular.
// Sin llave, la app usa el reconocimiento de voz del navegador, como antes.

import { connection } from "next/server";

const MODELO = "gpt-4o-mini-transcribe";
/** Vercel no deja recibir más de 4,5 MB; una frase de 30 s pesa mucho menos. */
const MAXIMO_BYTES = 4 * 1024 * 1024;

const llave = () => process.env.OPENAI_API_KEY?.trim() || null;

/** El micrófono pregunta al abrir si la voz por API está lista. */
export async function GET() {
  // Se revisa en cada visita, no una vez al compilar
  await connection();
  return Response.json({ activo: llave() !== null });
}

/** Solo la propia app puede usarla (cada transcripción cuesta). */
function deLaApp(req: Request) {
  const origen = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origen || !host) return false;
  try {
    return new URL(origen).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const clave = llave();
  if (!clave) return Response.json({ error: "La voz por API no está configurada" }, { status: 503 });
  if (!deLaApp(req)) return Response.json({ error: "No permitido" }, { status: 403 });

  let audio: FormDataEntryValue | null;
  let pista: string;
  try {
    const datos = await req.formData();
    audio = datos.get("audio");
    pista = String(datos.get("pista") ?? "").slice(0, 600);
  } catch {
    return Response.json({ error: "No llegó el audio" }, { status: 400 });
  }
  if (!(audio instanceof File) || audio.size === 0) {
    return Response.json({ error: "No llegó el audio" }, { status: 400 });
  }
  if (audio.size > MAXIMO_BYTES) {
    return Response.json({ error: "El audio es muy largo" }, { status: 413 });
  }

  const pedido = new FormData();
  // OpenAI reconoce el formato por la extensión del nombre (webm en Android, mp4 en iPhone)
  pedido.append("file", audio, audio.name || "voz.webm");
  pedido.append("model", MODELO);
  pedido.append("language", "es");
  pedido.append("response_format", "json");
  pedido.append(
    "prompt",
    "Habla un tendero de una tienda de barrio en Colombia anotando una venta o un gasto, " +
      "con cantidades y plata en pesos (\"me paga con veinte\", \"quince mil del arriendo\")." +
      (pista ? ` Puede nombrar: ${pista}.` : "")
  );

  let respuesta: Response;
  try {
    respuesta = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}` },
      body: pedido,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    console.error("No se pudo llamar a OpenAI para transcribir", error);
    return Response.json({ error: "No pudimos entender el audio" }, { status: 502 });
  }
  if (!respuesta.ok) {
    console.error("OpenAI no transcribió el audio", respuesta.status, await respuesta.text().catch(() => ""));
    return Response.json({ error: "No pudimos entender el audio" }, { status: 502 });
  }
  const { text } = (await respuesta.json()) as { text?: string };
  return Response.json({ texto: (text ?? "").trim() });
}
