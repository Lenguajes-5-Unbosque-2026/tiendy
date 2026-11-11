"use client";

// Estado de la tienda en el celular. Guarda lo que cambia en el navegador y, si la
// tienda existe en Supabase, también allá (ver nube.ts): al iniciar sesión se traen
// la tienda, sus personas, productos, turnos y ventas; cada venta, apertura y
// cierre de caja, empleado y cambio de producto se escribe allá. Gastos y entradas
// de mercancía siguen solo en el navegador por ahora.
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
import { cajaDelTurno, fijarHoy, HOY, HOY_PRUEBA, hoyEnColombia } from "@/lib/tienda/calculos";
import { type Filtros, filtrosHoy } from "@/lib/tienda/cuaderno";
import * as nube from "@/lib/tienda/nube";

const mock = datos as unknown as DatosMock;
// Cambia la versión si cambia la forma de lo guardado
const CLAVE = "tiendy:mvp:v8";
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
  /** La tienda existe en Supabase: lo que se anota se guarda también allá. */
  enNube: boolean;
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

/** Cómo va el guardado de la venta en Supabase ("local": la tienda no está en la base). */
export type Guardado = "guardando" | "listo" | "error" | "local";

export type Aviso =
  | { tipo: "venta"; ventaId: string; total: number; medioPago: MedioPago; guardado: Guardado }
  | { tipo: "error"; texto: string };

/** Productos de Mi inventario (41) leídos de Supabase. */
export type EstadoProductos = "cargando" | "error" | "listo";

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
  enNube: true,
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

/** Anota la venta y descuenta el inventario; si corrige otra, esa se elimina primero. */
function sumarVenta(e: Mutable, nueva: Venta, lineas: VentaProducto[], corrige?: string): Mutable {
  const base = corrige ? quitarVenta(e, corrige, "eliminada") : e;
  return {
    ...base,
    ventas: [...base.ventas, nueva],
    ventaProductos: [...base.ventaProductos, ...lineas],
    productos: base.productos.map((p) => {
      const vendida = lineas.find((l) => l.producto_id === p.id);
      return vendida ? { ...p, unidades: Math.max(0, p.unidades - vendida.cantidad) } : p;
    }),
  };
}

/** Los productos de esas ventas, como quedaron en el estado. */
function productosDe(e: Mutable, ventaIds: (string | undefined)[]) {
  const ids = new Set(
    e.ventaProductos.filter((l) => ventaIds.includes(l.venta_id)).map((l) => l.producto_id)
  );
  return e.productos.filter((p) => ids.has(p.id));
}

/** Lo de Supabase manda; los productos creados en este celular que aún no están allá se conservan. */
function unirProductos(deLaNube: Producto[], locales: Producto[]) {
  const enLaNube = new Set(deLaNube.map((p) => p.id));
  return [...deLaNube, ...locales.filter((p) => p.id.startsWith("p-") && !enLaNube.has(p.id))];
}

function useTiendaState() {
  const [estado, setEstado] = useState<Mutable>(inicial);
  const [cargado, setCargado] = useState(false);
  const [borrador, setBorrador] = useState<Borrador>(borradorVacio);
  const [venderAbierto, setVenderAbierto] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [borradorGasto, setBorradorGasto] = useState<BorradorGasto>(borradorGastoVacio);
  // La tienda de prueba vive en su 23 de septiembre; una tienda real, en la fecha de hoy
  fijarHoy(estado.tienda.id === mock.tienda.id ? HOY_PRUEBA : hoyEnColombia());
  const [filtros, setFiltros] = useState<Filtros>(() => ({ ...filtrosHoy }));
  // Al cambiar de tienda, el cuaderno vuelve a "hoy" de esa tienda
  const tiendaActual = estado.tienda.id;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia el filtro al cambiar de tienda
    setFiltros({ ...filtrosHoy });
  }, [tiendaActual]);
  /** Celular escrito en 03 mientras se verifica el código (04, 05). */
  const [celularPendiente, setCelularPendiente] = useState("");
  /** Bienvenida (02): "Empezar" crea tienda; "Ya tengo cuenta" solo inicia sesión. */
  const [modoEntrada, setModoEntrada] = useState<"crear" | "entrar">("crear");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [estadoProductos, setEstadoProductos] = useState<EstadoProductos>("cargando");
  const [intentoProductos, setIntentoProductos] = useState(0);
  // Lo que se escribe en Supabase va en fila, para que deshacer no se adelante a guardar
  const cola = useRef<Promise<unknown>>(Promise.resolve());
  // Ventas que no se pudieron guardar en Supabase, para reintentar desde el aviso (22)
  const pendientes = useRef(new Map<string, nube.VentaParaGuardar>());

  /** Una tienda creada sin conexión (o antes de correr cuentas.sql) sigue solo en el navegador. */
  const enLaNube = estado.enNube;

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

  // Mi inventario (41): los productos de la tienda de prueba se leen de Supabase
  const tiendaId = estado.tienda.id;
  const conSesion = estado.sesion !== null;
  useEffect(() => {
    if (!cargado || !conSesion) return;
    if (!enLaNube) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin base, los productos son los del celular
      setEstadoProductos("listo");
      return;
    }
    let vigente = true;
    setEstadoProductos("cargando");
    nube
      .leerProductos(tiendaId)
      .then((deLaNube) => {
        if (!vigente) return;
        setEstado((e) => ({ ...e, productos: unirProductos(deLaNube, e.productos) }));
        setEstadoProductos("listo");
      })
      .catch((error) => {
        console.error("No se pudieron leer los productos de Supabase", error);
        if (vigente) setEstadoProductos("error");
      });
    return () => {
      vigente = false;
    };
  }, [cargado, conSesion, enLaNube, tiendaId, intentoProductos]);

  const recargarProductos = useCallback(() => setIntentoProductos((n) => n + 1), []);

  const turnoAbierto = estado.turnos.find((t) => t.estado === "abierto") ?? null;
  const atiende = estado.personas.find((p) => p.id === turnoAbierto?.persona_id) ?? null;

  const mostrarAviso = useCallback((nuevo: Aviso, sinTiempo = false) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso(nuevo);
    if (!sinTiempo) temporizador.current = setTimeout(() => setAviso(null), DURACION_AVISO);
  }, []);

  const cerrarAviso = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso(null);
  }, []);

  /** Pone una escritura en la fila de Supabase; si falla, avisa con ese texto. */
  const escribirEnNube = useCallback(
    (escritura: () => Promise<void>, textoError: string) => {
      const paso = cola.current.then(escritura);
      cola.current = paso.catch((error) => {
        console.error(textoError, error);
        mostrarAviso({ tipo: "error", texto: textoError });
      });
    },
    [mostrarAviso]
  );

  /** Registrar venta en Supabase; el aviso (22) pasa de "guardando" a anotada o a error. */
  const guardarVentaEnNube = useCallback(
    (datos: nube.VentaParaGuardar, aviso: Extract<Aviso, { tipo: "venta" }>) => {
      pendientes.current.set(datos.venta.id, datos);
      // Solo se actualiza el aviso si sigue siendo el de esta venta
      const actualizar = (guardado: Guardado, sinTiempo = false) =>
        setAviso((actual) => {
          if (actual?.tipo !== "venta" || actual.ventaId !== datos.venta.id) return actual;
          if (temporizador.current) clearTimeout(temporizador.current);
          if (!sinTiempo) temporizador.current = setTimeout(() => setAviso(null), DURACION_AVISO);
          return { ...actual, guardado };
        });
      mostrarAviso({ ...aviso, guardado: "guardando" }, true);
      const paso = cola.current.then(() => nube.guardarVenta(datos));
      cola.current = paso.then(
        () => {
          pendientes.current.delete(datos.venta.id);
          actualizar("listo");
        },
        (error) => {
          console.error("No se pudo guardar la venta en Supabase", error);
          // El error se queda a la vista hasta reintentar
          actualizar("error", true);
        }
      );
    },
    [mostrarAviso]
  );

  /** Reintentar (22): vuelve a guardar en Supabase la venta que falló. */
  const reintentarVenta = useCallback(
    (ventaId: string) => {
      const datos = pendientes.current.get(ventaId);
      if (datos && aviso?.tipo === "venta") guardarVentaEnNube(datos, aviso);
    },
    [aviso, guardarVentaEnNube]
  );

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

      // Al corregir, la venta anterior se elimina y sus productos vuelven antes de descontar
      setEstado((e) => sumarVenta(e, nueva, lineas, venta.corrige));

      const aviso = {
        tipo: "venta" as const,
        ventaId: id,
        total,
        medioPago: venta.medioPago,
        guardado: "local" as const,
      };
      if (enLaNube) {
        const despues = sumarVenta(estado, nueva, lineas, venta.corrige);
        guardarVentaEnNube(
          {
            tiendaId: estado.tienda.id,
            venta: nueva,
            lineas,
            turno: estado.turnos.find((t) => t.id === nueva.turno_id) ?? null,
            persona: estado.personas.find((p) => p.id === nueva.persona_id) ?? null,
            productos: productosDe(despues, [id, venta.corrige]),
            corrige: venta.corrige,
          },
          aviso
        );
      } else {
        mostrarAviso(aviso);
      }
      setBorrador(borradorVacio);
      return id;
    },
    [estado, turnoAbierto, atiende, enLaNube, guardarVentaEnNube, mostrarAviso]
  );

  /** Deshacer (22) o eliminar (36) en Supabase: la venta deja de contar y vuelven las unidades. */
  const quitarVentaEnNube = useCallback(
    (ventaId: string, motivo: "deshecha" | "eliminada") => {
      if (!enLaNube) return;
      pendientes.current.delete(ventaId);
      const despues = quitarVenta(estado, ventaId, motivo);
      escribirEnNube(
        () => nube.quitarVenta(ventaId, motivo, productosDe(despues, [ventaId])),
        motivo === "deshecha"
          ? "No pudimos deshacer la venta en la base de datos"
          : "No pudimos eliminar la venta en la base de datos"
      );
    },
    [estado, enLaNube, escribirEnNube]
  );

  /** Deshacer (22): la venta queda "deshecha" y los productos vuelven al inventario. */
  const deshacerVenta = useCallback(
    (ventaId: string) => {
      setEstado((e) => quitarVenta(e, ventaId, "deshecha"));
      cerrarAviso();
      quitarVentaEnNube(ventaId, "deshecha");
    },
    [cerrarAviso, quitarVentaEnNube]
  );

  /** Abrir caja (16a → 16): empieza el turno con quién atiende y la base contada. */
  const abrirTurno = useCallback(
    (personaId: string, base: number) => {
      const abiertoEn = horaDeHoy();
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
      setEstado((e) => ({ ...e, turnos: [...e.turnos, turno] }));
      if (enLaNube) {
        escribirEnNube(
          () => nube.abrirTurno(estado.tienda.id, turno),
          "No pudimos guardar la apertura de caja en la base de datos"
        );
      }
    },
    [enLaNube, estado.tienda.id, escribirEnNube]
  );

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
      if (enLaNube) {
        // Si el turno se abrió sin conexión, primero se crea y luego se cierra
        escribirEnNube(async () => {
          await nube.abrirTurno(estado.tienda.id, turnoAbierto);
          await nube.cerrarTurno(cerrado);
        }, "No pudimos guardar el cierre de caja en la base de datos");
      }
      return cerrado.id;
    },
    [turnoAbierto, estado.ventas, estado.gastos, estado.tienda.id, enLaNube, escribirEnNube]
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
  const eliminarVenta = useCallback(
    (ventaId: string) => {
      setEstado((e) => quitarVenta(e, ventaId, "eliminada"));
      quitarVentaEnNube(ventaId, "eliminada");
    },
    [quitarVentaEnNube]
  );

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
      const sumarLlegada = (p: Producto) => {
        const llego = productosEntrada.find((l) => l.producto_id === p.id);
        return llego
          ? { ...p, unidades: p.unidades + llego.cantidad, costo: llego.costo_unitario }
          : p;
      };
      setEstado((e) => ({
        ...e,
        entradas: [...e.entradas, entrada],
        entradaProductos: [...e.entradaProductos, ...productosEntrada],
        productos: e.productos.map(sumarLlegada),
      }));
      // Las unidades y el costo nuevos también quedan en Supabase, para que la venta descuente bien
      if (enLaNube) {
        const cambiados = estado.productos
          .filter((p) => productosEntrada.some((l) => l.producto_id === p.id))
          .map(sumarLlegada);
        escribirEnNube(
          () => nube.guardarCambiosProductos(cambiados),
          "No pudimos actualizar el inventario en la base de datos"
        );
      }
      return id;
    },
    [turnoAbierto, atiende, enLaNube, estado.productos, escribirEnNube]
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
   * Verificación (04): si el celular ya tiene tienda en Supabase, trae sus datos
   * y entra al Home. Sin conexión entra con lo guardado en este celular (o con los
   * datos de prueba). Devuelve false si es una cuenta nueva (sigue a 06).
   */
  const iniciarSesion = useCallback(
    async (cel: string) => {
      try {
        const tiendaId = await nube.buscarTienda(cel);
        if (tiendaId) {
          const datos = await nube.leerTienda(tiendaId);
          // Gastos y entradas todavía no están en Supabase: se quedan los de este celular
          const propios = <T,>(locales: T[], deMock: T[]) =>
            estado.tienda.id === tiendaId ? locales : tiendaId === mock.tienda.id ? deMock : [];
          setEstado((e) => ({
            ...datos,
            gastos: propios(e.gastos, mock.gastos),
            entradas: propios(e.entradas, mock.entradas),
            entradaProductos: propios(e.entradaProductos, mock.entradaProductos),
            sesion: cel,
            enNube: true,
          }));
          return true;
        }
      } catch (error) {
        console.error("No se pudo buscar la tienda en Supabase", error);
        if (cel === mock.tienda.celular && estado.tienda.celular !== cel) {
          setEstado({ ...inicial, sesion: cel });
          return true;
        }
      }
      // Una tienda creada sin conexión solo existe en este celular
      if (cel === estado.tienda.celular) {
        setEstado((e) => ({ ...e, sesion: cel }));
        return true;
      }
      return false;
    },
    [estado.tienda.celular, estado.tienda.id]
  );

  /**
   * Tu tienda (06): cuenta nueva con la tienda vacía y la dueña como primera persona.
   * Se guarda en Supabase; si falla, la tienda queda solo en este celular.
   */
  const crearTienda = useCallback(async (cel: string, nombreTienda: string, nombreDuena: string) => {
    const nombre = nombreDuena.trim().replace(/\s+/g, " ");
    const tienda: Tienda = {
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
    };
    const duena: Persona = {
      id: `pe-${Date.now()}`,
      nombre,
      nombre_corto: nombre.split(" ")[0],
      rol: "duena",
      activo: true,
    };
    let enNube = true;
    try {
      await nube.crearTienda(tienda, duena);
    } catch (error) {
      console.error("No se pudo crear la tienda en Supabase", error);
      enNube = false;
    }
    setEstado({
      tienda,
      personas: [duena],
      enNube,
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
  const guardarTienda = useCallback(
    (cambios: Partial<Tienda>) => {
      setEstado((e) => ({ ...e, tienda: { ...e.tienda, ...cambios } }));
      if (enLaNube) {
        escribirEnNube(
          () => nube.guardarTienda(estado.tienda.id, cambios),
          "No pudimos guardar los datos de la tienda en la base de datos"
        );
      }
    },
    [enLaNube, estado.tienda.id, escribirEnNube]
  );

  /** Empleados (47): entra eligiendo su nombre en 16a, sin cuenta ni código. */
  const agregarEmpleado = useCallback(
    (nombre: string) => {
      const limpio = nombre.trim().replace(/\s+/g, " ");
      const persona: Persona = {
        id: `pe-${Date.now()}`,
        nombre: limpio,
        nombre_corto: limpio.split(" ")[0],
        rol: "empleado",
        activo: true,
      };
      setEstado((e) => ({ ...e, personas: [...e.personas, persona] }));
      if (enLaNube) {
        escribirEnNube(
          () => nube.guardarPersona(estado.tienda.id, persona),
          "No pudimos guardar el empleado en la base de datos"
        );
      }
    },
    [enLaNube, estado.tienda.id, escribirEnNube]
  );

  /** Quitar un empleado: deja de salir en 16a, pero lo que anotó sigue con su nombre. */
  const quitarEmpleado = useCallback(
    (personaId: string) => {
      setEstado((e) => ({
        ...e,
        personas: e.personas.map((p) => (p.id === personaId ? { ...p, activo: false } : p)),
      }));
      if (enLaNube) {
        escribirEnNube(
          () => nube.desactivarPersona(personaId),
          "No pudimos quitar el empleado en la base de datos"
        );
      }
    },
    [enLaNube, escribirEnNube]
  );

  const guardarProducto = useCallback(
    (id: string, cambios: Pick<Producto, "precio_venta" | "costo" | "unidades">) => {
      setEstado((e) => ({
        ...e,
        productos: e.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
      }));
      // Un producto creado en este celular llega a Supabase con su primera venta;
      // mientras tanto este cambio no encuentra fila y no hace nada
      if (enLaNube) {
        escribirEnNube(
          () => nube.guardarCambiosProductos([{ id, ...cambios }]),
          "No pudimos guardar el producto en la base de datos"
        );
      }
    },
    [enLaNube, escribirEnNube]
  );

  return {
    ...estado,
    categorias: mock.categorias,
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
    reintentarVenta,
    estadoProductos,
    recargarProductos,
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
    modoEntrada,
    setModoEntrada,
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
