"use client";

import { Banknote, Package, PackagePlus, Receipt, Store, Wallet } from "lucide-react";

import { useState } from "react";

import { AbrirCajaSheet } from "@/components/caja/AbrirCajaSheet";
import { AppScreen } from "@/components/layout/AppScreen";
import { ActionCard } from "@/components/tiendy/ActionCard";
import { AlertBanner } from "@/components/tiendy/AlertBanner";
import { AmountCard } from "@/components/tiendy/AmountCard";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { hora, pesos } from "@/lib/formato";
import { cajaDelTurno, resumenDelDia } from "@/lib/tienda/calculos";
import { useTienda } from "@/lib/tienda/store";
import { useInventario } from "@/lib/tienda/useInventario";

/** Mi tienda (46) se abre desde el Home: no tiene pestaña. */
const MI_TIENDA = { href: "/mi-tienda", icon: Store, etiqueta: "Mi tienda" };

/** Home: sin caja abierta (09) o con el resumen del turno (15). */
export default function InicioPage() {
  const { turnoAbierto } = useTienda();
  return turnoAbierto ? <HomeDelDia /> : <HomeSinCaja />;
}

/** Home sin caja abierta (09): lo primero es abrir la caja. */
function HomeSinCaja() {
  const { tienda, personas, setVenderAbierto } = useTienda();
  const [abriendo, setAbriendo] = useState(false);
  const duena = personas.find((p) => p.rol === "duena");

  return (
    <AppScreen
      title={`Hola, ${duena?.nombre_corto ?? ""}`}
      subtitle={tienda.nombre}
      accion={MI_TIENDA}
    >
      <ActionCard
        variante="primaria"
        icon={Wallet}
        titulo="Abrir caja"
        detalle="Pon la base para empezar el día"
        onClick={() => setAbriendo(true)}
      />
      {/* Sin caja abierta, la hoja de venta pide abrirla primero */}
      <ActionCard
        icon={Banknote}
        titulo="Vender"
        detalle="Busca, toca o dilo en voz alta"
        onClick={() => setVenderAbierto(true)}
      />
      <div className="grid grid-cols-2 gap-espacio-3">
        <ActionCard vertical icon={Receipt} titulo="Registrar gasto" href="/gasto" />
        <ActionCard vertical icon={Package} titulo="Llegó mercancía" href="/inventario/llego" />
      </div>
      <ActionCard vertical icon={PackagePlus} titulo="Cargar productos" href="/inventario/cargar" />
      <AbrirCajaSheet abierta={abriendo} onOpenChange={setAbriendo} />
    </AppScreen>
  );
}

/** Home del día (15): resumen del día, alerta de inventario y accesos. */
function HomeDelDia() {
  const { ventas, ventaProductos, gastos, turnoAbierto, atiende, setVenderAbierto } = useTienda();
  const { porAgotarse } = useInventario();

  const resumen = resumenDelDia(ventas, ventaProductos);
  const caja = turnoAbierto ? cajaDelTurno(turnoAbierto, ventas, gastos) : null;
  const masUrgente = porAgotarse[0];
  const nombre = atiende?.nombre_corto ?? "";

  return (
    <AppScreen
      title={`Hola, ${nombre}`}
      accion={MI_TIENDA}
      subtitle={turnoAbierto ? `Turno de ${nombre} · desde ${hora(turnoAbierto.abierto_en)}` : undefined}
    >
      <AmountCard variante="oscura" etiqueta="Vendido hoy" monto={pesos(resumen.vendido)}>
        <span className="text-chip text-texto-inverso-suave">
          Ganancia {pesos(resumen.ganancia)}
        </span>
      </AmountCard>

      {masUrgente && (
        <AlertBanner
          tono="advertencia"
          titulo={`Se está acabando: ${masUrgente.producto.nombre_corto}`}
          detalle={
            masUrgente.producto.unidades === 0
              ? "Agotado · ver sugerencia de compra"
              : `Quedan ${masUrgente.producto.unidades} · ver sugerencia de compra`
          }
          href="/inventario/sugerencias"
        />
      )}

      <ActionCard
        variante="primaria"
        icon={Banknote}
        titulo="Vender"
        detalle="Busca, toca o dilo en voz alta"
        onClick={() => setVenderAbierto(true)}
      />

      <div className="grid grid-cols-2 gap-espacio-3">
        <ActionCard vertical icon={Receipt} titulo="Registrar gasto" href="/gasto" />
        <ActionCard vertical icon={Package} titulo="Llegó mercancía" href="/inventario/llego" />
      </div>

      {caja && (
        <ListItem
          leading={<IconBadge icon={Wallet} tono="oscuro" />}
          titulo="Caja del día"
          detalle={`Efectivo esperado ${pesos(caja.esperado)}`}
          flecha
          href="/caja"
        />
      )}
    </AppScreen>
  );
}
