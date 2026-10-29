import { createCn } from "cn/config"

// `cn` necesita conocer el tema de Tiendy (design/tokens.md) para saber qué clases
// chocan: sin esto, `text-monto-xl` (tamaño) y `text-texto-inverso` (color) se
// confunden, y `h-alto-chip` no reemplaza a `h-alto-boton`.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "monto-xl",
            "titulo-1",
            "titulo-2",
            "monto-m",
            "valor",
            "cuerpo-fuerte",
            "boton",
            "cuerpo",
            "chip",
            "secundario",
            "caption",
          ],
        },
      ],
    },
    theme: {
      spacing: [
        "espacio-1",
        "espacio-2",
        "espacio-3",
        "espacio-4",
        "espacio-5",
        "espacio-6",
        "margen-pantalla",
        "solape-hoja",
        "alto-boton",
        "alto-campo",
        "alto-tecla",
        "alto-chip",
        "alto-header",
        "alto-header-subtitulo",
        "alto-barra-estado",
        "alto-grafica",
        "boton-volver",
        "boton-vender",
        "icono-circulo-m",
        "icono-circulo-l",
        "avatar-m",
        "avatar-l",
        "voz",
        "voz-halo",
        "casilla-codigo",
        "pantalla",
        "icono-sm",
        "icono-md",
        "icono-lg",
        "icono-xl",
      ],
    },
  },
})
