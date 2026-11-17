// Lectura y escritura en Supabase de lo que ya vive en la base: la tienda y sus
// personas (registro, inicio de sesión, Mi tienda), los productos (41), los turnos
// (Caja), las ventas (20 → 22), los gastos (27 → 32) y las entradas de mercancía
// (41a). Los permisos están en supabase/escritura.sql, cuentas.sql y gastos.sql;
// el tiempo real y la tienda de cada línea de venta o entrada, en sincronizar.sql.
//
// Cada "subir…" deja en Supabase el registro tal como está en el celular y se
// puede repetir sin duplicar nada: si falla, la app lo vuelve a intentar después.
import type {
  Entrada,
  EntradaProducto,
  Gasto,
  Persona,
  Producto,
  Tienda,
  Turno,
  Venta,
  VentaProducto,
} from "@/lib/mock/tipos";
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

/** Agrega los productos que la base todavía no tiene (si ya están, no se tocan). */
async function insertarProductos(tiendaId: string, productos: Producto[]) {
  if (productos.length === 0) return;
  const { error } = await supabase
    .from("productos")
    .upsert(
      productos.map((p) => filaProducto(tiendaId, p)),
      { onConflict: "id", ignoreDuplicates: true }
    );
  if (error) throw error;
}

/**
 * Cargar productos (11, 12, 13), Ver y editar producto (42) y Llegó mercancía
 * (41a): los productos quedan en su tienda con el precio, el costo y las
 * unidades del celular.
 */
export async function subirProductos(tiendaId: string, productos: Producto[]) {
  await insertarProductos(tiendaId, productos);
  const resultados = await Promise.all(
    productos.map(({ id, precio_venta, costo, unidades }) =>
      supabase.from("productos").update({ precio_venta, costo, unidades }).eq("id", id)
    )
  );
  const conError = resultados.find((r) => r.error);
  if (conError) throw conError.error;
}

let movimientos: Promise<boolean> | null = null;

/**
 * La base lleva las unidades (supabase/inventario.sql): resta con cada venta,
 * devuelve al deshacer y suma con la mercancía que llega. Entonces la app no
 * manda las unidades después de vender; si la base todavía no lo tiene, sí.
 */
export function porMovimientos(): Promise<boolean> {
  movimientos ??= Promise.resolve(supabase.rpc("inventario_por_movimientos")).then(
    ({ data, error }) => {
      // Sin conexión no se sabe: se vuelve a preguntar la próxima vez
      if (error && !error.code) movimientos = null;
      return !error && data === true;
    },
    () => {
      movimientos = null;
      return false;
    }
  );
  return movimientos;
}

async function guardarUnidades(productos: Pick<Producto, "id" | "unidades">[]) {
  const resultados = await Promise.all(
    productos.map(({ id, unidades }) => supabase.from("productos").update({ unidades }).eq("id", id))
  );
  const conError = resultados.find((r) => r.error);
  if (conError) throw conError.error;
}

/** Lo que necesita la base para guardar una venta. */
export type VentaParaGuardar = {
  tiendaId: string;
  venta: Venta;
  lineas: VentaProducto[];
  turno: Turno | null;
  persona: Persona | null;
  /**
   * Productos de la venta. Si la base lleva las unidades, con las que debe tener
   * antes de contar lo pendiente (ver unidadesParaSubir en store.tsx); si no, con
   * las que les quedan en el celular.
   */
  productos: Producto[];
};

/**
 * Registrar venta (20 → 22), deshacer (22), eliminar o corregir (36): la venta y
 * sus productos quedan en ventas y venta_productos con su estado. Las unidades
 * las resta y las devuelve la base; si todavía no lo hace, se mandan las del
 * celular. El turno, la persona y los productos se agregan primero si la base
 * todavía no los tiene.
 */
export async function subirVenta({ tiendaId, venta, lineas, turno, persona, productos }: VentaParaGuardar) {
  if (persona) await guardarPersona(tiendaId, persona);
  if (turno) await subirTurno(tiendaId, turno);
  await insertarProductos(tiendaId, productos);

  const { error: errorVenta } = await supabase
    .from("ventas")
    .upsert({ ...venta, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (errorVenta) throw errorVenta;
  // venta_productos.tienda_id lo llena la base (supabase/sincronizar.sql)
  const { error: errorLineas } = await supabase
    .from("venta_productos")
    .upsert(lineas, { onConflict: "id", ignoreDuplicates: true });
  if (errorLineas) throw errorLineas;
  // Si ya estaba guardada, pudo pasar a deshecha o eliminada
  const { error: errorEstado } = await supabase
    .from("ventas")
    .update({ estado: venta.estado })
    .eq("id", venta.id);
  if (errorEstado) throw errorEstado;

  if (!(await porMovimientos())) await guardarUnidades(productos);
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

/** PostgREST: la función no existe en la base. */
const SIN_FUNCION = "PGRST202";

/**
 * Tu celular (03): si el número ya tiene tienda. Se pregunta antes de iniciar
 * sesión, cuando todavía no se puede leer la tabla tienda (permisos-por-tienda.sql):
 * la función solo responde sí o no.
 */
export async function celularRegistrado(celular: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("celular_registrado", { cel: celular });
  if (error?.code === SIN_FUNCION) return Boolean(await buscarTienda(celular));
  if (error) throw error;
  return data === true;
}

export type DatosTienda = {
  tienda: Tienda;
  personas: Persona[];
  productos: Producto[];
  turnos: Turno[];
  ventas: Venta[];
  ventaProductos: VentaProducto[];
  gastos: Gasto[];
  entradas: Entrada[];
  entradaProductos: EntradaProducto[];
};

/** Todo lo de una tienda que vive en Supabase, para entrar desde cualquier celular. */
export async function leerTienda(tiendaId: string): Promise<DatosTienda> {
  const [tienda, personas, productos, turnos, ventas, ventaProductos, gastos, entradas, entradaProductos] =
    await Promise.all([
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
    // (así funciona aunque todavía no se haya corrido sincronizar.sql)
    supabase
      .from("venta_productos")
      .select("id, venta_id, producto_id, cantidad, precio_unitario, costo_unitario, subtotal, ventas!inner(tienda_id)")
      .eq("ventas.tienda_id", tiendaId),
    supabase
      .from("gastos")
      .select(
        "id, turno_id, persona_id, fecha_hora, monto, categoria, nota, proveedor_id, canal, lo_que_dijo, medio_pago, pagar_antes_de, imagen"
      )
      .eq("tienda_id", tiendaId),
    supabase
      .from("entradas_mercancia")
      .select("id, proveedor_id, turno_id, persona_id, fecha_hora, total, medio_pago, pagar_antes_de, imagen")
      .eq("tienda_id", tiendaId),
    // Los productos de cada entrada se filtran por la tienda de su entrada
    supabase
      .from("entrada_productos")
      .select("id, entrada_id, producto_id, cantidad, costo_unitario, subtotal, entradas_mercancia!inner(tienda_id)")
      .eq("entradas_mercancia.tienda_id", tiendaId),
  ]);
  for (const r of [tienda, personas, turnos, ventas, ventaProductos, gastos, entradas, entradaProductos])
    if (r.error) throw r.error;

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
    gastos: (gastos.data as Gasto[])
      .map((g) => ({ ...g, fecha_hora: aColombia(g.fecha_hora) }))
      .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora)),
    entradas: (entradas.data as (Omit<Entrada, "turno_id"> & { turno_id: string | null })[])
      // En la app, "sin turno" es "" (la mercancía llegó con la caja cerrada)
      .map((e) => ({ ...e, turno_id: e.turno_id ?? "", fecha_hora: aColombia(e.fecha_hora) }))
      .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora)),
    entradaProductos: (entradaProductos.data ?? []).map(
      ({ id, entrada_id, producto_id, cantidad, costo_unitario, subtotal }) => ({
        id,
        entrada_id,
        producto_id,
        cantidad,
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
  if (tienda.celular && (await celularRegistrado(tienda.celular))) throw new CelularRegistrado();
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

/** Agrega una persona si la base no la tiene (si ya está, no se toca). */
async function guardarPersona(tiendaId: string, persona: Persona) {
  const { error } = await supabase
    .from("personas")
    .upsert({ ...persona, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

/**
 * Empleados (47): la persona queda como en el celular. Al quitarla queda
 * inactiva y sus registros siguen a su nombre.
 */
export async function subirPersona(tiendaId: string, persona: Persona) {
  await guardarPersona(tiendaId, persona);
  const { error } = await supabase
    .from("personas")
    .update({ nombre: persona.nombre, nombre_corto: persona.nombre_corto, activo: persona.activo })
    .eq("id", persona.id);
  if (error) throw error;
}

/** Abrir caja (16) y cerrar caja (18): el turno, con lo contado si ya se cerró. */
export async function subirTurno(tiendaId: string, turno: Turno) {
  const { error } = await supabase
    .from("turnos")
    .upsert({ ...turno, tienda_id: tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
  if (turno.estado !== "cerrado") return;
  const { error: errorCierre } = await supabase
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
  if (errorCierre) throw errorCierre;
}

/** Lo que necesita la base para guardar un gasto o una entrada: su turno y quién atendía. */
export type Contexto = { tiendaId: string; turno: Turno | null; persona: Persona | null };

async function asegurarContexto({ tiendaId, turno, persona }: Contexto) {
  if (persona) await guardarPersona(tiendaId, persona);
  if (turno) await subirTurno(tiendaId, turno);
}

/**
 * Registrar gasto (31). Si el gasto ya no está en el celular (se eliminó o se
 * corrigió desde el cuaderno, 36), se borra de la base.
 */
export async function subirGasto(gastoId: string, gasto: Gasto | null, contexto: Contexto) {
  if (!gasto) {
    const { error } = await supabase.from("gastos").delete().eq("id", gastoId);
    if (error) throw error;
    return;
  }
  await asegurarContexto(contexto);
  const { error } = await supabase
    .from("gastos")
    .upsert({ ...gasto, tienda_id: contexto.tiendaId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

/**
 * Llegó mercancía (41a): la entrada y sus productos. Las unidades y el costo
 * los suma la base; si todavía no lo hace, se mandan los del celular.
 */
export async function subirEntrada(
  entrada: Entrada,
  lineas: EntradaProducto[],
  productos: Producto[],
  contexto: Contexto
) {
  await asegurarContexto(contexto);
  await insertarProductos(contexto.tiendaId, productos);
  const { error } = await supabase
    .from("entradas_mercancia")
    .upsert(
      { ...entrada, turno_id: entrada.turno_id || null, tienda_id: contexto.tiendaId },
      { onConflict: "id", ignoreDuplicates: true }
    );
  if (error) throw error;
  // entrada_productos.tienda_id lo llena la base (supabase/sincronizar.sql)
  const { error: errorLineas } = await supabase
    .from("entrada_productos")
    .upsert(lineas, { onConflict: "id", ignoreDuplicates: true });
  if (errorLineas) throw errorLineas;
  if (!(await porMovimientos())) await subirProductos(contexto.tiendaId, productos);
}

/** Tablas con tienda_id que avisan en tiempo real cuando cambian (supabase/sincronizar.sql). */
const TABLAS_DE_LA_TIENDA = [
  "personas",
  "productos",
  "turnos",
  "ventas",
  "venta_productos",
  "gastos",
  "entradas_mercancia",
  "entrada_productos",
] as const;

/**
 * Escucha los cambios de la tienda en Supabase (desde otro celular o desde el
 * panel de Supabase) y llama a alCambiar. Devuelve la función para dejar de escuchar.
 * Si las tablas no tienen el tiempo real activo, no llega nada: la app igual
 * vuelve a leer cada cierto tiempo.
 */
export function escucharTienda(tiendaId: string, alCambiar: () => void) {
  const canal = supabase.channel(`tienda:${tiendaId}:${Date.now()}`);
  canal.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "tienda", filter: `id=eq.${tiendaId}` },
    alCambiar
  );
  for (const table of TABLAS_DE_LA_TIENDA) {
    canal.on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter: `tienda_id=eq.${tiendaId}` },
      alCambiar
    );
  }
  canal.subscribe();
  return () => {
    supabase.removeChannel(canal);
  };
}
