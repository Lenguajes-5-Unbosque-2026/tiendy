// Gastos (CU-05): categorías, medios de pago, plazos y lo que se dice por voz (28).
import type { CategoriaGasto, MedioPagoGasto, Proveedor } from "@/lib/mock/tipos";
import { HOY } from "@/lib/tienda/calculos";
import { normalizar } from "@/lib/tienda/voz";

export const CATEGORIAS_GASTO: { valor: CategoriaGasto; etiqueta: string }[] = [
  { valor: "transporte", etiqueta: "Transporte" },
  { valor: "servicios", etiqueta: "Servicios" },
  { valor: "arriendo", etiqueta: "Arriendo" },
  { valor: "mercancia", etiqueta: "Mercancía" },
  { valor: "otro", etiqueta: "Otro" },
];

export const nombreCategoria = (c: CategoriaGasto) =>
  CATEGORIAS_GASTO.find((x) => x.valor === c)?.etiqueta ?? "Otro";

export const nombreMedioGasto: Record<MedioPagoGasto, string> = {
  efectivo: "Efectivo de la caja",
  transferencia: "Transferencia",
  quede_debiendo: "Quedé debiendo",
};

// Palabras con las que la gente nombra cada categoría
const PALABRAS: Record<Exclude<CategoriaGasto, "otro">, RegExp> = {
  transporte: /\b(transporte|mototaxi|moto|taxi|bus|pasaje|domicilio|flete|acarreo)\b/,
  servicios: /\b(servicios?|luz|agua|gas|internet|recibo|celular|enel|minutos)\b/,
  arriendo: /\b(arriendo|alquiler|renta)\b/,
  mercancia: /\b(mercancia|pedido|proveedor|surtido|surtir)\b/,
};

const NUMEROS: Record<string, number> = {
  // Sin "un"/"uno": en "pagué un domicilio de 5 mil" no son plata
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8,
  nueve: 9, diez: 10, quince: 15, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50,
  sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, doscientos: 200,
  trescientos: 300, quinientos: 500,
};

/** "20.000", "20 mil", "veinte mil" → 20000. Sin "mil", un número chico se toma en miles. */
function leerMonto(texto: string): number | null {
  // Los puntos y comas de miles se juntan antes de normalizar: "20.000" → "20000"
  const limpio = normalizar(texto.replace(/(\d)[.,](?=\d{3}\b)/g, "$1"));
  const m = limpio.match(/\b(\d+|[a-z]+)(?:\s+(mil))?\b/g);
  if (!m) return null;
  for (const trozo of m) {
    const [palabra, mil] = trozo.split(/\s+/);
    const n = /^\d+$/.test(palabra) ? Number(palabra) : NUMEROS[palabra];
    if (n === undefined) continue;
    return mil || n < 1000 ? n * 1000 : n;
  }
  return null;
}

/** "pagué 20.000 de transporte" → monto 20000, categoría transporte. */
export function interpretarGasto(texto: string) {
  const t = normalizar(texto);
  const categoria =
    (Object.entries(PALABRAS).find(([, patron]) => patron.test(t))?.[0] as CategoriaGasto) ??
    null;
  return { monto: leerMonto(texto), categoria };
}

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

/** Fecha (AAAA-MM-DD) `dias` después de hoy. */
export function enDias(dias: number, desde = HOY) {
  const d = new Date(`${desde}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** El próximo día en que viene el proveedor, sin contar hoy. */
export function proximaVisita(proveedor: Proveedor | undefined, desde = HOY) {
  if (!proveedor?.dia_visita) return null;
  const objetivo = DIAS_SEMANA.indexOf(normalizar(proveedor.dia_visita).trim());
  if (objetivo < 0) return null;
  const hoy = new Date(`${desde}T12:00:00Z`).getUTCDay();
  return enDias(((objetivo - hoy + 7) % 7) || 7, desde);
}
