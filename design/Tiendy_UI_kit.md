# Tiendy — ⚙️ Componentes / UI kit

> Página "⚙️Componentes / Ui kit" del archivo de Figma **Tiendy**.
> Fuente: https://www.figma.com/design/bzbPDyDL2y6K6ED0FjBYxX/Tiendy?node-id=3-4

---

## Propuestas de logo

*(En Figma está como imagen de referencia.)*

| Propuesta | Fondo | Ícono | Eslogan |
|---|---|---|---|
| **A · El toldo** | Crema | Tienda con toldo verde y amarillo | "tu tienda, siempre surtida" |
| **B · La bolsa** | Verde oscuro | Bolsa de compras con chulo y punto amarillo | "sabe qué se acaba antes que tú" |
| **C · El estante** | Amarillo | Estante con productos en un cuadro verde redondeado | "repón antes de que te lo pidan" |

---

## Auditoría y decisiones de UI

**Referencias (página Recursos):** apps de supermercado con verde fresco (Frames 1, 2, 4, 8), acentos naranja/rojo de apps de comida (3, 5), estilo limpio y minimalista con mucho blanco (7, 9) y pantallas de app de comida con header oscuro, hoja blanca redondeada, botones píldora e íconos en círculo (Log In, Recommendations, Help Center).

### Qué encontramos en las pantallas v1

- 47 pantallas sin un solo componente: todo dibujado a mano.
- Íconos reemplazados por letras ($, C, I, F, !).
- 12 radios distintos y ~25 combinaciones de tamaño/peso de texto.
- Tres colores fuertes compitiendo (morado, naranja, azul) sin jerarquía; naranja usado a la vez para flechas, alertas y acentos.
- Texto Light de 13–15 px con bajo contraste para un tendero que usa la app de pie y con prisa.

### Decisiones

- **Color primario verde tienda (#12813F):** asocia con plata y frescura, viene de las referencias de supermercado y diferencia a Tiendy de apps de comida. Todos los textos cumplen contraste AA.
- **Naranja** solo como acento de alerta (por agotarse, fiados vencidos, faltante en el cierre de caja). **Rojo** solo para gastos y deudas.
- **Header** verde oscuro con hoja crema redondeada (estructura de las referencias), **barra inferior** blanca con estado activo en píldora.
- **Tipografía Plus Jakarta Sans:** más legible en tamaños pequeños; sin pesos Light.
- **Íconos Lucide** (los mismos de shadcn/ui) para que diseño y código hablen igual.
- **Escala cerrada:** radios 8/12/16/20/28/full, espacios de 4 en 4, 14 estilos de texto.
- **Botones de 52 px de alto** y áreas táctiles amplias: uso con una mano en el mostrador.

---

## Color

Variables semánticas (colección "Tiendi · Tema") que apuntan a la paleta base ("Tiendi · Primitivos"). En código viven como variables CSS de Tailwind/shadcn.

> Las colecciones no son locales del archivo Tiendy: vienen de una **biblioteca publicada** aparte. Todavía se llaman "Tiendi" allá; el nombre oficial del producto es Tiendy y hay que renombrarlas en el archivo de la biblioteca.

### Fondos

| Variable | Primitivo | Hex |
|---|---|---|
| `fondo/app` | neutro/50 | `#F6F7F2` |
| `fondo/tarjeta` | neutro/0 | `#FFFFFF` |
| `fondo/sutil` | neutro/100 | `#EEF1EA` |
| `fondo/encabezado` | verde/900 | `#0B3D23` |
| `fondo/primario` | verde/600 | `#12813F` |
| `fondo/primario-suave` | verde/100 | `#D7F5E1` |
| `fondo/acento` | naranja/500 | `#F97316` |
| `fondo/acento-suave` | naranja/100 | `#FFEAD9` |
| `fondo/exito` | verde/700 | `#0E6B34` |
| `fondo/exito-suave` | verde/100 | `#D7F5E1` |
| `fondo/peligro` | rojo/600 | `#D92D20` |
| `fondo/peligro-suave` | rojo/100 | `#FDE4E1` |
| `fondo/placeholder` | neutro/300 | `#D5DACF` |

### Texto

| Variable | Primitivo | Hex |
|---|---|---|
| `texto/principal` | neutro/900 | `#13201A` |
| `texto/secundario` | neutro/600 | `#55625A` |
| `texto/sutil` | neutro/500 | `#757F78` |
| `texto/inverso` | neutro/0 | `#FFFFFF` |
| `texto/inverso-suave` | verde/200 | `#AEE9C3` |
| `texto/primario` | verde/700 | `#0E6B34` |
| `texto/acento` | naranja/600 | `#C2410C` |
| `texto/exito` | verde/700 | `#0E6B34` |
| `texto/peligro` | rojo/700 | `#B42318` |

### Bordes

| Variable | Primitivo | Hex |
|---|---|---|
| `borde/default` | neutro/200 | `#E2E6DD` |
| `borde/fuerte` | neutro/400 | `#C8CEC3` |
| `borde/foco` | verde/600 | `#12813F` |

---

## Medidas

Colección "Tiendi · Medidas" (misma biblioteca que el color). Son las variables que usan los componentes del kit.

### Espacio

| Variable | Valor |
|---|---|
| `espacio/1` | 4 |
| `espacio/2` | 8 |
| `espacio/3` | 12 |
| `espacio/4` | 16 |
| `espacio/5` | 20 |
| `espacio/6` | 24 |

### Radio

| Variable | Valor | Uso |
|---|---|---|
| `radio/sm` | 8 | Elementos pequeños |
| `radio/md` | 12 | |
| `radio/lg` | 16 | |
| `radio/xl` | 20 | |
| `radio/2xl` | 28 | Hoja de contenido que se monta sobre el Header |
| `radio/full` | 999 | Píldoras y círculos |

*`radio/sm` y `radio/2xl` se agregaron al kit el 20-10-2026 para completar la escala 8/12/16/20/28/full; todavía no existen en la biblioteca de variables de Figma.*

---

## Tipografía

Plus Jakarta Sans · 14 estilos de texto. Texto de muestra: *"Tienda Doña Rosa vendió $385.000"*.

| Estilo | Tamaño |
|---|---|
| Monto/Grande | 36 px (muestra: "$385.000") |
| Título/H1 | 26 px |
| Título/Encabezado | 24 px |
| Título/H2 | 22 px |
| Título/H3 | 20 px |
| Cuerpo/Destacado | 17 px |
| Cuerpo/Grande | 17 px |
| Botón | 17 px |
| Cuerpo/Medio fuerte | 15 px |
| Cuerpo/Medio | 15 px |
| Etiqueta/Media | 14 px |
| Cuerpo/Pequeño | 13 px |
| Leyenda | 12 px |
| Etiqueta/Pequeña | 11 px |

---

## Íconos

Set Lucide (el mismo que trae shadcn/ui → `lucide-react`). Cada ícono es un componente 24×24 con una capa "Glyph" cuyo trazo se colorea con variables de texto.

`chevron-right` · `chevron-left` · `house` · `book-open` · `hand-coins` · `package` · `user` · `users` · `banknote` · `receipt` · `mic` · `pencil` · `camera` · `smartphone` · `wallet` · `coins` · `triangle-alert` · `truck` · `map-pin` · `store` · `check` · `circle-check` · `plus` · `minus` · `x` · `search` · `funnel` · `message-square` · `clock` · `shopping-cart` · `list` · `phone` · `trending-up`

---

## Componentes

Cada componente usa solo variables del tema y estilos de texto. Nombres y propiedades pensados para su equivalente en shadcn/ui.

### Barra de estado
Tono Claro sobre el header; Oscuro sobre fondos claros.
- **Variantes:** `Tono=Claro`, `Tono=Oscuro`

### Header
Fondo verde oscuro con decoración suave. La hoja de contenido (`radio/2xl`) se monta encima. Props: Volver, Subtítulo, textos Título y Subtítulo.
- **Variantes:** `Volver=Sí, Subtítulo=Sí` · `Volver=Sí, Subtítulo=No` · `Volver=No, Subtítulo=Sí` · `Volver=No, Subtítulo=No`

### Barra inferior
Navegación principal. Variante = pestaña activa.

> **Decidido (20-10-2026): esta es la barra oficial.** Las pantallas de la v3 todavía usan otra, "Barra inferior v3" (Inicio · Fiados · Vender central · Inventario · Caja), y hay que actualizarlas en Figma para que usen este componente. Vender y Caja no tienen pestaña: se abren desde las tarjetas del Home. La pestaña `Activo=Perfil` se muestra como **"Mi tienda"**.
- **Variantes:** `Activo=Inicio` · `Activo=Cuaderno` · `Activo=Fiados` · `Activo=Inventario` · `Activo=Perfil`

### Botón
shadcn: `<Button variant="default | secondary | outline | ghost">`. Alto 52, píldora.
- **Variantes:** `Tipo=Primario` · `Tipo=Secundario` · `Tipo=Borde` · `Tipo=Texto`

### Campo de texto
shadcn: `<Input>`. Estados Vacío (placeholder), Lleno y Activo (foco).
- **Variantes:** `Estado=Vacío` · `Estado=Lleno` · `Estado=Activo`

### Chip de filtro
shadcn: `<ToggleGroupItem>` / `<Badge>`. Para filtros (Hoy, Semana, Todos…) y ventas rápidas.
- **Variantes:** `Seleccionado=Sí` · `Seleccionado=No`

### Ícono en círculo
Reemplaza las letras de v1. Props: Tono, Tamaño (M 40 / L 48) e Ícono (intercambiable).
- **Tonos:** Primario · Primario sólido · Éxito · Peligro · Acento · Acento sólido · Oscuro · Neutro
- **Tamaños:** M (40 px) · L (48 px)

### Avatar
Para personas y productos: inicial en círculo. shadcn: `<Avatar><AvatarFallback>`.
- **Tonos:** Primario · Acento · Oscuro · Neutro
- **Tamaños:** M (40 px) · L (48 px)

### Fila de lista
Movimientos, fiados, productos, opciones. Final: Flecha o Valor.
- **Variantes:** `Final=Flecha` · `Final=Valor`

### Tarjeta de monto
Totales: vendido hoy, plata en caja, total de la venta. shadcn: `<Card>`.
- **Variantes:** `Tono=Primario` · `Tono=Claro`

### Alerta
Avisos de agotado, fiados vencidos o faltante en el cierre de caja. shadcn: `<Alert>`.
- **Variantes:** `Tono=Acento` · `Tono=Peligro`

### Botón de voz
El diferenciador de Tiendy: registro por voz. Estados Reposo y Escuchando.
- **Variantes:** `Estado=Reposo` · `Estado=Escuchando`

---

## Tokens en código

Las variables CSS se llaman igual que en Figma, cambiando `/` por `-`: `fondo/primario` → `--fondo-primario`, `texto/peligro` → `--texto-peligro`, `espacio/4` → `--espacio-4`, `radio/lg` → `--radio-lg`. Las variables propias de shadcn/ui (`--primary`, `--background`, `--destructive`…) no llevan valores propios: apuntan a estas.

---

## Inventario de componentes

Qué componente usa cada patrón de las pantallas y su equivalente en código (shadcn/ui + Tailwind).

| Componente | Dónde aparece | En código |
|---|---|---|
| Barra de estado | Todas las pantallas | — (solo diseño) |
| Header | Todas las pantallas con título (volver / subtítulo) | `components/layout/AppHeader` |
| Barra inferior | Home, Cuaderno, Fiados, Inventario, Mi tienda | `components/layout/BottomNav` |
| Botón | Continuar, Registrar venta, Cerrar caja, Enviar código… | `ui/button` |
| Campo de texto | Celular, código, montos, búsquedas | `ui/input` |
| Chip de filtro | Hoy/Semana/Mes, Todos/Vencidos, categorías, ventas rápidas | `ui/toggle-group`, `ui/badge` |
| Ícono en círculo | Opciones de registro, medios de pago, movimientos | `tiendy/IconBadge` + `lucide-react` |
| Avatar | Clientes de fiados, empleados, productos | `ui/avatar` |
| Fila de lista | Movimientos, fiados, productos, proveedores | `tiendy/ListItem` |
| Tarjeta de monto | Vendido hoy, plata en caja, total de venta, resultado del cierre | `ui/card` → `tiendy/AmountCard` |
| Alerta | Producto por agotarse, fiado vencido | `ui/alert` |
| Botón de voz | Venta por voz, gasto por voz | `tiendy/VoiceButton` |
| Íconos (33) | Navegación, acciones y estados | `lucide-react` |
