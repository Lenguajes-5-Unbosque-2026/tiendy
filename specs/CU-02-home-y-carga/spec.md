# Home y carga de productos

> CU-02 · Pantallas en `design/flujos/Home y carga de productos/`

## Quién y para qué

**Quién:** la persona que atiende la tienda. La dueña lo usa al empezar el día y cada vez que vuelve a la app; la carga de productos la hace sobre todo la dueña, la primera vez.

**Para qué:**

- **Home:** ver de un vistazo cómo va el día (vendido, ganancia, fiado, efectivo esperado, qué se está acabando) y llegar en un toque a lo que más se hace: vender, anotar un gasto, recibir mercancía y ver la caja.
- **Carga de productos:** dejar el inventario listo en pocos minutos para poder vender. Sin productos no se puede vender (CU-04 · 20a).

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 09 | Home por primera vez | Header "Hola, Doña Rosa · Tienda Doña Rosa". Tarjeta destacada "Abrir caja · Pon la base para empezar el día". Tarjeta "Vender · Busca, toca o dilo en voz alta". Dos tarjetas "Registrar gasto" y "Llegó mercancía". Tarjeta "Cargar productos". Barra inferior con Inicio activo. |
| 09a | Abrir caja (hoja) | Hoja sobre el Home oscurecido: "Abrir caja", "Cancelar", "¿Con cuánto efectivo empiezas hoy?", tarjeta "Base del día $80.000 · Ayer cerraste con $76.500", chips $50.000 / $80.000 / $100.000 / Igual que ayer y botón "Abrir caja". |
| 10 | Cómo cargar productos | Header "Cargar productos" con volver. "¿Cómo quieres cargar tus productos?" con tres opciones: "Uno por uno, a mano · Escribe nombre, precio y cantidad", "Con fotos · De los productos o de la factura" y "Desde un listado · Marca productos típicos de tienda" (con borde verde). "Recomendado: desde un listado, es lo más rápido." y "Puedes combinar métodos y agregar más productos después." |
| 11 | Carga manual | Header "Agregar producto". Área "Foto del producto (opcional)". Campos Nombre, Precio de venta y Costo. Chips de Categoría (Abarrotes, Bebidas, Aseo, Lácteos, Snacks). "Cantidad · Aviso cuando queden 5" con − y +. Botones "Guardar producto" y "Guardar y agregar otro". |
| 12 | Carga por foto | Header "Cargar con foto". Chips "Productos" / "Factura del proveedor". Área de cámara "Toma la foto a un grupo de productos del estante". "Detectamos 3 productos · revisa y corrige" con filas (nombre, cantidad, precio). Botón "Confirmar 3 productos". |
| 13 | Carga desde listado | Header "Listado sugerido". Buscador "Buscar producto", chips de categoría (Todos, Abarrotes, Bebidas, Aseo, Lácteos), "4 seleccionados", "Seleccionar todos" y filas con casilla, nombre y "Precio sugerido". Botón "Agregar 4 productos". |
| 15 | Home | Header "Hola, Doña Rosa · Turno de Doña Rosa · desde 7:02 a.m.". Tarjeta oscura "Vendido hoy $385.000 · Ganancia $118.000 · Fiado $28.000". Alerta "Se está acabando la leche · Quedan 2 · ver sugerencia de compra". Tarjeta "Vender". "Registrar gasto" y "Llegó mercancía". Fila "Caja del día · Efectivo esperado $341.000". Barra inferior. |

## Paso a paso

**Caso de ejemplo:** Doña Rosa acaba de registrarse (CU-01). Es la primera vez que entra al Home, no tiene productos ni caja abierta.

### Primera vez: cargar productos desde el listado (09 → 10 → 13 → 09)

1. En el **Home por primera vez** (09) toca **Cargar productos**.
2. En **Cómo cargar productos** (10) elige **Desde un listado** (la opción recomendada).
3. En **Listado sugerido** (13) filtra por **Abarrotes** y marca Arroz Diana 500 g, Aceite Premier 1 L, Azúcar Manuelita 1 kg y Panela 500 g. Deja sin marcar Huevos AA x30. Arriba dice **4 seleccionados**.
   - Puede buscar por nombre o tocar **Seleccionar todos**.
4. Toca **Agregar 4 productos**. Los productos quedan en su inventario con el precio sugerido.

### Otras formas de cargar

- **A mano (11):** escribe "Arroz Diana 500 g", precio de venta $3.200, costo $2.600, categoría Abarrotes y cantidad 24 (el aviso de "por agotarse" queda en 5). Toca **Guardar producto** o **Guardar y agregar otro** para seguir con el siguiente.
- **Con foto (12):** con "Productos" elegido, le toma una foto al estante. La app muestra **Detectamos 3 productos** (Gaseosa Postobón 1,5 L × 12 a $4.500, Leche Alquería 1 L × 8 a $3.900, Pan tajado Bimbo × 5 a $6.800). Revisa y toca **Confirmar 3 productos**. Con "Factura del proveedor" la foto es de la factura.

### Abrir la caja desde el Home (09 → 09a → 15)

1. En el Home (09) toca **Abrir caja**.
2. Sube la hoja **Abrir caja** (09a): "¿Con cuánto efectivo empiezas hoy?". Elige el chip **$80.000** (o "Igual que ayer").
3. Toca **Abrir caja**. El Home pasa a su versión del día (15): el header dice "Turno de Doña Rosa · desde 7:02 a.m." y aparecen "Vendido hoy" y "Caja del día".

### Usar el Home durante el día (15)

- **Vender** → hoja de venta (CU-04 · 20).
- **Registrar gasto** → CU-05 · 27.
- **Llegó mercancía** → CU-08 · 41a.
- **Caja del día** → resumen de caja (CU-03 · 17).
- **Alerta "Se está acabando la leche"** → abre lo que se está acabando (CU-08 · 43 o 44, ver Preguntas abiertas).
- **Barra inferior:** Inicio · Fiados · Vender · Inventario · Caja.

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Sin caja abierta y sin productos | 09 | "Abrir caja" destacada arriba y tarjeta "Cargar productos". Sin "Vendido hoy". |
| Abriendo caja | 09a | Hoja con la base del día y montos rápidos. |
| Caja abierta, día en curso | 15 | "Vendido hoy", alerta de agotado y "Caja del día". |
| Hay un producto por agotarse | 15 | Una alerta naranja arriba de "Vender" (máximo una alerta). |
| Recién se anotó una venta | 22 (CU-04) | Aviso "Venta anotada" con "Deshacer". |
| Elección de método de carga | 10 | "Desde un listado" marcado como recomendado. |
| Productos seleccionados en el listado | 13 | Contador "4 seleccionados" y el botón dice cuántos se agregan. |
| Productos detectados por foto | 12 | Lista para revisar antes de confirmar. |

**Estados sin pantalla en Figma:** Home con caja abierta pero sin ventas todavía (¿"Vendido hoy $0"?), Home sin ninguna alerta, Home con caja ya cerrada, Home del empleado (no ve ganancias, según 47), foto sin productos detectados, búsqueda sin resultados en el listado, producto repetido, campos obligatorios vacíos en 11.

## Qué pasa después

- **Productos cargados (11, 12, 13):** quedan en Mi inventario (CU-08 · 41) con nombre, categoría, precio, costo y cantidad. Desde ese momento se pueden vender (CU-04) y aparecen en el buscador y en las ventas rápidas.
- **Caja abierta (09a):** empieza el turno de quien abre, con la base contada. El Home cambia a 15 y se puede ver el resumen de caja (CU-03 · 17).
- **El Home (15) refleja en vivo** lo que pasa en los otros flujos: ventas (CU-04), fiados (CU-04 y CU-07), gastos en efectivo (CU-05, bajan el efectivo esperado) y productos por agotarse (CU-08).

**Cómo salen los números del Home** (con los valores de 15 y 17):

- Vendido hoy = todas las ventas del día, incluidas las fiadas: $385.000.
- Fiado = ventas fiadas del día: $28.000.
- Ganancia = vendido − costo de lo vendido: $118.000.
- Efectivo esperado = base + ventas en efectivo − gastos en efectivo: $80.000 + $323.000 − $62.000 = $341.000.

## Datos que usa

**Lee**

| Dato | Para qué |
|---|---|
| Tienda: nombre | Subtítulo de 09 |
| Persona que atiende: nombre | Saludo "Hola, Doña Rosa" |
| Turno abierto: quién, hora de apertura, base | Header de 15 y si mostrar 09 o 15 |
| Ventas del día con su medio de pago, precio y costo | Vendido hoy, Ganancia, Fiado |
| Gastos en efectivo del día | Efectivo esperado |
| Productos por debajo de su mínimo | Alerta "Se está acabando…" |
| Último cierre de caja | "Ayer cerraste con $76.500" e "Igual que ayer" en 09a |
| Catálogo base de productos típicos, con categoría y precio sugerido | Listado de 13 |

**Guarda**

| Registro | Campos |
|---|---|
| Producto | id · tienda · nombre · categoría · precio de venta · costo · cantidad · mínimo para avisar ("aviso cuando queden 5") · foto (opcional) · origen (manual, foto, listado) |
| Turno (al abrir caja desde 09a) | id · tienda · quién atiende · hora de apertura · base |
| Foto de productos o de la factura | imagen guardada en el almacenamiento de fotos |

## Fuera de alcance

- Hoja de venta (CU-04), registrar gasto (CU-05), llegó mercancía (CU-08 · 41a), resumen y cierre de caja (CU-03).
- "¿Quién atiende?" y la pantalla completa de abrir caja con teclado (CU-03 · 16a y 16).
- Editar un producto ya cargado (CU-08 · 42).

## Preguntas abiertas

1. **Dos versiones de Abrir caja.** 09a (hoja, sin teclado) y 16 (pantalla completa, con teclado) son el mismo paso. ¿Cuál se queda o cuándo aparece cada una? ¿Desde 09a también se pregunta "¿Quién atiende?" (16a)? (auditoría).
2. **"Ayer cerraste con $76.500" en el primer día.** En el Home por primera vez no hay día anterior. ¿Qué muestra 09a la primera vez?
3. **Cargar productos después del primer día.** 15 ya no tiene la tarjeta "Cargar productos". ¿Desde dónde se cargan más productos después? ¿Desde "+ Agregar" de Mi inventario (41)?
4. **¿Cuándo deja de ser "primera vez"?** ¿Al abrir caja, al cargar productos o al hacer la primera venta?
5. **Cantidades en el listado.** 13 agrega productos con precio sugerido, pero no pide cantidad ni costo. ¿Entran con 0 unidades? ¿Cuándo se completan?
6. **Corregir lo detectado por foto.** 12 dice "revisa y corrige", pero las filas no tienen flecha ni lápiz (auditoría). ¿Cómo se corrige una fila?
7. **Foto de factura en carga.** ¿"Factura del proveedor" en 12 hace lo mismo que la foto de factura de Llegó mercancía (41a)?
8. **Categorías.** 11 tiene Snacks; 13 y 41 no. ¿Cuál es la lista fija de categorías? ¿El tendero puede crear las suyas?
9. **Destino de la alerta del Home.** "Quedan 2 · ver sugerencia de compra" ¿abre Por agotarse (43), Qué pedir (44) o el producto (42)?
10. **Entrada a Mi tienda.** El Home no tiene acceso a Mi tienda (CU-09) y la barra inferior tampoco (auditoría, pantalla 46).
11. **Barra inferior.** Las pantallas y el UI kit nuevo usan Inicio · Fiados · Vender · Inventario · Caja; el CLAUDE.md (§6) dice Inicio · Cuaderno · Fiados · Inventario · Mi tienda. ¿Cuál vale?
12. **Íconos de color.** Registrar gasto (rojo), Llegó mercancía y Cargar productos (naranja) rompen la regla de color; Cargar productos repite el ícono `package` (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 09, 09a, 10, 11, 12, 13 y 15 de "📱 Diseño v3 · propuesta". |
