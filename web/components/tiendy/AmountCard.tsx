import { cn } from "@/lib/utils";

type AmountCardProps = {
  etiqueta: string;
  monto: string;
  /** Oscura: "Vendido hoy" del Home. Clara: tarjetas de la caja. */
  variante?: "oscura" | "clara";
  /** Compacta: tarjetas de dos columnas con monto mediano (17). */
  compacta?: boolean;
  centrada?: boolean;
  /** El monto en verde cuando es plata que entra ("Ventas en efectivo"). */
  montoPrimario?: boolean;
  /** Línea de detalle debajo del monto ("Ganancia $118.000"). */
  children?: React.ReactNode;
  className?: string;
};

/** Tarjeta de monto (UI kit §7): oscura / clara · compacta · centrada. */
export function AmountCard({
  etiqueta,
  monto,
  variante = "clara",
  compacta = false,
  centrada = false,
  montoPrimario = false,
  children,
  className,
}: AmountCardProps) {
  const oscura = variante === "oscura";
  return (
    <div
      className={cn(
        "flex flex-col gap-espacio-1 rounded-xl",
        oscura ? "bg-fondo-encabezado p-espacio-5" : "bg-fondo-tarjeta",
        !oscura && (compacta ? "rounded-lg p-espacio-4" : "p-espacio-5"),
        centrada && "items-center text-center",
        className
      )}
    >
      <span
        className={cn(
          compacta ? "text-secundario" : "text-cuerpo",
          oscura ? "text-texto-inverso" : "text-texto-secundario"
        )}
      >
        {etiqueta}
      </span>
      <span
        className={cn(
          compacta ? "text-monto-m" : "text-monto-xl",
          oscura ? "text-texto-inverso" : montoPrimario ? "text-texto-primario" : "text-texto-principal"
        )}
      >
        {monto}
      </span>
      {children}
    </div>
  );
}
