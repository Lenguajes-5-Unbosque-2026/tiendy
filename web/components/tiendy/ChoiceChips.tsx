import { cn } from "@/lib/utils";

type Opcion<T extends string> = { valor: T; etiqueta: string; disabled?: boolean };

type ChoiceChipsProps<T extends string> = {
  opciones: Opcion<T>[];
  /** Elegido; null si ninguno. */
  valor: T | null;
  onChange: (valor: T) => void;
  etiqueta: string;
  className?: string;
};

/** Chips de filtro (UI kit §7) con una sola respuesta. */
export function ChoiceChips<T extends string>({
  opciones,
  valor,
  onChange,
  etiqueta,
  className,
}: ChoiceChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className={cn("flex flex-wrap gap-espacio-2", className)}>
      {opciones.map((o) => (
        <Chip
          key={o.valor}
          role="radio"
          aria-checked={valor === o.valor}
          elegido={valor === o.valor}
          disabled={o.disabled}
          onClick={() => onChange(o.valor)}
        >
          {o.etiqueta}
        </Chip>
      ))}
    </div>
  );
}

type ChipProps = React.ComponentProps<"button"> & { elegido?: boolean };

/** Un chip suelto: también sirve para las ventas rápidas, donde cada toque suma 1. */
export function Chip({ elegido = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-alto-chip items-center rounded-full px-espacio-4 text-chip whitespace-nowrap transition-colors disabled:text-texto-sutil",
        elegido
          ? "bg-fondo-primario text-texto-inverso"
          : "border border-borde-default bg-fondo-tarjeta text-texto-principal",
        className
      )}
      {...props}
    />
  );
}
