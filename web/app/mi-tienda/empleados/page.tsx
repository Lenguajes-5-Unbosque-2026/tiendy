"use client";

import { useState } from "react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBadge } from "@/components/tiendy/IconBadge";
import { ListItem } from "@/components/tiendy/ListItem";
import { iniciales } from "@/lib/formato";
import { useTienda } from "@/lib/tienda/store";

/** Empleados (47): quién puede atender, sin cuenta ni código. */
export default function EmpleadosPage() {
  const { personas, agregarEmpleado, quitarEmpleado } = useTienda();
  const [nombre, setNombre] = useState("");
  const [quitando, setQuitando] = useState<string | null>(null);
  const activas = personas
    .filter((p) => p.activo)
    .sort((a, b) => (a.rol === "duena" ? -1 : b.rol === "duena" ? 1 : 0));
  const repetido = activas.some((p) => p.nombre.toLowerCase() === nombre.trim().toLowerCase());

  return (
    <AppScreen
      title="Empleados"
      back="/mi-tienda"
      footer={
        <Button
          disabled={!nombre.trim() || repetido}
          onClick={() => {
            agregarEmpleado(nombre);
            setNombre("");
          }}
        >
          Agregar empleado
        </Button>
      }
    >
      <p className="text-secundario text-texto-secundario">
        Tus empleados pueden vender, anotar gastos y abrir o cerrar caja. No ven ganancias ni cambian
        precios.
      </p>

      <ul className="flex flex-col gap-espacio-3">
        {activas.map((p) => {
          const duena = p.rol === "duena";
          return (
            <li key={p.id}>
              <ListItem
                leading={<IconBadge letra={iniciales(p.nombre).charAt(0)} tono={duena ? "oscuro" : "primario"} />}
                titulo={p.nombre}
                detalle={duena ? "Dueña · tú" : "Empleado"}
                trailing={
                  !duena && (
                    <button
                      type="button"
                      onClick={() => {
                        // Se confirma con un segundo toque
                        if (quitando !== p.id) return setQuitando(p.id);
                        quitarEmpleado(p.id);
                        setQuitando(null);
                      }}
                      className="shrink-0 text-secundario font-bold text-texto-primario"
                    >
                      {quitando === p.id ? "¿Seguro? Quitar" : "Quitar"}
                    </button>
                  )
                }
              />
            </li>
          );
        })}
      </ul>

      <section className="flex flex-col gap-espacio-2">
        <h2 className="text-secundario font-bold text-texto-secundario">Agregar empleado</h2>
        <div className="flex flex-col gap-espacio-2 rounded-xl bg-fondo-tarjeta p-espacio-4">
          <Input
            aria-label="Nombre del empleado"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <p className="text-caption text-texto-secundario">
            {repetido
              ? "Ya hay alguien con ese nombre."
              : "Entra eligiendo su nombre en el celular de la tienda. No necesita cuenta ni código."}
          </p>
        </div>
      </section>
    </AppScreen>
  );
}
