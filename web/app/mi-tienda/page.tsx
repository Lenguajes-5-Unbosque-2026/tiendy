"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Mic, Users } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { celular, horaDelDia, plural } from "@/lib/formato";
import type { Tienda } from "@/lib/mock/tipos";
import { useTienda } from "@/lib/tienda/store";

/** Mi tienda (46): datos del negocio, empleados y cerrar sesión. */
export default function MiTiendaPage() {
  const router = useRouter();
  const { tienda, personas, guardarTienda, cerrarSesion } = useTienda();
  const [editando, setEditando] = useState(false);
  const duena = personas.find((p) => p.rol === "duena");
  const empleados = personas.filter((p) => p.rol === "empleado" && p.activo).length;

  if (editando) {
    return <EditarTienda tienda={tienda} onListo={() => setEditando(false)} onGuardar={guardarTienda} />;
  }

  const horario =
    tienda.horario_apertura && tienda.horario_cierre
      ? `${horaDelDia(tienda.horario_apertura)} – ${horaDelDia(tienda.horario_cierre)}`
      : null;
  const datos: [string, string | null][] = [
    ["Dueña", duena?.nombre ?? null],
    ["Celular", tienda.celular ? celular(tienda.celular) : null],
    ["Dirección", tienda.direccion],
    ["Horario", horario],
    ["NIT (opcional)", tienda.nit],
  ];

  return (
    <AppScreen
      title="Mi tienda"
      compacto
      footer={
        <Button
          variant="outline"
          onClick={() => {
            cerrarSesion();
            router.push("/bienvenida");
          }}
        >
          Cerrar sesión
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-espacio-3 rounded-xl bg-fondo-tarjeta p-espacio-4">
        <div className="flex min-w-0 flex-col gap-espacio-1">
          <h2 className="text-titulo-2 text-texto-principal">{tienda.nombre}</h2>
          <p className="text-secundario text-texto-secundario">
            {[tienda.tipo, tienda.barrio].filter(Boolean).join(" · ")}
          </p>
        </div>
        <button type="button" onClick={() => setEditando(true)} className="text-cuerpo-fuerte font-bold text-texto-primario">
          Editar
        </button>
      </div>

      <section className="flex flex-col gap-espacio-2">
        <h2 className="text-secundario font-bold text-texto-secundario">Datos del negocio</h2>
        <dl className="flex flex-col gap-espacio-3 rounded-xl bg-fondo-tarjeta p-espacio-4">
          {datos.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="flex items-center justify-between gap-espacio-3">
              <dt className="text-cuerpo text-texto-secundario">{etiqueta}</dt>
              <dd className="text-right text-cuerpo-fuerte font-bold text-texto-principal">
                {valor ?? (
                  <button type="button" onClick={() => setEditando(true)} className="text-texto-primario">
                    Agregar
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <ListItem
        leading={<IconBadge icon={Users} />}
        titulo="Empleados"
        detalle={empleados === 0 ? "Todavía no tienes empleados" : plural(empleados, "empleado", "empleados")}
        flecha
        href="/mi-tienda/empleados"
      />
      {/* Notificaciones y Micrófono no tienen pantalla todavía */}
      <ListItem
        leading={<IconBadge icon={MessageSquare} />}
        titulo="Notificaciones"
        detalle="Agotados · pronto podrás elegirlas"
      />
      <ListItem
        leading={<IconBadge icon={Mic} />}
        titulo="Micrófono"
        detalle="Se activa al tocar"
      />
    </AppScreen>
  );
}

function EditarTienda({
  tienda,
  onGuardar,
  onListo,
}: {
  tienda: Tienda;
  onGuardar: (cambios: Partial<Tienda>) => void;
  onListo: () => void;
}) {
  const [f, setF] = useState(tienda);
  const campo = (etiqueta: string, clave: keyof Tienda, props: React.ComponentProps<"input"> = {}) => (
    <label className="flex flex-col gap-espacio-2">
      <span className="text-cuerpo-fuerte">{etiqueta}</span>
      <Input
        value={f[clave] ?? ""}
        onChange={(e) => setF({ ...f, [clave]: e.target.value || null })}
        {...props}
      />
    </label>
  );

  return (
    <AppScreen
      title="Editar tienda"
      back={onListo}
      withNav={false}
      footer={
        <Button
          disabled={!f.nombre?.trim()}
          onClick={() => {
            onGuardar({ ...f, nombre: f.nombre.trim() });
            onListo();
          }}
        >
          Guardar cambios
        </Button>
      }
    >
      {campo("Nombre de la tienda", "nombre")}
      {campo("Tipo", "tipo", { placeholder: "Tienda de barrio" })}
      {campo("Barrio", "barrio")}
      {campo("Dirección", "direccion")}
      <div className="grid grid-cols-2 gap-espacio-3">
        {campo("Abre", "horario_apertura", { type: "time" })}
        {campo("Cierra", "horario_cierre", { type: "time" })}
      </div>
      {campo("NIT (opcional)", "nit", { inputMode: "numeric" })}
    </AppScreen>
  );
}
