# Gasto

> CU-05 · Pantallas en `design/flujos/Gasto/`

## Quién y para qué

**Quién:** la persona que está en el mostrador (dueña o empleado) cuando sale plata de la caja o se paga algo del negocio.

**Para qué:** que ninguna salida de plata quede sin rastro. El Brief lo define así: cualquier plata que sale sin que entre mercancía a cambio es un gasto, y queda con su motivo. Anotarlo en el momento es lo que evita el "no me cuadra la caja" al cerrar (CU-03).

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 27 | Registrar gasto | Header "Registrar gasto" con volver. "¿Cómo quieres anotar el gasto?" con tres opciones: "Por voz · Di: 'pagué 20.000 de transporte'" (borde verde), "A mano · Monto y categoría" y "Foto del recibo · Leemos el monto por ti". "Gastos frecuentes": chips Transporte, Servicios, Arriendo, Mercancía, Otro. |
| 28 | Gasto por voz | Header "Gasto por voz". Botón de voz grande con halo y "Escuchando…". Tarjeta "Entendí esto": Monto $20.000, Categoría Transporte (verde, se puede tocar), "Toca la categoría para cambiarla". "¿No sabes qué decir? Prueba con:" y el ejemplo "Pagué 20.000 de transporte". Botón "Continuar". |
| 29 | Gasto manual | Header "Gasto manual". Tarjeta "¿Cuánto gastaste? $20.000". Teclado numérico. Chips de Categoría (Transporte elegido, Servicios, Arriendo, Mercancía, Otro). Campo "Nota (opcional)". Botón "Continuar". |
| 30 | Gasto por foto | Header "Foto del recibo". Área de cámara "Encuadra la factura o el recibo". Tarjeta "Leímos esto · puedes corregirlo": Proveedor Distribuidora El Sol, Monto $184.000, Categoría sugerida Mercancía. Nota "¿Es mercancía para vender? Anótala en Inventario › Llegó mercancía." Botón "Continuar". |
| 31 | Cómo pagaste el gasto | Header "¿Cómo lo pagaste?". Tarjeta "Gasto $184.000 · Mercancía · Distribuidora El Sol". Opciones "Efectivo de la caja", "Transferencia · Nequi, Daviplata o banco" y "Quedé debiendo · Se guarda como cuenta por pagar" (elegida). "¿Cuándo tienes que pagar?" con chips Próxima visita / En 8 días (elegido) / En 15 días. Botón "Registrar gasto". |
| 32 | Gasto registrado | Header "Listo". Check, "¡Gasto anotado!". Resumen: Monto $184.000, Categoría Mercancía, Pago Quedé debiendo, Pagar antes de 3 de octubre. Alerta de éxito "Sumamos 24 productos · Ver en tu inventario". Botones "Registrar otro gasto" e "Ir al inicio". Barra inferior. |

## Paso a paso

**Caso de ejemplo:** martes 23 a las 11:00 a.m. Doña Rosa le paga $20.000 en efectivo al mototaxi que le trajo un pedido. Lo anota por voz.

### Camino 1 · Por voz (27 → 28 → 31 → 32)

1. En el Home (CU-02 · 15) toca **Registrar gasto**.
2. En **Registrar gasto** (27) toca **Por voz** (la opción destacada).
3. En **Gasto por voz** (28) el micrófono está **Escuchando…**. Dice: *"pagué 20.000 de transporte"*.
4. La tarjeta **Entendí esto** muestra Monto **$20.000** y Categoría **Transporte**. Si la categoría está mal, la toca y la cambia.
   - Si no sabe qué decir, la pantalla le muestra el ejemplo.
5. Toca **Continuar**.
6. En **¿Cómo lo pagaste?** (31) elige **Efectivo de la caja**.
7. Toca **Registrar gasto**.
8. En **Listo** (32) ve "¡Gasto anotado!" con el resumen. Toca **Ir al inicio** o **Registrar otro gasto** (vuelve a 27).

### Camino 2 · A mano (27 → 29 → 31 → 32)

1. En 27 toca **A mano**.
2. En **Gasto manual** (29) escribe **$20.000** con el teclado, elige **Transporte** y, si quiere, escribe una nota ("mototaxi pedido Don Carlos").
3. Toca **Continuar** y sigue igual que el camino 1 desde el paso 6.

### Camino 3 · Foto del recibo (27 → 30 → 31 → 32)

Variante: llega la factura de Distribuidora El Sol por $184.000 y Doña Rosa queda debiendo.

1. En 27 toca **Foto del recibo**.
2. En **Foto del recibo** (30) encuadra la factura. La tarjeta **Leímos esto** muestra Proveedor **Distribuidora El Sol**, Monto **$184.000** y Categoría sugerida **Mercancía**. Puede corregir cualquier dato.
3. Toca **Continuar**.
4. En **¿Cómo lo pagaste?** (31) elige **Quedé debiendo** y en **¿Cuándo tienes que pagar?** elige **En 8 días**.
5. Toca **Registrar gasto**.
6. En **Listo** (32) ve Pago "Quedé debiendo", "Pagar antes de 3 de octubre" y la alerta **Sumamos 24 productos · Ver en tu inventario**, que lleva a Mi inventario (CU-08 · 41).

### Atajo · Gastos frecuentes (27)

Los chips de "Gastos frecuentes" (Transporte, Servicios, Arriendo, Mercancía, Otro) aparecen en 27 como atajo de categoría (ver Preguntas abiertas).

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Eligiendo cómo anotar | 27 | "Por voz" destacada con borde verde. |
| Escuchando y entendido | 28 | Botón de voz con halo, "Escuchando…" y tarjeta "Entendí esto". |
| Monto escrito a mano | 29 | Monto grande arriba, teclado y categoría elegida. |
| Recibo leído | 30 | Tarjeta "Leímos esto · puedes corregirlo". |
| Pago "Quedé debiendo" | 31 | Aparece "¿Cuándo tienes que pagar?" con plazos. |
| Gasto anotado | 32 | Check, resumen y siguiente paso. |
| Gasto de mercancía | 30, 32 | Nota que manda a Llegó mercancía; alerta "Sumamos 24 productos". |

**Estados sin pantalla en Figma:** voz que no entendió el monto o la categoría, foto ilegible, monto en $0 (botón deshabilitado), pago en efectivo mayor a lo que hay en caja, gasto sin caja abierta, resumen de 32 cuando se pagó en efectivo o transferencia (sin "Pagar antes de"), error al guardar.

## Qué pasa después

- **Pagado con efectivo de la caja:** suma a "Gastos en efectivo" y baja el efectivo esperado (CU-03 · 17 y 18). En el Home cambia el "Efectivo esperado" de la fila "Caja del día"; "Vendido hoy" no cambia.
- **Pagado con transferencia:** queda registrado como gasto, pero no toca el efectivo de la caja.
- **Quedé debiendo:** se guarda como cuenta por pagar con fecha límite. No sale plata de la caja.
- **En todos los casos:** aparece en Mi cuaderno (CU-06 · 33) como "Gasto · Mercancía · 9:50 a.m. · Quedé debiendo · −$184.000", con quién lo anotó, y cuenta en "Salió". En Caja cerrada (CU-03 · 19) suma a "Gastos".
- **Gasto de mercancía (32):** según la pantalla, suma productos al inventario (CU-08 · 41). Ver la contradicción en Preguntas abiertas.

## Datos que usa

**Lee:** turno abierto (quién anota) · categorías de gasto · proveedores conocidos (para reconocer "Distribuidora El Sol").

**Guarda**

| Registro | Campos |
|---|---|
| Gasto | id · tienda · turno · quién lo anotó · fecha y hora · monto · categoría (transporte, servicios, arriendo, mercancía, otro) · nota (opcional) · proveedor (opcional) · canal (voz, manual, foto) · lo que se dijo o se leyó · medio de pago (efectivo, transferencia, quedé debiendo) · foto del recibo (opcional) |
| Cuenta por pagar (si quedó debiendo) | gasto · proveedor · monto · plazo (próxima visita, 8 días, 15 días) · fecha límite · estado (pendiente, pagada) |
| Proveedor (si es nuevo) | id · tienda · nombre |

## Fuera de alcance

- Registrar la llegada de mercancía con cantidades y costos por producto (CU-08 · 41a).
- Corregir o eliminar un gasto ya anotado (CU-06 · 36).
- Pagar una cuenta por pagar más adelante: no hay pantalla.

## Preguntas abiertas

1. **Mercancía: ¿gasto o Llegó mercancía?** 30 dice "¿Es mercancía para vender? Anótala en Inventario › Llegó mercancía", pero 31 y 32 la registran como gasto y además "Sumamos 24 productos". 41a dice que la mercancía "no cuenta como gasto del día". El Brief dice que un gasto es plata que sale *sin* que entre mercancía. Hay que decidir por dónde se anota la mercancía (auditoría, pantallas 30–32 y 41a).
2. **¿De dónde salen los 24 productos de 32?** La foto del recibo (30) solo lee proveedor, monto y categoría, no productos ni cantidades.
3. **Cuentas por pagar.** "Quedé debiendo" guarda una cuenta por pagar, pero ninguna pantalla las muestra ni deja pagarlas. ¿Dónde se ven? ¿Se avisa cuando se acerca la fecha?
4. **Fecha límite.** Con "En 8 días" desde el martes 23 de septiembre, la fecha sería el 1 de octubre, pero 32 dice "3 de octubre".
5. **Gastos frecuentes.** ¿Tocar un chip de 27 abre el gasto manual (29) con esa categoría ya elegida?
6. **Botón de voz en 28.** Dice "Escuchando…" mientras la tarjeta ya muestra "Entendí esto": debería estar en reposo o decir "Listo" (auditoría).
7. **Nota en voz y foto.** Solo 29 tiene "Nota (opcional)". ¿Se puede agregar nota en 28 y 30?
8. **Gastos personales.** El Brief señala el riesgo de que el tendero no quiera anotar lo que saca para la casa. ¿Hace falta una categoría "Retiro" o "Casa"? Hoy solo existe "Otro".
9. **Íconos de color.** La cámara de "Foto del recibo" (27) está en naranja; "Quedé debiendo" (31) usa un avatar con "D"; la alerta de 32 usa el triángulo de aviso en vez de `circle-check` (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 27 a 32 de "📱 Diseño v3 · propuesta". |
