"use client";

import { Banknote, Package, Receipt, Wallet } from "lucide-react";

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

/** Home (15): resumen del día, alerta de inventario y accesos. */
export default function InicioPage() {
  const { ventas, ventaProductos, gastos, turnoAbierto, atiende, setVenderAbierto } = useTienda();
  const { porAgotarse } = useInventario();

  const resumen = resumenDelDia(ventas, ventaProductos);
  const caja = turnoAbierto ? cajaDelTurno(turnoAbierto, ventas, gastos) : null;
  const masUrgente = porAgotarse[0];
  const nombre = atiende?.nombre_corto ?? "";

  return (
    <AppScreen
      title={`Hola, ${nombre}`}
      subtitle={
        turnoAbierto ? `Turno de ${nombre} · desde ${hora(turnoAbierto.abierto_en)}` : undefined
      }
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
              ? "Agotado · ver productos por agotarse"
              : `Quedan ${masUrgente.producto.unidades} · ver productos por agotarse`
          }
          href="/inventario/por-agotarse"
        />
      )}

      <ActionCard
        variante="primaria"
        icon={Banknote}
        titulo="Vender"
        detalle="Busca, toca o dilo en voz alta"
        onClick={() => setVenderAbierto(true)}
      />

      {/* Registrar gasto (CU-05) y Llegó mercancía (CU-08 · 41a) quedan fuera del MVP */}
      <div className="grid grid-cols-2 gap-espacio-3">
        <ActionCard vertical icon={Receipt} titulo="Registrar gasto" />
        <ActionCard vertical icon={Package} titulo="Llegó mercancía" />
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
