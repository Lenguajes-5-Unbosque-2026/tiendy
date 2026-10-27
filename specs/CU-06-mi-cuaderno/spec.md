# Mi cuaderno

> CU-06 · Pantallas en `design/flujos/Mi cuaderno/`

## Quién y para qué

**Quién:** sobre todo la dueña, cuando quiere saber qué pasó en el negocio (aunque no estuviera en el mostrador). También quien cierra la caja y necesita revisar movimientos para encontrar un faltante.

**Para qué:** reemplazar el cuaderno de papel. Reúne en una sola lista todo lo que se anotó (ventas, gastos, fiados, abonos, aperturas y cierres de caja), con hora, medio de pago y quién lo anotó. Desde aquí se corrige o se elimina un registro mal anotado, y se ve el resultado de cada turno.

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 33 | Mi cuaderno | Header "Mi cuaderno" (sin volver). Chips Hoy (elegido) / Semana / Mes / Turnos. Tarjetas "Entró $405.000" (verde) y "Salió $246.000". Buscador "Buscar movimiento" con "Filtros". Grupo "Hoy, martes 23" con movimientos: "Venta · Gaseosa, Papas · 10:24 a.m. · Fiado · Don Carlos · +$11.500", "Gasto · Mercancía · 9:50 a.m. · Quedé debiendo · −$184.000", "Abono · Doña Marta · 8:40 a.m. · Transferencia · +$20.000", "Venta · Pan ×4, Leche · 8:12 a.m. · Efectivo · +$5.900". Barra inferior con Caja activa. |
| 34 | Filtros del cuaderno | Header "Filtrar" con volver. Tipo de movimiento: Todo, Ventas, Gastos, Fiados, Abonos, Aperturas y cierres (Ventas y Fiados elegidos). Medio de pago: Efectivo, Transferencia (elegidos), Fiado, Quedé debiendo. Fechas: Desde 1 sep. 2026, Hasta 23 sep. 2026. Turno: Todos (elegido), Mañana, Tarde. Botones "Ver 128 resultados" y "Limpiar filtros". |
| 35 | Turnos | Header "Turnos" con volver. Chips Esta semana (elegido) / Este mes. Filas: "Hoy · abierto 7:02 a.m. · Base $80.000 · vendido $385.000 · En curso" (borde verde); "Lunes 22 sep. · Doña Rosa · caja cuadró · +$121.000"; "Domingo 21 sep. · Andrés · sobraron $2.000 · +$64.000"; "Sábado 20 sep. · Doña Rosa · faltaron $3.000 (rojo) · +$142.000"; "Viernes 19 sep. · Doña Rosa · caja cuadró · +$98.000". Barra inferior con Caja activa. |
| 36 | Detalle de movimiento | Header "Detalle" con volver. Tarjeta "Venta · Hoy, 10:24 a.m. · por voz", productos (Gaseosa Postobón 1,5 L × 2 $9.000, Papas Margarita × 1 $2.500), Total $11.500, Pago Fiado, Cliente Don Carlos Pérez, Anotó Doña Rosa. Texto "Si eliminas esta venta, los productos vuelven al inventario." Botones "Corregir" y "Eliminar registro". |

## Paso a paso

**Caso de ejemplo:** martes 23 en la noche. Doña Rosa revisa el cuaderno y ve que la venta fiada a Don Carlos de las 10:24 a.m. quedó con 2 gaseosas, pero fue 1. La corrige.

### Revisar el día (33)

1. Llega a **Mi cuaderno** (33) desde la Caja: la fila **Movimientos de hoy** (CU-03 · 17), **Revisar movimientos** (18) o **Ver el cuaderno del día** (19).
2. Con **Hoy** elegido, ve que **entró $405.000** y **salió $246.000**, y la lista de movimientos del día, del más reciente al más antiguo.
3. Cambia a **Semana** o **Mes** para ver otros periodos.
4. Escribe en **Buscar movimiento** ("Don Carlos") para encontrar uno.

### Filtrar (33 → 34 → 33)

1. Toca **Filtros**.
2. En **Filtrar** (34) elige Tipo **Ventas** y **Fiados**, Medio de pago **Efectivo** y **Transferencia**, fechas del **1 sep. 2026** al **23 sep. 2026** y Turno **Todos**.
3. El botón muestra cuántos hay: **Ver 128 resultados**. Lo toca y vuelve a 33 con la lista filtrada.
4. **Limpiar filtros** deja todo como al inicio.

### Ver un movimiento y corregirlo (33 → 36)

1. Toca la venta **Venta · Gaseosa, Papas · +$11.500**.
2. En **Detalle** (36) ve que fue **por voz**, a las **10:24 a.m.**, **fiada** a **Don Carlos Pérez** y que la **anotó Doña Rosa**.
3. Toca **Corregir** y deja la gaseosa en 1 (ver Preguntas abiertas: no hay pantalla de corrección).
4. Si la venta no debió existir, toca **Eliminar registro**: los productos vuelven al inventario.

### Ver los turnos (33 → 35)

1. En 33 toca el chip **Turnos**.
2. En **Turnos** (35) ve el turno de hoy **En curso** y los turnos anteriores de la semana: quién atendió, cuánto entró y cómo cerró la caja ("caja cuadró", "sobraron $2.000", "faltaron $3.000" en rojo).
3. Cambia a **Este mes** para ver más atrás.

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Movimientos del día | 33 | Agrupados por día ("Hoy, martes 23"), con ícono según el tipo y monto con signo. |
| Filtros elegidos | 34 | Chips en verde y número de resultados en el botón. |
| Turno en curso | 35 | Fila con borde verde y "En curso". |
| Turno que cuadró | 35 | "caja cuadró" en gris. |
| Turno con sobrante | 35 | "sobraron $2.000" en gris. |
| Turno con faltante | 35 | "faltaron $3.000" en rojo. |
| Detalle de una venta fiada por voz | 36 | Productos, total, pago, cliente, quién anotó y canal. |

**Estados sin pantalla en Figma:** cuaderno vacío (primer día), búsqueda o filtro sin resultados, detalle de un gasto, de un abono y de una apertura o cierre, pantalla de corrección, confirmación antes de eliminar, detalle de un turno anterior, lista con varios días (grupos por fecha en Semana o Mes).

## Qué pasa después

- **Corregir (36):** el movimiento cambia y con él todo lo que alimentó: caja (CU-03), inventario (CU-08), deuda del cliente (CU-07) y los totales del Home (CU-02).
- **Eliminar (36):** el registro deja de contar. En una venta, "los productos vuelven al inventario", baja el vendido y, si era fiada, baja la deuda del cliente.
- **Mirar o filtrar** no cambia ningún dato.

**Cómo salen los totales de 33** (con los valores del ejemplo):

- Entró = ventas del día (incluidas las fiadas) + abonos: $385.000 + $20.000 = $405.000.
- Salió = gastos del día (incluido el que quedó debiendo): $62.000 + $184.000 = $246.000.

## Datos que usa

**Lee**

| Dato | Para qué |
|---|---|
| Ventas con sus productos, medio de pago, cliente, canal, quién anotó y hora | Lista y detalle |
| Gastos con categoría, medio de pago y hora | Lista |
| Abonos con cliente, medio de pago y hora | Lista |
| Turnos: fecha, persona, apertura, cierre, base, vendido, diferencia | Lista de turnos y filtro "Aperturas y cierres" |
| Franja del turno (mañana, tarde) | Filtro "Turno" |

**Guarda**

| Registro | Campos |
|---|---|
| Corrección de un movimiento | los campos que cambian, más quién corrigió y cuándo |
| Eliminación | estado = eliminado, quién lo eliminó y cuándo (no se borra del todo, para que el cierre de caja se pueda explicar) |

**Actualiza:** unidades de los productos (al corregir o eliminar una venta) y lo que debe el cliente (si era fiada).

## Fuera de alcance

- Anotar ventas, gastos y abonos nuevos (CU-04, CU-05, CU-07).
- Abrir y cerrar caja (CU-03); aquí solo se ven los turnos.
- Exportar el cuaderno o enviarlo a un contador: no hay pantalla.

## Preguntas abiertas

1. **Pantalla de corrección.** "Corregir" (36) no tiene pantalla. ¿Abre la hoja de venta (CU-04 · 20) con los datos cargados?
2. **Confirmar antes de eliminar.** ¿Hay confirmación? El kit dice que la confirmación explica la consecuencia; 36 ya la muestra como texto encima de los botones.
3. **Quién puede corregir o eliminar.** ¿Los empleados pueden corregir o eliminar lo que anotaron? ¿Lo de otros?
4. **"Entró" incluye fiados.** Según los números, "Entró $405.000" suma las ventas fiadas, que no son plata que entró. Y "Salió $246.000" suma un gasto que quedó debiendo. ¿Es correcto o "Entró" y "Salió" deben ser solo plata real?
5. **Tocar un turno.** Las filas de 35 tienen flecha. ¿Abren el resumen de esa caja (17) o el resultado del cierre (19)?
6. **Chip "Turnos".** En 33, "Turnos" es un chip junto a Hoy, Semana y Mes, pero abre otra pantalla con volver (35). ¿Es un filtro o un acceso?
7. **Turno "Mañana" y "Tarde".** ¿Se definen por hora o por cada turno que se abre?
8. **Filtro "Fiados" y "Fiado".** Tipo "Fiados" y medio de pago "Fiado" parecen lo mismo. ¿Cuál es la diferencia?
9. **Acceso desde la barra.** 33 y 35 muestran la pestaña Caja activa. El kit nuevo dice que Mi cuaderno se abre desde Caja; el CLAUDE.md (§6) dice que Cuaderno es una pestaña. ¿Cuál vale?
10. **Corrección visual.** "Filtros" va escrito dentro del buscador; debe ser un botón aparte. El ícono de "Gasto · Mercancía" está en rojo. Los avatares de 35 muestran la inicial del día (H, L, D, S, V), no de una persona, y los títulos se parten en dos líneas (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 33 a 36 de "📱 Diseño v3 · propuesta". |
