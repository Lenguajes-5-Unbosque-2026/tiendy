# specs

Una carpeta por caso de uso (CU) con su `spec.md`. Más adelante cada carpeta tendrá también `plan.md` y `tareas.md`. La plantilla está en [`_plantilla.md`](_plantilla.md).

Las specs describen las pantallas de la página "📱 Diseño v3 · propuesta" de Figma, exportadas en `design/flujos/`. El flujo core es **CU-04 · Vender**; su spec sirvió de modelo para las demás.

## 1. Flujos

| CU | Carpeta | Pantallas | Qué hace |
|---|---|---|---|
| CU-01 | [`CU-01-registro/`](CU-01-registro/spec.md) | 01–06 | Crea la cuenta de la dueña con su celular y un código por SMS, y le pone nombre a la tienda. |
| CU-02 | [`CU-02-home-y-carga/`](CU-02-home-y-carga/spec.md) | 09, 09a, 10–13, 15 | Muestra cómo va el día y da acceso a todo; carga los productos a mano, por foto o desde un listado. |
| CU-03 | [`CU-03-caja/`](CU-03-caja/spec.md) | 16a, 16, 17–19 | Abre el turno con quién atiende y la base, muestra el efectivo esperado y cierra con la plata contada y la diferencia. |
| CU-04 | [`CU-04-vender/`](CU-04-vender/spec.md) | 20, 20a, 21–23 | Anota una venta tocando, buscando o hablando, con su medio de pago o como fiado a un cliente. **Flujo core.** |
| CU-05 | [`CU-05-gasto/`](CU-05-gasto/spec.md) | 27–32 | Anota una salida de plata por voz, a mano o con foto del recibo, con su categoría y cómo se pagó. |
| CU-06 | [`CU-06-mi-cuaderno/`](CU-06-mi-cuaderno/spec.md) | 33–36 | Lista todo lo anotado, con filtros y turnos; desde el detalle se corrige o elimina un registro. |
| CU-07 | [`CU-07-fiados/`](CU-07-fiados/spec.md) | 37–40 | Muestra quién debe y cuánto, y anota abonos hasta dejar al cliente a paz y salvo. |
| CU-08 | [`CU-08-inventario/`](CU-08-inventario/spec.md) | 41, 41a, 42–44 | Muestra lo que queda, avisa lo que se acaba, sugiere qué pedir y suma la mercancía que llega. |
| CU-09 | [`CU-09-mi-tienda/`](CU-09-mi-tienda/spec.md) | 46, 47 | Datos del negocio, empleados con sus permisos, notificaciones y micrófono. |

## 2. Cómo se conectan

```
CU-01 Registro ──06──▶ CU-02 Home por primera vez (09)
                         │
                         ├─ Abrir caja ──▶ 09a (hoja) ─── o ───▶ CU-03 16a → 16
                         ├─ Cargar productos ──▶ 10 → 11 / 12 / 13
                         ▼
                       Home del día (15)
                         ├─ Vender ──────────────▶ CU-04 (20 → 21 → 22 / 23)
                         ├─ Registrar gasto ─────▶ CU-05 (27 → 28/29/30 → 31 → 32)
                         ├─ Llegó mercancía ─────▶ CU-08 (41a)
                         ├─ Caja del día ────────▶ CU-03 (17 → 18 → 19)
                         └─ Alerta "se acaba" ───▶ CU-08 (43 / 44)
```

| Destino | Se llega desde |
|---|---|
| **CU-01** Registro (01) | Abrir la app sin sesión · "Cerrar sesión" en Mi tienda (46) |
| **CU-02** Home (09 / 15) | Final del registro (06) · pestaña Inicio · "Ir al inicio" (32) · al guardar una venta (22) · al abrir caja (16 / 09a) |
| **CU-02** Cargar productos (10) | Tarjeta "Cargar productos" del Home por primera vez (09) · "Cargar productos" en Vender sin productos (20a) · ¿"+ Agregar" de Mi inventario (41)? |
| **CU-03** Abrir caja (16a / 16 / 09a) | Tarjeta "Abrir caja" del Home por primera vez (09) |
| **CU-03** Caja del día (17) | Fila "Caja del día" del Home (15) · pestaña Caja |
| **CU-04** Vender (20) | Tarjeta "Vender" del Home (09, 15) · botón central de la barra inferior |
| **CU-04** Venta fiada (23) | Chip "Fiado" en la hoja de venta (20, 21) |
| **CU-05** Registrar gasto (27) | Tarjeta "Registrar gasto" del Home (09, 15) · "Registrar otro gasto" (32) |
| **CU-06** Mi cuaderno (33) | "Movimientos de hoy" (17) · "Revisar movimientos" (18) · "Ver el cuaderno del día" (19) |
| **CU-06** Turnos (35) | Chip "Turnos" de Mi cuaderno (33) |
| **CU-07** Fiados (37) | Pestaña Fiados · "Volver a fiados" (40) |
| **CU-08** Mi inventario (41) | Pestaña Inventario · "Sumamos 24 productos" (32) |
| **CU-08** Llegó mercancía (41a) | Tarjeta "Llegó mercancía" del Home (09, 15) · nota de Gasto por foto (30) |
| **CU-08** Por agotarse (43) | Alerta de Mi inventario (41) · ¿alerta del Home (15)? |
| **CU-08** Qué pedir (44) | "Ver sugerencia de compra" (43) · ¿alerta del Home (15)? |
| **CU-09** Mi tienda (46) | **Ninguna pantalla** (ver inconsistencia 1) |
| **CU-09** Empleados (47) | Fila "Empleados" de Mi tienda (46) · ¿"Agregar · Solo la dueña" de ¿Quién atiende? (16a)? |

**Cómo se pasan datos entre flujos:** la venta (CU-04) alimenta la caja (CU-03), el inventario (CU-08), los fiados (CU-07), el cuaderno (CU-06) y el Home (CU-02). El gasto (CU-05) y el abono (CU-07) alimentan la caja y el cuaderno. La llegada de mercancía (CU-08) cambia unidades y costos, y con ellos la ganancia. El turno (CU-03) le pone nombre a todo lo que se anota.

## 3. Inconsistencias entre specs

Cada una está anotada en la spec que corresponde. Ninguna se puede cerrar sin una decisión del equipo o un ajuste en Figma; la columna "Ajuste" dice dónde va.

### Navegación

| # | Inconsistencia | Specs | Ajuste |
|---|---|---|---|
| 1 | **No hay entrada a Mi tienda.** Ninguna pantalla lleva a 46. El kit nuevo dice "desde el Home"; el Home no tiene ese acceso. | CU-02, CU-09 | Figma: agregar el acceso en el Home (15) o en la barra. |
| 2 | **Barra inferior.** Las pantallas y el UI kit nuevo (`design/tiendy-ui-kit.md`) usan Inicio · Fiados · Vender · Inventario · Caja. El CLAUDE.md (§6) dice que la oficial es Inicio · Cuaderno · Fiados · Inventario · Mi tienda y que Vender y Caja no tienen pestaña. | CU-02, CU-04, CU-06, CU-09 | Decisión del equipo y luego actualizar el CLAUDE.md (no se editó en esta ronda). |
| 3 | **Dos pantallas de Abrir caja.** 09a (hoja sin teclado, en CU-02) y 16 (pantalla con teclado, en CU-03) son el mismo paso. Desde 09a no se pasa por "¿Quién atiende?" (16a). | CU-02, CU-03 | Figma: dejar una sola o definir cuándo sale cada una. |
| 4 | **Destino de la alerta del Home.** "Se está acabando la leche · ver sugerencia de compra" puede ir a 43, 44 o 42. | CU-02, CU-08 | Figma: conectar el prototipo. |
| 5 | **Turnos (35) como chip o como pantalla.** En 33 "Turnos" es un chip junto a Hoy, Semana y Mes, pero 35 es otra pantalla con volver. | CU-06 | Figma. |

### Pantallas que se mencionan y no existen

| # | Pantalla que falta | Se menciona en | Ajuste |
|---|---|---|---|
| 6 | Pasos 2 y 3 del registro (07, 08): "Paso 1 de 3" en 06 | CU-01 | Figma: diseñarlos o quitar "Paso 1 de 3". |
| 7 | Corregir un movimiento ("Corregir" en 36) | CU-06, CU-04 | Figma. |
| 8 | Resultado de un abono parcial (39 solo lleva a "paz y salvo", 40) | CU-07 | Figma. |
| 9 | Confirmación después de "Registrar fiado" (23) | CU-04 | Figma. |
| 10 | Cuentas por pagar ("Quedé debiendo" en 31 y 41a) | CU-05, CU-08 | Figma o sacarlo del alcance. |
| 11 | "Pedir a un proveedor" (44) | CU-08 | Figma o quitar el botón. |
| 12 | Detalle del empleado, Notificaciones, Micrófono y Editar tienda (46, 47) | CU-09 | Figma. |
| 13 | Detalle de un turno anterior (filas de 35 con flecha) | CU-06 | Figma. |

### Datos

| # | Inconsistencia | Specs | Ajuste |
|---|---|---|---|
| 14 | **Mercancía: ¿gasto o entrada?** El gasto por foto (30–32) registra mercancía como gasto y suma 24 productos; Llegó mercancía (41a) dice que "no cuenta como gasto del día"; el Brief dice que un gasto es plata que sale *sin* que entre mercancía. | CU-05, CU-08 | Decisión del equipo (recomendación: toda mercancía por 41a, según el Brief) y ajustar 30–32 en Figma. |
| 15 | **Cuentas por pagar que nadie lee.** CU-05 y CU-08 guardan "Quedé debiendo" con fecha, pero ningún flujo las muestra ni las paga. | CU-05, CU-08 | Ver 10. |
| 16 | **Fórmula del efectivo esperado incompleta.** 18 dice "base + ventas en efectivo − gastos en efectivo", pero los abonos en efectivo "entran a la caja" (39, 40) y la mercancía pagada "con efectivo de la caja" (41a) sale de ella. | CU-03, CU-07, CU-08 | Decisión del equipo y actualizar el texto de ayuda de 18. |
| 17 | **Nombre del medio digital.** "Nequi / Daviplata" en la hoja de venta (20, 21); "Transferencia" en Caja (17), filtros (34), abono (39) y gasto (31). | CU-04, CU-03, CU-06, CU-07 | Decisión: un solo valor guardado (`transferencia`) y un solo texto. |
| 18 | **Acuerdo de pago: ¿de cada fiado o del cliente?** 23 lo pide en cada venta fiada; 38 lo muestra como acuerdo del cliente. | CU-04, CU-07 | Decisión del equipo. |
| 19 | **Nombre de la dueña.** El Home ("Hola, Doña Rosa"), 16a y 46 lo muestran, pero el registro (CU-01) no lo pide. Lo mismo con barrio, dirección y horario (46). | CU-01, CU-02, CU-09 | Figma: pedirlo en los pasos 2 y 3 del registro (ver 6). |
| 20 | **Datos que la voz necesita y nadie guarda.** Los alias de productos ("unas papas" → Papas Margarita) y qué productos son ventas rápidas no se cargan en ningún flujo. | CU-04, CU-02 | Decisión: catálogo base con alias (Brief) y reglas de ventas rápidas. |
| 21 | **Costo y cantidad de lo cargado desde el listado.** 13 agrega productos sin costo ni cantidad, pero la ganancia (Home, Caja) y el inventario los necesitan. | CU-02, CU-08 | Figma o regla: pedirlos después. |
| 22 | **Mínimo de cada producto y "crítico/bajo".** 11 guarda "aviso cuando queden 5"; 42 dice "Mínimo 6"; Huevo AA (quedan 6) es "Crítico" en 43 y "bajo" en 41; 43 dice 6 productos y muestra 5. | CU-02, CU-08 | Decisión de la regla y Figma. |
| 23 | **Unidad de venta y de compra.** Huevo AA se vende por unidad ($700, en 20 y 41), se carga como "Huevos AA x30" ($18.500, en 13) y se pide por panal (44). | CU-02, CU-04, CU-08 | Decisión del equipo. |
| 24 | **Permisos del empleado vs. pantallas.** 47 dice que los empleados no ven ganancias, pero el Home (15) y Caja cerrada (19) la muestran sin distinguir quién atiende. | CU-09, CU-02, CU-03 | Figma: versión del empleado. |
| 25 | **"Entró" y "Salió" del cuaderno.** "Entró $405.000" incluye ventas fiadas y "Salió $246.000" incluye un gasto que quedó debiendo: ninguno de los dos es plata que se movió. | CU-06 | Decisión del equipo. |
| 26 | **Signos del abono.** En el cuaderno (33) el abono es "+$20.000"; en el detalle del fiado (38) es "−$20.000" y el fiado es "+". | CU-06, CU-07 | Decisión del equipo (se entiende si 38 habla de la deuda). |
| 27 | **Números que no cuadran en Figma.** En 22, "Vendido hoy" sube a $396.500 pero la Ganancia sigue en $118.000. En 32, "En 8 días" desde el 23 de septiembre da 1 de octubre, no 3. | CU-04, CU-05 | Figma. |

### Documentación

| # | Inconsistencia | Ajuste |
|---|---|---|
| 28 | El CLAUDE.md (§3) todavía nombra `design/Tiendy_UI_kit.md` y `design/Auditoria de pantallas.md`; ahora son `design/tiendy-ui-kit.md` y `design/auditoria-de-pantallas-tiendy.md`. También menciona `data/modelo-datos.md`, que no existe. | Actualizar el CLAUDE.md en la próxima ronda (en esta no se edita). |
| 29 | El CLAUDE.md (§4) no lista las pantallas nuevas 09a (Abrir caja, hoja) y 20a (Vender sin productos). | Igual que 28. |

## 4. Preguntas abiertas

Todas las preguntas de las specs, juntas. El número entre paréntesis es el de la pregunta en su spec. Las que se repiten en varios flujos están una sola vez, en "Transversales".

### Transversales

- Barra inferior oficial y si Vender es botón central (CU-02 11, CU-04 1, CU-06 9, CU-09 1). → Inconsistencia 2.
- Cómo se llega a Mi tienda (CU-02 10, CU-09 1). → Inconsistencia 1.
- Por dónde se anota la mercancía (CU-05 1, CU-08 1). → Inconsistencia 14.
- Qué suma y qué resta el efectivo esperado: abonos, mercancía en efectivo (CU-03 2 y 3, CU-07 8, CU-08 2). → Inconsistencia 16.
- Una o dos versiones de Abrir caja (CU-02 1, CU-03 1). → Inconsistencia 3.
- "Nequi / Daviplata" o "Transferencia" (CU-04 4). → Inconsistencia 17.
- Qué ve y qué puede hacer un empleado: ganancias, corregir, fiar, cerrar el turno de otro (CU-03 7 y 8, CU-06 3, CU-07 9, CU-09 6). → Inconsistencia 24.
- Correcciones visuales de la auditoría: íconos en rojo o naranja, avatares para cosas que no son personas, acciones dentro de buscadores, textos en `texto/sutil` (CU-01 8–9, CU-02 12, CU-03 10–11, CU-04 15, CU-05 6 y 9, CU-06 10, CU-07 10, CU-08 4 y 11, CU-09 9). → `design/auditoria-de-pantallas-tiendy.md`.

### CU-01 · Registro

- ¿Se diseñan los pasos 2 y 3 o se quita "Paso 1 de 3"? (1)
- ¿Dónde se pide el nombre de la dueña? ¿Y barrio, dirección y horario? (2, 3)
- ¿El splash es un carrusel de tres pantallas? (4)
- Si el número ya tiene cuenta, ¿04 lleva directo al Home? (5)
- ¿"Llamarme con el código" se implementa en esta versión? ¿A qué número va el WhatsApp de soporte? (6, 7)

### CU-02 · Home y carga de productos

- ¿Qué muestra "Ayer cerraste con…" el primer día? (2)
- ¿Desde dónde se cargan productos después del primer día? ¿Cuándo deja de ser "primera vez"? (3, 4)
- ¿Con qué cantidad y costo entran los productos del listado? (5)
- ¿Cómo se corrige una fila detectada por foto? ¿"Factura del proveedor" hace lo mismo que en 41a? (6, 7)
- ¿Cuál es la lista fija de categorías? (8)
- ¿A dónde lleva la alerta del Home? (9)

### CU-03 · Caja

- Motivos de la diferencia cuando sobra plata; ¿el motivo es obligatorio? (4)
- ¿Cómo le llega a la dueña el aviso del faltante? (5)
- ¿Cómo funcionan dos turnos por día? (6)

### CU-04 · Vender

- ¿El medio de pago arranca en Efectivo o en el último usado? (2)
- ¿Cómo se ingresa "Paga con" al tocar? ¿Es opcional? (3)
- ¿Quién decide las ventas rápidas? (5)
- ¿Cómo se ve la hoja vacía? ¿Qué pasa si la voz no entiende? (6, 7)
- ¿La cuenta de 3 s se detiene al corregir? ¿Cuánto dura "Deshacer"? (8, 9)
- ¿Qué pasa después de "Registrar fiado"? ¿Cómo se elige y se busca el cliente? (10, 11)
- ¿El acuerdo de pago es del fiado o del cliente? (12) → Inconsistencia 18.
- ¿Se puede vender sin caja abierta o sin unidades? (13, 14)

### CU-05 · Gasto

- ¿De dónde salen los 24 productos de 32? (2)
- ¿Dónde se ven y se pagan las cuentas por pagar? (3) → Inconsistencia 15.
- Fecha límite de 32 (4). → Inconsistencia 27.
- ¿Un chip de "Gastos frecuentes" abre el gasto manual con la categoría elegida? (5)
- ¿Se puede agregar nota por voz y por foto? (7)
- ¿Hace falta una categoría para lo que se saca para la casa? (8)

### CU-06 · Mi cuaderno

- ¿Qué pantalla abre "Corregir"? ¿Hay confirmación al eliminar? (1, 2)
- ¿"Entró" y "Salió" deben ser solo plata real? (4) → Inconsistencia 25.
- ¿Qué abre una fila de Turnos? ¿"Turnos" es filtro o acceso? (5, 6)
- ¿Cómo se definen los turnos "Mañana" y "Tarde"? ¿En qué se diferencian el tipo "Fiados" y el medio "Fiado"? (7, 8)

### CU-07 · Fiados

- ¿Qué pasa después de un abono parcial? (1)
- ¿Cuándo un fiado está "Vencido"? ¿Qué filtra "Esta semana"? (3, 4)
- ¿Los clientes en $0 siguen en la lista? (7)
- Signos del abono en 38 (6). → Inconsistencia 26.

### CU-08 · Inventario

- Regla de crítico, bajo y mínimo (3, 5, 6). → Inconsistencia 22.
- Unidad de venta y de compra (7). → Inconsistencia 23.
- ¿Qué hace "Pedir a un proveedor"? (8)
- ¿Qué abre "+ Agregar"? ¿Se pueden crear productos nuevos en 41a? (9, 10)

### CU-09 · Mi tienda

- ¿Qué pestaña va activa en 46 y 47? (2)
- ¿Qué se puede cambiar de un empleado? (4)
- ¿Nombre corto o completo al atender? ("Andrés" / "Andrés Martínez", "Doña Rosa" / "Rosa Martínez") (5, 7)
- Sin cuenta ni código, ¿cómo se evita que alguien elija el nombre de la dueña? (6)
