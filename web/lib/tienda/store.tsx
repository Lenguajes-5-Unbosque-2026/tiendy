"use client";

// Estado de la tienda en el celular. Arranca con data/mock/ y guarda lo que
// cambia (ventas, inventario) en el navegador hasta que llegue Supabase.
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
  DatosMock,
  MedioPago,
  Producto,
  Venta,
  VentaProducto,
} from "@/lib/mock/tipos";
import { HOY } from "@/lib/tienda/calculos";

const mock = datos as unknown as DatosMock;
// Cambia la versión si cambia la forma de lo guardado
const CLAVE = "tiendy:mvp:v3";
const DURACION_AVISO = 6000;

type Mutable = {
  productos: Producto[];
  ventas: Venta[];
  ventaProductos: VentaProducto[];
};

export type LineaVenta = { productoId: string; cantidad: number };

/** La venta que se está armando en la hoja (20). */
export type Borrador = {
  lineas: LineaVenta[];
  medioPago: MedioPago;
  pagaCon: number | null;
  canal: Venta["canal"];
};

export type Aviso = { ventaId: string; total: number; medioPago: MedioPago };

const borradorVacio: Borrador = {
  lineas: [],
  medioPago: "efectivo",
  pagaCon: null,
  canal: "toque",
};

const inicial: Mutable = {
  productos: mock.productos,
  ventas: mock.ventas,
  ventaProductos: mock.ventaProductos,
};

function horaDeHoy() {
  // La fecha es la de los datos de prueba; la hora, la de ahora.
  const ahora = new Date();
  const hh = String(ahora.getHours()).padStart(2, "0");
  const mm = String(ahora.getMinutes()).padStart(2, "0");
  return `${HOY}T${hh}:${mm}:00-05:00`;
}

function useTiendaState() {
  const [estado, setEstado] = useState<Mutable>(inicial);
  const [cargado, setCargado] = useState(false);
  const [borrador, setBorrador] = useState<Borrador>(borradorVacio);
  const [venderAbierto, setVenderAbierto] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
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

  const turnoAbierto = mock.turnos.find((t) => t.estado === "abierto") ?? null;
  const atiende = mock.personas.find((p) => p.id === turnoAbierto?.persona_id) ?? null;

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
      const nueva: Venta = {
        id,
        turno_id: turnoAbierto?.id ?? "",
        persona_id: atiende?.id ?? "",
        fecha_hora: horaDeHoy(),
        canal: venta.canal,
        medio_pago: venta.medioPago,
        total,
        paga_con: venta.medioPago === "efectivo" ? venta.pagaCon : null,
        estado: "anotada",
      };

      setEstado((e) => ({
        ...e,
        ventas: [...e.ventas, nueva],
        ventaProductos: [...e.ventaProductos, ...lineas],
        productos: e.productos.map((p) => {
          const vendida = lineas.find((l) => l.producto_id === p.id);
          return vendida ? { ...p, unidades: Math.max(0, p.unidades - vendida.cantidad) } : p;
        }),
      }));

      mostrarAviso({ ventaId: id, total, medioPago: venta.medioPago });
      setBorrador(borradorVacio);
      return id;
    },
    [estado.productos, turnoAbierto, atiende, mostrarAviso]
  );

  /** Deshacer (22): la venta queda "deshecha" y los productos vuelven al inventario. */
  const deshacerVenta = useCallback(
    (ventaId: string) => {
      setEstado((e) => {
        const lineas = e.ventaProductos.filter((l) => l.venta_id === ventaId);
        return {
          ...e,
          ventas: e.ventas.map((v) => (v.id === ventaId ? { ...v, estado: "deshecha" } : v)),
          productos: e.productos.map((p) => {
            const vuelve = lineas.find((l) => l.producto_id === p.id);
            return vuelve ? { ...p, unidades: p.unidades + vuelve.cantidad } : p;
          }),
        };
      });
      cerrarAviso();
    },
    [cerrarAviso]
  );

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
    tienda: mock.tienda,
    categorias: mock.categorias,
    gastos: mock.gastos,
    turnoAbierto,
    atiende,
    borrador,
    setBorrador,
    reiniciarBorrador: () => setBorrador(borradorVacio),
    venderAbierto,
    setVenderAbierto,
    aviso,
    cerrarAviso,
    anotarVenta,
    deshacerVenta,
    guardarProducto,
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
