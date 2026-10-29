import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Botón del UI kit (§7): pastilla de alto-boton con texto en estilo "boton".
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-espacio-2 rounded-full border border-transparent text-boton whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-[length:var(--borde-ancho-foco)] focus-visible:ring-borde-foco disabled:pointer-events-none disabled:bg-fondo-sutil disabled:text-texto-secundario [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icono-sm",
  {
    variants: {
      variant: {
        // Primario: la acción principal
        default: "bg-fondo-primario text-texto-inverso",
        // Secundario: una segunda acción que también avanza
        secondary: "bg-fondo-primario-suave text-texto-primario",
        // Borde: una alternativa que no avanza
        outline:
          "border-fondo-primario bg-transparent text-texto-primario [border-width:var(--borde-ancho-boton)]",
        // Texto: acciones de poco peso
        ghost: "bg-transparent text-texto-primario",
        link: "bg-transparent text-texto-primario underline-offset-4 hover:underline",
      },
      size: {
        default: "h-alto-boton w-full px-espacio-6",
        sm: "h-alto-chip px-espacio-4 text-chip",
        icon: "size-alto-boton",
        "icon-sm": "size-alto-chip",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
