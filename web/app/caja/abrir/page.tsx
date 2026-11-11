"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet } from "lucide-react";

import { BaseDelDia } from "@/components/caja/BaseDelDia";
import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/tiendy/EmptyState";
import { NumberPad } from "@/components/tiendy/NumberPad";
import { iniciales } from "@/lib/formato";
import type { Persona } from "@/lib/mock/tipos";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

/** Abrir caja: primero ¿Quién atiende? (16a) y después la base del día (16). */
export default function AbrirCajaPage() {
  const router = useRouter();
  const { personas, turnoAbierto, abrirTurno } = useTienda();
  const [paso, setPaso] = useState<"quien" | "base">("quien");
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [base, setBase] = useState(0);

  if (turnoAbierto) {
    return (
      <AppScreen title="Abrir caja" back="/caja" withNav={false}>
        <EmptyState
          icon={Wallet}
          titulo="Ya hay una caja abierta"
          texto="Ciérrala antes de abrir otra."
          accion={
            <Button className="w-full" onClick={() => router.push("/caja")}>
              Ir a la caja
            </Button>
          }
        />
      </AppScreen>
    );
  }

  if (paso === "quien") {
    return (
      <AppScreen
        title="¿Quién atiende?"
        back="/caja"
        withNav={false}
        footer={
          <Button disabled={!personaId} onClick={() => setPaso("base")}>
            Seguir · contar la base
          </Button>
        }
      >
        <div className="flex flex-col gap-espacio-2">
          <h2 className="text-titulo-2 text-texto-principal">Elige tu nombre para abrir el turno</h2>
          <p className="text-cuerpo text-texto-secundario">
            No necesitas cuenta ni contraseña. Todo lo que anotes queda con tu nombre.
          </p>
        </div>

        <div role="radiogroup" aria-label="Quién atiende" className="grid grid-cols-2 gap-espacio-3">
          {personas
            .filter((p) => p.activo)
            .map((p) => (
              <TarjetaPersona
                key={p.id}
                persona={p}
                elegida={personaId === p.id}
                onClick={() => setPersonaId(p.id)}
              />
            ))}
          {/* Agregar personas es de Empleados (CU-09 · 47) */}
          <div className="flex flex-col items-center gap-espacio-2 rounded-lg bg-fondo-tarjeta p-espacio-4 text-center">
            <span className="flex size-avatar-l items-center justify-center rounded-full bg-fondo-sutil text-texto-secundario">
              <Plus className="size-icono-md" />
            </span>
            <span className="text-cuerpo-fuerte text-texto-principal">Agregar</span>
            <span className="text-secundario text-texto-secundario">Solo la dueña</span>
          </div>
        </div>
      </AppScreen>
    );
  }

  const abrir = () => {
    abrirTurno(personaId!, base);
    router.push("/");
  };

  return (
    <AppScreen
      title="Abrir caja"
      back={() => setPaso("quien")}
      withNav={false}
      footer={<Button onClick={abrir}>Abrir caja</Button>}
    >
      <h2 className="text-titulo-2 text-texto-principal">¿Con cuánto efectivo empiezas hoy?</h2>

      <BaseDelDia base={base} onChange={setBase} />

      <NumberPad valor={base} onChange={setBase} />
    </AppScreen>
  );
}

function TarjetaPersona({
  persona,
  elegida,
  onClick,
}: {
  persona: Persona;
  elegida: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={elegida}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-espacio-2 rounded-lg bg-fondo-tarjeta p-espacio-4 text-center [border-width:var(--borde-ancho-foco)]",
        elegida ? "border-borde-foco" : "border-transparent"
      )}
    >
      <span className="flex size-avatar-l items-center justify-center rounded-full bg-fondo-primario-suave text-monto-m text-texto-primario">
        {iniciales(persona.nombre_corto)}
      </span>
      <span className="text-cuerpo-fuerte text-texto-principal">{persona.nombre_corto}</span>
      <span className="text-secundario text-texto-secundario">
        {persona.rol === "duena" ? "Dueña" : "Empleado"}
      </span>
    </button>
  );
}
