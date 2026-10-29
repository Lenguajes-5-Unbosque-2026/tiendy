// Convierte los CSV de data/mock/ en web/lib/mock/datos.json.
// Corre solo antes de `npm run dev` y `npm run build` (predev / prebuild).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "..", "data", "mock");
const destino = join(raiz, "lib", "mock", "datos.json");

const archivos = {
  tienda: "tienda.csv",
  personas: "personas.csv",
  categorias: "categorias.csv",
  productos: "productos.csv",
  turnos: "turnos.csv",
  ventas: "ventas.csv",
  ventaProductos: "venta_productos.csv",
  gastos: "gastos.csv",
};

// Columnas que son plata o cantidades
const numericas = new Set([
  "orden", "precio_venta", "costo", "unidades", "minimo", "base",
  "efectivo_esperado", "efectivo_contado", "diferencia", "total", "paga_con",
  "cantidad", "precio_unitario", "costo_unitario", "subtotal", "monto",
]);

function separarLinea(linea) {
  const valores = [];
  let actual = "";
  let entreComillas = false;
  for (const c of linea) {
    if (c === '"') entreComillas = !entreComillas;
    else if (c === "," && !entreComillas) {
      valores.push(actual);
      actual = "";
    } else actual += c;
  }
  valores.push(actual);
  return valores;
}

function convertir(columna, valor) {
  if (valor === "") return null;
  if (valor === "true") return true;
  if (valor === "false") return false;
  if (numericas.has(columna)) return Number(valor);
  if (columna === "alias") return valor.split("|");
  return valor;
}

function leerCsv(archivo) {
  const [encabezado, ...filas] = readFileSync(join(origen, archivo), "utf8")
    .replace(/^﻿/, "")
    .trim()
    .split(/\r?\n/);
  const columnas = separarLinea(encabezado);
  return filas.map((fila) => {
    const valores = separarLinea(fila);
    return Object.fromEntries(
      columnas.map((col, i) => [col, convertir(col, valores[i] ?? "")])
    );
  });
}

const datos = Object.fromEntries(
  Object.entries(archivos).map(([clave, archivo]) => [clave, leerCsv(archivo)])
);
datos.tienda = datos.tienda[0];

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, JSON.stringify(datos, null, 2));
console.log(`Datos de prueba listos en ${destino}`);
