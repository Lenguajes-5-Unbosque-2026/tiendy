// Forma de los datos de data/mock/ (ver data/mock/README.md).

export type MedioPago = "efectivo" | "transferencia";

export type Tienda = {
  id: string;
  nombre: string;
  tipo: string;
  barrio: string;
  direccion: string | null;
  ciudad: string | null;
  /** "06:00" */
  horario_apertura: string | null;
  horario_cierre: string | null;
  nit: string | null;
  celular: string | null;
};

export type Persona = {
  id: string;
  nombre: string;
  nombre_corto: string;
  rol: "duena" | "empleado";
  activo: boolean;
};

export type Categoria = { id: string; nombre: string; orden: number };

export type Producto = {
  id: string;
  categoria_id: string;
  nombre: string;
  nombre_corto: string;
  alias: string[] | null;
  precio_venta: number;
  costo: number | null;
  unidades: number;
  minimo: number;
  venta_rapida: boolean;
  /** Cómo se cargó (11 manual, 12 foto, 13 listado). */
  origen?: "listado" | "manual" | "foto";
  imagen: string | null;
};

export type Turno = {
  id: string;
  persona_id: string;
  fecha: string;
  franja: "manana" | "tarde";
  abierto_en: string;
  cerrado_en: string | null;
  base: number;
  efectivo_esperado: number | null;
  efectivo_contado: number | null;
  diferencia: number | null;
  motivo_diferencia: MotivoDiferencia | null;
  estado: "abierto" | "cerrado";
};

/** Por qué no cuadró la caja (18). */
export type MotivoDiferencia = "olvide_un_gasto" | "di_mal_vueltas" | "no_se";

export type Venta = {
  id: string;
  turno_id: string;
  persona_id: string;
  fecha_hora: string;
  canal: "toque" | "busqueda" | "voz";
  medio_pago: MedioPago;
  total: number;
  paga_con: number | null;
  estado: "anotada" | "deshecha" | "eliminada";
};

export type VentaProducto = {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number | null;
  subtotal: number;
};

export type MedioPagoGasto = "efectivo" | "transferencia" | "quede_debiendo";

export type CategoriaGasto = "transporte" | "servicios" | "arriendo" | "mercancia" | "otro";

export type Gasto = {
  id: string;
  turno_id: string;
  persona_id: string;
  fecha_hora: string;
  monto: number;
  categoria: CategoriaGasto;
  nota: string | null;
  proveedor_id: string | null;
  canal: "voz" | "manual" | "foto";
  lo_que_dijo: string | null;
  medio_pago: MedioPagoGasto;
  /** Fecha límite (AAAA-MM-DD) cuando quedó debiendo. */
  pagar_antes_de: string | null;
  imagen: string | null;
};

export type Proveedor = {
  id: string;
  nombre: string;
  celular: string | null;
  dia_visita: string | null;
};

/** Mercancía que llegó (41a): suma unidades al inventario. */
export type Entrada = {
  id: string;
  proveedor_id: string | null;
  turno_id: string;
  persona_id: string;
  fecha_hora: string;
  total: number;
  medio_pago: MedioPagoGasto;
  pagar_antes_de: string | null;
  imagen: string | null;
};

export type EntradaProducto = {
  id: string;
  entrada_id: string;
  producto_id: string;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
};

/** Producto típico de tienda para cargar desde el listado sugerido (13). */
export type ProductoSugerido = {
  id: string;
  categoria_id: string;
  nombre: string;
  nombre_corto: string;
  precio_sugerido: number;
};

export type DatosMock = {
  tienda: Tienda;
  personas: Persona[];
  categorias: Categoria[];
  productos: Producto[];
  turnos: Turno[];
  ventas: Venta[];
  ventaProductos: VentaProducto[];
  gastos: Gasto[];
  proveedores: Proveedor[];
  entradas: Entrada[];
  entradaProductos: EntradaProducto[];
  listado: ProductoSugerido[];
};
