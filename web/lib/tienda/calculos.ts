// Lo que no se guarda porque se calcula (data/mock/README.md).
import type {
  Gasto,
  MedioPago,
  Producto,
  Turno,
  Venta,
  VentaProducto,
} from "@/lib/mock/tipos";

/** "Hoy" en los datos de prueba: el 23 de septiembre, como en Figma. */
export const HOY = "2026-09-23";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const esDelDia = (fechaHora: string, fecha: string) => fechaHora.startsWith(fecha);

export function ventasAnotadas(ventas: Venta[]) {
  return ventas.filter((v) => v.estado === "anotada");
}

/** Resumen del día para el Home (15): vendido y ganancia. */
export function resumenDelDia(
  ventas: Venta[],
  lineas: VentaProducto[],
  fecha = HOY
) {
  const delDia = ventasAnotadas(ventas).filter((v) => esDelDia(v.fecha_hora, fecha));
  const ids = new Set(delDia.map((v) => v.id));
  const porMedio: Record<MedioPago, number> = { efectivo: 0, transferencia: 0 };
  for (const v of delDia) porMedio[v.medio_pago] += v.total;

  // Sin costo no se puede calcular la ganancia de esa línea (p36)
  const ganancia = lineas
    .filter((l) => ids.has(l.venta_id) && l.costo_unitario !== null)
    .reduce((suma, l) => suma + (l.precio_unitario - (l.costo_unitario ?? 0)) * l.cantidad, 0);

  return {
    vendido: delDia.reduce((suma, v) => suma + v.total, 0),
    ganancia,
    porMedio,
    cantidadVentas: delDia.length,
  };
}

/** Caja del turno (17). Efectivo esperado = base + ventas en efectivo − gastos en efectivo. */
export function cajaDelTurno(turno: Turno, ventas: Venta[], gastos: Gasto[]) {
  const delTurno = ventasAnotadas(ventas).filter((v) => v.turno_id === turno.id);
  const gastosTurno = gastos.filter((g) => g.turno_id === turno.id);
  const sumar = (medio: MedioPago) =>
    delTurno.filter((v) => v.medio_pago === medio).reduce((s, v) => s + v.total, 0);
  const ventasEfectivo = sumar("efectivo");
  const gastosEfectivo = gastosTurno
    .filter((g) => g.medio_pago === "efectivo")
    .reduce((s, g) => s + g.monto, 0);

  return {
    base: turno.base,
    ventasEfectivo,
    gastosEfectivo,
    porMedio: {
      efectivo: ventasEfectivo,
      transferencia: sumar("transferencia"),
    },
    esperado: turno.base + ventasEfectivo - gastosEfectivo,
    cantidadVentas: delTurno.length,
    cantidadGastos: gastosTurno.length,
  };
}

/** Fechas (AAAA-MM-DD) de los últimos `n` días, terminando hoy. */
function ultimosDias(n: number, hasta = HOY) {
  const fin = new Date(`${hasta}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(fin);
    d.setUTCDate(fin.getUTCDate() - (n - 1 - i));
    return d;
  });
}

/** Unidades vendidas por día en los últimos 7 días (gráfica de 42). */
export function ventasUltimos7Dias(
  productoId: string,
  ventas: Venta[],
  lineas: VentaProducto[]
) {
  const fechaDeVenta = new Map(
    ventasAnotadas(ventas).map((v) => [v.id, v.fecha_hora.slice(0, 10)])
  );
  return ultimosDias(7).map((d, i, todos) => {
    const fecha = d.toISOString().slice(0, 10);
    const unidades = lineas
      .filter((l) => l.producto_id === productoId && fechaDeVenta.get(l.venta_id) === fecha)
      .reduce((s, l) => s + l.cantidad, 0);
    return {
      fecha,
      etiqueta: i === todos.length - 1 ? "Hoy" : DIAS[d.getUTCDay()],
      unidades,
    };
  });
}

/** Cuántas unidades se venden en promedio por día, según los días con registro. */
export function promedioDiario(
  productoId: string,
  ventas: Venta[],
  lineas: VentaProducto[]
) {
  const anotadas = ventasAnotadas(ventas);
  const dias = new Set(anotadas.map((v) => v.fecha_hora.slice(0, 10))).size || 1;
  const ids = new Set(anotadas.map((v) => v.id));
  const vendidas = lineas
    .filter((l) => l.producto_id === productoId && ids.has(l.venta_id))
    .reduce((s, l) => s + l.cantidad, 0);
  return vendidas / dias;
}

export type NivelStock = "ok" | "bajo" | "critico";

/** Estado del inventario de un producto: por agotarse si está en su mínimo o debajo. */
export function estadoStock(producto: Producto, promedio: number) {
  const porAgotarse = producto.unidades <= producto.minimo;
  const dias = promedio > 0 ? Math.floor(producto.unidades / promedio) : null;
  let nivel: NivelStock = "ok";
  if (porAgotarse) {
    nivel = producto.unidades === 0 || (dias !== null && dias <= 2) ? "critico" : "bajo";
  }

  let alcance: string | null = null;
  if (producto.unidades === 0) alcance = "agotado";
  else if (dias !== null) alcance = dias <= 1 ? "se acaba mañana" : `alcanza ${dias} días`;

  return { porAgotarse, nivel, dias, alcance, promedio };
}

/** Días de venta que cubre la sugerencia de compra (44). */
export const DIAS_SUGERENCIA = 7;

/** Cuánto pedir para cubrir los próximos días de venta, sin bajar del mínimo. */
export function cantidadSugerida(producto: Producto, promedio: number) {
  const necesarias = Math.max(Math.ceil(promedio * DIAS_SUGERENCIA), producto.minimo);
  return Math.max(0, necesarias - producto.unidades);
}
