// Entiende una venta dicha en voz alta (21):
// "dos gaseosas y unas papas, en efectivo, me paga con veinte".
import type { MedioPago, Producto } from "@/lib/mock/tipos";
import type { LineaVenta } from "@/lib/tienda/store";

const NUMEROS: Record<string, number> = {
  un: 1, una: 1, uno: 1, unos: 1, unas: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, quince: 15, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50,
  cien: 100,
};

export const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.,;!?¿¡"]/g, " ");

function leerNumero(palabra: string | undefined): number | null {
  if (!palabra) return null;
  if (/^\d+$/.test(palabra)) return Number(palabra);
  return NUMEROS[palabra] ?? null;
}

/** "veinte" → 20.000, "cincuenta mil" → 50.000, "20000" → 20.000. */
function leerPlata(texto: string): number | null {
  const m = texto.match(/paga(?:n)? con (?:un billete de )?(\d+|[a-z]+)(?: (mil))?/);
  if (!m) return null;
  const n = leerNumero(m[1]);
  if (n === null) return null;
  // En la tienda "veinte" es un billete de veinte mil
  return m[2] || n < 1000 ? n * 1000 : n;
}

function leerMedio(texto: string): MedioPago | null {
  if (/\b(nequi|daviplata|transferencia|transfiere)\b/.test(texto)) return "transferencia";
  if (/\b(efectivo|plata|billete|paga con)\b/.test(texto)) return "efectivo";
  return null;
}

/** La frase como patrón: escapa "+" y similares, y acepta varios espacios. */
const escapar = (frase: string) =>
  frase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");

export type VentaDicha = {
  lineas: LineaVenta[];
  medioPago: MedioPago | null;
  pagaCon: number | null;
  /** Palabras que parecían productos pero no se encontraron. */
  entendido: boolean;
};

export function interpretarVenta(dicho: string, productos: Producto[]): VentaDicha {
  // Lo de "me paga con" no son productos
  const texto = normalizar(dicho);
  const pedido = ` ${texto.split(/\bpaga(?:n)? con\b/)[0]} `;

  // Frases con las que se nombra cada producto, de la más larga a la más corta
  const frases = productos
    .filter((p) => p.unidades > 0)
    .flatMap((p) =>
      [...(p.alias ?? []), p.nombre_corto, p.nombre].map((f) => ({
        producto: p,
        // Sin la cantidad que traen algunos alias ("una leche" → "leche")
        frase: normalizar(f).trim().replace(/^(un|una|unos|unas)\s+/, ""),
      }))
    )
    .filter((f) => f.frase.length > 2)
    .sort((a, b) => b.frase.length - a.frase.length);

  let resto = pedido;
  // Cantidad y en qué parte de la frase se dijo, para mantener el orden
  const encontrados = new Map<string, { cantidad: number; posicion: number }>();

  for (const { producto, frase } of frases) {
    // Acepta el plural: "gaseosa" encuentra "gaseosas"
    const patron = new RegExp(`((?:\\d+|[a-z]+)\\s+)?\\b${escapar(frase)}(?:s|es)?\\b`);
    let m = resto.match(patron);
    while (m) {
      const cantidad = leerNumero(m[1]?.trim()) ?? 1;
      const previo = encontrados.get(producto.id);
      encontrados.set(producto.id, {
        cantidad: (previo?.cantidad ?? 0) + cantidad,
        posicion: previo?.posicion ?? m.index ?? 0,
      });
      // Se tapa con espacios para no volver a encontrarlo y no correr las posiciones
      resto = resto.replace(m[0], " ".repeat(m[0].length));
      m = resto.match(patron);
    }
  }

  const lineas = [...encontrados]
    .sort(([, a], [, b]) => a.posicion - b.posicion)
    .map(([productoId, { cantidad }]) => {
      const p = productos.find((x) => x.id === productoId)!;
      return { productoId, cantidad: Math.min(cantidad, p.unidades) };
    });

  return {
    lineas,
    medioPago: leerMedio(texto),
    pagaCon: leerPlata(texto),
    entendido: lineas.length > 0,
  };
}
