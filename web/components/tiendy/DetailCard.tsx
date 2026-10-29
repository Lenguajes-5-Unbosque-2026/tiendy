import { cn } from "@/lib/utils";

const tonos = {
  principal: "text-texto-principal",
  primario: "text-texto-primario",
  peligro: "text-texto-peligro",
} as const;

export type FilaDetalle = {
  etiqueta: string;
  valor: string;
  tono?: keyof typeof tonos;
  /** Fila de total: con separador arriba y el valor más grande. */
  total?: boolean;
};

/** Tarjeta de detalle: filas clave–valor ("Monto · $184.000"). */
export function DetailCard({ filas, className }: { filas: FilaDetalle[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col gap-espacio-2 rounded-lg bg-fondo-tarjeta p-espacio-4", className)}>
      {filas.map((f) => (
        <div
          key={f.etiqueta}
          className={cn(
            "flex items-center justify-between gap-espacio-3",
            f.total && "mt-espacio-1 border-t border-borde-default pt-espacio-3"
          )}
        >
          <dt className="text-cuerpo text-texto-secundario">{f.etiqueta}</dt>
          <dd className={cn(f.total ? "text-valor" : "text-cuerpo-fuerte font-bold", tonos[f.tono ?? "principal"])}>
            {f.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}
