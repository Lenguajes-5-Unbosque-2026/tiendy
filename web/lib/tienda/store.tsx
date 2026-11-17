"use client";

// Estado de la tienda en el celular. Guarda lo que cambia en el navegador y, si la
// tienda existe en Supabase, también allá (ver nube.ts). En las dos direcciones:
// · Del celular a Supabase: cada venta, gasto, entrada, apertura y cierre de caja,
//   empleado y cambio de producto queda marcado en sinSubir hasta que Supabase lo
//   confirma; si falla (sin internet), se reintenta solo.
// · De Supabase al celular: al iniciar sesión, al abrir la app, al volver a ella,
//   cada 30 s y cuando Supabase avisa un cambio (tiempo real), se vuelve a leer la
//   tienda. Lo marcado que todavía no ha subido no se pisa.
import {
  createContext,
  Fragment,
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
import * as acceso from "@/lib/tienda/acceso";
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
  /** Lo anotado en este celular que Supabase todavía no ha confirmado. */
  sinSubir: Marca[];
};

/**
 * Un registro que hay que dejar en Supabase como está en el celular. `vez`
 * cambia cada vez que se vuelve a tocar, para no dar por subido un cambio más
 * nuevo que el que se mandó.
 */
export type Marca = {
  tipo: "tienda" | "persona" | "producto" | "turno" | "venta" | "gasto" | "entrada";
  id: string;
  vez: number;
};

/** Se sube primero lo que otros registros necesitan que exista. */
const ORDEN_SUBIDA: Record<Marca["tipo"], number> = {
  tienda: 0,
  persona: 1,
  producto: 2,
  turno: 3,
  venta: 4,
  gasto: 4,
  entrada: 4,
};

/** Cada cuánto se vuelve a leer Supabase, aunque no llegue aviso en tiempo real. */
const CADA_CUANTO_LEER = 30_000;

let contadorVez = 0;

/** Agrega las marcas (o renueva las que ya estaban). */
function marcar(e: Mutable, nuevas: Omit<Marca, "vez">[]): Mutable {
  if (!e.enNube || nuevas.length === 0) return e;
  const clave = (m: Omit<Marca, "vez">) => `${m.tipo}:${m.id}`;
  const claves = new Set(nuevas.map(clave));
  return {
    ...e,
    sinSubir: [
      ...e.sinSubir.filter((m) => !claves.has(clave(m))),
      ...nuevas.map((m) => ({ ...m, vez: Date.now() * 1000 + (contadorVez++ % 1000) })),
    ],
  };
}

/** Los ids que el celular dice que aún no están en Supabase, de un tipo. */
function idsSinSubir(e: Pick<Mutable, "sinSubir">, tipo: Marca["tipo"]) {
  return new Set(e.sinSubir.filter((m) => m.tipo === tipo).map((m) => m.id));
}

/** Lo de Supabase manda, salvo lo que el celular todavía no ha subido. */
function mezclar<T extends { id: string }>(deLaNube: T[], locales: T[], sinSubir: Set<string>) {
  const local = new Map(locales.filter((x) => sinSubir.has(x.id)).map((x) => [x.id, x]));
  const enLaNube = new Set(deLaNube.map((x) => x.id));
  return [
    // En el mismo orden de Supabase, con la versión del celular si falta subirla
    // (si en el celular ya no está, por ejemplo un gasto eliminado, no se muestra)
    ...deLaNube.flatMap((x) => (sinSubir.has(x.id) ? (local.has(x.id) ? [local.get(x.id)!] : []) : [x])),
    ...[...local.values()].filter((x) => !enLaNube.has(x.id)),
  ];
}

const porFecha = <T extends { fecha_hora: string }>(a: T, b: T) => a.fecha_hora.localeCompare(b.fecha_hora);

/** El estado del celular con lo que hay en Supabase, sin perder lo que falta por subir. */
function unirConNube(e: Mutable, datos: nube.DatosTienda): Mutable {
  const ventasSinSubir = idsSinSubir(e, "venta");
  const entradasSinSubir = idsSinSubir(e, "entrada");
  // Los productos de una venta o entrada sin subir guardan las unidades del celular:
  // al subirla, son las que quedan en Supabase
  const productosSinSubir = idsSinSubir(e, "producto");
  for (const l of e.ventaProductos) if (ventasSinSubir.has(l.venta_id)) productosSinSubir.add(l.producto_id);
  for (const l of e.entradaProductos)
    if (entradasSinSubir.has(l.entrada_id)) productosSinSubir.add(l.producto_id);
  return {
    ...e,
    tienda: idsSinSubir(e, "tienda").size > 0 ? e.tienda : datos.tienda,
    personas: mezclar(datos.personas, e.personas, idsSinSubir(e, "persona")),
    productos: mezclar(datos.productos, e.productos, productosSinSubir),
    turnos: mezclar(datos.turnos, e.turnos, idsSinSubir(e, "turno")).sort((a, b) =>
      a.abierto_en.localeCompare(b.abierto_en)
    ),
    ventas: mezclar(datos.ventas, e.ventas, ventasSinSubir).sort(porFecha),
    ventaProductos: [
      ...datos.ventaProductos.filter((l) => !ventasSinSubir.has(l.venta_id)),
      ...e.ventaProductos.filter((l) => ventasSinSubir.has(l.venta_id)),
    ],
    gastos: mezclar(datos.gastos, e.gastos, idsSinSubir(e, "gasto")).sort(porFecha),
    entradas: mezclar(datos.entradas, e.entradas, entradasSinSubir).sort(porFecha),
    entradaProductos: [
      ...datos.entradaProductos.filter((l) => !entradasSinSubir.has(l.entrada_id)),
      ...e.entradaProductos.filter((l) => entradasSinSubir.has(l.entrada_id)),
    ],
  };
}

/**
 * Registros creados en este celular (sus id llevan "-", los de prueba no) que no
 * están en Supabase: quedaron de antes de que la app llevara la cuenta de lo que
 * falta por subir, o de una tienda creada sin conexión.
 */
function huerfanos(e: Mutable, datos: nube.DatosTienda | null): Omit<Marca, "vez">[] {
  const deLaApp = (id: string) => id.includes("-");
  const faltan = <T extends { id: string }>(tipo: Marca["tipo"], locales: T[], enNube: T[] | undefined) => {
    const ya = new Set((enNube ?? []).map((x) => x.id));
    return locales.filter((x) => deLaApp(x.id) && !ya.has(x.id)).map((x) => ({ tipo, id: x.id }));
  };
  return [
    ...faltan("persona", e.personas, datos?.personas),
    ...faltan("producto", e.productos, datos?.productos),
    ...faltan("turno", e.turnos, datos?.turnos),
    ...faltan("venta", e.ventas, datos?.ventas),
    ...faltan("gasto", e.gastos, datos?.gastos),
    ...faltan("entrada", e.entradas, datos?.entradas),
  ];
}

/** Lo que cambió entre dos estados, para no volver a pintar si Supabase trae lo mismo. */
function igual(a: Mutable, b: Mutable) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Cuando la base lleva las unidades (supabase/inventario.sql), un producto que se
 * sube con su número (nuevo, o contado a mano en 42) va con las unidades de
 * antes de lo que falta por subir: la base va a restar las ventas pendientes y a
 * sumar la mercancía pendiente cuando lleguen. Si no, iría contado dos veces.
 */
function unidadesParaSubir(e: Mutable, productos: Producto[]): Producto[] {
  const ventas = idsSinSubir(e, "venta");
  const entradas = idsSinSubir(e, "entrada");
  const anotadas = new Set(e.ventas.filter((v) => ventas.has(v.id) && v.estado === "anotada").map((v) => v.id));
  return productos.map((p) => {
    const vendido = e.ventaProductos
      .filter((l) => l.producto_id === p.id && anotadas.has(l.venta_id))
      .reduce((s, l) => s + l.cantidad, 0);
    const llego = e.entradaProductos
      .filter((l) => l.producto_id === p.id && entradas.has(l.entrada_id))
      .reduce((s, l) => s + l.cantidad, 0);
    return { ...p, unidades: p.unidades + vendido - llego };
  });
}

/** Los productos como deben subir: ajustados si la base lleva las unidades, o como están. */
async function productosParaSubir(e: Mutable, productos: Producto[]) {
  return (await nube.porMovimientos()) ? unidadesParaSubir(e, productos) : productos;
}

/** Arma la subida de una marca con lo que hay ahora en el celular (null: no hay nada que subir). */
function subidaDe(e: Mutable, m: Marca): (() => Promise<void>) | null {
  const tiendaId = e.tienda.id;
  const turnoDe = (id: string) => e.turnos.find((t) => t.id === id) ?? null;
  const personaDe = (id: string) => e.personas.find((p) => p.id === id) ?? null;
  switch (m.tipo) {
    case "tienda": {
      const { nombre, tipo, barrio, direccion, ciudad, horario_apertura, horario_cierre, nit } = e.tienda;
      return () =>
        nube.guardarTienda(tiendaId, {
          nombre,
          tipo,
          barrio,
          direccion,
          ciudad,
          horario_apertura,
          horario_cierre,
          nit,
        });
    }
    case "persona": {
      const persona = personaDe(m.id);
      return persona && (() => nube.subirPersona(tiendaId, persona));
    }
    case "producto": {
      const producto = e.productos.find((p) => p.id === m.id);
      return producto
        ? async () => nube.subirProductos(tiendaId, await productosParaSubir(e, [producto]))
        : null;
    }
    case "turno": {
      const turno = turnoDe(m.id);
      return turno && (() => nube.subirTurno(tiendaId, turno));
    }
    case "venta": {
      const venta = e.ventas.find((v) => v.id === m.id);
      if (!venta) return null;
      return async () =>
        nube.subirVenta({
          tiendaId,
          venta,
          lineas: e.ventaProductos.filter((l) => l.venta_id === venta.id),
          turno: turnoDe(venta.turno_id),
          persona: personaDe(venta.persona_id),
          productos: await productosParaSubir(e, productosDe(e, [venta.id])),
        });
    }
    case "gasto": {
      // Si ya no está en el celular, se eliminó o se corrigió: se borra
      const gasto = e.gastos.find((g) => g.id === m.id) ?? null;
      return () =>
        nube.subirGasto(m.id, gasto, {
          tiendaId,
          turno: gasto ? turnoDe(gasto.turno_id) : null,
          persona: gasto ? personaDe(gasto.persona_id) : null,
        });
    }
    case "entrada": {
      const entrada = e.entradas.find((x) => x.id === m.id);
      if (!entrada) return null;
      const lineas = e.entradaProductos.filter((l) => l.entrada_id === entrada.id);
      const ids = new Set(lineas.map((l) => l.producto_id));
      return async () =>
        nube.subirEntrada(
          entrada,
          lineas,
          await productosParaSubir(e, e.productos.filter((p) => ids.has(p.id))),
          { tiendaId, turno: turnoDe(entrada.turno_id), persona: personaDe(entrada.persona_id) }
        );
    }
  }
}

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
  sinSubir: [],
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

/**
 * Anota la venta y descuenta el inventario; si corrige otra, esa se elimina primero.
 * Se puede vender más de lo anotado: las unidades quedan en negativo (−2 son dos
 * que estaban en el estante sin anotar) hasta que llegue mercancía o se cuente en 42.
 */
function sumarVenta(e: Mutable, nueva: Venta, lineas: VentaProducto[], corrige?: string): Mutable {
  const base = corrige ? quitarVenta(e, corrige, "eliminada") : e;
  return {
    ...base,
    ventas: [...base.ventas, nueva],
    ventaProductos: [...base.ventaProductos, ...lineas],
    productos: base.productos.map((p) => {
      const vendida = lineas.find((l) => l.producto_id === p.id);
      return vendida ? { ...p, unidades: p.unidades - vendida.cantidad } : p;
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

  // ── Sincronización con Supabase ──────────────────────────────
  // Todo lo que se anota queda marcado en sinSubir hasta que Supabase lo confirma
  // (si falla, se reintenta solo). Y cada tanto, al volver a la app y cuando
  // Supabase avisa un cambio, se vuelve a leer la tienda: así lo que cambia en
  // otro celular o en el panel de Supabase también llega a este.

  /** El estado más reciente, para subir y leer sin esperar a que React vuelva a pintar. */
  const ultimo = useRef(estado);
  useEffect(() => {
    ultimo.current = estado;
  }, [estado]);
  const subiendo = useRef(false);
  /** Llegó algo para subir mientras se subía: al terminar se da otra vuelta. */
  const otraVuelta = useRef(false);
  /** Subidas terminadas: si cambia mientras se lee, lo leído ya está viejo. */
  const subidas = useRef(0);
  /** Se pidió leer mientras se subía: se lee al terminar. */
  const leerDespues = useRef(false);
  /** La próxima subida es de algo que se acaba de anotar: si falla, se avisa. */
  const avisarSiFalla = useRef(false);
  /** El estado guardado es de antes de llevar la cuenta de lo que falta por subir. */
  const revisarHuerfanos = useRef(false);
  /** El celular de la tienda creada sin conexión ya tiene otra tienda en Supabase. */
  const tiendaLocalBloqueada = useRef(false);

  /** Una tienda creada sin conexión (o antes de correr cuentas.sql) sigue solo en el navegador. */
  const enLaNube = estado.enNube;

  // Lo guardado en este celular reemplaza a los datos de prueba
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) {
        const leido = JSON.parse(guardado) as Mutable;
        if (!Array.isArray(leido.sinSubir)) {
          leido.sinSubir = [];
          revisarHuerfanos.current = true;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee una sola vez al abrir
        setEstado(leido);
      }
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

  const tiendaId = estado.tienda.id;
  const conSesion = estado.sesion !== null;

  // Con el login por SMS, la sesión del celular vale solo si Supabase también la
  // tiene (con el mismo número): si venció o es de otro número, se vuelve a entrar
  const celularSesion = estado.sesion;
  useEffect(() => {
    if (!cargado || !acceso.conSms || celularSesion === null) return;
    let vigente = true;
    void acceso.celularConSesion().then((celular) => {
      if (vigente && celular !== celularSesion) setEstado((e) => ({ ...e, sesion: null }));
    });
    const dejar = acceso.alSalir(() => setEstado((e) => ({ ...e, sesion: null })));
    return () => {
      vigente = false;
      dejar();
    };
  }, [cargado, celularSesion]);

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

  /** Venta anotada (22): el aviso pasa de "guardando" a anotada o a error, si sigue a la vista. */
  const avisoDeVenta = useCallback((ventaId: string, guardado: Guardado) => {
    setAviso((actual) => {
      if (actual?.tipo !== "venta" || actual.ventaId !== ventaId) return actual;
      if (temporizador.current) clearTimeout(temporizador.current);
      // El error se queda a la vista hasta reintentar
      if (guardado !== "error" && guardado !== "guardando")
        temporizador.current = setTimeout(() => setAviso(null), DURACION_AVISO);
      return { ...actual, guardado };
    });
  }, []);

  /**
   * Lee la tienda de Supabase y la une con lo del celular. Lo que todavía no se
   * ha subido no se pisa. Si se está subiendo algo, espera a que termine.
   */
  const leer = useCallback(async () => {
    const e0 = ultimo.current;
    if (!e0.enNube || e0.sesion === null) return;
    if (subiendo.current) {
      leerDespues.current = true;
      return;
    }
    const id = e0.tienda.id;
    const antes = subidas.current;
    try {
      const datos = await nube.leerTienda(id);
      // Algo se subió mientras se leía: lo leído puede no tenerlo
      if (subiendo.current || subidas.current !== antes) {
        leerDespues.current = true;
        return;
      }
      const revisar = revisarHuerfanos.current;
      revisarHuerfanos.current = false;
      setEstado((e) => {
        if (e.tienda.id !== id || !e.enNube) return e;
        const nuevo = unirConNube(revisar ? marcar(e, huerfanos(e, datos)) : e, datos);
        return igual(nuevo, e) ? e : nuevo;
      });
      setEstadoProductos("listo");
    } catch (error) {
      console.warn("No se pudo leer la tienda de Supabase; se sigue con lo del celular", error);
      setEstadoProductos((actual) => (actual === "listo" ? actual : "error"));
    }
  }, []);

  /**
   * Tienda creada sin conexión (06): apenas hay internet se crea en Supabase y
   * todo lo anotado queda para subir.
   */
  const subirTiendaLocal = useCallback(async () => {
    const e = ultimo.current;
    if (e.enNube || e.sesion === null || tiendaLocalBloqueada.current) return false;
    const duena = e.personas.find((p) => p.rol === "duena");
    if (!duena) return false;
    try {
      await nube.crearTienda(e.tienda, duena);
    } catch (error) {
      if (error instanceof nube.CelularRegistrado) {
        tiendaLocalBloqueada.current = true;
        console.warn("Este celular ya tiene otra tienda en Supabase; esta sigue solo en el celular");
      } else {
        console.warn("Todavía no se pudo crear la tienda en Supabase", error);
      }
      return false;
    }
    setEstado((x) =>
      x.tienda.id !== e.tienda.id
        ? x
        : marcar({ ...x, enNube: true }, [
            { tipo: "tienda", id: x.tienda.id },
            ...huerfanos(x, null),
          ])
    );
    return true;
  }, []);

  /**
   * Una vuelta por lo marcado en sinSubir, en orden (la persona y el turno antes
   * que la venta). Lo que falla se queda marcado. Devuelve true si falló algo
   * que no es una venta (la venta tiene su propio aviso).
   */
  const subirUnaVuelta = useCallback(async () => {
    const hechas = new Set<string>();
    const fallaron = new Set<string>();
    let fallaOtraCosa = false;
    for (;;) {
      const e = ultimo.current;
      if (!e.enNube || e.sesion === null) break;
      const m = e.sinSubir
        .filter((x) => !hechas.has(`${x.tipo}:${x.id}:${x.vez}`) && !fallaron.has(`${x.tipo}:${x.id}`))
        .sort((a, b) => ORDEN_SUBIDA[a.tipo] - ORDEN_SUBIDA[b.tipo] || a.vez - b.vez)[0];
      if (!m) break;
      hechas.add(`${m.tipo}:${m.id}:${m.vez}`);
      try {
        const subida = subidaDe(e, m);
        if (subida) await subida();
        subidas.current++;
        setEstado((x) => ({
          ...x,
          sinSubir: x.sinSubir.filter((y) => !(y.tipo === m.tipo && y.id === m.id && y.vez === m.vez)),
        }));
        if (m.tipo === "venta") avisoDeVenta(m.id, "listo");
      } catch (error) {
        console.error(`No se pudo guardar en Supabase (${m.tipo} ${m.id}); se reintenta después`, error);
        fallaron.add(`${m.tipo}:${m.id}`);
        if (m.tipo === "venta") avisoDeVenta(m.id, "error");
        else fallaOtraCosa = true;
      }
    }
    return fallaOtraCosa;
  }, [avisoDeVenta]);

  /**
   * Sube a Supabase lo que falta. Si ya se está subiendo, la subida en curso da
   * otra vuelta al terminar. Al final, si se pidió, vuelve a leer la tienda.
   */
  const subir = useCallback(async () => {
    if (subiendo.current) {
      otraVuelta.current = true;
      return;
    }
    subiendo.current = true;
    let fallaOtraCosa = false;
    try {
      if (await subirTiendaLocal()) return;
      do {
        otraVuelta.current = false;
        if (await subirUnaVuelta()) fallaOtraCosa = true;
      } while (otraVuelta.current);
    } finally {
      subiendo.current = false;
    }
    if (fallaOtraCosa && avisarSiFalla.current) {
      mostrarAviso({ tipo: "error", texto: "No pudimos guardar en la base de datos. Quedó en este celular" });
    }
    avisarSiFalla.current = false;
    if (leerDespues.current) {
      leerDespues.current = false;
      void leer();
    }
  }, [subirTiendaLocal, subirUnaVuelta, mostrarAviso, leer]);

  // Lo que se acaba de anotar se sube de una vez
  // (solo cuando entra una marca nueva, no cuando se quita una ya subida)
  const ultimaMarca = estado.sinSubir.reduce((max, m) => Math.max(max, m.vez), 0);
  const marcaVista = useRef(0);
  useEffect(() => {
    if (!cargado || !conSesion || ultimaMarca <= marcaVista.current) return;
    marcaVista.current = ultimaMarca;
    void subir();
  }, [cargado, conSesion, ultimaMarca, subir]);

  // Al abrir la app, al volver a ella, al volver el internet, cada 30 s y cuando
  // Supabase avisa un cambio: se sube lo pendiente y se lee la tienda
  useEffect(() => {
    if (!cargado || !conSesion) return;
    if (!enLaNube) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin base, los productos son los del celular
      setEstadoProductos("listo");
    }
    const sincronizar = () => {
      void subir();
      void leer();
    };
    sincronizar();
    const alVolver = () => {
      if (document.visibilityState === "visible") sincronizar();
    };
    window.addEventListener("online", sincronizar);
    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alVolver);
    const reloj = setInterval(alVolver, CADA_CUANTO_LEER);
    // Un cambio suele traer varios avisos seguidos (la venta y sus productos): se lee una vez
    let espera: ReturnType<typeof setTimeout> | undefined;
    const dejarDeEscuchar = enLaNube
      ? nube.escucharTienda(tiendaId, () => {
          clearTimeout(espera);
          espera = setTimeout(() => void leer(), 800);
        })
      : () => {};
    return () => {
      window.removeEventListener("online", sincronizar);
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alVolver);
      clearInterval(reloj);
      clearTimeout(espera);
      dejarDeEscuchar();
    };
  }, [cargado, conSesion, enLaNube, tiendaId, subir, leer]);

  /** Mi inventario (41) · "Reintentar": vuelve a leer la tienda de Supabase. */
  const recargarProductos = useCallback(() => {
    setEstadoProductos("cargando");
    void leer();
  }, [leer]);

  /** Reintentar (22): vuelve a subir la venta que falló (y lo demás que esté pendiente). */
  const reintentarVenta = useCallback(
    (ventaId: string) => {
      avisoDeVenta(ventaId, "guardando");
      void subir();
    },
    [avisoDeVenta, subir]
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
      setEstado((e) =>
        marcar(sumarVenta(e, nueva, lineas, venta.corrige), [
          { tipo: "venta", id },
          ...(venta.corrige ? [{ tipo: "venta" as const, id: venta.corrige }] : []),
        ])
      );

      // Con la tienda en Supabase, el aviso dice "Guardando…" hasta que se confirma
      mostrarAviso(
        {
          tipo: "venta",
          ventaId: id,
          total,
          medioPago: venta.medioPago,
          guardado: enLaNube ? "guardando" : "local",
        },
        enLaNube
      );
      setBorrador(borradorVacio);
      return id;
    },
    [estado, turnoAbierto, atiende, enLaNube, mostrarAviso]
  );

  /** Deshacer (22): la venta queda "deshecha" y los productos vuelven al inventario. */
  const deshacerVenta = useCallback(
    (ventaId: string) => {
      avisarSiFalla.current = true;
      setEstado((e) => marcar(quitarVenta(e, ventaId, "deshecha"), [{ tipo: "venta", id: ventaId }]));
      cerrarAviso();
    },
    [cerrarAviso]
  );

  /** Abrir caja (16a → 16): empieza el turno con quién atiende y la base contada. */
  const abrirTurno = useCallback((personaId: string, base: number) => {
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
    avisarSiFalla.current = true;
    setEstado((e) => marcar({ ...e, turnos: [...e.turnos, turno] }, [{ tipo: "turno", id: turno.id }]));
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
      avisarSiFalla.current = true;
      setEstado((e) =>
        marcar(
          { ...e, turnos: e.turnos.map((t) => (t.id === cerrado.id ? cerrado : t)) },
          [{ tipo: "turno", id: cerrado.id }]
        )
      );
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
      avisarSiFalla.current = true;
      // Al corregir, el gasto anterior sale del celular y se borra de Supabase
      setEstado((e) =>
        marcar({ ...e, gastos: [...e.gastos.filter((g) => g.id !== b.corrige), gasto] }, [
          { tipo: "gasto", id },
          ...(b.corrige ? [{ tipo: "gasto" as const, id: b.corrige }] : []),
        ])
      );
      setBorradorGasto(borradorGastoVacio);
      return id;
    },
    [borradorGasto, estado.gastos, turnoAbierto, atiende]
  );

  /** Eliminar registro (36): la venta deja de contar y sus productos vuelven al inventario. */
  const eliminarVenta = useCallback((ventaId: string) => {
    avisarSiFalla.current = true;
    setEstado((e) => marcar(quitarVenta(e, ventaId, "eliminada"), [{ tipo: "venta", id: ventaId }]));
  }, []);

  const eliminarGasto = useCallback((gastoId: string) => {
    avisarSiFalla.current = true;
    setEstado((e) =>
      marcar({ ...e, gastos: e.gastos.filter((g) => g.id !== gastoId) }, [{ tipo: "gasto", id: gastoId }])
    );
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
        // Sin caja abierta la entrada queda sin turno y a nombre de la dueña
        turno_id: turnoAbierto?.id ?? "",
        persona_id: atiende?.id ?? estado.personas.find((p) => p.rol === "duena")?.id ?? "",
        fecha_hora: horaDeHoy(),
        total: productosEntrada.reduce((s, l) => s + l.subtotal, 0),
        medio_pago: pago.medio,
        pagar_antes_de: pago.medio === "quede_debiendo" ? pago.pagarAntesDe : null,
        imagen: null,
      };
      const sumarLlegada = (p: Producto) => {
        const llego = productosEntrada.find((l) => l.producto_id === p.id);
        return llego
          ? // Si estaba en negativo (se vendió de más), cuenta desde 0: lo de más ya se vendió
            { ...p, unidades: Math.max(0, p.unidades) + llego.cantidad, costo: llego.costo_unitario }
          : p;
      };
      avisarSiFalla.current = true;
      // La entrada sube con las unidades y costos nuevos de sus productos
      setEstado((e) =>
        marcar(
          {
            ...e,
            entradas: [...e.entradas, entrada],
            entradaProductos: [...e.entradaProductos, ...productosEntrada],
            productos: e.productos.map(sumarLlegada),
          },
          [{ tipo: "entrada", id }]
        )
      );
      return id;
    },
    [turnoAbierto, atiende, estado.personas]
  );

  /** Cargar productos (11, 12, 13): los suma al inventario y los sube a Supabase. */
  const agregarProductos = useCallback((nuevos: ProductoNuevo[]) => {
    const base = Date.now();
    const conId = nuevos.map((p, i) => ({ ...p, id: `p-${base}-${i}` }));
    avisarSiFalla.current = true;
    setEstado((e) =>
      marcar(
        { ...e, productos: [...e.productos, ...conId] },
        conId.map((p) => ({ tipo: "producto" as const, id: p.id }))
      )
    );
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
          const revisar = revisarHuerfanos.current;
          revisarHuerfanos.current = false;
          setEstado((e) => {
            // Otra tienda en este celular: se entra solo con lo de Supabase
            if (e.tienda.id !== tiendaId) {
              return { ...datos, sesion: cel, enNube: true, sinSubir: [] };
            }
            // La misma tienda: lo anotado aquí que Supabase no tiene se conserva y se sube
            const conMarcas = marcar({ ...e, enNube: true }, revisar ? huerfanos(e, datos) : []);
            return { ...unirConNube(conMarcas, datos), sesion: cel, enNube: true };
          });
          setEstadoProductos("listo");
          return true;
        }
      } catch (error) {
        console.warn("No se pudo buscar la tienda en Supabase; se usa lo guardado en este celular", error);
        if (cel === mock.tienda.celular && estado.tienda.celular !== cel) {
          setEstado({ ...inicial, sesion: cel });
          return true;
        }
      }
      // Una tienda creada sin conexión solo existe en este celular (se sube cuando haya internet)
      if (cel === estado.tienda.celular) {
        setEstado((e) => ({ ...e, sesion: cel }));
        return true;
      }
      return false;
    },
    [estado.tienda.celular]
  );

  /**
   * Tu tienda (06): cuenta nueva con la tienda vacía y la dueña como primera persona.
   * Se guarda en Supabase; si no hay conexión, la tienda queda en este celular y
   * se sube apenas haya internet.
   * Si el celular ya tiene tienda no crea otra: devuelve "ya-registrado".
   */
  const crearTienda = useCallback(async (
    cel: string,
    nombreTienda: string,
    nombreDuena: string
  ): Promise<"creada" | "ya-registrado"> => {
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
      if (error instanceof nube.CelularRegistrado) return "ya-registrado";
      // Advertencia y no error: la app sigue con la tienda en este celular
      console.warn("No se pudo crear la tienda en Supabase; queda en este celular", error);
      enNube = false;
    }
    tiendaLocalBloqueada.current = false;
    setEstado({
      tienda,
      personas: [duena],
      enNube,
      sinSubir: [],
      sesion: cel,
      productos: [],
      ventas: [],
      ventaProductos: [],
      turnos: [],
      gastos: [],
      entradas: [],
      entradaProductos: [],
    });
    return "creada";
  }, []);

  const cerrarSesion = useCallback(() => {
    setEstado((e) => ({ ...e, sesion: null }));
    void acceso.salir();
  }, []);

  /** Mi tienda (46): cambia los datos del negocio. */
  const guardarTienda = useCallback((cambios: Partial<Tienda>) => {
    avisarSiFalla.current = true;
    setEstado((e) =>
      marcar({ ...e, tienda: { ...e.tienda, ...cambios } }, [{ tipo: "tienda", id: e.tienda.id }])
    );
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
    avisarSiFalla.current = true;
    setEstado((e) =>
      marcar({ ...e, personas: [...e.personas, persona] }, [{ tipo: "persona", id: persona.id }])
    );
  }, []);

  /** Quitar un empleado: deja de salir en 16a, pero lo que anotó sigue con su nombre. */
  const quitarEmpleado = useCallback((personaId: string) => {
    avisarSiFalla.current = true;
    setEstado((e) =>
      marcar(
        { ...e, personas: e.personas.map((p) => (p.id === personaId ? { ...p, activo: false } : p)) },
        [{ tipo: "persona", id: personaId }]
      )
    );
  }, []);

  const guardarProducto = useCallback(
    (id: string, cambios: Pick<Producto, "precio_venta" | "costo" | "unidades">) => {
      avisarSiFalla.current = true;
      setEstado((e) =>
        marcar(
          { ...e, productos: e.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) },
          [{ tipo: "producto", id }]
        )
      );
    },
    []
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

/**
 * El servidor no conoce la tienda de cada celular: pinta con los datos de prueba.
 * Al leer lo guardado en el celular, la key cambia y React vuelve a montar las
 * pantallas con esos datos, en vez de hidratar con datos distintos a los del HTML
 * (error de hidratación). Mientras tanto, GuardaSesion tapa la pantalla.
 */
export function TiendaProvider({ children }: { children: React.ReactNode }) {
  const valor = useTiendaState();
  return (
    <Contexto.Provider value={valor}>
      <Fragment key={valor.cargado ? "celular" : "servidor"}>{children}</Fragment>
    </Contexto.Provider>
  );
}

export function useTienda() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useTienda va dentro de TiendaProvider");
  return contexto;
}
