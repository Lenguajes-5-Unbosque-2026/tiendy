import type { LucideIcon } from "lucide-react";

import { IconBadge } from "@/components/tiendy/IconBadge";

type EmptyStateProps = {
  icon: LucideIcon;
  titulo: string;
  texto?: string;
  /** Botón de acción (va abajo, a ancho completo). */
  accion?: React.ReactNode;
};

/** Estado vacío (20a): ícono, título, texto y botón. */
export function EmptyState({ icon, titulo, texto, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-espacio-6 text-center">
      <div className="flex flex-col items-center gap-espacio-3">
        <IconBadge icon={icon} tamano="l" />
        <p className="text-titulo-2 text-texto-principal">{titulo}</p>
        {texto && <p className="text-secundario text-texto-secundario">{texto}</p>}
      </div>
      {accion}
    </div>
  );
}
