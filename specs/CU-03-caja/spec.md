# Caja

> CU-03 · Pantallas en `design/flujos/Caja/`

## Quién y para qué

**Quién:** la persona que empieza o termina el turno en el mostrador: la dueña o un empleado. La dueña también revisa la caja del turno de otro desde su celular.

**Para qué:** que cada turno arranque y cierre con la plata contada y con nombre. Al abrir, se elige quién atiende y con cuánta base se empieza. Durante el día se ve cuánto efectivo debería haber. Al cerrar, se cuenta el efectivo y la diferencia queda registrada a nombre de ese turno y esa persona. Es lo que sostiene el hábito de anotar (propuesta de valor secundaria y segunda hipótesis del Brief).

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 16a | ¿Quién atiende? | Header "¿Quién atiende?" con volver. "Elige tu nombre para abrir el turno", "No necesitas cuenta ni contraseña. Todo lo que anotes queda con tu nombre." Tarjetas con avatar: "Doña Rosa · Dueña", "Andrés · Empleado" (elegida, borde verde) y "Agregar · Solo la dueña". Botón "Seguir · contar la base". |
| 16 | Abrir caja | Header "Abrir caja" con volver. "¿Con cuánto efectivo empiezas hoy?", tarjeta "Base del día $80.000 · Ayer cerraste con $76.500", chips $50.000 / $80.000 / $100.000 / Igual que ayer, teclado numérico (1–9, 000, 0, Borrar) y botón "Abrir caja". |
| 17 | Resumen de caja | Header "Caja del día · Abierta 7:02 a.m." con volver. "Efectivo esperado en caja $341.000". Tres tarjetas: Base $80.000, Ventas en efectivo $323.000 (verde), Gastos en efectivo $62.000. "Por medio de pago": Efectivo $323.000, Transferencia $34.000. Fila "Movimientos de hoy · 42 ventas · 3 gastos". Botón "Cerrar caja". Barra inferior con Caja activa. |
| 18 | Cierre de caja | Header "Cerrar caja" con volver. Tarjeta "Debería haber en efectivo $341.000 · Transferencias del día $34.000". "¿Cuánto efectivo contaste?" con ayuda "Base + ventas en efectivo − gastos en efectivo. Cuenta billetes y monedas." Campo con $336.000. Alerta roja "Faltan $5.000 · Revisa si olvidaste anotar algún gasto". "¿Por qué crees que falta? (le avisamos a la dueña)" con chips "Olvidé anotar un gasto" (elegido), "Di mal unas vueltas" y "No sé". Botones "Confirmar cierre" y "Revisar movimientos". |
| 19 | Resultado del cierre | Header "Caja cerrada · Hoy · 7:02 a.m. a 9:15 p.m.". Check de éxito, "Turno cerrado, Doña Rosa". Tarjetas Vendido $385.000, Gastos $62.000, Ganancia del día $118.000 (fondo verde suave) y Diferencia de caja −$5.000 (fondo rojo suave, texto rojo). Botones "Ver el cuaderno del día" y "Finalizar". Barra inferior con Caja activa. |

En el flujo, 16a va antes que 16: el botón de 16a dice "Seguir · contar la base".

## Paso a paso

**Caso de ejemplo:** martes 23. Doña Rosa abre la tienda a las 7:02 a.m. con $80.000 de base y cierra a las 9:15 p.m. Al contar, tiene $336.000 en efectivo: faltan $5.000 porque olvidó anotar un gasto.

### Abrir el turno (16a → 16 → Home)

1. Desde el Home sin caja (CU-02 · 09) toca **Abrir caja**.
2. En **¿Quién atiende?** (16a) toca su tarjeta **Doña Rosa · Dueña**. Toca **Seguir · contar la base**.
   - Si fuera Andrés, tocaría su tarjeta. Él no necesita cuenta ni contraseña.
   - **Agregar** (solo la dueña) suma una persona nueva.
3. En **Abrir caja** (16) cuenta el efectivo con el que arranca. Toca el chip **$80.000**, o lo escribe con el teclado, o toca **Igual que ayer** para repetir la base del último cierre ($76.500).
4. Toca **Abrir caja**. Vuelve al Home del día (CU-02 · 15): "Turno de Doña Rosa · desde 7:02 a.m.".

### Ver la caja durante el día (17)

1. Desde la fila **Caja del día** del Home o la pestaña **Caja** de la barra inferior, llega a **Caja del día** (17).
2. Ve el **efectivo esperado: $341.000** = base $80.000 + ventas en efectivo $323.000 − gastos en efectivo $62.000.
3. Ve las ventas por medio de pago: efectivo $323.000 y transferencia $34.000.
4. Toca **Movimientos de hoy** para ver el detalle en Mi cuaderno (CU-06 · 33).

### Cerrar el turno (17 → 18 → 19)

1. A las 9:15 p.m., en **Caja del día** (17), toca **Cerrar caja**.
2. En **Cerrar caja** (18) ve que **debería haber $341.000** en efectivo, además de $34.000 en transferencias.
3. Cuenta billetes y monedas y escribe **$336.000**.
4. Aparece la alerta **Faltan $5.000 · Revisa si olvidaste anotar algún gasto**.
5. Responde **¿Por qué crees que falta?** con **Olvidé anotar un gasto**. Esa respuesta le llega a la dueña.
   - Si quiere revisar antes de cerrar, toca **Revisar movimientos** (va a Mi cuaderno).
6. Toca **Confirmar cierre**.
7. En **Caja cerrada** (19) ve "Turno cerrado, Doña Rosa", lo vendido ($385.000), los gastos ($62.000), la ganancia del día ($118.000) y la diferencia de caja **−$5.000** en rojo.
8. Toca **Finalizar** (o **Ver el cuaderno del día**, que abre CU-06 · 33).

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Eligiendo quién atiende | 16a | Tarjeta elegida con borde verde. |
| Contando la base | 16 | Monto grande arriba, chips de montos y teclado. |
| Caja abierta | 17 | Resumen del día y botón "Cerrar caja". |
| Cierre con faltante | 18 | Alerta roja "Faltan $X" y pregunta de por qué. |
| Turno cerrado con diferencia negativa | 19 | Tarjeta de diferencia en rojo suave con "−$5.000". |

**Estados sin pantalla en Figma:** cierre que cuadra (diferencia $0), cierre con sobrante ("sobraron $2.000", que sí aparece en Turnos, CU-06 · 35), campo de efectivo contado vacío, base en $0, caja ya abierta por otra persona, segundo turno del día (cambio de turno entre la mañana y la tarde), resumen de caja sin ventas todavía, vista de la caja desde el celular de la dueña cuando atiende un empleado.

## Qué pasa después

- **Al abrir:** empieza un turno con la persona y la base. Todo lo que se anote durante el turno (ventas, gastos) queda con su nombre ("Anotó: Doña Rosa", CU-06 · 36).
- **Al cerrar:**
  - El turno guarda la hora de cierre, el efectivo contado, la diferencia y el motivo elegido.
  - La dueña recibe el motivo del faltante ("le avisamos a la dueña").
  - El turno aparece en Turnos (CU-06 · 35) con su resultado: "caja cuadró", "sobraron $2.000" o "faltaron $3.000" (en rojo).
  - La próxima apertura muestra "Ayer cerraste con $X" e "Igual que ayer" con este cierre.
  - En Mi cuaderno, la apertura y el cierre se pueden filtrar como "Aperturas y cierres" (CU-06 · 34).

**Fórmulas** (de 17, 18 y 19):

- Efectivo esperado = base + ventas en efectivo − gastos en efectivo.
- Diferencia de caja = efectivo contado − efectivo esperado ($336.000 − $341.000 = −$5.000).
- Ganancia del día = vendido − costo de lo vendido.

## Datos que usa

**Lee**

| Dato | Para qué |
|---|---|
| Personas de la tienda (dueña y empleados activos) | Tarjetas de 16a |
| Último cierre: efectivo contado | "Ayer cerraste con $76.500" e "Igual que ayer" |
| Ventas del turno por medio de pago, con su costo | Ventas en efectivo, Transferencia, Vendido, Ganancia |
| Gastos del turno pagados en efectivo | Gastos en efectivo |
| Cantidad de ventas y gastos del turno | "42 ventas · 3 gastos" |

**Guarda**

| Registro | Campos |
|---|---|
| Turno (al abrir) | id · tienda · persona que atiende · fecha · hora de apertura · base |
| Turno (al cerrar) | hora de cierre · efectivo esperado · efectivo contado · diferencia · motivo de la diferencia (olvidé anotar un gasto, di mal unas vueltas, no sé) · estado (abierto, cerrado) |
| Aviso a la dueña | turno · diferencia · motivo |

## Fuera de alcance

- Agregar o editar empleados (CU-09 · 47); aquí solo se elige quién atiende.
- La lista de movimientos y la de turnos (CU-06 · 33 y 35).
- Las ventas y los gastos que alimentan la caja (CU-04 y CU-05).
- La versión en hoja de Abrir caja (CU-02 · 09a).

## Preguntas abiertas

1. **Dos versiones de Abrir caja.** 09a (hoja sin teclado) y 16 (pantalla completa con teclado) son el mismo paso. ¿Cuál se queda? (auditoría).
2. **Pagos al proveedor.** ¿El efectivo esperado tiene en cuenta las ventas cobradas por transferencia que se pagan al proveedor?
3. **Gastos "Quedé debiendo" y mercancía de contado.** ¿La mercancía pagada con "Efectivo de la caja" (CU-08 · 41a) resta del efectivo esperado aunque "no cuenta como gasto del día"?
4. **Motivos de la diferencia.** Los chips de 18 son para un faltante. ¿Cuáles salen si sobra plata? ¿Es obligatorio elegir un motivo?
5. **Aviso a la dueña.** ¿Cómo le llega: notificación en la app, SMS o WhatsApp? (Mi tienda tiene "Notificaciones", CU-09 · 46).
6. **Dos turnos por día.** El Brief permite hasta dos turnos por día y los filtros tienen "Mañana" y "Tarde". ¿Cerrar el turno de la mañana abre de una vez el de la tarde?
7. **Quién puede cerrar.** ¿Un empleado puede cerrar el turno de otra persona? 47 dice que los empleados pueden "abrir o cerrar caja".
8. **Ganancia para empleados.** 47 dice que los empleados "no ven ganancias", pero 19 muestra "Ganancia del día" al cerrar. ¿Se oculta cuando cierra un empleado?
9. **Nombre en 16a y 19.** 16a muestra a Andrés elegido; 19 dice "Turno cerrado, Doña Rosa". Para la spec se tomó a Doña Rosa como ejemplo.
10. **"Movimientos de hoy".** Usa un avatar con "C"; debe ser Ícono en círculo con `list` (auditoría).
11. **Ayuda de 18 en `texto/sutil`.** No cumple contraste; pasar a `texto/secundario` (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 16a, 16, 17, 18 y 19 de "📱 Diseño v3 · propuesta". |
