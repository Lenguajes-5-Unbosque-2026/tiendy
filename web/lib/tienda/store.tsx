"use client";

// Estado de la tienda en el celular. Arranca con data/mock/ y guarda lo que
// cambia (ventas, gastos, inventario, turnos) en el navegador hasta que llegue Supabase.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import datos from "@/lib/mock/datos.json";
import type {
  CategoriaGasto,
  DatosMock,
  Persona,
  Tienda,
  Entrada,
  EntradaProducto,
  Gasto,
  MedioPago,
  MedioPagoGasto,
  MotivoDiferencia,
  Producto,
  Turno,
  Venta,
  VentaProducto,
} from "@/lib/mock/tipos";
import { cajaDelTurno, HOY } from "@/lib/tienda/calculos";
import { type Filtros, filtrosHoy } from "@/lib/tienda/cuaderno";

const mock = datos as unknown as DatosMock;
// Cambia la versión si cambia la forma de lo guardado
const CLAVE = "tiendy:mvp:v7";
const DURACION_AVISO = 6000;

type Mutable = {
  tienda: Tienda;
  personas: Persona[];
  /** Celular con el que se entró; null si se cerró sesión (CU-01). */
  sesion: string | null;
  productos: Producto[];
  ventas: Venta[];
  ventaProductos: VentaProducto[];
  turnos: Turno[];
  gastos: Gasto[];
  entradas: Entrada[];
  entradaProductos: EntradaProducto[];
};

export type LineaVenta = { productoId: string; cantidad: number };

/** La venta que se está armando en la hoja (20). */
export type Borrador = {
  lineas: LineaVenta[];
  medioPago: MedioPago;
  pagaCon: number | null;
  canal: Venta["canal"];
  /** Venta que se está corrigiendo desde el cuaderno (36): se reemplaza al anotar. */
  corrige?: string;
};

/** El gasto que se está armando entre 27 y 31. */
export type BorradorGasto = {
  monto: number;
  categoria: CategoriaGasto | null;
  nota: string;
  proveedorId: string | null;
  canal: Gasto["canal"];
  loQueDijo: string | null;
  /** Gasto que se está corrigiendo desde el cuaderno (36): se reemplaza al registrar. */
  corrige?: string;
};

export type Pago = { medio: MedioPagoGasto; pagarAntesDe: string | null };

export type LineaEntrada = { productoId: string; cantidad: number; costo: number };

export type ProductoNuevo = Omit<Producto, "id">;

export type Aviso = { ventaId: string; total: number; medioPago: MedioPago };

const borradorVacio: Borrador = {
  lineas: [],
  medioPago: "efectivo",
  pagaCon: null,
  canal: "toque",
};

export const borradorGastoVacio: BorradorGasto = {
  monto: 0,
  categoria: null,
  nota: "",
  proveedorId: null,
  canal: "manual",
  loQueDijo: null,
};

const inicial: Mutable = {
  tienda: mock.tienda,
  personas: mock.personas,
  // La app arranca en el registro (CU-01); con el celular de prueba entra a estos datos
  sesion: null,
  productos: mock.productos,
  ventas: mock.ventas,
  ventaProductos: mock.ventaProductos,
  turnos: mock.turnos,
  gastos: mock.gastos,
  entradas: mock.entradas,
  entradaProductos: mock.entradaProductos,
};

function horaDeHoy() {
  // La fecha es la de los datos de prueba; la hora, la de ahora.
  const ahora = new Date();
  const hh = String(ahora.getHours()).padStart(2, "0");
  const mm = String(ahora.getMinutes()).padStart(2, "0");
  return `${HOY}T${hh}:${mm}:00-05:00`;
}

/** La venta deja de contar (deshecha o eliminada) y sus productos vuelven al inventario. */
function quitarVenta(e: Mutable, ventaId: string, estado: "deshecha" | "eliminada"): Mutable {
  const lineas = e.ventaProductos.filter((l) => l.venta_id === ventaId);
  return {
    ...e,
    ventas: e.ventas.map((v) => (v.id === ventaId ? { ...v, estado } : v)),
    productos: e.productos.map((p) => {
      const vuelve = lineas.find((l) => l.producto_id === p.id);
      return vuelve ? { ...p, unidades: p.unidades + vuelve.cantidad } : p;
    }),
  };
}

function useTiendaState() {
  const [estado, setEstado] = useState<Mutable>(inicial);
  const [cargado, setCargado] = useState(false);
  const [borrador, setBorrador] = useState<Borrador>(borradorVacio);
  const [venderAbierto, setVenderAbierto] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [borradorGasto, setBorradorGasto] = useState<BorradorGasto>(borradorGastoVacio);
  const [filtros, setFiltros] = useState<Filtros>(filtrosHoy);
  /** Celular escrito en 03 mientras se verifica el código (04, 05). */
  const [celularPendiente, setCelularPendiente] = useState("");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lo guardado en este celular reemplaza a los datos de prueba
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee una sola vez al abrir
      if (guardado) setEstado(JSON.parse(guardado));
    } catch {
      // Sin almacenamiento: se trabaja con los datos de prueba
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      // Sin almacenamiento: los cambios duran hasta recargar
    }
  }, [estado, cargado]);

  const turnoAbierto = estado.turnos.find((t) => t.estado === "abierto") ?? null;
  const atiende = estado.personas.find((p) => p.id === turnoAbierto?.persona_id) ?? null;

  const mostrarAviso = useCallback((nuevo: Aviso) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso(nuevo);
    temporizador.current = setTimeout(() => setAviso(null), DURACION_AVISO);
  }, []);

  const cerrarAviso = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso(null);
  }, []);

  /** Anota la venta: suma a la caja y descuenta el inventario. */
  const anotarVenta = useCallback(
    (venta: Borrador) => {
      const id = `v-${Date.now()}`;
      const lineas: VentaProducto[] = venta.lineas.map((l, i) => {
        const p = estado.productos.find((x) => x.id === l.productoId)!;
        return {
          id: `${id}-${i + 1}`,
          venta_id: id,
          producto_id: p.id,
          cantidad: l.cantidad,
          precio_unitario: p.precio_venta,
          costo_unitario: p.costo,
          subtotal: p.precio_venta * l.cantidad,
        };
      });
      const total = lineas.reduce((s, l) => s + l.subtotal, 0);
      // Una corrección se queda en el turno y la hora de la venta original
      const original = estado.ventas.find((v) => v.id === venta.corrige);
      const nueva: Venta = {
        id,
        turno_id: original?.turno_id ?? turnoAbierto?.id ?? "",
        persona_id: original?.persona_id ?? atiende?.id ?? "",
        fecha_hora: original?.fecha_hora ?? horaDeHoy(),
        canal: venta.canal,
        medio_pago: venta.medioPago,
        total,
        paga_con: venta.medioPago === "efectivo" ? venta.pagaCon : null,
        estado: "anotada",
      };

      setEstado((e) => {
        // Al corregir, la venta anterior se elimina y sus productos vuelven antes de descontar
        const base = venta.corrige ? quitarVenta(e, venta.corrige, "eliminada") : e;
        return {
          ...base,
          ventas: [...base.ventas, nueva],
          ventaProductos: [...base.ventaProductos, ...lineas],
          productos: base.productos.map((p) => {
            const vendida = lineas.find((l) => l.producto_id === p.id);
            return vendida ? { ...p, unidades: Math.max(0, p.unidades - vendida.cantidad) } : p;
          }),
        };
      });

      mostrarAviso({ ventaId: id, total, medioPago: venta.medioPago });
      setBorrador(borradorVacio);
      return id;
    },
    [estado.productos, estado.ventas, turnoAbierto, atiende, mostrarAviso]
  );

  /** Deshacer (22): la venta queda "deshecha" y los productos vuelven al inventario. */
  const deshacerVenta = useCallback(
    (ventaId: string) => {
      setEstado((e) => quitarVenta(e, ventaId, "deshecha"));
      cerrarAviso();
    },
    [cerrarAviso]
  );

  /** Abrir caja (16a → 16): empieza el turno con quién atiende y la base contada. */
  const abrirTurno = useCallback((personaId: string, base: number) => {
    const abiertoEn = horaDeHoy();
    setEstado((e) => {
      const turno: Turno = {
        id: `tu-${Date.now()}`,
        persona_id: personaId,
        fecha: HOY,
        franja: Number(abiertoEn.slice(11, 13)) < 13 ? "manana" : "tarde",
        abierto_en: abiertoEn,
        cerrado_en: null,
        base,
        efectivo_esperado: null,
        efectivo_contado: null,
        diferencia: null,
        motivo_diferencia: null,
        estado: "abierto",
      };
      return { ...e, turnos: [...e.turnos, turno] };
    });
  }, []);

  /** Cerrar caja (18): guarda lo contado, la diferencia y el motivo. Devuelve el id del turno. */
  const cerrarTurno = useCallback(
    (contado: number, motivo: MotivoDiferencia | null) => {
      if (!turnoAbierto) return null;
      const esperado = cajaDelTurno(turnoAbierto, estado.ventas, estado.gastos).esperado;
      const diferencia = contado - esperado;
      const cerrado: Turno = {
        ...turnoAbierto,
        cerrado_en: horaDeHoy(),
        efectivo_esperado: esperado,
        efectivo_contado: contado,
        diferencia,
        motivo_diferencia: diferencia === 0 ? null : motivo,
        estado: "cerrado",
      };
      setEstado((e) => ({
        ...e,
        turnos: e.turnos.map((t) => (t.id === cerrado.id ? cerrado : t)),
      }));
      return cerrado.id;
    },
    [turnoAbierto, estado.ventas, estado.gastos]
  );

  /** Registrar gasto (31): sale plata con su motivo y queda con quién atiende. Devuelve el id. */
  const anotarGasto = useCallback(
    (pago: Pago) => {
      const id = `g-${Date.now()}`;
      const b = borradorGasto;
      const original = estado.gastos.find((g) => g.id === b.corrige);
      const gasto: Gasto = {
        id,
        turno_id: original?.turno_id ?? turnoAbierto?.id ?? "",
        persona_id: original?.persona_id ?? atiende?.id ?? "",
        fecha_hora: original?.fecha_hora ?? horaDeHoy(),
        monto: b.monto,
        categoria: b.categoria ?? "otro",
        nota: b.nota.trim() || null,
        proveedor_id: b.proveedorId,
        canal: b.canal,
        lo_que_dijo: b.loQueDijo,
        medio_pago: pago.medio,
        pagar_antes_de: pago.medio === "quede_debiendo" ? pago.pagarAntesDe : null,
        imagen: null,
      };
      setEstado((e) => ({
        ...e,
        gastos: [...e.gastos.filter((g) => g.id !== b.corrige), gasto],
      }));
      setBorradorGasto(borradorGastoVacio);
      return id;
    },
    [borradorGasto, estado.gastos, turnoAbierto, atiende]
  );

  /** Eliminar registro (36): la venta deja de contar y sus productos vuelven al inventario. */
  const eliminarVenta = useCallback((ventaId: string) => {
    setEstado((e) => quitarVenta(e, ventaId, "eliminada"));
  }, []);

  const eliminarGasto = useCallback((gastoId: string) => {
    setEstado((e) => ({ ...e, gastos: e.gastos.filter((g) => g.id !== gastoId) }));
  }, []);

  /** Llegó mercancía (41a): suma unidades y actualiza el costo de cada producto. */
  const anotarEntrada = useCallback(
    (proveedorId: string | null, lineas: LineaEntrada[], pago: Pago) => {
      const id = `e-${Date.now()}`;
      const productosEntrada: EntradaProducto[] = lineas.map((l, i) => ({
        id: `${id}-${i + 1}`,
        entrada_id: id,
        producto_id: l.productoId,
        cantidad: l.cantidad,
        costo_unitario: l.costo,
        subtotal: l.cantidad * l.costo,
      }));
      const entrada: Entrada = {
        id,
        proveedor_id: proveedorId,
        turno_id: turnoAbierto?.id ?? "",
        persona_id: atiende?.id ?? "",
        fecha_hora: horaDeHoy(),
        total: productosEntrada.reduce((s, l) => s + l.subtotal, 0),
        medio_pago: pago.medio,
        pagar_antes_de: pago.medio === "quede_debiendo" ? pago.pagarAntesDe : null,
        imagen: null,
      };
      setEstado((e) => ({
        ...e,
        entradas: [...e.entradas, entrada],
        entradaProductos: [...e.entradaProductos, ...productosEntrada],
        productos: e.productos.map((p) => {
          const llego = productosEntrada.find((l) => l.producto_id === p.id);
          return llego
            ? { ...p, unidades: p.unidades + llego.cantidad, costo: llego.costo_unitario }
            : p;
        }),
      }));
      return id;
    },
    [turnoAbierto, atiende]
  );

  /** Cargar productos (11, 12, 13): los suma al inventario. */
  const agregarProductos = useCallback((nuevos: ProductoNuevo[]) => {
    const base = Date.now();
    setEstado((e) => ({
      ...e,
      productos: [...e.productos, ...nuevos.map((p, i) => ({ ...p, id: `p-${base}-${i}` }))],
    }));
  }, []);

  /**
   * Verificación (04): entra si el celular ya tiene tienda. El de los datos de
   * prueba vuelve a cargarlos. Devuelve false si es una cuenta nueva (sigue a 06).
   */
  const iniciarSesion = useCallback(
    (cel: string) => {
      if (cel === estado.tienda.celular) {
        setEstado((e) => ({ ...e, sesion: cel }));
        return true;
      }
      if (cel === mock.tienda.celular) {
        setEstado({ ...inicial, sesion: cel });
        return true;
      }
      return false;
    },
    [estado.tienda.celular]
  );

  /** Tu tienda (06): cuenta nueva con la tienda vacía y la dueña como primera persona. */
  const crearTienda = useCallback((cel: string, nombreTienda: string, nombreDuena: string) => {
    const nombre = nombreDuena.trim().replace(/\s+/g, " ");
    setEstado({
      tienda: {
        id: `t-${Date.now()}`,
        nombre: nombreTienda.trim(),
        tipo: "Tienda de barrio",
        barrio: "",
        direccion: null,
        ciudad: null,
        horario_apertura: null,
        horario_cierre: null,
        nit: null,
        celular: cel,
      },
      personas: [
        { id: `pe-${Date.now()}`, nombre, nombre_corto: nombre.split(" ")[0], rol: "duena", activo: true },
      ],
      sesion: cel,
      productos: [],
      ventas: [],
      ventaProductos: [],
      turnos: [],
      gastos: [],
      entradas: [],
      entradaProductos: [],
    });
  }, []);

  const cerrarSesion = useCallback(() => {
    setEstado((e) => ({ ...e, sesion: null }));
  }, []);

  /** Mi tienda (46): cambia los datos del negocio. */
  const guardarTienda = useCallback((cambios: Partial<Tienda>) => {
    setEstado((e) => ({ ...e, tienda: { ...e.tienda, ...cambios } }));
  }, []);

  /** Empleados (47): entra eligiendo su nombre en 16a, sin cuenta ni código. */
  const agregarEmpleado = useCallback((nombre: string) => {
    const limpio = nombre.trim().replace(/\s+/g, " ");
    const persona: Persona = {
      id: `pe-${Date.now()}`,
      nombre: limpio,
      nombre_corto: limpio.split(" ")[0],
      rol: "empleado",
      activo: true,
    };
    setEstado((e) => ({ ...e, personas: [...e.personas, persona] }));
  }, []);

  /** Quitar un empleado: deja de salir en 16a, pero lo que anotó sigue con su nombre. */
  const quitarEmpleado = useCallback((personaId: string) => {
    setEstado((e) => ({
      ...e,
      personas: e.personas.map((p) => (p.id === personaId ? { ...p, activo: false } : p)),
    }));
  }, []);

  const guardarProducto = useCallback(
    (id: string, cambios: Pick<Producto, "precio_venta" | "costo" | "unidades">) => {
      setEstado((e) => ({
        ...e,
        productos: e.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
      }));
    },
    []
  );

  return {
    ...estado,
    categorias: mock.categorias,
    listado: mock.listado,
    proveedores: mock.proveedores,
    turnoAbierto,
    atiende,
    borrador,
    setBorrador,
    reiniciarBorrador: () => setBorrador(borradorVacio),
    borradorGasto,
    setBorradorGasto,
    venderAbierto,
    setVenderAbierto,
    aviso,
    cerrarAviso,
    anotarVenta,
    deshacerVenta,
    abrirTurno,
    cerrarTurno,
    filtros,
    setFiltros,
    eliminarVenta,
    eliminarGasto,
    anotarGasto,
    anotarEntrada,
    guardarProducto,
    agregarProductos,
    cargado,
    celularPendiente,
    setCelularPendiente,
    iniciarSesion,
    crearTienda,
    cerrarSesion,
    guardarTienda,
    agregarEmpleado,
    quitarEmpleado,
  };
}

type TiendaContexto = ReturnType<typeof useTiendaState>;

const Contexto = createContext<TiendaContexto | null>(null);

export function TiendaProvider({ children }: { children: React.ReactNode }) {
  const valor = useTiendaState();
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTienda() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useTienda va dentro de TiendaProvider");
  return contexto;
}
