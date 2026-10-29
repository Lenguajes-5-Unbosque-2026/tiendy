import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

// Campo de texto del UI kit (§7): alto-campo, fondo sutil y borde de foco al escribir.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-alto-campo w-full min-w-0 rounded-md border-transparent bg-fondo-sutil px-espacio-4 text-cuerpo text-texto-principal outline-none [border-width:var(--borde-ancho-foco)] placeholder:text-texto-sutil focus-visible:border-borde-foco focus-visible:bg-fondo-tarjeta disabled:pointer-events-none disabled:border-borde-fuerte",
        className
      )}
      {...props}
    />
  )
}

export { Input }
