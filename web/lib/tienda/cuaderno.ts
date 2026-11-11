// Mi cuaderno (CU-06): todo lo que pasó en la tienda, como una sola lista.
import { hora, pesos } from "@/lib/formato";
import type {
  Entrada,
  Gasto,
  MedioPagoGasto,
  Persona,
  Producto,
  Proveedor,
  Turno,
  Venta,
  VentaProducto,
} from "@/lib/mock/tipos";
import { HOY, ventasAnotadas } from "@/lib/tienda/calculos";
import { enDias, nombreCategoria } from "@/lib/tienda/gastos";

export type TipoMovimiento = "venta" | "gasto" | "mercancia" | "caja";

export type Movimiento = {
  /** "v12", "g03", "e01", "tu08-apertura": sirve de ruta en 36. */
  id: string;
  tipo: TipoMovimiento;
  fechaHora: string;
  titulo: string;
  detalle: string;
  /** Con signo: + entra, − sale. Null en aperturas y cierres. */
  monto: number | null;
  medio: MedioPagoGasto | null;
  turnoId: string;
  personaId: string;
};

export type Filtros = {
  tipos: TipoMovimiento[];
  medios: MedioPagoGasto[];
  desde: string;
  hasta: string;
  franja: "todos" | Turno["franja"];
  /** Un turno de la lista de Turnos (35). */
  turnoId: string | null;
  busqueda: string;
};

export const filtrosHoy: Filtros = {
  tipos: [],
  medios: [],
  desde: HOY,
  hasta: HOY,
  franja: "todos",
  turnoId: null,
  busqueda: "",
};

export const PERIODOS = {
  hoy: { desde: HOY, hasta: HOY },
  semana: { desde: enDias(-6), hasta: HOY },
  mes: { desde: `${HOY.slice(0, 8)}01`, hasta: HOY },
} as const;

export const nombreMedio: Record<MedioPagoGasto, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  quede_debiendo: "Quedé debiendo",
};

type Datos = {
  ventas: Venta[];
  ventaProductos: VentaProducto[];
  productos: Producto[];
  gastos: Gasto[];
  entradas: Entrada[];
  turnos: Turno[];
  personas: Persona[];
  proveedores: Proveedor[];
};

/** Todos los movimientos, del más reciente al más viejo. */
export function movimientos(d: Datos): Movimiento[] {
  const nombreProducto = new Map(d.productos.map((p) => [p.id, p.nombre_corto]));
  const nombrePersona = new Map(d.personas.map((p) => [p.id, p.nombre_corto]));
  const nombreProveedor = new Map(d.proveedores.map((p) => [p.id, p.nombre]));

  const ventas: Movimiento[] = ventasAnotadas(d.ventas).map((v) => {
    const lineas = d.ventaProductos.filter((l) => l.venta_id === v.id);
    const que = lineas
      .map((l) => `${nombreProducto.get(l.producto_id) ?? "Producto"}${l.cantidad > 1 ? ` ×${l.cantidad}` : ""}`)
      .join(", ");
    return {
      id: v.id,
      tipo: "venta",
      fechaHora: v.fecha_hora,
      titulo: `Venta · ${que || "sin productos"}`,
      detalle: `${hora(v.fecha_hora)} · ${nombreMedio[v.medio_pago]}`,
      monto: v.total,
      medio: v.medio_pago,
      turnoId: v.turno_id,
      personaId: v.persona_id,
    };
  });

  const gastos: Movimiento[] = d.gastos.map((g) => ({
    id: g.id,
    tipo: "gasto",
    fechaHora: g.fecha_hora,
    titulo: `Gasto · ${nombreCategoria(g.categoria)}`,
    detalle: [hora(g.fecha_hora), nombreMedio[g.medio_pago], g.nota].filter(Boolean).join(" · "),
    monto: -g.monto,
    medio: g.medio_pago,
    turnoId: g.turno_id,
    personaId: g.persona_id,
  }));

  const entradas: Movimiento[] = d.entradas.map((e) => ({
    id: e.id,
    tipo: "mercancia",
    fechaHora: e.fecha_hora,
    titulo: `Llegó mercancía · ${nombreProveedor.get(e.proveedor_id ?? "") ?? "sin proveedor"}`,
    detalle: `${hora(e.fecha_hora)} · ${nombreMedio[e.medio_pago]}`,
    monto: -e.total,
    medio: e.medio_pago,
    turnoId: e.turno_id,
    personaId: e.persona_id,
  }));

  const caja: Movimiento[] = d.turnos.flatMap((t) => {
    const quien = nombrePersona.get(t.persona_id) ?? "";
    const apertura: Movimiento = {
      id: `${t.id}-apertura`,
      tipo: "caja",
      fechaHora: t.abierto_en,
      titulo: `Abrió caja · ${quien}`,
      detalle: `${hora(t.abierto_en)} · base ${pesos(t.base)}`,
      monto: null,
      medio: null,
      turnoId: t.id,
      personaId: t.persona_id,
    };
    if (!t.cerrado_en) return [apertura];
    const cierre: Movimiento = {
      id: `${t.id}-cierre`,
      tipo: "caja",
      fechaHora: t.cerrado_en,
      titulo: `Cerró caja · ${quien}`,
      detalle: `${hora(t.cerrado_en)} · ${resultadoCaja(t.diferencia ?? 0)}`,
      monto: null,
      medio: null,
      turnoId: t.id,
      personaId: t.persona_id,
    };
    return [apertura, cierre];
  });

  return [...ventas, ...gastos, ...entradas, ...caja].sort((a, b) =>
    a.fechaHora < b.fechaHora ? 1 : -1
  );
}

/** "caja cuadró", "sobraron $2.000", "faltaron $3.000". */
export function resultadoCaja(diferencia: number) {
  if (diferencia === 0) return "caja cuadró";
  return diferencia > 0 ? `sobraron ${pesos(diferencia)}` : `faltaron ${pesos(-diferencia)}`;
}

const sinTildes = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function filtrar(lista: Movimiento[], f: Filtros, turnos: Turno[]) {
  const franja = new Map(turnos.map((t) => [t.id, t.franja]));
  const q = sinTildes(f.busqueda.trim());
  return lista.filter((m) => {
    const dia = m.fechaHora.slice(0, 10);
    if (f.turnoId) {
      if (m.turnoId !== f.turnoId) return false;
    } else if (dia < f.desde || dia > f.hasta) return false;
    if (f.tipos.length && !f.tipos.includes(m.tipo)) return false;
    if (f.medios.length && (!m.medio || !f.medios.includes(m.medio))) return false;
    if (f.franja !== "todos" && franja.get(m.turnoId) !== f.franja) return false;
    if (q && !sinTildes(`${m.titulo} ${m.detalle}`).includes(q)) return false;
    return true;
  });
}

/** Entró = ventas; Salió = gastos, también los que quedaron debiendo. La mercancía no es gasto. */
export function totales(lista: Movimiento[]) {
  return {
    entro: lista.filter((m) => m.tipo === "venta").reduce((s, m) => s + (m.monto ?? 0), 0),
    salio: lista.filter((m) => m.tipo === "gasto").reduce((s, m) => s - (m.monto ?? 0), 0),
  };
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];

/** "Lun 21 sep." (Turnos, 35). */
export function diaCorto(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`);
  const dia = DIAS[d.getUTCDay()].slice(0, 3);
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
}

/** "Hoy, miércoles 23" o "Lunes 21 sep.". */
export function nombreDia(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`);
  const dia = DIAS[d.getUTCDay()];
  if (fecha === HOY) return `Hoy, ${dia} ${d.getUTCDate()}`;
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
}
