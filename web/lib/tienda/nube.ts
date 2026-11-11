// Lectura y escritura en Supabase de lo que ya vive en la base: la tienda y sus
// personas (registro, inicio de sesión, Mi tienda), los productos (41), los turnos
// (Caja) y las ventas (20 → 22). Los permisos están en supabase/escritura.sql y
// supabase/cuentas.sql. Gastos y entradas de mercancía siguen en el navegador.
import type { Persona, Producto, Tienda, Turno, Venta, VentaProducto } from "@/lib/mock/tipos";
import { supabase } from "@/lib/supabase";

const COLUMNAS_PRODUCTO =
  "id, categoria_id, nombre, nombre_corto, alias, precio_venta, costo, unidades, minimo, venta_rapida, origen, imagen";

/** Mi inventario (41): los productos de la tienda, leídos de la tabla productos. */
export async function leerProductos(tiendaId: string): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select(COLUMNAS_PRODUCTO)
    .eq("tienda_id", tiendaId)
    .order("id");
  if (error) throw error;
  return data as Producto[];
}

/** Lo que necesita la base para guardar una venta. */
export type VentaParaGuardar = {
  tiendaId: string;
  venta: Venta;
  lineas: VentaProducto[];
  turno: Turno | null;
  persona: Persona | null;
  /** Productos de la venta, con las unidades que les quedan después de descontar. */
  productos: Producto[];
  /** Venta que esta reemplaza (corrección desde 36), con las unidades ya devueltas. */
  corrige?: string;
};

function filaProducto(tiendaId: string, p: Producto) {
  return {
    id: p.id,
    tienda_id: tiendaId,
    categoria_id: p.categoria_id,
    nombre: p.nombre,
    nombre_corto: p.nombre_corto,
    alias: p.alias ?? [],
    precio_venta: p.precio_venta,
    costo: p.costo,
    unidades: p.unidades,
    minimo: p.minimo,
    venta_rapida: p.venta_rapida,
    origen: p.origen ?? "manual",
    imagen: p.imagen,
  };
}

/**
 * Registrar venta: la guarda en ventas y venta_productos y descuenta las
 * unidades en productos. El turno, la persona y los productos creados en el
 * celular se agregan primero si la base todavía no los tiene.
 */
export async function guardarVenta({
  tiendaId,
  venta,
  lineas,
  turno,
  persona,
  productos,
  corrige,
}: VentaParaGuardar) {
  // 1. Lo que la venta necesita que exista (si ya está, no se toca)
  if (persona) {
    const { error } = await supabase
      .from("personas")
      .upsert({ ...persona, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
  if (turno) {
    const { error } = await supabase
      .from("turnos")
      .upsert({ ...turno, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
  const { error: errorProductos } = await supabase
    .from("productos")
    .upsert(
      productos.map((p) => filaProducto(tiendaId, p)),
      { onConflict: "id", ignoreDuplicates: true }
    );
  if (errorProductos) throw errorProductos;

  // 2. La venta corregida deja de contar
  if (corrige) {
    const { error } = await supabase.from("ventas").update({ estado: "eliminada" }).eq("id", corrige);
    if (error) throw error;
  }

  // 3. La venta y sus productos (al reintentar, lo que ya quedó guardado no se duplica)
  const { error: errorVenta } = await supabase
    .from("ventas")
    .upsert({ ...venta, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (errorVenta) throw errorVenta;
  const { error: errorLineas } = await supabase
    .from("venta_productos")
    .upsert(lineas, { onConflict: "id", ignoreDuplicates: true });
  if (errorLineas) throw errorLineas;

  // 4. Lo que queda en el estante
  await guardarUnidades(productos);
}

/** Deshacer (22) o eliminar (36): la venta deja de contar y sus productos vuelven. */
export async function quitarVenta(
  ventaId: string,
  estado: "deshecha" | "eliminada",
  productos: Producto[]
) {
  const { error } = await supabase.from("ventas").update({ estado }).eq("id", ventaId);
  if (error) throw error;
  await guardarUnidades(productos);
}

/** Cargar productos (11, 12, 13): los nuevos quedan en la tabla productos de su tienda. */
export async function agregarProductos(tiendaId: string, productos: Producto[]) {
  const { error } = await supabase
    .from("productos")
    .upsert(
      productos.map((p) => filaProducto(tiendaId, p)),
      { onConflict: "id", ignoreDuplicates: true }
    );
  if (error) throw error;
}

/** Ver y editar producto (42) y Llegó mercancía (41a): precio, costo y unidades. */
export async function guardarCambiosProductos(
  productos: Pick<Producto, "id" | "precio_venta" | "costo" | "unidades">[]
) {
  const resultados = await Promise.all(
    productos.map(({ id, precio_venta, costo, unidades }) =>
      supabase.from("productos").update({ precio_venta, costo, unidades }).eq("id", id)
    )
  );
  const conError = resultados.find((r) => r.error);
  if (conError) throw conError.error;
}

async function guardarUnidades(productos: Pick<Producto, "id" | "unidades">[]) {
  const resultados = await Promise.all(
    productos.map(({ id, unidades }) => supabase.from("productos").update({ unidades }).eq("id", id))
  );
  const conError = resultados.find((r) => r.error);
  if (conError) throw conError.error;
}

/** Supabase devuelve las fechas en UTC; la app las usa en hora de Colombia ("…-05:00"). */
function aColombia(iso: string): string;
function aColombia(iso: string | null): string | null;
function aColombia(iso: string | null) {
  if (!iso) return iso;
  const local = new Date(new Date(iso).getTime() - 5 * 60 * 60 * 1000);
  return `${local.toISOString().slice(0, 19)}-05:00`;
}

/** Iniciar sesión (03, 04): la tienda que tiene ese celular, o null si es un número nuevo. */
export async function buscarTienda(celular: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("tienda")
    .select("id")
    .eq("celular", celular)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export type DatosTienda = {
  tienda: Tienda;
  personas: Persona[];
  productos: Producto[];
  turnos: Turno[];
  ventas: Venta[];
  ventaProductos: VentaProducto[];
};

/** Todo lo de una tienda que vive en Supabase, para entrar desde cualquier celular. */
export async function leerTienda(tiendaId: string): Promise<DatosTienda> {
  const [tienda, personas, productos, turnos, ventas, ventaProductos] = await Promise.all([
    supabase
      .from("tienda")
      .select("id, nombre, tipo, barrio, direccion, ciudad, horario_apertura, horario_cierre, nit, celular")
      .eq("id", tiendaId)
      .single(),
    supabase
      .from("personas")
      .select("id, nombre, nombre_corto, rol, activo")
      .eq("tienda_id", tiendaId)
      .order("creada_en"),
    leerProductos(tiendaId),
    supabase
      .from("turnos")
      .select(
        "id, persona_id, fecha, franja, abierto_en, cerrado_en, base, efectivo_esperado, efectivo_contado, diferencia, motivo_diferencia, estado"
      )
      .eq("tienda_id", tiendaId),
    supabase
      .from("ventas")
      .select("id, turno_id, persona_id, fecha_hora, canal, medio_pago, total, paga_con, estado")
      .eq("tienda_id", tiendaId),
    // Los productos de cada venta se filtran por la tienda de su venta
    supabase
      .from("venta_productos")
      .select("id, venta_id, producto_id, cantidad, precio_unitario, costo_unitario, subtotal, ventas!inner(tienda_id)")
      .eq("ventas.tienda_id", tiendaId),
  ]);
  for (const r of [tienda, personas, turnos, ventas, ventaProductos]) if (r.error) throw r.error;

  const t = tienda.data!;
  return {
    tienda: {
      ...t,
      barrio: t.barrio ?? "",
      tipo: t.tipo ?? "Tienda de barrio",
      // "06:00:00" → "06:00", como en los datos de prueba
      horario_apertura: t.horario_apertura?.slice(0, 5) ?? null,
      horario_cierre: t.horario_cierre?.slice(0, 5) ?? null,
    },
    personas: personas.data as Persona[],
    productos,
    turnos: (turnos.data as Turno[])
      .map((x) => ({ ...x, abierto_en: aColombia(x.abierto_en), cerrado_en: aColombia(x.cerrado_en) }))
      .sort((a, b) => a.abierto_en.localeCompare(b.abierto_en)),
    ventas: (ventas.data as Venta[])
      .map((v) => ({ ...v, fecha_hora: aColombia(v.fecha_hora) }))
      .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora)),
    ventaProductos: (ventaProductos.data ?? []).map(
      ({ id, venta_id, producto_id, cantidad, precio_unitario, costo_unitario, subtotal }) => ({
        id,
        venta_id,
        producto_id,
        cantidad,
        precio_unitario,
        costo_unitario,
        subtotal,
      })
    ),
  };
}

/** El celular ya tiene tienda: la base no deja registrar otra (supabase/celular-unico.sql). */
export class CelularRegistrado extends Error {}

/** Postgres: valor repetido en una columna única. */
const REPETIDO = "23505";

/** Tu tienda (06): la tienda nueva y su dueña. Un celular, una tienda. */
export async function crearTienda(tienda: Tienda, duena: Persona) {
  // Se revisa antes por si la base todavía no tiene la regla de celular único
  if (tienda.celular && (await buscarTienda(tienda.celular))) throw new CelularRegistrado();
  const { error } = await supabase.from("tienda").insert(tienda);
  if (error?.code === REPETIDO) throw new CelularRegistrado();
  if (error) throw error;
  await guardarPersona(tienda.id, duena);
}

/** Mi tienda (46): los datos del negocio. */
export async function guardarTienda(tiendaId: string, cambios: Partial<Tienda>) {
  const { error } = await supabase.from("tienda").update(cambios).eq("id", tiendaId);
  if (error) throw error;
}

/** Empleados (47): agregar una persona (si ya está, no se toca). */
export async function guardarPersona(tiendaId: string, persona: Persona) {
  const { error } = await supabase
    .from("personas")
    .upsert({ ...persona, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

/** Quitar un empleado: queda inactivo, sus registros siguen a su nombre. */
export async function desactivarPersona(personaId: string) {
  const { error } = await supabase.from("personas").update({ activo: false }).eq("id", personaId);
  if (error) throw error;
}

/** Abrir caja (16): el turno nuevo. */
export async function abrirTurno(tiendaId: string, turno: Turno) {
  const { error } = await supabase
    .from("turnos")
    .upsert({ ...turno, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

/** Cerrar caja (18): lo contado, la diferencia y el motivo. */
export async function cerrarTurno(turno: Turno) {
  const { error } = await supabase
    .from("turnos")
    .update({
      cerrado_en: turno.cerrado_en,
      efectivo_esperado: turno.efectivo_esperado,
      efectivo_contado: turno.efectivo_contado,
      diferencia: turno.diferencia,
      motivo_diferencia: turno.motivo_diferencia,
      estado: turno.estado,
    })
    .eq("id", turno.id);
  if (error) throw error;
}
