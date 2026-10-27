# Fiados

> CU-07 · Pantallas en `design/flujos/Fiados/`

## Quién y para qué

**Quién:** la dueña, y los empleados que tienen permiso de fiar (CU-09 · 47), cuando un cliente viene a pagar o cuando quieren saber quién debe.

**Para qué:** saber en todo momento cuánto le deben, quién y desde cuándo, y anotar los abonos para que la deuda baje y la plata entre a la caja. Reemplaza el cuaderno de fiados, donde se pierden deudas.

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 37 | Lista de fiados | Header "Fiados · En total te deben $186.000" (sin volver). Buscador "Buscar cliente". Chips Todos (elegido) / Vencidos / Esta semana. Filas con avatar, nombre, estado y saldo: Don Carlos Pérez "Último abono hace 12 días" $53.500; Doña Marta Gómez "Al día · abonó ayer" (verde) $48.000; Julián (vigilante) "Vencido hace 5 días" (rojo) $37.500; Luz Mery "Paga en quincena" $29.000; Señor Ramírez "Paga fin de mes" $18.000. Barra inferior con Fiados activa. |
| 38 | Detalle del fiado | Header "Don Carlos Pérez · +57 311 456 7788" con volver. "Te debe $53.500 · Acordó pagar en quincena (30 sep.)". Botones "Llamar" y "WhatsApp". "Movimientos": "Fiado · Gaseosa, Papas · Hoy · +$11.500", "Abono en efectivo · 11 sep. · −$20.000" (verde), "Fiado · Mercado semanal · 5 sep. · +$62.000". Botón "Abonar o pagar". Barra inferior. |
| 39 | Registrar abono | Header "Abono · Don Carlos · debe $53.500" con volver. "¿Cuánto te paga? $20.000". Chips Pagó todo / La mitad / $10.000 / $20.000 (elegido). Tarjeta: Deuda actual $53.500, Abono −$20.000, Queda debiendo $33.500. "¿Cómo te paga?" con chips Efectivo (elegido) / Transferencia. "Este pago entra a la caja. No es una venta nueva." Botón "Guardar abono". |
| 40 | Deuda saldada | Header "Listo". Check, "¡Don Carlos quedó a paz y salvo!", "El pago ya está sumado a la caja de hoy. No cuenta como venta nueva." Resumen: Pagó $53.500, Medio Efectivo, Se anotó como "Pago de fiado" (verde), Deuda pendiente $0. Fila "Mandarle comprobante · Por WhatsApp". Botón "Volver a fiados". Barra inferior. |

## Paso a paso

**Caso de ejemplo:** el 30 de septiembre (quincena), Don Carlos Pérez llega a la tienda y paga toda su deuda de $53.500 en efectivo.

### Cobrar un fiado completo (37 → 38 → 39 → 40)

1. Doña Rosa toca la pestaña **Fiados** de la barra inferior. En **Fiados** (37) ve que en total le deben **$186.000**.
2. Busca o toca **Don Carlos Pérez · $53.500**.
3. En **Detalle del fiado** (38) ve que **te debe $53.500**, que acordó pagar en quincena (30 sep.) y sus movimientos: dos fiados y un abono anterior.
4. Toca **Abonar o pagar**.
5. En **Abono** (39) toca el chip **Pagó todo**: el monto pasa a $53.500 y "Queda debiendo" a $0.
6. En **¿Cómo te paga?** deja **Efectivo**.
7. Toca **Guardar abono**.
8. En **Listo** (40) ve "¡Don Carlos quedó a paz y salvo!", con el pago anotado como **Pago de fiado** y la deuda pendiente en **$0**.
9. Si quiere, toca **Mandarle comprobante** para enviárselo por WhatsApp.
10. Toca **Volver a fiados** (37).

### Abono parcial (39)

Si Don Carlos solo paga $20.000: en 39 toca el chip **$20.000** (o **La mitad**, o **$10.000**), ve que **queda debiendo $33.500** y toca **Guardar abono**. Ver Preguntas abiertas: no hay pantalla para después de un abono parcial.

### Ver quién debe (37)

- **Vencidos:** solo los clientes que pasaron la fecha acordada (Julián, "Vencido hace 5 días", en rojo).
- **Esta semana:** los que acordaron pagar esta semana.
- Desde el detalle (38), **Llamar** y **WhatsApp** abren la llamada o el chat con el celular del cliente.

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Cliente al día | 37 | "Al día · abonó ayer" en verde. |
| Cliente con acuerdo de pago | 37 | "Paga en quincena", "Paga fin de mes" en gris. |
| Cliente sin abonos recientes | 37 | "Último abono hace 12 días" en gris (es información, no alerta). |
| Cliente vencido | 37 | "Vencido hace 5 días" en rojo. |
| Abono parcial | 39 | "Queda debiendo $33.500". |
| Deuda saldada | 40 | Celebración "quedó a paz y salvo" y deuda pendiente $0. |

**Estados sin pantalla en Figma:** lista vacía (nadie debe), búsqueda sin resultados, filtro sin resultados, cliente sin celular (¿se ocultan Llamar y WhatsApp?), resultado de un abono parcial, abono mayor que la deuda, abono por transferencia, detalle de un cliente vencido.

## Qué pasa después

- **El abono baja la deuda** del cliente en la lista (37), en el detalle (38) y en el total "En total te deben".
- **Entra a la caja de hoy** como "Pago de fiado", no como venta nueva: no sube "Vendido hoy" (CU-02 · 15). Si fue en efectivo, es plata física en la caja (ver Preguntas abiertas sobre la fórmula de CU-03).
- **Aparece en Mi cuaderno** (CU-06 · 33) como "Abono · Doña Marta · 8:40 a.m. · Transferencia · +$20.000" y suma a "Entró".
- **Si la deuda llega a $0:** el cliente queda a paz y salvo (40).
- **Cómo nace un fiado:** desde una venta con medio de pago "Fiado" (CU-04 · 23). Cada venta fiada suma a la deuda del cliente y aparece en sus movimientos.

**Cómo sale el saldo de 38:** $62.000 (fiado 5 sep.) − $20.000 (abono 11 sep.) + $11.500 (fiado hoy) = $53.500. La suma de los saldos de 37 da $186.000.

## Datos que usa

**Lee**

| Dato | Para qué |
|---|---|
| Clientes: nombre, celular, acuerdo de pago (quincena, fin de mes, esta semana) y su fecha | Lista, detalle, Llamar y WhatsApp |
| Ventas fiadas del cliente: fecha, productos resumidos, total | Movimientos de 38 y saldo |
| Abonos del cliente: fecha, monto, medio | Movimientos de 38, "Último abono hace…" y saldo |
| Fecha de hoy | "Vencido hace 5 días", filtro "Esta semana" |

**Guarda**

| Registro | Campos |
|---|---|
| Abono | id · tienda · cliente · turno · quién lo anotó · fecha y hora · monto · medio de pago (efectivo, transferencia) |

El **saldo del cliente** no se guarda aparte: sale de sumar sus ventas fiadas y restar sus abonos.

## Fuera de alcance

- Crear un fiado: se hace al vender (CU-04 · 23).
- Cobro automático de fiados por WhatsApp (el Brief lo deja fuera de este semestre). Aquí solo se abre el chat y se manda el comprobante a mano.
- Corregir o eliminar un abono (CU-06 · 36).

## Preguntas abiertas

1. **Después de un abono parcial.** 40 solo cubre la deuda saldada. ¿Al guardar un abono parcial se vuelve al detalle (38) con un aviso? No hay pantalla.
2. **Ejemplo de 39 y 40.** 39 muestra un abono de $20.000 y 40 un pago de $53.500. Para la spec se tomaron como dos casos distintos (parcial y total).
3. **Cuándo es "Vencido".** ¿Un fiado se vence el día después de la fecha acordada? ¿Y si el cliente no acordó fecha?
4. **Filtro "Esta semana".** ¿Son los que acordaron pagar esta semana o los que fiaron esta semana?
5. **Acuerdo de pago.** ¿Es uno por cliente (como muestra 38) o uno por cada fiado (como se pide en CU-04 · 23)? ¿Cambia con cada venta fiada nueva?
6. **Signos en 38.** Los fiados van con "+" y los abonos con "−" en verde, al revés que en Mi cuaderno, donde el abono es "+$20.000". ¿Es intencional (desde el punto de vista de la deuda)?
7. **Clientes con deuda en $0.** ¿Siguen en la lista de 37 después de quedar a paz y salvo?
8. **Abono en la fórmula de la caja.** 39 y 40 dicen que el pago "entra a la caja", pero la fórmula del efectivo esperado (CU-03 · 18) no lo suma.
9. **Permiso de fiar.** 47 tiene "Puede registrar fiados". ¿Los empleados sin ese permiso pueden ver esta lista o recibir abonos?
10. **Íconos de color.** Los íconos de "Fiado" en 38 están en naranja. Sugerencia: agregar `phone` y `message-square` a Llamar y WhatsApp (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 37 a 40 de "📱 Diseño v3 · propuesta". |
