# Tokens · Tiendy

Todos los valores base del diseño, con su nombre fijo. En código, cada pantalla usa estos nombres y nunca valores sueltos (hex o px).

**Fuente:** `design/tiendy-ui-kit.md` (colecciones de Figma "Tiendy · Primitivos", "Tiendy · Tema" y "Tiendy · Medidas") y las pantallas de `design/flujos/`. Lo que sale solo de las pantallas está marcado *(pantallas)*: hay que confirmarlo en Figma.

**Cómo se nombran en código:** igual que en Figma, cambiando `/` por `-` y con `--` adelante: `fondo/primario` → `--fondo-primario`, `espacio/4` → `--espacio-4`, `radio/lg` → `--radio-lg`. Las variables de shadcn/ui no llevan valores propios: apuntan a estas (ver la sección 8).

**Contenido**

1. [Colores primitivos](#1-colores-primitivos)
2. [Colores del tema](#2-colores-del-tema)
3. [Tipografía](#3-tipografía)
4. [Espaciados](#4-espaciados)
5. [Radios](#5-radios)
6. [Alturas y tamaños](#6-alturas-y-tamaños)
7. [Bordes, sombras y capas](#7-bordes-sombras-y-capas)
8. [Variables de shadcn/ui](#8-variables-de-shadcnui)
9. [Valores parecidos o duplicados](#9-valores-parecidos-o-duplicados)

---

## 1. Colores primitivos

Los valores base. **No se usan directo en las pantallas**: solo los usan los colores del tema.

| Token | En código | Valor | Dónde se usa |
|---|---|---|---|
| `neutro/0` | `--neutro-0` | `#FFFFFF` | Blanco de tarjetas y texto sobre verde |
| `neutro/50` | `--neutro-50` | `#F6F7F2` | Crema de fondo de la app |
| `neutro/100` | `--neutro-100` | `#EEF1EA` | Fondo de campos y superficies sutiles |
| `neutro/200` | `--neutro-200` | `#E2E6DD` | Bordes por defecto |
| `neutro/300` | `--neutro-300` | `#D5DACF` | Relleno de fotos vacías |
| `neutro/400` | `--neutro-400` | `#C8CEC3` | Bordes fuertes, puntos inactivos |
| `neutro/500` | `--neutro-500` | `#757F78` | Texto sutil |
| `neutro/600` | `--neutro-600` | `#55625A` | Texto secundario |
| `neutro/900` | `--neutro-900` | `#13201A` | Texto principal |
| `verde/100` | `--verde-100` | `#D7F5E1` | Fondos suaves de íconos, botón secundario, estados activos |
| `verde/200` | `--verde-200` | `#AEE9C3` | Texto suave sobre el header |
| `verde/600` | `--verde-600` | `#12813F` | Verde de marca |
| `verde/700` | `--verde-700` | `#0E6B34` | Verde para texto y enlaces |
| `verde/900` | `--verde-900` | `#0B3D23` | Verde oscuro del header |
| `naranja/100` | `--naranja-100` | `#FFEAD9` | Solo advertencias leves (fondo) |
| `naranja/500` | `--naranja-500` | `#F97316` | Solo advertencias leves (sólido) |
| `naranja/600` | `--naranja-600` | `#C2410C` | Solo advertencias leves (texto) |
| `rojo/100` | `--rojo-100` | `#FDE4E1` | Solo problemas (fondo) |
| `rojo/600` | `--rojo-600` | `#D92D20` | Solo problemas (sólido) |
| `rojo/700` | `--rojo-700` | `#B42318` | Solo problemas (texto) |

## 2. Colores del tema

Los que se usan al construir. El nombre dice para qué sirven. **Regla del color:** el verde es la marca y la acción; el naranja y el rojo solo avisan de algo (naranja: advertencia leve; rojo: un problema que ya pasó). Un gasto no es un error: va en neutro.

### Fondos

| Token | En código | Apunta a | Valor | Dónde se usa |
|---|---|---|---|---|
| `fondo/app` | `--fondo-app` | neutro/50 | `#F6F7F2` | Fondo de todas las pantallas y de la hoja que sube sobre el header |
| `fondo/tarjeta` | `--fondo-tarjeta` | neutro/0 | `#FFFFFF` | Tarjetas, filas de lista, chips sin elegir, barra inferior |
| `fondo/sutil` | `--fondo-sutil` | neutro/100 | `#EEF1EA` | Campos de texto, teclas, íconos en tono Neutro, botón deshabilitado |
| `fondo/encabezado` | `--fondo-encabezado` | verde/900 | `#0B3D23` | Header y tarjeta oscura de "Vendido hoy" |
| `fondo/primario` | `--fondo-primario` | verde/600 | `#12813F` | Botón primario, chip elegido, botón Vender, barras de la gráfica |
| `fondo/primario-suave` | `--fondo-primario-suave` | verde/100 | `#D7F5E1` | Botón secundario, fondo de íconos y avatares, pestaña activa, alerta de éxito |
| `fondo/exito` | `--fondo-exito` | verde/700 | `#0E6B34` | Check sólido de las pantallas de éxito (19, 32) |
| `fondo/exito-suave` | `--fondo-exito-suave` | verde/100 | `#D7F5E1` | Área del check en pantallas de éxito, tarjeta "Ganancia del día" (19) |
| `fondo/advertencia` | `--fondo-advertencia` | naranja/500 | `#F97316` | **Solo** ícono de la alerta de advertencia (producto por agotarse) |
| `fondo/advertencia-suave` | `--fondo-advertencia-suave` | naranja/100 | `#FFEAD9` | **Solo** fondo de una alerta de advertencia |
| `fondo/peligro` | `--fondo-peligro` | rojo/600 | `#D92D20` | **Solo** problemas reales: faltante, agotado crítico |
| `fondo/peligro-suave` | `--fondo-peligro-suave` | rojo/100 | `#FDE4E1` | **Solo** fondo de alerta de peligro y de la diferencia de caja negativa |
| `fondo/placeholder` | `--fondo-placeholder` | neutro/300 | `#D5DACF` | Relleno de fotos todavía vacías |

### Textos

| Token | En código | Apunta a | Valor | Dónde se usa |
|---|---|---|---|---|
| `texto/principal` | `--texto-principal` | neutro/900 | `#13201A` | Títulos, montos y cuerpo; montos de gastos |
| `texto/secundario` | `--texto-secundario` | neutro/600 | `#55625A` | Detalles de filas, títulos de sección, ayudas, barra inferior |
| `texto/sutil` | `--texto-sutil` | neutro/500 | `#757F78` | **Solo** placeholders y legales no necesarios (no cumple contraste en texto pequeño) |
| `texto/inverso` | `--texto-inverso` | neutro/0 | `#FFFFFF` | Texto e íconos sobre verde, header y rojo |
| `texto/inverso-suave` | `--texto-inverso-suave` | verde/200 | `#AEE9C3` | Subtítulo del header ("Paso 1 de 3", "Abierta 7:02 a.m.") |
| `texto/primario` | `--texto-primario` | verde/700 | `#0E6B34` | Enlaces, acciones de texto, plata que entra (+$), "Vueltas" |
| `texto/advertencia` | `--texto-advertencia` | naranja/600 | `#C2410C` | **Solo** advertencia leve ("Quedan 6") |
| `texto/exito` | `--texto-exito` | verde/700 | `#0E6B34` | Confirmaciones en texto ("Caja cuadró") |
| `texto/peligro` | `--texto-peligro` | rojo/700 | `#B42318` | **Solo** problemas: "Faltan $5.000", "Vencido hace 5 días", "Quedan 2", "−$5.000" |

### Bordes

| Token | En código | Apunta a | Valor | Dónde se usa |
|---|---|---|---|---|
| `borde/default` | `--borde-default` | neutro/200 | `#E2E6DD` | Chips sin elegir, separadores, borde superior de la barra inferior |
| `borde/fuerte` | `--borde-fuerte` | neutro/400 | `#C8CEC3` | Casillas sin marcar, campos deshabilitados, puntos inactivos del splash |
| `borde/foco` | `--borde-foco` | verde/600 | `#12813F` | Campo activo, opción elegida o recomendada, anillo de foco |

## 3. Tipografía

**Familia:** Plus Jakarta Sans (Google Fonts), en pesos 400 a 800. En código: `--fuente-base: "Plus Jakarta Sans", system-ui, sans-serif` (cargada con `next/font/google`).

**Pesos**

| Token | En código | Valor | Dónde se usa |
|---|---|---|---|
| `peso/regular` | `--peso-regular` | 400 | `cuerpo` |
| `peso/medium` | `--peso-medium` | 500 | `secundario`, `caption` |
| `peso/semibold` | `--peso-semibold` | 600 | `cuerpo-fuerte`, `chip` |
| `peso/bold` | `--peso-bold` | 700 | Títulos, montos medianos, `valor`, `boton` |
| `peso/extrabold` | `--peso-extrabold` | 800 | `display`, `monto-xl` |

No se usan pesos Light (300) ni textos de menos de 12px.

**Estilos de texto**

| Token | En código | Tamaño / interlineado | Peso | Espaciado entre letras | Ejemplo | Dónde se usa |
|---|---|---|---|---|---|---|
| `display` | `--texto-display` | 48 / 59 | 800 | −2 % | Tiendy | Solo el nombre en el splash (01) |
| `monto-xl` | `--texto-monto-xl` | 34 / 40 | 800 | −1 % | $385.000 | Monto protagonista: Vendido hoy, Base del día, Total de la venta |
| `titulo-1` | `--texto-titulo-1` | 26 / 31 | 700 | 0 | ¿Cuál es tu número? | Pregunta o título del contenido |
| `titulo-2` | `--texto-titulo-2` | 24 / 30 | 700 | 0 | Vender | Tarjetas grandes del Home, título de la hoja "Nueva venta" |
| `monto-m` | `--texto-monto-m` | 22 / 28 | 700 | 0 | $62.000 | Montos en dos columnas (17, 19, 33) y título del header |
| `valor` | `--texto-valor` | 18 / 25 | 700 | 0 | $11.500 | Totales dentro de una tarjeta, valor a la derecha de una fila |
| `cuerpo-fuerte` | `--texto-cuerpo-fuerte` | 16 / 22 | 600 | 0 | Se está acabando la leche | Título de fila y de alerta, etiqueta de campo |
| `boton` | `--texto-boton` | 16 / 22 | 700 | 0 | Anotar venta · $11.500 | Texto de todos los botones |
| `cuerpo` | `--texto-cuerpo` | 15 / 21 | 400 | 0 | Anota ventas y gastos… | Párrafos y valores de filas |
| `chip` | `--texto-chip` | 14 / 20 | 600 | 0 | Quincena | Chips y opciones rápidas |
| `secundario` | `--texto-secundario-estilo` | 13 / 18 | 500 | 0 | Quedan 2 · ver sugerencia de compra | Detalles, ayudas, títulos de sección, subtítulo del header |
| `caption` | `--texto-caption` | 12 / 16 | 500 | 0 | Al continuar aceptas los Términos | Legales y etiquetas de la barra inferior |

> En código, cada estilo se arma con tres variables: `--texto-monto-xl-tamano`, `--texto-monto-xl-alto` y `--texto-monto-xl-peso`, y en Tailwind se expone como una clase (`text-monto-xl`). El estilo `secundario` choca con el color `texto/secundario`; por eso su variable lleva `-estilo` (ver la sección 9).

## 4. Espaciados

| Token | En código | Valor | Dónde se usa |
|---|---|---|---|
| `espacio/1` | `--espacio-1` | 4px | Entre un título y su detalle |
| `espacio/2` | `--espacio-2` | 8px | Entre chips y entre filas de chips |
| `espacio/3` | `--espacio-3` | 12px | Entre ícono y texto en una fila; entre tarjetas de dos columnas; entre filas de una lista |
| `espacio/4` | `--espacio-4` | 16px | Relleno de tarjetas y entre bloques del contenido |
| `espacio/5` | `--espacio-5` | 20px | Relleno de tarjetas grandes (Vender, Vendido hoy) |
| `espacio/6` | `--espacio-6` | 24px | Separación entre secciones |
| `espacio/margen-pantalla` | `--espacio-margen-pantalla` | 28px | Margen izquierdo y derecho del contenido (393px → 337px útiles) |
| `espacio/solape-hoja` *(propuesto)* | `--espacio-solape-hoja` | 40px | Cuánto sube la hoja crema sobre el header (UI kit §6: "el contenido empieza 40px antes del final del header") |

**Valores que salen de las pantallas y no están en la escala** (por decidir, ver la sección 9):

| Valor | Dónde | Propuesta |
|---|---|---|
| 14px | Relleno de la Tarjeta de monto compacta (dos columnas en 17 y 19) | Usar `espacio/3` (12) o `espacio/4` (16), o agregar `espacio/3-5` |
| 20px *(pantallas)* | Margen de la hoja inferior (20, 21, 09a) | Es distinto al margen de pantalla (28px): ¿agregar `espacio/margen-hoja`? |

## 5. Radios

| Token | En código | Valor | Dónde se usa |
|---|---|---|---|
| `radio/sm` | `--radio-sm` | 8px | Casillas de verificación (13, 47), barras de la gráfica (42) |
| `radio/md` | `--radio-md` | 12px | Campos de texto, teclas del teclado, casillas del código (04) |
| `radio/lg` | `--radio-lg` | 16px | Tarjetas, filas de lista, alertas |
| `radio/xl` | `--radio-xl` | 20px | Tarjetas grandes del Home, áreas de cámara (12, 30) |
| `radio/2xl` | `--radio-2xl` | 28px | Esquinas superiores de la hoja sobre el header y de las hojas inferiores |
| `radio/full` | `--radio-full` | 999px | Botones, chips, íconos en círculo, avatares |

## 6. Alturas y tamaños

### Alturas táctiles (colección "Tiendy · Medidas")

| Token | En código | Valor | Dónde se usa |
|---|---|---|---|
| `alto/boton` | `--alto-boton` | 52px | Todos los botones |
| `alto/campo` | `--alto-campo` | 52px | Campos de texto |
| `alto/tecla` | `--alto-tecla` | 46px | Teclas del teclado numérico (16, 29), todas iguales, incluida Borrar |
| `alto/chip` | `--alto-chip` | 36px | Chips de filtro |

### Tamaños de componentes

Están escritos en el UI kit dentro de cada componente, pero **no son variables de Figma**. Se proponen como tokens para no escribir px sueltos en código.

| Token propuesto | En código | Valor | Dónde se usa |
|---|---|---|---|
| `alto/header` | `--alto-header` | 170px | Header sin subtítulo |
| `alto/header-subtitulo` | `--alto-header-subtitulo` | 200px | Header con subtítulo |
| `alto/barra-estado` | `--alto-barra-estado` | 44px | Barra de estado (solo diseño; en código es el área segura del celular) |
| `alto/grafica` | `--alto-grafica` | 96px | Alto de las barras de "Ventas de los últimos 7 días" (42), medido en la pantalla |
| `tamano/boton-volver` | `--tamano-boton-volver` | 36px | Círculo de volver del header |
| `tamano/boton-vender` | `--tamano-boton-vender` | 56px | Círculo central "Vender" de la barra inferior |
| `tamano/icono-circulo-m` | `--tamano-icono-circulo-m` | 40px | Ícono en círculo M (filas) |
| `tamano/icono-circulo-l` | `--tamano-icono-circulo-l` | 48px | Ícono en círculo L (opciones grandes) |
| `tamano/avatar-m` | `--tamano-avatar-m` | 40px | Avatar en listas |
| `tamano/avatar-l` | `--tamano-avatar-l` | 64px | Avatar de "¿Quién atiende?" (16a) |
| `tamano/voz` | `--tamano-voz` | 112px | Botón de voz en reposo |
| `tamano/voz-halo` | `--tamano-voz-halo` | 160px | Halo del botón de voz escuchando |
| `tamano/casilla-codigo` | `--tamano-casilla-codigo` | 48px | Casillas del código de verificación (04) |
| `tamano/pantalla` | `--tamano-pantalla` | 393px | Ancho del lienzo de diseño (iPhone 15); en código, ancho máximo del contenido |

### Íconos (Lucide)

| Token propuesto | En código | Valor | Dónde se usa |
|---|---|---|---|
| `icono/sm` | `--icono-sm` | 20px | Filas, botones e Ícono en círculo M |
| `icono/md` | `--icono-md` | 24px | Opciones grandes, Ícono en círculo L |
| `icono/lg` | `--icono-lg` | 28px | Dentro de las tarjetas grandes del Home |
| `icono/xl` | `--icono-xl` | 48px | Botón de voz |
| `icono/trazo` | `--icono-trazo` | 2px | Grosor del trazo de todos los íconos |

## 7. Bordes, sombras y capas

### Grosores de borde

| Token propuesto | En código | Valor | Dónde se usa |
|---|---|---|---|
| `borde/ancho-default` | `--borde-ancho-default` | 1px | Chips sin elegir, separadores, campos deshabilitados |
| `borde/ancho-boton` | `--borde-ancho-boton` | 1.5px | Botón de tipo Borde ("Cambiar mi número", "Revisar movimientos") |
| `borde/ancho-foco` | `--borde-ancho-foco` | 2px | Campo activo, opción elegida o recomendada |

### Sombras

| Token | En código | Valor | Dónde se usa |
|---|---|---|---|
| `sombra/ninguna` | `--sombra-ninguna` | `none` | **Regla del kit:** "Superficies planas: las tarjetas blancas se separan del fondo crema por color, sin sombras." |
| `sombra/tarjeta` *(pantallas, por decidir)* | `--sombra-tarjeta` | Sin medir | Varias pantallas muestran una sombra suave debajo de las tarjetas blancas (16, 18, 29, 31, 42, 44, 47). Contradice la regla del kit (ver la sección 9). |
| `sombra/hoja` *(pantallas, por decidir)* | `--sombra-hoja` | Sin medir | Hoja inferior (20, 21, 09a) y aviso "Venta anotada" (22). |

### Capas

| Token propuesto | En código | Valor | Dónde se usa |
|---|---|---|---|
| `fondo/velo` *(pantallas)* | `--fondo-velo` | `fondo/encabezado` al 80 % (propuesto en código, por medir en Figma) | Home oscurecido detrás de las hojas inferiores (09a, 21). La auditoría pide usarlo también en 20 y 20a. |
| `fondo/aviso` *(pantallas)* | `--fondo-aviso` | `neutro/900` (propuesto en código, por medir en Figma) | Fondo del aviso "Venta anotada · Deshacer" (22). No tiene token en el kit. |

## 8. Variables de shadcn/ui

shadcn/ui trae sus propias variables. En Tiendy no llevan valores: apuntan a los tokens de arriba.

| Variable de shadcn | Apunta a |
|---|---|
| `--background` | `--fondo-app` |
| `--foreground` | `--texto-principal` |
| `--card` / `--popover` | `--fondo-tarjeta` |
| `--card-foreground` / `--popover-foreground` | `--texto-principal` |
| `--primary` | `--fondo-primario` |
| `--primary-foreground` | `--texto-inverso` |
| `--secondary` | `--fondo-primario-suave` |
| `--secondary-foreground` | `--texto-primario` |
| `--muted` | `--fondo-sutil` |
| `--muted-foreground` | `--texto-secundario` |
| `--accent` | `--fondo-primario-suave` |
| `--accent-foreground` | `--texto-primario` |
| `--destructive` | `--fondo-peligro` (solo para avisos; el kit prohíbe botones rojos) |
| `--border` | `--borde-default` |
| `--input` | `--fondo-sutil` |
| `--ring` | `--borde-foco` |
| `--radius` | `--radio-lg` |
| `--chart-1` | `--fondo-primario` |
| `--chart-2` | `--fondo-encabezado` |

## 9. Valores parecidos o duplicados

No se unificó nada. Cada punto necesita una decisión.

| # | Qué pasa | Tokens | Recomendación |
|---|---|---|---|
| 1 | **Mismo valor, distinto significado.** `fondo/primario-suave` y `fondo/exito-suave` son los dos `verde/100` (#D7F5E1). | fondo/primario-suave · fondo/exito-suave | Mantener los dos: si un día el éxito cambia de color, solo se toca uno. |
| 2 | **Mismo valor, tres usos.** `texto/primario`, `texto/exito` y `fondo/exito` son los tres `verde/700` (#0E6B34). | texto/primario · texto/exito · fondo/exito | Mantenerlos, por la misma razón. |
| 3 | **Mismo valor.** `fondo/primario` y `borde/foco` son `verde/600` (#12813F). | fondo/primario · borde/foco | Mantenerlos. |
| 4 | **Misma altura.** `alto/boton` y `alto/campo` valen 52px. | alto/boton · alto/campo | Podrían ser un solo `alto/control`; mantenerlos es más claro. |
| 5 | **Mismo tamaño, otro peso.** `cuerpo-fuerte` (600) y `boton` (700) son 16/22. | cuerpo-fuerte · boton | Mantenerlos: el peso es parte del estilo. |
| 6 | **El kit se contradice.** La Fila de lista dice "título (`cuerpo-fuerte` 15px)", pero `cuerpo-fuerte` es de 16px. | cuerpo-fuerte · cuerpo | Decidir si el título de fila es 15 o 16 y corregir el kit. |
| 7 | **Tamaños muy cercanos.** `monto-m` 22, `titulo-2` 24 y `titulo-1` 26; `secundario` 13 y `caption` 12. | monto-m · titulo-2 · titulo-1 · secundario · caption | Revisar si hacen falta los cinco; se dejan como están. |
| 8 | **Relleno fuera de escala.** La Tarjeta de monto compacta usa 14px. | (sin token) | Usar 12 o 16 de la escala. |
| 9 | **Casillas del código distintas.** La activa mide 52px y las demás 48px (04). | tamano/casilla-codigo | Dejar todas en 48 (auditoría). |
| 10 | **Sombras.** El kit dice que no hay sombras, pero varias pantallas las tienen. | sombra/tarjeta · sombra/hoja | Decidir: quitarlas de Figma (cumplir el kit) o medirlas y agregarlas al kit. |
| 11 | **Mismo número, sin relación.** `espacio/margen-pantalla` y `radio/2xl` valen 28px. | espacio/margen-pantalla · radio/2xl | No unificar: es coincidencia. |
| 12 | **El kit viejo usaba otros nombres y tamaños.** La versión anterior (`Tiendy_UI_kit.md`) tenía `fondo/acento` y `texto/acento` (hoy `advertencia`), colecciones "Tiendi", Avatar L de 48px (hoy 64), y otra escala de texto (36, 17, 11px). La auditoría dice que hay que confirmar que las pantallas de Figma tomen los nombres nuevos. | fondo/advertencia · texto/advertencia · tamano/avatar-l · estilos de texto | Verificar en Figma (auditoría, "Pendiente de verificar en Figma"). |
| 13 | **Nombre que choca.** El estilo de texto `secundario` y el color `texto/secundario` darían la misma variable `--texto-secundario`. | secundario · texto/secundario | Se usa `--texto-secundario-estilo` para el estilo. Otra opción: renombrar el estilo en Figma. |
| 14 | **Tokens que el kit no tiene.** Velo de las hojas, fondo del aviso "Deshacer", grosores de borde y tamaños de componentes. | Secciones 6 y 7 | Agregarlos primero al kit (CLAUDE.md §5) y luego a código. |
