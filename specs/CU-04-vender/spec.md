# Vender

> CU-04 · Pantallas en `design/flujos/Vender/` · Flujo core de Tiendy

## Quién y para qué

**Quién:** la persona que está en el mostrador con el turno abierto: la dueña (Doña Rosa) o un empleado (Andrés). Atiende de pie, con una mano y con el cliente esperando.

**Para qué:** anotar una venta en menos de tres segundos, hablando, tocando una venta rápida o buscando el producto. Es la base del producto: cada venta anotada suma a la caja del medio de pago que corresponde, descuenta los productos del inventario y, si es fiada, suma a la deuda de un cliente con nombre. Sin este flujo no hay caja que cuadrar, inventario que avisar ni fiados que cobrar.

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 20 | Vender · hoja de venta | Hoja inferior "Nueva venta" con "Cancelar". Buscador "Busca un producto" con botón de micrófono al lado. "Ventas rápidas · un toque suma 1": chips con nombre corto y precio (Gaseosa 1,5 L · $4.500, Pan · $500, Huevo · $700, Leche 1 L · $3.900, Papas · $2.500). Tarjeta "Esta venta" con una línea por producto (nombre, botones − y +, cantidad, subtotal) y "Total". "¿Cómo te pagan?" con tres chips: "Efectivo", "Nequi / Daviplata" y "Fiado". "Paga con $20.000" y "Vueltas $8.500". Botón "Anotar venta · $11.500". |
| 20a | Vender sin productos | La misma hoja "Nueva venta" con ícono de paquete, "Aún no tienes productos", "Para vender primero carga lo que hay en tu tienda. Con el listado de productos típicos toma unos 5 minutos." y botón "Cargar productos". |
| 21 | Vender · lo que dijiste | Hoja sobre el Home oscurecido. Tarjeta "Te escuché" con lo que se dijo entre comillas ("dos gaseosas y unas papas, en efectivo, me paga con veinte"). Ayuda "Toca una línea para corregirla. También puedes buscar a mano." La misma tarjeta "Esta venta". "¿Cómo te pagan? · lo dijiste: efectivo". Vueltas. Botón "Anotar · se guarda en 3 s". |
| 22 | Venta anotada · deshacer | El Home con "Vendido hoy" ya actualizado ($385.000 → $396.500) y un aviso abajo: "Venta anotada · $11.500 · Efectivo · inventario actualizado" con botón "Deshacer". |
| 23 | Fiado: elegir cliente (desde la hoja) | Pantalla "Venta fiada" con volver. Tarjeta "Fiado $11.500". "¿A quién le fías?" con un cliente sugerido y seleccionado ("Don Carlos Pérez · Ya te debe $42.000"). "O crea un cliente nuevo": campos "Nombre del cliente" y "+57 Celular (opcional)". "¿Cuándo te paga?" con chips Esta semana / Quincena / Fin de mes. Botón "Registrar fiado". |

**Cómo se entra:** desde la tarjeta "Vender · Busca, toca o dilo en voz alta" del Home (09 y 15) y desde el botón central "Vender" de la barra inferior que muestran las pantallas (ver Preguntas abiertas).

## Paso a paso

**Caso de ejemplo:** martes 23, 10:24 a.m. Doña Rosa tiene la caja abierta desde las 7:02 a.m. y lleva $385.000 vendidos. Llega un cliente y pide dos gaseosas Postobón de 1,5 L y unas papas Margarita. Total: $11.500. Paga con un billete de $20.000.

### Camino 1 · Tocando (20 → 22)

1. En el Home (15), Doña Rosa toca la tarjeta **Vender**. Sube la hoja **Nueva venta** (20) sobre el Home.
2. Toca dos veces el chip **Gaseosa 1,5 L · $4.500**. Cada toque suma 1: en "Esta venta" aparece "Gaseosa Postobón 1,5 L · 2 · $9.000".
3. Toca el chip **Papas · $2.500**. Aparece "Papas Margarita · 1 · $2.500". El total pasa a **$11.500**.
   - Si el producto no está en las ventas rápidas, lo escribe en **Busca un producto** y lo elige de los resultados.
   - Con **−** y **+** de cada línea ajusta la cantidad.
4. En **¿Cómo te pagan?** queda elegido **Efectivo**.
5. Indica que le pagan con **$20.000**. La hoja muestra **Vueltas $8.500** en verde.
6. Toca **Anotar venta · $11.500**. La hoja se cierra.
7. Vuelve al Home (22): "Vendido hoy" sube a **$396.500** y aparece el aviso **Venta anotada · $11.500 · Efectivo · inventario actualizado** con **Deshacer**.
8. Si se equivocó, toca **Deshacer** mientras el aviso está en pantalla y la venta se borra como si no hubiera pasado.

### Camino 2 · Hablando (20 → 21 → 22)

1. En la hoja (20), toca el **micrófono** junto al buscador.
2. Dice: *"dos gaseosas y unas papas, en efectivo, me paga con veinte"*.
3. La hoja cambia a **lo que dijiste** (21):
   - La tarjeta **Te escuché** muestra la frase tal como se entendió.
   - "Esta venta" ya trae las dos líneas y el total $11.500.
   - **Efectivo** queda elegido, con la nota "lo dijiste: efectivo".
   - "Paga con $20.000" y "Vueltas $8.500" salen de "me paga con veinte".
4. El botón dice **Anotar · se guarda en 3 s**: si no toca nada, la venta se guarda sola al terminar la cuenta.
5. Si algo quedó mal, toca la línea para corregirla, usa − y +, cambia el medio de pago o busca a mano antes de que termine la cuenta.
6. Al guardarse, vuelve al Home (22) con el aviso y **Deshacer**, igual que en el camino 1.

### Camino 3 · Fiado (20 → 23 → Home)

Mismo pedido, pero Don Carlos Pérez dice que lo paga en la quincena.

1. En la hoja (20 o 21), elige **Fiado** en "¿Cómo te pagan?".
2. Se abre **Venta fiada** (23) con el total arriba: **Fiado $11.500**.
3. En **¿A quién le fías?** aparece Don Carlos Pérez, que "Ya te debe $42.000". Lo deja elegido (borde verde).
   - Si es un cliente nuevo, escribe su **nombre** y, si quiere, su **celular** con +57.
4. En **¿Cuándo te paga?** elige **Quincena**.
5. Toca **Registrar fiado**. La venta queda anotada como fiado a nombre de Don Carlos, que ahora debe **$53.500**.

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Sin productos cargados | 20a | La hoja no deja vender: invita a "Cargar productos". |
| Venta con productos | 20 | Líneas, total y botón "Anotar venta · $total". |
| Voz entendida, guardando | 21 | Tarjeta "Te escuché", venta armada y botón con cuenta regresiva de 3 s. |
| Venta en efectivo con vueltas | 20, 21 | "Paga con $X" y "Vueltas $Y" en verde. |
| Fiado con cliente existente | 23 | Cliente sugerido con borde verde y lo que ya debe. |
| Fiado con cliente nuevo | 23 | Campos Nombre y Celular (opcional). |
| Venta anotada, se puede deshacer | 22 | Aviso oscuro en el Home con "Deshacer". |

**Estados que no tienen pantalla en Figma** (ver Preguntas abiertas): hoja vacía antes de agregar el primer producto, micrófono escuchando dentro de la hoja, voz que no se entendió o producto que no existe, resultados del buscador, medio "Nequi / Daviplata" elegido (sin vueltas), producto agotado o cantidad mayor a la que hay, vender sin caja abierta, error al guardar o sin conexión, aviso de confirmación de un fiado.

## Qué pasa después

Cuando la venta queda anotada (y no se deshace):

- **Home (15):** "Vendido hoy" suma el total. La venta fiada también cuenta en "Vendido hoy" y además suma en "Fiado". "Ganancia" sube en la diferencia entre el precio y el costo de lo vendido.
- **Caja (CU-03 · 17):** la venta suma a su medio de pago en "Por medio de pago" (Efectivo, Transferencia o Fiado). Solo el efectivo sube el "Efectivo esperado en caja"; el fiado aparece como "Fiado · no está en caja".
- **Inventario (CU-08 · 41, 42):** cada producto baja en la cantidad vendida. Si queda por debajo de su mínimo, aparece en "Por agotarse" (43) y en la alerta del Home ("Se está acabando la leche").
- **Mi cuaderno (CU-06 · 33, 36):** aparece como movimiento "Venta · Gaseosa, Papas · 10:24 a.m. · Efectivo · +$11.500". El detalle (36) muestra los productos, el total, el pago, el cliente si es fiado, quién la anotó y si fue "por voz".
- **Fiados (CU-07 · 37, 38):** si es fiada, sube lo que debe el cliente y aparece en sus movimientos como "Fiado · Gaseosa, Papas · Hoy · +$11.500". Si el cliente es nuevo, aparece en la lista de fiados.
- **Deshacer:** revierte todo lo anterior (vendido, caja, inventario, fiado).
- **Corregir o eliminar después:** se hace desde el detalle del movimiento (36), en CU-06.

## Datos que usa

**Lee**

| Dato | Para qué |
|---|---|
| Productos de la tienda: nombre, precio de venta, costo, unidades disponibles | Buscar, armar las líneas, calcular el total y la ganancia |
| Ventas rápidas: qué productos salen como chip y con qué nombre corto ("Gaseosa 1,5 L", "Pan") | Chips de la hoja 20 |
| Alias de productos ("unas papas" → Papas Margarita) | Entender lo que se dice por voz |
| Turno abierto: quién atiende | Guardar quién anotó la venta |
| Clientes con fiado: nombre, celular, lo que deben hoy | Sugerir cliente en 23 y mostrar "Ya te debe $42.000" |
| Si la tienda tiene productos cargados | Mostrar 20 o 20a |

**Guarda**

| Registro | Campos |
|---|---|
| Venta | id · tienda · turno · quién la anotó · fecha y hora · canal (toque, búsqueda, voz) · lo que se dijo (si fue por voz) · medio de pago (efectivo, transferencia, fiado) · total · paga con (opcional) · cliente (si es fiado) · estado (anotada, deshecha) |
| Producto de la venta (una fila por línea) | venta · producto · cantidad · precio unitario al momento de vender · costo unitario al momento de vender · subtotal |
| Cliente (solo si es nuevo) | id · tienda · nombre · celular (opcional) |
| Acuerdo de pago del fiado | cuándo paga (esta semana, quincena, fin de mes) y la fecha que resulta |

**Actualiza:** las unidades de cada producto vendido.

## Fuera de alcance

- Cargar productos cuando no hay (20a lleva a CU-02 · Home y carga de productos).
- Abrir y cerrar caja (CU-03).
- Corregir o eliminar una venta después de que se fue el aviso (CU-06 · Mi cuaderno, pantalla 36).
- Abonos y pagos de fiados (CU-07).
- Venta tomando foto del producto: el Brief la menciona, pero no hay pantalla.
- Datáfono como medio de pago: el Brief lo menciona, pero no aparece en las pantallas.

## Preguntas abiertas

1. **Entrada desde la barra inferior.** Las pantallas y el UI kit nuevo (`tiendy-ui-kit.md`) muestran "Vender" como botón central de la barra. El CLAUDE.md (§6) dice que Vender no tiene pestaña y solo se abre desde el Home. ¿Cuál vale?
2. **Medio de pago por defecto.** En 20 aparece Efectivo elegido. ¿Siempre arranca en Efectivo o en el último medio usado?
3. **"Paga con".** ¿Cómo se ingresa el billete con el que paga en el camino de toque? No hay campo ni teclado visible. ¿Es opcional?
4. **Nombre del medio digital.** La hoja dice "Nequi / Daviplata"; la Caja (17), los filtros (34) y el abono (39) dicen "Transferencia". ¿Es el mismo medio? ¿Se guarda cuál de los dos fue?
5. **Ventas rápidas.** ¿Quién decide qué productos salen como chip: los más vendidos, los que elige el tendero o un listado fijo?
6. **Hoja vacía.** ¿Cómo se ve la hoja antes de agregar el primer producto y qué pasa con el botón "Anotar venta"?
7. **Voz sin entender.** ¿Qué se muestra si la voz no reconoce un producto, la cantidad o el medio de pago? ¿Y el estado "escuchando" dentro de la hoja?
8. **Guardado automático.** ¿La cuenta de 3 s se detiene si la persona toca una línea para corregir?
9. **Deshacer.** ¿Cuánto tiempo queda el aviso con "Deshacer"?
10. **Después del fiado.** Al tocar "Registrar fiado", ¿vuelve al Home con un aviso como el de 22? No hay pantalla.
11. **Cliente sugerido.** ¿Cómo se elige el cliente que aparece en 23 (el último, el que se dijo por voz, uno buscado)? ¿Cómo se busca otro cliente existente?
12. **"¿Cuándo te paga?"** ¿Es un dato de cada fiado o del cliente? La pantalla 38 lo muestra como acuerdo del cliente ("Acordó pagar en quincena (30 sep.)").
13. **Sin caja abierta.** ¿Se puede vender si nadie ha abierto caja? El Home sin caja (09) muestra "Vender" activo.
14. **Inventario insuficiente.** ¿Qué pasa si se vende más de lo que hay o un producto en 0?
15. **Fondo de la hoja.** 20 y 20a muestran verde liso detrás; 21 muestra el Home oscurecido (auditoría: usar el Home oscurecido).
16. **Ganancia en 22.** "Vendido hoy" sube a $396.500 pero "Ganancia" sigue en $118.000 (auditoría, pantalla 22).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 20, 20a, 21, 22 y 23 de "📱 Diseño v3 · propuesta". |
