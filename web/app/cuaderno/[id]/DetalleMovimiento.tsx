"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { MovimientoIcono } from "@/components/tiendy/MovimientoIcono";
import { fechaLarga, hora, pesos } from "@/lib/formato";
import { HOY } from "@/lib/tienda/calculos";
import { nombreMedio, resultadoCaja, type TipoMovimiento } from "@/lib/tienda/cuaderno";
import { nombreCategoria } from "@/lib/tienda/gastos";
import { useTienda } from "@/lib/tienda/store";

type Fila = [string, string];

const CANAL: Record<string, string> = {
  voz: "por voz",
  toque: "venta rápida",
  busqueda: "buscando",
  manual: "a mano",
  foto: "con foto",
};

const MOTIVO: Record<string, string> = {
  olvide_un_gasto: "Olvidé anotar un gasto",
  di_mal_vueltas: "Di mal unas vueltas",
  no_se: "No sé",
};

const cuando = (fechaHora: string) =>
  `${fechaHora.startsWith(HOY) ? "Hoy" : fechaLarga(fechaHora)}, ${hora(fechaHora)}`;

/** Detalle de movimiento (36): qué fue, cuánto, cómo se pagó y quién lo anotó. */
export function DetalleMovimiento({ id }: { id: string }) {
  const router = useRouter();
  const t = useTienda();
  const [confirmando, setConfirmando] = useState(false);
  const nombrePersona = (pid: string) => t.personas.find((p) => p.id === pid)?.nombre_corto ?? "";
  const nombreProducto = (pid: string) => t.productos.find((p) => p.id === pid)?.nombre ?? "Producto";

  let tipo: TipoMovimiento;
  let titulo: string;
  let subtitulo: string;
  let lineas: Fila[] = [];
  let filas: Fila[] = [];
  let aviso: string | null = null;
  let corregir: (() => void) | null = null;
  let eliminar: (() => void) | null = null;

  const venta = t.ventas.find((v) => v.id === id && v.estado === "anotada");
  const gasto = t.gastos.find((g) => g.id === id);
  const entrada = t.entradas.find((e) => e.id === id);
  const turno = t.turnos.find((x) => id === `${x.id}-apertura` || id === `${x.id}-cierre`);

  if (venta) {
    const productos = t.ventaProductos.filter((l) => l.venta_id === venta.id);
    tipo = "venta";
    titulo = "Venta";
    subtitulo = `${cuando(venta.fecha_hora)} · ${CANAL[venta.canal]}`;
    lineas = productos.map((l) => [`${nombreProducto(l.producto_id)} × ${l.cantidad}`, pesos(l.subtotal)]);
    filas = [
      ["Total", pesos(venta.total)],
      ["Pago", nombreMedio[venta.medio_pago]],
      ...(venta.paga_con ? [["Pagó con", pesos(venta.paga_con)] as Fila] : []),
      ["Anotó", nombrePersona(venta.persona_id)],
    ];
    aviso = "Si eliminas esta venta, los productos vuelven al inventario.";
    // Corregir abre la hoja de venta con lo que tenía; al anotar, reemplaza a esta
    corregir = () => {
      t.setBorrador({
        lineas: productos.map((l) => ({ productoId: l.producto_id, cantidad: l.cantidad })),
        medioPago: venta.medio_pago,
        pagaCon: venta.paga_con,
        canal: venta.canal,
        corrige: venta.id,
      });
      t.setVenderAbierto(true);
      router.push("/cuaderno");
    };
    eliminar = () => t.eliminarVenta(venta.id);
  } else if (gasto) {
    const proveedor = t.proveedores.find((p) => p.id === gasto.proveedor_id);
    tipo = "gasto";
    titulo = `Gasto · ${nombreCategoria(gasto.categoria)}`;
    subtitulo = `${cuando(gasto.fecha_hora)} · ${CANAL[gasto.canal]}`;
    filas = [
      ["Monto", pesos(gasto.monto)],
      ...(proveedor ? [["Proveedor", proveedor.nombre] as Fila] : []),
      ...(gasto.nota ? [["Nota", gasto.nota] as Fila] : []),
      ...(gasto.lo_que_dijo ? [["Dijo", `“${gasto.lo_que_dijo}”`] as Fila] : []),
      ["Pago", nombreMedio[gasto.medio_pago]],
      ...(gasto.pagar_antes_de ? [["Pagar antes de", fechaLarga(gasto.pagar_antes_de)] as Fila] : []),
      ["Anotó", nombrePersona(gasto.persona_id)],
    ];
    aviso = "Si eliminas este gasto, deja de contar en la caja.";
    corregir = () => {
      t.setBorradorGasto({
        monto: gasto.monto,
        categoria: gasto.categoria,
        nota: gasto.nota ?? "",
        proveedorId: gasto.proveedor_id,
        canal: "manual",
        loQueDijo: gasto.lo_que_dijo,
        corrige: gasto.id,
      });
      router.push("/gasto/manual");
    };
    eliminar = () => t.eliminarGasto(gasto.id);
  } else if (entrada) {
    const proveedor = t.proveedores.find((p) => p.id === entrada.proveedor_id);
    tipo = "mercancia";
    titulo = "Llegó mercancía";
    subtitulo = cuando(entrada.fecha_hora);
    lineas = t.entradaProductos
      .filter((l) => l.entrada_id === entrada.id)
      .map((l) => [`${nombreProducto(l.producto_id)} × ${l.cantidad}`, pesos(l.subtotal)]);
    filas = [
      ["Total del pedido", pesos(entrada.total)],
      ["Proveedor", proveedor?.nombre ?? "Sin proveedor"],
      ["Pago", nombreMedio[entrada.medio_pago]],
      ...(entrada.pagar_antes_de ? [["Pagar antes de", fechaLarga(entrada.pagar_antes_de)] as Fila] : []),
      ["Anotó", nombrePersona(entrada.persona_id)],
    ];
  } else if (turno) {
    const esCierre = id.endsWith("-cierre") && turno.cerrado_en;
    tipo = "caja";
    titulo = esCierre ? "Cierre de caja" : "Apertura de caja";
    subtitulo = cuando(esCierre ? turno.cerrado_en! : turno.abierto_en);
    filas = esCierre
      ? [
          ["Debía haber", pesos(turno.efectivo_esperado ?? 0)],
          ["Contó", pesos(turno.efectivo_contado ?? 0)],
          ["Resultado", resultadoCaja(turno.diferencia ?? 0)],
          ...(turno.motivo_diferencia ? [["Por qué", MOTIVO[turno.motivo_diferencia]] as Fila] : []),
          ["Cerró", nombrePersona(turno.persona_id)],
        ]
      : [
          ["Base", pesos(turno.base)],
          ["Abrió", nombrePersona(turno.persona_id)],
        ];
  } else {
    return (
      <AppScreen title="Detalle" back="/cuaderno">
        <p className="text-cuerpo text-texto-secundario">Este registro ya no existe.</p>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Detalle"
      back="/cuaderno"
      withNav={false}
      footer={
        (corregir || eliminar) && (
          <div className="flex flex-col gap-espacio-3">
            {aviso && <p className="text-center text-secundario text-texto-secundario">{aviso}</p>}
            {corregir && <Button onClick={corregir}>Corregir</Button>}
            {eliminar && (
              <Button
                variant={confirmando ? "outline" : "ghost"}
                onClick={() => {
                  // Se confirma con un segundo toque: no tiene vuelta atrás
                  if (!confirmando) return setConfirmando(true);
                  eliminar!();
                  router.push("/cuaderno");
                }}
              >
                {confirmando ? "Sí, eliminar registro" : "Eliminar registro"}
              </Button>
            )}
          </div>
        )
      }
    >
      <section className="flex flex-col gap-espacio-3 rounded-xl bg-fondo-tarjeta p-espacio-4">
        <div className="flex items-center gap-espacio-3">
          <MovimientoIcono tipo={tipo} tamano="l" />
          <div className="flex flex-col gap-espacio-1">
            <h2 className="text-titulo-2 text-texto-principal">{titulo}</h2>
            <p className="text-secundario text-texto-secundario">{subtitulo}</p>
          </div>
        </div>

        {lineas.length > 0 && (
          <dl className="flex flex-col gap-espacio-2 border-t border-borde-default pt-espacio-3">
            {lineas.map(([que, cuanto], i) => (
              <div key={i} className="flex justify-between gap-espacio-3">
                <dt className="text-cuerpo text-texto-secundario">{que}</dt>
                <dd className="shrink-0 text-cuerpo-fuerte font-bold text-texto-principal">{cuanto}</dd>
              </div>
            ))}
          </dl>
        )}

        <dl className="flex flex-col gap-espacio-2 border-t border-borde-default pt-espacio-3">
          {filas.map(([etiqueta, valor], i) => (
            <div key={etiqueta} className="flex items-center justify-between gap-espacio-3">
              <dt className="text-cuerpo text-texto-secundario">{etiqueta}</dt>
              <dd
                className={
                  i === 0
                    ? "text-monto-m text-texto-principal"
                    : "text-right text-cuerpo-fuerte font-bold text-texto-principal"
                }
              >
                {valor}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </AppScreen>
  );
}
