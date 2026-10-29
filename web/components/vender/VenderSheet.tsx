"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Package, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Chip, ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { QuantityStepper } from "@/components/tiendy/QuantityStepper";
import { leerPesos, pesos } from "@/lib/formato";
import type { MedioPago, Producto } from "@/lib/mock/tipos";
import { useTienda, type Borrador } from "@/lib/tienda/store";
import { useReconocimientoVoz } from "@/lib/tienda/useReconocimientoVoz";
import { interpretarVenta, normalizar } from "@/lib/tienda/voz";

const mediosPago: { valor: MedioPago; etiqueta: string }[] = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Nequi / Daviplata" },
  { valor: "fiado", etiqueta: "Fiado" },
];

const nombreMedio: Record<MedioPago, string> = {
  efectivo: "efectivo",
  transferencia: "Nequi / Daviplata",
  fiado: "fiado",
};

/** Segundos antes de guardar sola una venta dicha por voz (21). */
const SEGUNDOS_AUTOGUARDADO = 3;

type Dicho = { texto: string; medio: MedioPago | null; entendido: boolean };

/** Hoja "Nueva venta" (20), lo que dijiste (21) y el estado sin productos (20a). */
export function VenderSheet() {
  const router = useRouter();
  const {
    productos,
    borrador,
    setBorrador,
    reiniciarBorrador,
    venderAbierto,
    setVenderAbierto,
    anotarVenta,
  } = useTienda();
  const [busqueda, setBusqueda] = useState("");
  const [dicho, setDicho] = useState<Dicho | null>(null);
  const [cuenta, setCuenta] = useState<number | null>(null);

  // 21 · Lo que dijiste: arma la venta con lo que se entendió
  const alEscuchar = useCallback(
    (texto: string) => {
      const venta = interpretarVenta(texto, productos);
      setDicho({ texto, medio: venta.medioPago, entendido: venta.entendido });
      if (!venta.entendido) return;
      const medioPago = venta.medioPago ?? "efectivo";
      setBorrador({ lineas: venta.lineas, medioPago, pagaCon: venta.pagaCon, canal: "voz" });
      // El fiado necesita escoger cliente: no se guarda solo
      setCuenta(medioPago === "fiado" ? null : SEGUNDOS_AUTOGUARDADO);
    },
    [productos, setBorrador],
  );
  const voz = useReconocimientoVoz(alEscuchar);

  const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);
  const ventasRapidas = productos.filter((p) => p.venta_rapida);

  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return [];
    return productos
      .filter((p) =>
        [p.nombre, p.nombre_corto, ...(p.alias ?? [])].some((n) => normalizar(n).includes(q)),
      )
      .slice(0, 5);
  }, [busqueda, productos]);

  const lineas = borrador.lineas
    .map((l) => ({ ...l, producto: porId.get(l.productoId) }))
    .filter((l): l is typeof l & { producto: Producto } => Boolean(l.producto));
  const total = lineas.reduce((s, l) => s + l.producto.precio_venta * l.cantidad, 0);
  const vueltas =
    borrador.medioPago === "efectivo" && borrador.pagaCon !== null && borrador.pagaCon >= total
      ? borrador.pagaCon - total
      : null;

  const actualizar = (cambios: Partial<Borrador>) => setBorrador({ ...borrador, ...cambios });

  const cantidadDe = (id: string) =>
    borrador.lineas.find((l) => l.productoId === id)?.cantidad ?? 0;

  const sumar = (producto: Producto, canal: Borrador["canal"]) => {
    if (cantidadDe(producto.id) >= producto.unidades) return;
    const existe = borrador.lineas.some((l) => l.productoId === producto.id);
    actualizar({
      canal: borrador.lineas.length === 0 ? canal : borrador.canal,
      lineas: existe
        ? borrador.lineas.map((l) =>
            l.productoId === producto.id ? { ...l, cantidad: l.cantidad + 1 } : l,
          )
        : [...borrador.lineas, { productoId: producto.id, cantidad: 1 }],
    });
  };

  const restar = (productoId: string) =>
    actualizar({
      lineas: borrador.lineas
        .map((l) => (l.productoId === productoId ? { ...l, cantidad: l.cantidad - 1 } : l))
        .filter((l) => l.cantidad > 0),
    });

  const irAFiado = () => {
    setVenderAbierto(false);
    router.push("/vender/fiado");
  };

  const elegirMedio = (medioPago: MedioPago) => {
    setBorrador({ ...borrador, medioPago });
    // Al elegir Fiado se pasa a "Venta fiada" (23) para escoger el cliente
    if (medioPago === "fiado" && lineas.length > 0) irAFiado();
  };

  const limpiar = () => {
    setBusqueda("");
    setDicho(null);
    setCuenta(null);
  };

  const anotar = () => {
    if (borrador.medioPago === "fiado") return irAFiado();
    anotarVenta(borrador);
    limpiar();
    setVenderAbierto(false);
    router.push("/");
  };

  // Cuenta regresiva de la venta por voz: si nadie toca nada, se guarda
  useEffect(() => {
    if (cuenta === null) return;
    const t = setTimeout(() => {
      if (cuenta <= 1) anotar();
      else setCuenta(cuenta - 1);
    }, 1000);
    return () => clearTimeout(t);
  });

  const cancelar = (abierto: boolean) => {
    setVenderAbierto(abierto);
    if (!abierto) {
      voz.detener();
      reiniciarBorrador();
      limpiar();
    }
  };

  return (
    <Drawer open={venderAbierto} onOpenChange={cancelar} showSwipeHandle>
      <DrawerContent className="mx-auto w-full max-w-pantalla border-0 bg-fondo-app data-[swipe-direction=down]:rounded-t-2xl">
        <div
          // Tocar cualquier cosa para corregir detiene el guardado automático
          onPointerDownCapture={() => setCuenta(null)}
          className="flex min-h-0 flex-col gap-espacio-4 overflow-y-auto px-espacio-5 pt-espacio-3 pb-[max(var(--espacio-5),env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-titulo-2 text-texto-principal">Nueva venta</DrawerTitle>
            <DrawerClose className="text-cuerpo-fuerte text-texto-primario">Cancelar</DrawerClose>
          </div>

          {productos.length === 0 ? (
            <EmptyState
              icon={Package}
              titulo="Aún no tienes productos"
              texto="Para vender primero carga lo que hay en tu tienda. Con el listado de productos típicos toma unos 5 minutos."
              accion={
                <Button
                  onClick={() => {
                    setVenderAbierto(false);
                    router.push("/inventario");
                  }}
                >
                  Cargar productos
                </Button>
              }
            />
          ) : (
            <>
              {dicho?.entendido ? (
                <div className="flex flex-col gap-espacio-2">
                  <div className="flex items-center gap-espacio-3 rounded-lg bg-fondo-primario-suave p-espacio-4">
                    <IconBadge icon={Mic} tono="exito" tamano="l" />
                    <div className="flex flex-col gap-espacio-1">
                      <span className="text-secundario font-bold text-texto-primario">
                        Te escuché
                      </span>
                      <span className="text-cuerpo text-texto-principal">“{dicho.texto}”</span>
                    </div>
                  </div>
                  <p className="text-secundario text-texto-secundario">
                    Toca una línea para corregirla. También puedes{" "}
                    <button
                      type="button"
                      onClick={() => setDicho(null)}
                      className="font-bold text-texto-primario underline-offset-4 hover:underline"
                    >
                      buscar a mano
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-espacio-2">
                    <div className="flex items-center gap-espacio-3">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-espacio-4 size-icono-sm -translate-y-1/2 text-texto-sutil" />
                        <Input
                          type="search"
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          placeholder="Busca un producto"
                          aria-label="Busca un producto"
                          className="pl-[calc(var(--espacio-4)+var(--icono-sm)+var(--espacio-2))]"
                        />
                      </div>
                      {/* Sin reconocimiento de voz en el navegador, el micrófono queda apagado */}
                      <Button
                        variant={voz.estado === "escuchando" ? "default" : "secondary"}
                        size="icon"
                        disabled={!voz.disponible}
                        aria-label={
                          voz.estado === "escuchando" ? "Dejar de escuchar" : "Vender hablando"
                        }
                        aria-pressed={voz.estado === "escuchando"}
                        onClick={voz.estado === "escuchando" ? voz.detener : voz.escuchar}
                      >
                        <Mic className="size-icono-md" />
                      </Button>
                    </div>

                    {voz.estado === "escuchando" && (
                      <p role="status" className="text-cuerpo-fuerte text-texto-primario">
                        Escuchando… di los productos y cómo te pagan.
                      </p>
                    )}
                    {voz.estado === "error" && (
                      <p role="status" className="text-secundario text-texto-secundario">
                        No pudimos usar el micrófono. Revisa el permiso o busca a mano.
                      </p>
                    )}
                    {dicho && !dicho.entendido && (
                      <p role="status" className="text-secundario text-texto-secundario">
                        Escuché “{dicho.texto}”, pero no encontré esos productos. Intenta de nuevo o
                        búscalos a mano.
                      </p>
                    )}

                    {resultados.length > 0 && (
                      <ul className="flex flex-col overflow-hidden rounded-lg bg-fondo-tarjeta">
                        {resultados.map((p) => {
                          const agotado = cantidadDe(p.id) >= p.unidades;
                          return (
                            <li key={p.id} className="border-b border-borde-default last:border-0">
                              <button
                                type="button"
                                disabled={agotado}
                                onClick={() => {
                                  sumar(p, "busqueda");
                                  setBusqueda("");
                                }}
                                className="flex w-full items-center justify-between gap-espacio-3 px-espacio-4 py-espacio-3 text-left disabled:text-texto-sutil"
                              >
                                <span className="text-cuerpo">{p.nombre}</span>
                                <span className="shrink-0 text-secundario">
                                  {p.unidades === 0 ? "Agotado" : pesos(p.precio_venta)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {busqueda.trim() && resultados.length === 0 && (
                      <p className="text-secundario text-texto-secundario">
                        No encontramos “{busqueda.trim()}” en tu inventario.
                      </p>
                    )}
                  </div>

                  <section className="flex flex-col gap-espacio-2">
                    <h2 className="text-secundario text-texto-secundario">
                      Ventas rápidas · un toque suma 1
                    </h2>
                    <div className="flex flex-wrap gap-espacio-2">
                      {ventasRapidas.map((p) => (
                        <Chip
                          key={p.id}
                          disabled={cantidadDe(p.id) >= p.unidades}
                          onClick={() => sumar(p, "toque")}
                        >
                          {p.nombre_corto} · {pesos(p.precio_venta)}
                        </Chip>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {lineas.length > 0 && (
                <section className="flex flex-col gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4">
                  <h2 className="text-secundario text-texto-secundario">Esta venta</h2>
                  <ul className="flex flex-col gap-espacio-3">
                    {lineas.map((l) => (
                      <li key={l.productoId} className="flex items-center gap-espacio-3">
                        <span className="min-w-0 flex-1 text-cuerpo-fuerte">
                          {l.producto.nombre}
                        </span>
                        <QuantityStepper
                          valor={l.cantidad}
                          etiqueta={l.producto.nombre}
                          onMenos={() => restar(l.productoId)}
                          onMas={() => sumar(l.producto, borrador.canal)}
                          maximo={l.producto.unidades}
                        />
                        <span className="shrink-0 text-cuerpo-fuerte font-bold">
                          {pesos(l.producto.precio_venta * l.cantidad)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t border-borde-default pt-espacio-3">
                    <span className="text-cuerpo-fuerte">Total</span>
                    <span className="text-monto-xl">{pesos(total)}</span>
                  </div>
                </section>
              )}

              <section className="flex flex-col gap-espacio-2">
                <h2 className="text-secundario text-texto-secundario">
                  ¿Cómo te pagan?
                  {dicho?.entendido && dicho.medio && ` · lo dijiste: ${nombreMedio[dicho.medio]}`}
                </h2>
                <ChoiceChips
                  etiqueta="¿Cómo te pagan?"
                  opciones={mediosPago}
                  valor={borrador.medioPago}
                  onChange={elegirMedio}
                />
              </section>

              {borrador.medioPago === "efectivo" && (
                <div className="flex items-center justify-between gap-espacio-3">
                  <label className="flex min-w-0 flex-1 items-center gap-espacio-1 text-cuerpo whitespace-nowrap">
                    Paga con
                    <input
                      inputMode="numeric"
                      value={borrador.pagaCon === null ? "" : pesos(borrador.pagaCon)}
                      onChange={(e) => actualizar({ pagaCon: leerPesos(e.target.value) })}
                      placeholder="$0"
                      className="w-full min-w-0 rounded-sm bg-transparent text-cuerpo-fuerte outline-none placeholder:text-texto-sutil focus-visible:bg-fondo-sutil"
                    />
                  </label>
                  {vueltas !== null && (
                    <span className="shrink-0 text-cuerpo-fuerte font-bold text-texto-primario">
                      Vueltas {pesos(vueltas)}
                    </span>
                  )}
                </div>
              )}

              <Button disabled={lineas.length === 0} onClick={anotar}>
                {lineas.length === 0
                  ? "Anotar venta"
                  : cuenta !== null
                    ? `Anotar · se guarda en ${cuenta} s`
                    : `Anotar venta · ${pesos(total)}`}
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
