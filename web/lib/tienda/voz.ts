// Entiende una venta dicha en voz alta (21):
// "dos gaseosas y unas papas, en efectivo, me paga con veinte".
import type { MedioPago, Producto } from "@/lib/mock/tipos";
import type { LineaVenta } from "@/lib/tienda/store";

const NUMEROS: Record<string, number> = {
  un: 1, una: 1, uno: 1, unos: 1, unas: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21,
  veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26,
  veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40,
  cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100,
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

const escapar = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Una palabra como patrón, en singular o en plural: "gaseosa" encuentra
 * "gaseosas", "arroz" encuentra "arroces" y "huevos" encuentra "huevo".
 */
function patronPalabra(palabra: string) {
  if (palabra.length < 3 || /\d/.test(palabra)) return escapar(palabra);
  if (palabra.endsWith("z")) return `${escapar(palabra.slice(0, -1))}(?:z|ces)`;
  if (palabra.endsWith("s")) return `${escapar(palabra.slice(0, -1))}(?:s|es)?`;
  return `${escapar(palabra)}(?:s|es)?`;
}

/** La frase como patrón: cada palabra en singular o plural, con uno o más espacios. */
const patronFrase = (frase: string) => frase.split(" ").map(patronPalabra).join("\\s+");

/**
 * Lo que no se dice al pedir: la medida y el empaque ("1 L", "500 g", "1,5 L",
 * "x30"). "Leche Alquería 1 L" → "leche alqueria"; "Huevos x30" → "huevos".
 */
const MEDIDA =
  /(?:^|\s)(?:x\s*\d+|\d+(?:\s+\d+)?\s*(?:g|gr|gramos|kg|kilos?|ml|l|lt|litros?|lb|libras?|cc|oz|und|unidades)?)(?=\s|$)/g;
const sinMedida = (frase: string) => frase.replace(MEDIDA, " ").replace(/\s+/g, " ").trim();

/** Palabras que solas no nombran un producto. */
const VACIAS = new Set(["de", "del", "la", "el", "los", "las", "con", "sin", "por", "para", "x"]);

/** Cantidades dichas en docenas o pares: "media docena de huevos" → "6 huevos". */
const agruparCantidades = (texto: string) =>
  texto
    .replace(/\bmedia\s+docena\s+de\b/g, " 6 ")
    .replace(/\b(\d+|[a-z]+)\s+docenas?\s+de\b/g, (_, n: string) => ` ${(leerNumero(n) ?? 1) * 12} `)
    .replace(/\bdocena\s+de\b/g, " 12 ")
    .replace(/\bun\s+par\s+de\b/g, " 2 ");

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
  const pedido = ` ${agruparCantidades(texto.split(/\bpaga(?:n)? con\b/)[0])} `;

  // Frases con las que se nombra cada producto. También los agotados: se puede
  // vender lo que está en el estante sin anotar. De más a menos exacta:
  //   0 · como está escrito (apodos, nombre corto, nombre)
  //   1 · sin la medida ("Leche 1 L" → "leche", "Huevos x30" → "huevos")
  //   2 · solo la primera palabra ("Arroz Maria 500 g" → "arroz")
  const frases = productos
    .flatMap((p) => {
      const escritas = [...(p.alias ?? []), p.nombre_corto, p.nombre].map((f) =>
        // Sin la cantidad que traen algunos apodos ("una leche" → "leche")
        normalizar(f).replace(/\s+/g, " ").trim().replace(/^(un|una|unos|unas)\s+/, "")
      );
      const sinMedidas = escritas.map(sinMedida);
      const primeras = sinMedidas.map((f) => f.split(" ")[0]);
      const vistas = new Set<string>();
      return [escritas, sinMedidas, primeras].flatMap((lista, prioridad) =>
        lista
          .filter((frase) => {
            if (frase.length < 3 || VACIAS.has(frase) || frase in NUMEROS || vistas.has(frase)) return false;
            vistas.add(frase);
            return true;
          })
          .map((frase) => ({ producto: p, frase, prioridad }))
      );
    })
    // La frase más larga primero ("pan tajado" antes que "pan"); a igual largo, la
    // más exacta; entre productos, el de venta rápida
    .sort(
      (a, b) =>
        b.frase.length - a.frase.length ||
        a.prioridad - b.prioridad ||
        Number(b.producto.venta_rapida) - Number(a.producto.venta_rapida)
    );

  let resto = pedido;
  // Cantidad y en qué parte de la frase se dijo, para mantener el orden
  const encontrados = new Map<string, { cantidad: number; posicion: number }>();

  for (const { producto, frase } of frases) {
    // La cantidad es la palabra de antes ("dos", "3"); si no es un número, 1
    const patron = new RegExp(`((?:\\d+|[a-z]+)\\s+)?\\b${patronFrase(frase)}\\b`);
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
    .map(([productoId, { cantidad }]) => ({ productoId, cantidad }));

  return {
    lineas,
    medioPago: leerMedio(texto),
    pagaCon: leerPlata(texto),
    entendido: lineas.length > 0,
  };
}
