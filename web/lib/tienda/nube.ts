// Lectura y escritura en Supabase de lo que ya vive en la base: los productos
// de la tienda (41) y las ventas (20 → 22). Los permisos están en supabase/escritura.sql.
import type { Persona, Producto, Turno, Venta, VentaProducto } from "@/lib/mock/tipos";
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
