# Inventario

> CU-08 · Pantallas en `design/flujos/Inventario/`

## Quién y para qué

**Quién:** la dueña, cuando revisa qué tiene, ajusta precios o decide qué pedir; y quien recibe al proveedor en el mostrador cuando llega mercancía.

**Para qué:** saber qué queda en el estante sin contar a mano, enterarse antes de que algo se acabe y saber qué pedir y cuánto. El inventario no se lleva aparte: baja con cada venta (CU-04) y sube con cada entrada de mercancía (41a).

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 41 | Mi inventario | Header "Mi inventario · 248 productos" (sin volver). Buscador "Buscar producto" con "+ Agregar". Chips Todos (elegido), Abarrotes, Bebidas, Lácteos, Aseo. Alerta roja "6 productos por agotarse · Revisa y pide antes de quedarte sin". Filas: Leche Alquería 1 L · Lácteos · $3.900 · "Quedan 2" (rojo); Huevo AA · Abarrotes · $700 · "Quedan 6" (naranja); Arroz Diana 500 g · $3.200 · 24 und.; Gaseosa Postobón 1,5 L · $4.500 · 18 und. Barra inferior con Inventario activa. |
| 41a | Llegó mercancía | Header "Llegó mercancía · Suma al inventario y actualiza costos" con volver. Campo Proveedor "Postobón preventa". Tarjeta con productos: Gaseosa Postobón 1,5 L "24 und × costo $3.200" $76.800; Agua Cristal 600 ml "12 und × costo $1.100" $13.200; "+ Agregar producto · o tómale foto a la factura"; Total del pedido $90.000. "¿Cómo lo pagaste?": Efectivo de la caja / Transferencia / Quedé debiendo · viernes (elegido). "Suma cantidades y actualiza el costo de cada producto. No cuenta como gasto del día." Botón "Sumar al inventario". |
| 42 | Ver y editar producto | Header "Leche Alquería 1 L · Lácteos" con volver. Tarjeta "Quedan 2 unidades · Mínimo 6 · vendes unas 5 al día" (rojo). Campos Precio de venta $3.900 y Costo $3.100. "Unidades · Ajustar si contaste distinto" con − 2 +. Gráfica "Ventas de los últimos 7 días" (Mié a Hoy). Botón "Guardar cambios". |
| 43 | Alertas de agotado | Header "Por agotarse · 6 productos" con volver. Chips Todos / Críticos / Bajos. Filas: Leche Alquería 1 L "Quedan 2 · se acaba mañana" Crítico; Huevo AA "Quedan 6 · alcanza 2 días" Crítico; Pan tajado Bimbo "Quedan 3 · alcanza 3 días" Bajo; Aceite Premier 1 L "Quedan 4 · alcanza 4 días" Bajo; Papel higiénico x4 "Quedan 5 · alcanza 5 días" Bajo. Botón "Ver sugerencia de compra". |
| 44 | Sugerencias de compra | Header "Qué pedir · Según lo que vendiste en 30 días" con volver. "Ajusta las cantidades si quieres. Calculamos para 7 días de venta." Filas con − cantidad +: Leche Alquería 1 L 30 (≈ $93.000), Huevo AA (panal x30) 2 (≈ $37.000), Pan tajado Bimbo 8 (≈ $54.400), Aceite Premier 1 L 3 (≈ $29.700). "Total estimado $214.100". Botones "Pedir a un proveedor" y "Compartir lista por WhatsApp". |

## Paso a paso

**Caso de ejemplo:** martes 23. Doña Rosa ve en el Home "Se está acabando la leche · Quedan 2". Revisa qué se está acabando, arma el pedido de la semana y el viernes recibe al de Postobón.

### Ver qué se está acabando y qué pedir (41 → 43 → 44)

1. Toca la pestaña **Inventario**. En **Mi inventario** (41) ve que tiene 248 productos y la alerta **6 productos por agotarse**.
2. Toca la alerta. En **Por agotarse** (43) ve cada producto con cuántos quedan y para cuántos días alcanza. La leche "se acaba mañana".
   - Con **Críticos** o **Bajos** filtra la lista.
3. Toca **Ver sugerencia de compra**.
4. En **Qué pedir** (44) ve cuánto pedir de cada producto para 7 días de venta, calculado con lo que vendió en los últimos 30 días. Sube o baja cantidades con − y +. El total estimado es **$214.100**.
5. Toca **Compartir lista por WhatsApp** para mandársela al proveedor, o **Pedir a un proveedor**.

### Revisar y editar un producto (41 → 42)

1. En 41 toca **Leche Alquería 1 L**.
2. En el producto (42) ve que quedan 2 unidades, que el mínimo es 6 y que vende unas 5 al día, con la gráfica de los últimos 7 días.
3. Cambia el precio de venta o el costo, o ajusta las unidades si contó distinto en el estante.
4. Toca **Guardar cambios**.

### Recibir mercancía (41a)

1. El viernes llega el camión de Postobón. Desde el Home toca **Llegó mercancía** (CU-02 · 15).
2. En **Llegó mercancía** (41a) escribe el proveedor **Postobón preventa**.
3. Agrega los productos con cantidad y costo: 24 gaseosas Postobón 1,5 L a $3.200 ($76.800) y 12 aguas Cristal 600 ml a $1.100 ($13.200). El total del pedido es **$90.000**.
   - También puede **tomarle foto a la factura** para que se llenen solos.
4. En **¿Cómo lo pagaste?** elige **Quedé debiendo · viernes**.
5. Toca **Sumar al inventario**. Las unidades suben y el costo de cada producto se actualiza.

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Producto con unidades suficientes | 41 | "24 und." en gris. |
| Producto bajo | 41 | "Quedan 6" en naranja. |
| Producto crítico | 41, 42 | "Quedan 2" en rojo. |
| Hay productos por agotarse | 41 | Alerta arriba de la lista con flecha. |
| Lista de por agotarse filtrada | 43 | Chip Críticos o Bajos elegido. |
| Sugerencia ajustada | 44 | Cantidades con − y + y total estimado. |
| Mercancía que quedó debiendo | 41a | Chip "Quedé debiendo · viernes". |

**Estados sin pantalla en Figma:** inventario vacío, búsqueda sin resultados, producto agotado (0 unidades), producto sin costo, nada por agotarse (sin alerta), producto con menos de 7 días de ventas (gráfica incompleta), confirmación después de "Sumar al inventario", producto nuevo dentro de Llegó mercancía, foto de factura en 41a.

## Qué pasa después

- **Llegó mercancía (41a):** suben las unidades de cada producto y su costo pasa a ser el nuevo. Desde ahí la ganancia de cada venta (CU-04) se calcula con ese costo. Si se pagó con efectivo de la caja, sale plata de la caja (ver Preguntas abiertas). Si quedó debiendo, queda una cuenta por pagar al proveedor.
- **Editar producto (42):** el nuevo precio se usa en las próximas ventas (chips y buscador de CU-04). El ajuste de unidades cambia lo que queda.
- **Cuando un producto baja de su mínimo** (por ventas de CU-04): aparece en "Por agotarse" (43), en la alerta de 41 y en la alerta del Home (CU-02 · 15). También dispara la notificación de agotados (CU-09 · 46).
- **Compartir lista (44):** abre WhatsApp con la lista; no cambia el inventario.

## Datos que usa

**Lee**

| Dato | Para qué |
|---|---|
| Productos: nombre, categoría, precio, costo, unidades, mínimo | Lista, detalle y alertas |
| Ventas por producto y por día (últimos 7 y 30 días) | Gráfica de 42, "vendes unas 5 al día", "alcanza N días" y cantidades sugeridas de 44 |
| Proveedores conocidos | Campo Proveedor de 41a |

**Guarda**

| Registro | Campos |
|---|---|
| Entrada de mercancía | id · tienda · proveedor · turno · quién la anotó · fecha y hora · total · medio de pago (efectivo, transferencia, quedé debiendo) · fecha para pagar (si quedó debiendo) · foto de la factura (opcional) |
| Producto de la entrada (una fila por producto) | entrada · producto · cantidad · costo unitario · subtotal |
| Ajuste de inventario | producto · unidades antes · unidades después · quién · cuándo (para que el cuadre se pueda explicar) |
| Cambio de precio o costo | producto · nuevo precio de venta · nuevo costo |

**Actualiza:** unidades y costo de los productos.

## Fuera de alcance

- Cargar productos la primera vez (CU-02 · 10 a 13).
- Pedidos automáticos o integración con proveedores (fuera de alcance del semestre según el Brief).
- La venta que descuenta unidades (CU-04).

## Preguntas abiertas

1. **Mercancía: ¿gasto o Llegó mercancía?** 41a dice que "no cuenta como gasto del día", pero el gasto por foto (CU-05 · 30 a 32) registra mercancía como gasto y suma productos. Hay que decidir un solo camino (auditoría).
2. **Pago en efectivo de la mercancía.** Si se paga con "Efectivo de la caja", ¿resta del efectivo esperado de la caja (CU-03)? La fórmula de 18 solo resta gastos.
3. **Crítico y bajo.** Huevo AA (quedan 6) es "Crítico" en 43 y "bajo" (naranja) en 41. ¿Se define por unidades, por días que alcanza o por el mínimo? (auditoría).
4. **Color de "por agotarse".** La alerta de 41 es roja y la del Home es naranja para el mismo aviso. El kit dice naranja para "por agotarse" y rojo solo para agotado o crítico (auditoría).
5. **Número de productos por agotarse.** El encabezado de 43 dice 6 productos, pero la lista muestra 5 (auditoría).
6. **Mínimo de cada producto.** 11 dice "Aviso cuando queden 5"; 42 dice "Mínimo 6". ¿Lo pone el tendero o lo calcula la app según lo que vende?
7. **Unidad de venta y de compra.** El huevo se vende por unidad ($700) pero se pide por panal de 30 (44). ¿Cómo se maneja un producto que se compra en una unidad y se vende en otra?
8. **"Pedir a un proveedor".** No tiene pantalla. ¿Qué hace?
9. **Agregar un producto.** "+ Agregar" de 41 ¿abre la carga manual (CU-02 · 11) o el método de carga (10)?
10. **Producto nuevo en Llegó mercancía.** ¿"+ Agregar producto" en 41a permite crear un producto que no existe?
11. **Corrección visual.** "+ Agregar" va escrito dentro del buscador de 41; debe ser botón aparte. Los productos usan avatares con letra; deben ser Ícono en círculo con `package`. "Gaseosa Postobón 1,5 L" deja la "L" sola en otra línea. Los chips "Crítico" y "Bajo" de 43 parecen botones. En 41a "+ Agregar producto · o tómale foto a la factura" junta dos acciones (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 41, 41a, 42, 43 y 44 de "📱 Diseño v3 · propuesta". |
