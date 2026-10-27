# Tiendy · UI Kit

> Tu tienda en orden, sin cuaderno.

Tiendy es la app para que el tendero de barrio lleve ventas, gastos, fiados, caja e inventario sin cuaderno. Se usa de pie, con una mano, en el mostrador y con prisa. Todo en este kit sirve a eso: textos grandes y claros, áreas fáciles de tocar y muy pocos colores, cada uno con un significado.

**Contenido**

1. [La regla del color](#1-la-regla-del-color)
2. [Colores](#2-colores)
3. [Tipografía](#3-tipografía)
4. [Medidas](#4-medidas)
5. [Voz y textos](#5-voz-y-textos)
6. [Pantalla y estructura](#6-pantalla-y-estructura)
7. [Componentes](#7-componentes)
8. [Íconos](#8-íconos)
9. [Contraste](#9-contraste)

---

## 1. La regla del color

El verde es la marca y la acción. El rojo y el naranja **solo** avisan de algo. Si nada está mal, en la pantalla no hay rojo ni naranja.

| Color | Variables | Se usa para | Nunca para |
|---|---|---|---|
| **Verde** | `fondo/primario`, `fondo/primario-suave`, `texto/primario`, `fondo/encabezado` | Header, botones, chip seleccionado, enlaces, íconos de acciones, avatares, plata que entra (+$) | Avisar de un problema |
| **Neutro** | `texto/principal`, `texto/secundario`, `fondo/tarjeta`, `fondo/sutil` | Gastos, fiados, deudas, saldos, títulos de sección, textos de apoyo | — |
| **Naranja** | `fondo/advertencia`, `fondo/advertencia-suave`, `texto/advertencia` | Advertencia leve que pide atención pronto: "Se está acabando la leche", "Quedan 6" | Enlaces, avatares, íconos de mercancía o fotos, montos de fiado, títulos |
| **Rojo** | `fondo/peligro`, `fondo/peligro-suave`, `texto/peligro` | Un problema que ya pasó: "Faltan $5.000", diferencia de caja "−$5.000", "Vencido hace 5 días", "Quedan 2" (crítico) | Gastos, "Quedé debiendo", el ícono de Registrar gasto, botones de eliminar |

**Prueba rápida** antes de pintar algo de rojo o naranja: ¿la persona tiene que hacer algo distinto por esto? Si no, va en verde o neutro.

- Un gasto es parte normal del día: su monto va en `texto/principal` con signo "−", y su ícono en tono Primario o Neutro.
- Un fiado es plata que te deben, no un error: monto en `texto/principal`. Solo el fiado **vencido** se marca en `texto/peligro`.
- Cada aviso lleva palabras además del color ("Vencido", "Faltan", "Quedan 2"), para quien no distingue bien los colores.
- Como máximo una Alerta por pantalla.

---

## 2. Colores

### Primitivos — colección "Tiendy · Primitivos"

Los valores base. No se usan directo en las pantallas: los usa el Tema.

| Variable | Hex | Uso |
|---|---|---|
| `neutro/0` | `#FFFFFF` | Blanco de tarjetas y texto sobre verde |
| `neutro/50` | `#F6F7F2` | Crema de fondo de la app |
| `neutro/100` | `#EEF1EA` | Fondo de campos y superficies sutiles |
| `neutro/200` | `#E2E6DD` | Bordes por defecto |
| `neutro/300` | `#D5DACF` | Relleno de imágenes vacías |
| `neutro/400` | `#C8CEC3` | Bordes fuertes, puntos inactivos |
| `neutro/500` | `#757F78` | Texto sutil |
| `neutro/600` | `#55625A` | Texto secundario |
| `neutro/900` | `#13201A` | Texto principal |
| `verde/100` | `#D7F5E1` | Fondos suaves de íconos, botón secundario, estados activos |
| `verde/200` | `#AEE9C3` | Texto suave sobre el header |
| `verde/600` | `#12813F` | Verde de marca |
| `verde/700` | `#0E6B34` | Verde para texto y enlaces |
| `verde/900` | `#0B3D23` | Verde oscuro del header |
| `naranja/100` | `#FFEAD9` | Solo advertencias leves (fondo) |
| `naranja/500` | `#F97316` | Solo advertencias leves (sólido) |
| `naranja/600` | `#C2410C` | Solo advertencias leves (texto) |
| `rojo/100` | `#FDE4E1` | Solo problemas (fondo) |
| `rojo/600` | `#D92D20` | Solo problemas (sólido) |
| `rojo/700` | `#B42318` | Solo problemas (texto) |

### Tema — colección "Tiendy · Tema"

Los colores que se usan al diseñar. El nombre dice para qué sirven.

**Fondos**

| Variable | Primitivo | Hex | Uso |
|---|---|---|---|
| `fondo/app` | neutro/50 | `#F6F7F2` | Fondo de todas las pantallas y de la hoja que sube sobre el header |
| `fondo/tarjeta` | neutro/0 | `#FFFFFF` | Tarjetas, filas de lista, chips sin seleccionar, barra inferior |
| `fondo/sutil` | neutro/100 | `#EEF1EA` | Campos de texto, teclas del teclado, íconos en tono Neutro |
| `fondo/encabezado` | verde/900 | `#0B3D23` | Header de cada pantalla y tarjeta de resumen oscura |
| `fondo/primario` | verde/600 | `#12813F` | Botón primario, chip seleccionado, botón Vender, barras de gráfica |
| `fondo/primario-suave` | verde/100 | `#D7F5E1` | Botón secundario, fondo de íconos y avatares, pestaña activa, alerta de éxito |
| `fondo/exito` | verde/700 | `#0E6B34` | Confirmaciones sólidas (check de turno cerrado) |
| `fondo/exito-suave` | verde/100 | `#D7F5E1` | Área de confirmación en pantallas de éxito |
| `fondo/advertencia` | naranja/500 | `#F97316` | **Solo** advertencia leve: producto por agotarse |
| `fondo/advertencia-suave` | naranja/100 | `#FFEAD9` | **Solo** fondo de una Alerta de advertencia |
| `fondo/peligro` | rojo/600 | `#D92D20` | **Solo** problemas reales: faltante de caja, fiado vencido, agotado crítico |
| `fondo/peligro-suave` | rojo/100 | `#FDE4E1` | **Solo** fondo de una Alerta de peligro o de la diferencia de caja negativa |
| `fondo/placeholder` | neutro/300 | `#D5DACF` | Relleno de fotos todavía vacías |

**Textos**

| Variable | Primitivo | Hex | Uso |
|---|---|---|---|
| `texto/principal` | neutro/900 | `#13201A` | Títulos, montos y texto de cuerpo |
| `texto/secundario` | neutro/600 | `#55625A` | Detalles de filas, títulos de sección, ayudas, barra inferior |
| `texto/sutil` | neutro/500 | `#757F78` | Placeholders y textos legales (ver [Contraste](#9-contraste)) |
| `texto/inverso` | neutro/0 | `#FFFFFF` | Texto e íconos sobre verde, header y rojo |
| `texto/inverso-suave` | verde/200 | `#AEE9C3` | Subtítulos del header |
| `texto/primario` | verde/700 | `#0E6B34` | Enlaces, acciones de texto, montos de entrada (+$) |
| `texto/advertencia` | naranja/600 | `#C2410C` | **Solo** texto de advertencia leve ("Quedan 6") |
| `texto/exito` | verde/700 | `#0E6B34` | Confirmaciones en texto ("Pago de fiado", "Caja cuadró") |
| `texto/peligro` | rojo/700 | `#B42318` | **Solo** texto de problemas: "Faltan $5.000", "Vencido hace 5 días", "Quedan 2" |

**Bordes**

| Variable | Primitivo | Hex | Uso |
|---|---|---|---|
| `borde/default` | neutro/200 | `#E2E6DD` | Chips sin seleccionar, separadores, borde superior de la barra inferior |
| `borde/fuerte` | neutro/400 | `#C8CEC3` | Casillas sin marcar, campos deshabilitados |
| `borde/foco` | verde/600 | `#12813F` | Campo activo, opción elegida y anillo de foco |

---

## 3. Tipografía

Una sola familia: **Plus Jakarta Sans** (Google Fonts, ya viene en Figma), en pesos 400 a 800. No uses pesos Light ni textos de menos de 12px.

| Estilo | Tamaño / interlineado | Peso | Ejemplo | Uso |
|---|---|---|---|---|
| `display` | 48 / 59 | ExtraBold (800) | Tiendy | Solo el nombre en el splash |
| `monto-xl` | 34 / 40 | ExtraBold (800) | $385.000 | Monto protagonista de la pantalla |
| `titulo-1` | 26 / 31 | Bold (700) | ¿Cuál es tu número? | Pregunta o título del contenido |
| `titulo-2` | 24 / 30 | Bold (700) | Vender | Botones grandes del Home |
| `monto-m` | 22 / 28 | Bold (700) | $62.000 | Montos en dos columnas y título del header |
| `valor` | 18 / 25 | Bold (700) | $11.500 | Totales dentro de una tarjeta |
| `cuerpo-fuerte` | 16 / 22 | SemiBold (600) | Se está acabando la leche | Título de fila, de alerta y etiqueta de campo |
| `boton` | 16 / 22 | Bold (700) | Anotar venta · $11.500 | Texto de todos los botones |
| `cuerpo` | 15 / 21 | Regular (400) | Anota ventas, gastos y fiados… | Párrafos y valores de filas |
| `chip` | 14 / 20 | SemiBold (600) | Quincena | Chips y opciones rápidas |
| `secundario` | 13 / 18 | Medium (500) | Quedan 2 · ver sugerencia de compra | Detalles, ayudas, títulos de sección |
| `caption` | 12 / 16 | Medium (500) | Al continuar aceptas los Términos | Textos legales y barra inferior |

> `display` y `monto-xl` llevan un espaciado entre letras ligeramente negativo (−2 % y −1 %).

---

## 4. Medidas

Colección "Tiendy · Medidas".

**Espacios**

| Variable | Valor | Uso |
|---|---|---|
| `espacio/1` | 4px | Entre un título y su detalle |
| `espacio/2` | 8px | Entre chips y entre filas de chips |
| `espacio/3` | 12px | Entre ícono y texto en una fila; entre tarjetas de dos columnas |
| `espacio/4` | 16px | Relleno de tarjetas y entre bloques del contenido |
| `espacio/5` | 20px | Relleno de tarjetas grandes (Vender, Vendido hoy) |
| `espacio/6` | 24px | Separación entre secciones |
| `espacio/margen-pantalla` | 28px | Margen izquierdo y derecho del contenido (393px → 337px útiles) |

**Radios**

| Variable | Valor | Uso |
|---|---|---|
| `radio/sm` | 8px | Casillas de verificación, barras de gráfica |
| `radio/md` | 12px | Campos de texto, teclas, casillas del código |
| `radio/lg` | 16px | Tarjetas, filas de lista, alertas |
| `radio/xl` | 20px | Tarjetas grandes del Home, áreas de cámara |
| `radio/2xl` | 28px | Esquinas superiores de la hoja sobre el header y de las hojas inferiores |
| `radio/full` | 999px | Botones, chips, íconos en círculo, avatares |

**Alturas** (para que todo sea fácil de tocar con una mano)

| Variable | Valor | Uso |
|---|---|---|
| `alto/boton` | 52px | Todos los botones |
| `alto/campo` | 52px | Campos de texto |
| `alto/tecla` | 46px | Teclas del teclado numérico (todas iguales, incluida Borrar) |
| `alto/chip` | 36px | Chips de filtro |

---

## 5. Voz y textos

- Tutea y habla como en la tienda: "plata", "fiado", "Doña Rosa", "¿A quién le fías?", "Pon la base para empezar el día".
- Frases cortas, con mayúscula solo al inicio: "Registrar gasto", no "Registrar Gasto".
- Si la pantalla pide un dato, el título es una pregunta: "¿Cuál es tu número?", "¿Cuánto efectivo contaste?".
- Los botones dicen verbo + objeto, con el monto cuando ayuda: "Anotar venta · $11.500", "Confirmar 3 productos".
- Plata con signo pesos, punto de miles y sin decimales: "$385.000". Salidas con "−$184.000", entradas con "+$20.000".
- Fechas y horas como se dicen: "Hoy, martes 23", "10:24 a.m.", "Lunes 22 sep.".
- Separa datos con " · ": "Lácteos · $3.900".
- Sin emoji y sin signos de exclamación, salvo en una celebración real ("¡Don Carlos quedó a paz y salvo!").

---

## 6. Pantalla y estructura

- Lienzo de **393 × 852** (iPhone 15), con `espacio/margen-pantalla` (28px) a cada lado.
- Cada pantalla empieza con el **Header** (`fondo/encabezado`). Encima sube la hoja `fondo/app` con esquinas `radio/2xl`; el contenido empieza 40px antes del final del header.
- La acción principal va abajo, en un **Botón Primario** a ancho completo. Solo una por pantalla.
- Las pantallas principales de cada sección llevan la **Barra inferior** (Inicio, Fiados, Vender, Inventario, Caja). Los flujos paso a paso no la llevan.
- Entre bloques usa `espacio/4`; dentro de una tarjeta, relleno `espacio/4` o `espacio/5`; entre filas de una lista, `espacio/3`.
- Nada importante debe quedar tapado por la barra inferior: deja al final un espacio igual a su alto.
- Superficies planas: las tarjetas blancas se separan del fondo crema por color, sin sombras.
- La opción elegida o recomendada lleva un borde de 2px en `borde/foco`.

---

## 7. Componentes

### Barra de estado

Hora, señal y batería en la parte superior de cada pantalla (solo diseño). 44px de alto. El Header ya la trae adentro.

| Propiedad | Valores |
|---|---|
| Tono | **Claro** (contenido blanco, sobre `fondo/encabezado`) · **Oscuro** (contenido `texto/principal`, sobre pantallas sin header) |

No la tapes con contenido ni le pongas fondo propio.

### Header

Encabezado verde oscuro con título centrado y la hoja crema que sube encima.

| Propiedad | Valores |
|---|---|
| Volver | Sí · No |
| Subtítulo | Sí · No |

- **Medidas:** 170px sin subtítulo, 200px con subtítulo.
- **Título:** corto, 1–3 palabras ("Abrir caja", "Fiados"), en `texto/inverso`, estilo `monto-m`.
- **Subtítulo:** contexto ("Paso 1 de 3", "Turno de Doña Rosa · desde 7:02 a.m."), en `texto/inverso-suave`, estilo `secundario`.
- **Botón volver:** círculo de 36px en `fondo/primario` con el ícono `chevron-left`.
- En el Home lleva el saludo ("Hola, Doña Rosa") y no tiene botón volver.
- **No** pongas acciones, montos ni colores de alerta en el header.

### Barra inferior

Navegación principal: **Inicio · Fiados · Vender · Inventario · Caja**.

| Propiedad | Valores |
|---|---|
| Activo | Inicio · Fiados · Inventario · Caja |

- La pestaña activa lleva una pastilla `fondo/primario-suave` con ícono y texto en `texto/primario`; las demás van en `texto/secundario`.
- Vender siempre es el círculo `fondo/primario` de 56px que sobresale: es la acción más usada.
- Va en las pantallas principales de cada sección (Home, Caja del día, Mi cuaderno, Fiados, Inventario y sus detalles).
- **No** uses las pestañas viejas "Cuaderno" y "Perfil": Mi cuaderno se abre desde Caja y Mi tienda desde el Home.

### Botón

Pastilla de 52px (`alto/boton`, `radio/full`) con texto en estilo `boton`.

| Tipo | Aspecto | Cuándo |
|---|---|---|
| **Primario** | `fondo/primario` + `texto/inverso` | La acción principal. Una por pantalla, abajo, a ancho completo |
| **Secundario** | `fondo/primario-suave` + `texto/primario` | Una segunda acción que también avanza ("Llamarme con el código", "Guardar y agregar otro") |
| **Borde** | Borde 1.5px `fondo/primario` + `texto/primario` | Una alternativa que no avanza ("Cambiar mi número", "Revisar movimientos") |
| **Texto** | Solo `texto/primario` | Acciones de poco peso ("Eliminar registro", "Cancelar") |
| *Deshabilitado* | `fondo/sutil` + `texto/secundario` | Cuando falta un dato para continuar |

**No** hagas botones rojos ni naranjas, ni siquiera para eliminar: la confirmación explica la consecuencia ("Si eliminas esta venta, los productos vuelven al inventario").

### Campo de texto

Campo de 52px (`alto/campo`) con fondo `fondo/sutil` y `radio/md`.

| Estado | Aspecto |
|---|---|
| **Vacío** | Placeholder en `texto/sutil` |
| **Lleno** | Valor en `texto/principal` |
| **Activo** | Fondo `fondo/tarjeta` + borde de 2px `borde/foco` |

- Etiqueta arriba en `cuerpo-fuerte`, ayuda debajo en `secundario`, ícono opcional a la izquierda (búsquedas).
- Montos con el formato de la app: "$3.200".
- En un buscador, acciones como "Filtros" o "+ Agregar" van como botón aparte, no dentro del texto.
- Nunca pongas información necesaria solo en el placeholder.

### Chip de filtro

Pastilla de 36px (`alto/chip`) para opciones cortas: periodos, categorías, medios de pago, montos rápidos.

| Seleccionado | Aspecto |
|---|---|
| **No** | `fondo/tarjeta` + borde `borde/default` + `texto/principal` |
| **Sí** | `fondo/primario` + `texto/inverso` |

- En filas que envuelven, con `espacio/2` entre chips.
- Para una sola respuesta (¿cuándo te paga?) solo uno queda seleccionado; para filtros pueden ser varios.
- **No** uses chips de color para "Crítico" o "Bajo": eso va en el texto de la fila.

### Botón de voz

Micrófono grande para anotar ventas y gastos hablando.

| Estado | Aspecto |
|---|---|
| **Reposo** | Círculo de 112px `fondo/primario` con ícono `mic` de 48px + "Toca para hablar" en `texto/secundario` |
| **Escuchando** | Además, halo de 160px `fondo/primario-suave` + "Escuchando…" en `texto/primario` |

Debajo va una tarjeta "Entendí esto" para confirmar lo anotado. **No** lo pongas rojo al grabar.

### Ícono en círculo

Ícono dentro de un círculo de color, para opciones del Home, medios de pago, movimientos y alertas.

| Tamaño | Círculo | Ícono | Dónde |
|---|---|---|---|
| **M** | 40px | 20px | Filas de lista |
| **L** | 48px | 24px | Opciones grandes del Home |

| Tono | Colores | Cuándo |
|---|---|---|
| **Primario** | `fondo/primario-suave` + `texto/primario` | El normal: Registrar gasto, Llegó mercancía, Cargar productos, fotos, ventas, abonos |
| **Primario sólido** | `fondo/primario` + `texto/inverso` | Destacar una sola opción (Vender) |
| **Oscuro** | `fondo/encabezado` + `texto/inverso` | Destacar una sola opción (Caja del día) |
| **Neutro** | `fondo/sutil` + `texto/secundario` | Movimientos que no son entrada de plata: un gasto, un fiado nuevo |
| **Éxito** | `fondo/exito-suave` + `texto/exito` | Confirmaciones |
| **Advertencia** | `fondo/advertencia-suave` + `texto/advertencia` | **Solo** avisos leves |
| **Advertencia sólido** | `fondo/advertencia` + `texto/inverso` | **Solo** dentro de una Alerta de advertencia |
| **Peligro** | `fondo/peligro-suave` + `texto/peligro` | **Solo** problemas reales |

Un gasto no es un error: nunca uses Peligro para el ícono de Registrar gasto, ni Advertencia para mercancía o fotos.

### Avatar

Círculo con la inicial de una **persona**: clientes de fiado, empleados, la dueña.

| Propiedad | Valores |
|---|---|
| Tono | **Primario** (por defecto) · **Oscuro** (la dueña o el usuario actual) · **Neutro** (personas inactivas) |
| Tamaño | **M** 40px (listas) · **L** 64px ("¿Quién atiende?") |

- **No** uses avatares para cosas que no son personas (productos, "Movimientos de hoy", "Quedé debiendo", Notificaciones, Micrófono): para eso va Ícono en círculo.
- **No** pongas avatares en naranja ni rojo: el estado del cliente se dice en el texto.

### Fila de lista

Tarjeta blanca (`fondo/tarjeta`, `radio/lg`) para movimientos, fiados, productos, turnos y opciones de menú.

**Estructura:** ícono en círculo (M) **o** avatar si es una persona · título (`cuerpo-fuerte` 15px) · detalle (`secundario`) · a la derecha un valor, una flecha `chevron-right` o ambos.

| Color del valor | Variable | Cuándo |
|---|---|---|
| Entrada | `texto/primario` | Plata que entra: ventas, abonos, "Entró" |
| Neutro | `texto/principal` | Todo lo demás: gastos, fiados, deudas, saldos (salidas con "−") |
| Advertencia / Peligro | `texto/advertencia` / `texto/peligro` | **Solo** para un aviso: "Quedan 6" (bajo), "Quedan 2" (crítico) |

- El detalle va en `texto/secundario`. Solo pásalo a `texto/peligro` cuando cuenta un problema real ("Vencido hace 5 días", "faltaron $3.000").
- "Último abono hace 12 días", "Acordó pagar en quincena" o "Ya te debe $42.000" son información, no alertas: van en `texto/secundario`.
- La opción elegida o recomendada lleva borde de 2px `borde/foco`.

### Tarjeta de monto

Muestra un monto grande con su etiqueta: vendido hoy, efectivo en caja, base del día.

| Propiedad | Valores |
|---|---|
| Tono | **Oscuro** (`fondo/encabezado`, el resumen principal del Home; una por pantalla) · **Claro** (`fondo/tarjeta`, todo lo demás) |
| Compacta | Para dos columnas: el monto baja a `monto-m` (22px) y el relleno a 14px |
| Centrada | Monto y etiqueta centrados (efectivo esperado, base del día) |

- Monto en `monto-xl`, en `texto/principal` (o `texto/inverso` en la oscura). Una venta en efectivo puede ir en `texto/primario`.
- Los gastos y los fiados **no** van en rojo ni en naranja. La única cifra en `texto/peligro` es una diferencia de caja negativa ("−$5.000"), dentro de una tarjeta `fondo/peligro-suave`.

### Alerta

Aviso destacado dentro del contenido. Es el **único** lugar donde el naranja y el rojo aparecen como fondo.

| Tono | Fondo | Ícono | Cuándo |
|---|---|---|---|
| **Advertencia** | `fondo/advertencia-suave` | `triangle-alert` en Advertencia sólido | Algo que conviene atender pronto: un producto por agotarse |
| **Peligro** | `fondo/peligro-suave` | `triangle-alert` en Peligro | Un problema que ya pasó: faltante de caja, agotado, fiado vencido |
| **Éxito** | `fondo/primario-suave` | `circle-check` en Primario sólido | Una confirmación con siguiente paso ("Sumamos 24 productos") |

- **Título:** el hecho, corto ("Faltan $5.000"), en `cuerpo-fuerte`. **Detalle:** qué hacer ("Revisa si olvidaste anotar algún gasto").
- Lleva flecha si abre otra pantalla.
- Máximo una alerta por pantalla, arriba del contenido. Si todo está bien, no hay alerta.

---

## 8. Íconos

Todos son de **Lucide** (trazo de 2px, esquinas redondeadas). En Figma, usa el plugin oficial de Lucide con el mismo nombre.

- **Tamaños:** 20px en filas y botones, 24px en opciones grandes, 28px dentro de los botones del Home, 48px en el botón de voz.
- Toman el color del texto que los acompaña. Sobre un círculo, usa Ícono en círculo con el tono que corresponda.
- Nunca reemplaces un ícono por una letra ($, C, I, F, !), ni uses un avatar para algo que no es una persona.

| Navegación | Plata | Acciones | Estados | Otros |
|---|---|---|---|---|
| `house` | `banknote` | `plus` | `check` | `user` |
| `book-open` | `wallet` | `minus` | `circle-check` | `users` |
| `hand-coins` | `coins` | `x` | `triangle-alert` | `store` |
| `package` | `receipt` | `pencil` | `clock` | `truck` |
| `chevron-left` | `shopping-cart` | `search` | `trending-up` | `map-pin` |
| `chevron-right` | | `funnel` | | `smartphone` |
| `list` | | `camera` | | `phone` |
| | | `mic` | | `message-square` |

> En Lucide 0.460, `funnel` se llama `filter`.

---

## 9. Contraste

| Par | Contraste | ¿Cumple? |
|---|---|---|
| `texto/principal` sobre `fondo/app` | 15.6 : 1 | Sí |
| `texto/secundario` sobre `fondo/app` / `fondo/tarjeta` | 5.9 / 6.4 : 1 | Sí |
| `texto/primario` sobre `fondo/tarjeta` / `fondo/primario-suave` | 6.6 / 5.7 : 1 | Sí |
| `texto/inverso` sobre `fondo/primario` | 4.96 : 1 | Sí |
| `texto/inverso-suave` sobre `fondo/encabezado` | 8.9 : 1 | Sí |
| `texto/peligro` sobre `fondo/tarjeta` / `fondo/peligro-suave` | 6.6 / 5.4 : 1 | Sí |
| `texto/advertencia` sobre `fondo/tarjeta` | 5.2 : 1 | Sí |
| `texto/advertencia` sobre `fondo/advertencia-suave` | 4.44 : 1 | Justo por debajo de 4.5 |
| `texto/sutil` sobre `fondo/app` / `fondo/tarjeta` / `fondo/sutil` | 3.9 / 4.2 / 3.6 : 1 | **No** en texto pequeño |
| Ícono blanco sobre `fondo/advertencia` | 2.8 : 1 | **No** (mínimo 3:1 para íconos) |

**Reglas que salen de aquí:**

- Usa `texto/sutil` solo para placeholders y textos legales que no sean necesarios; para todo lo demás, `texto/secundario`.
- En una Alerta de advertencia, el título va en `texto/principal`, no en naranja.
- Si quieres corregir los dos pares que no cumplen, oscurece `neutro/500` y el ícono sobre naranja; los valores actuales son los del archivo original.
