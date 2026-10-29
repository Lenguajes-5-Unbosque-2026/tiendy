// Lo que no se guarda porque se calcula (data/mock/README.md).
import type {
  Abono,
  AcuerdoPago,
  Cliente,
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

/** Resumen del día para el Home (15): vendido, ganancia y fiado. */
export function resumenDelDia(
  ventas: Venta[],
  lineas: VentaProducto[],
  fecha = HOY
) {
  const delDia = ventasAnotadas(ventas).filter((v) => esDelDia(v.fecha_hora, fecha));
  const ids = new Set(delDia.map((v) => v.id));
  const porMedio: Record<MedioPago, number> = { efectivo: 0, transferencia: 0, fiado: 0 };
  for (const v of delDia) porMedio[v.medio_pago] += v.total;

  // Sin costo no se puede calcular la ganancia de esa línea (p36)
  const ganancia = lineas
    .filter((l) => ids.has(l.venta_id) && l.costo_unitario !== null)
    .reduce((suma, l) => suma + (l.precio_unitario - (l.costo_unitario ?? 0)) * l.cantidad, 0);

  return {
    vendido: delDia.reduce((suma, v) => suma + v.total, 0),
    ganancia,
    fiado: porMedio.fiado,
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
      fiado: sumar("fiado"),
    },
    esperado: turno.base + ventasEfectivo - gastosEfectivo,
    cantidadVentas: delTurno.length,
    cantidadGastos: gastosTurno.length,
  };
}

/** Lo que debe un cliente = sus ventas fiadas anotadas − sus abonos. */
export function deudaCliente(clienteId: string, ventas: Venta[], abonos: Abono[]) {
  const fiado = ventasAnotadas(ventas)
    .filter((v) => v.medio_pago === "fiado" && v.cliente_id === clienteId)
    .reduce((s, v) => s + v.total, 0);
  const abonado = abonos
    .filter((a) => a.cliente_id === clienteId)
    .reduce((s, a) => s + a.monto, 0);
  return Math.max(0, fiado - abonado);
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

/** Días completos entre dos fechas AAAA-MM-DD (positivo si `hasta` es después). */
export function diasEntre(desde: string, hasta: string) {
  const a = Date.UTC(+desde.slice(0, 4), +desde.slice(5, 7) - 1, +desde.slice(8, 10));
  const b = Date.UTC(+hasta.slice(0, 4), +hasta.slice(5, 7) - 1, +hasta.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

const ACUERDOS: Record<AcuerdoPago, string> = {
  esta_semana: "esta semana",
  quincena: "quincena",
  fin_de_mes: "fin de mes",
};

export function textoAcuerdo(acuerdo: AcuerdoPago) {
  return ACUERDOS[acuerdo];
}

/** Cómo va un cliente con su fiado, para la lista (37). */
export function estadoFiado(cliente: Cliente, deuda: number, abonos: Abono[]) {
  const suyos = abonos
    .filter((a) => a.cliente_id === cliente.id)
    .sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora));
  const ultimo = suyos[0];
  const haceUltimo = ultimo ? diasEntre(ultimo.fecha_hora, HOY) : null;
  const cuando =
    haceUltimo === null ? "" : haceUltimo === 0 ? "hoy" : haceUltimo === 1 ? "ayer" : `hace ${haceUltimo} días`;

  if (deuda === 0) {
    return { texto: ultimo ? `Al día · abonó ${cuando}` : "Al día", tono: "exito" as const, vencido: false };
  }
  const atraso = cliente.fecha_acuerdo ? diasEntre(cliente.fecha_acuerdo, HOY) : null;
  if (atraso !== null && atraso > 0) {
    return {
      texto: `Vencido hace ${atraso} ${atraso === 1 ? "día" : "días"}`,
      tono: "peligro" as const,
      vencido: true,
    };
  }
  if (cliente.acuerdo_pago) {
    return { texto: `Paga ${cliente.acuerdo_pago === "quincena" ? "en quincena" : textoAcuerdo(cliente.acuerdo_pago)}`, tono: "secundario" as const, vencido: false };
  }
  if (ultimo) return { texto: `Último abono ${cuando}`, tono: "secundario" as const, vencido: false };
  return { texto: "Sin acuerdo de pago", tono: "secundario" as const, vencido: false };
}

/** Si el cliente acordó pagar en los próximos 7 días (filtro "Esta semana" de 37). */
export function pagaEstaSemana(cliente: Cliente) {
  if (cliente.acuerdo_pago === "esta_semana") return true;
  if (!cliente.fecha_acuerdo) return false;
  const dias = diasEntre(HOY, cliente.fecha_acuerdo);
  return dias >= 0 && dias <= 7;
}

export type Movimiento = {
  id: string;
  tipo: "fiado" | "abono";
  titulo: string;
  fecha: string;
  monto: number;
};

/** Fiados y abonos de un cliente, del más nuevo al más viejo (38). */
export function movimientosCliente(
  clienteId: string,
  ventas: Venta[],
  lineas: VentaProducto[],
  productos: Producto[],
  abonos: Abono[]
): Movimiento[] {
  const nombreCorto = new Map(productos.map((p) => [p.id, p.nombre_corto]));
  const fiados: Movimiento[] = ventasAnotadas(ventas)
    .filter((v) => v.medio_pago === "fiado" && v.cliente_id === clienteId)
    .map((v) => {
      const nombres = lineas
        .filter((l) => l.venta_id === v.id)
        .map((l) => nombreCorto.get(l.producto_id))
        .filter(Boolean);
      return {
        id: v.id,
        tipo: "fiado",
        titulo: `Fiado · ${nombres.join(", ")}`,
        fecha: v.fecha_hora,
        monto: v.total,
      };
    });
  const pagos: Movimiento[] = abonos
    .filter((a) => a.cliente_id === clienteId)
    .map((a) => ({
      id: a.id,
      tipo: "abono",
      titulo: `Abono en ${a.medio_pago === "efectivo" ? "efectivo" : "transferencia"}`,
      fecha: a.fecha_hora,
      monto: a.monto,
    }));
  return [...fiados, ...pagos].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Días de venta que cubre la sugerencia de compra (44). */
export const DIAS_SUGERENCIA = 7;

/** Cuánto pedir para cubrir los próximos días de venta, sin bajar del mínimo. */
export function cantidadSugerida(producto: Producto, promedio: number) {
  const necesarias = Math.max(Math.ceil(promedio * DIAS_SUGERENCIA), producto.minimo);
  return Math.max(0, necesarias - producto.unidades);
}
