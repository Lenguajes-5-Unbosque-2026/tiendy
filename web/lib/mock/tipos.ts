// Forma de los datos de data/mock/ (ver data/mock/README.md).

export type MedioPago = "efectivo" | "transferencia" | "fiado";
export type AcuerdoPago = "esta_semana" | "quincena" | "fin_de_mes";

export type Tienda = {
  id: string;
  nombre: string;
  barrio: string;
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
  imagen: string | null;
};

export type Cliente = {
  id: string;
  nombre: string;
  celular: string | null;
  acuerdo_pago: AcuerdoPago | null;
  fecha_acuerdo: string | null;
  creado_en: string;
};

export type Turno = {
  id: string;
  persona_id: string;
  fecha: string;
  abierto_en: string;
  cerrado_en: string | null;
  base: number;
  estado: "abierto" | "cerrado";
};

export type Venta = {
  id: string;
  turno_id: string;
  persona_id: string;
  fecha_hora: string;
  canal: "toque" | "busqueda" | "voz";
  medio_pago: MedioPago;
  cliente_id: string | null;
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

export type Gasto = {
  id: string;
  turno_id: string;
  fecha_hora: string;
  monto: number;
  medio_pago: "efectivo" | "transferencia" | "quede_debiendo";
};

export type Abono = {
  id: string;
  cliente_id: string;
  monto: number;
};

export type DatosMock = {
  tienda: Tienda;
  personas: Persona[];
  categorias: Categoria[];
  productos: Producto[];
  clientes: Cliente[];
  turnos: Turno[];
  ventas: Venta[];
  ventaProductos: VentaProducto[];
  gastos: Gasto[];
  abonos: Abono[];
};
