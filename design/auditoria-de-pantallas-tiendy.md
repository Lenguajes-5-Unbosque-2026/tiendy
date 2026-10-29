# Auditoría de pantallas · Tiendy

27 de octubre de 2026

## Resumen

De las 44 pantallas, 15 ya cumplen con el kit nuevo y 29 tienen algo por corregir: 9 de prioridad alta, 11 media y 9 baja. La mayoría de las pantallas cumple la regla de color; lo que falta son detalles de componentes, de flujo y algunos íconos en rojo o naranja que no son avisos.

**Qué se revisó:** las 44 pantallas de la página "pantallas final", comparadas contra el UI kit de Tiendy.

**Criterios:**

- **Color:** rojo y naranja solo para advertencias reales.
- **Componentes:** cada elemento usa el componente correcto (por ejemplo, avatares solo para personas).
- **Textos:** voz de la app, formato de montos y contraste.
- **Estructura y flujo:** header, hoja, barra inferior, botón principal y coherencia entre pantallas.
- **Datos:** que los montos cuadren entre pantallas.

**Prioridad:** alta = rompe la regla de color o tapa una acción; media = usa mal un componente o el flujo se contradice; baja = detalle visual o de contraste.

## La regla de color

El criterio central de la revisión: el verde es la marca y la acción, y el rojo y el naranja solo avisan de algo. Si nada está mal, en la pantalla no hay rojo ni naranja.

- **Verde:** header, botones, enlaces, íconos de acciones, avatares y plata que entra (+$).
- **Negro y gris:** gastos, saldos, títulos de sección y textos de apoyo.
- **Naranja:** solo avisos leves que piden atención pronto, como "Se está acabando la leche" o "Quedan 6".
- **Rojo:** solo problemas que ya pasaron, como "Faltan $5.000", "Vencido hace 5 días" o "Quedan 2".

Prueba rápida: ¿la persona tiene que hacer algo distinto por esto? Si no, va en verde o neutro.

## Problemas que se repiten

Seis problemas explican la mayoría de las correcciones; arreglando cada uno una vez se resuelven varias pantallas a la vez.

| Problema | Pantallas | Cómo arreglarlo |
| --- | --- | --- |
| Íconos de acciones con el dibujo en rojo o naranja: el círculo es verde, pero el trazo del ícono no | 09, 10, 15, 22, 27, 33 | Seleccionar la capa del dibujo de cada ícono y ponerle el trazo `texto/primario` (o `texto/secundario` en los movimientos de gasto) |
| Avatares con letra para cosas que no son personas | 12, 17, 31, 35, 41, 43, 46 | Usar Ícono en círculo: `package` para productos, `list` en "Movimientos de hoy", `clock` en "Quedé debiendo" y en turnos (o la inicial de quien atendió), y un ícono propio para Notificaciones y Micrófono |
| Buscadores con la acción escrita dentro del campo ("Buscar movimiento Filtros", "Buscar producto + Agregar") | 33, 41 | Dejar el campo solo con el placeholder y poner "Filtros" o "+ Agregar" como botón aparte, al lado |
| Fondo distinto detrás de las hojas inferiores: unas muestran el Home oscurecido y otras un verde liso | 09a y 21 (Home oscurecido); 20 y 20a (verde liso) | Usar el Home oscurecido en todas |
| "Por agotarse" en dos colores: naranja en el Home y rojo en Inventario | 15, 41, 43 | "Por agotarse" va en Advertencia (naranja); Peligro (rojo) solo para agotado o crítico. Además, unificar qué es "crítico" y qué es "bajo" |
| Textos de ayuda y legales en `texto/sutil`, que no llega al contraste mínimo | 02, 03, 10, 18, 28 | Pasarlos a `texto/secundario` |

## Revisión por bloque

El bloque de Caja es el más sólido; Home, Gasto e Inventario concentran las correcciones de prioridad alta.

### Bloque 1 · Registro e inicio de sesión

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 01 Splash | Cumple | — |
| 02 Bienvenida | Baja | El texto legal está en `texto/sutil`: pasarlo a `texto/secundario`. |
| 03 Ingresa tu celular | Baja | La ayuda "Sirve para crear cuenta…" y el legal están en `texto/sutil`. |
| 04 Código de verificación | Baja | La casilla activa del código es más ancha (52px) que las demás (48px). |
| 05 No me llegó el código | Cumple | — |
| 06 Nombre de la tienda | Baja | Dice "Paso 1 de 3", pero los pasos 2 y 3 (pantallas 07 y 08) no existen. |

### Bloque 2 · Home y carga de productos

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 09 Home por primera vez | Alta | Íconos de Registrar gasto (rojo), Llegó mercancía y Cargar productos (naranja). Cargar productos repite el ícono `package` de Llegó mercancía: usar `plus` o `list`. |
| 15 Home | Alta | Íconos de Registrar gasto (rojo) y Llegó mercancía (naranja). |
| 09a Abrir caja (hoja) | Media | Es el mismo paso que la 16, pero sin teclado. Decidir cuál versión se queda o cuándo aparece cada una. |
| 10 Cómo cargar productos | Alta | El ícono de la cámara de "Con fotos" está en naranja. |
| 11 Carga manual | Cumple | — |
| 12 Carga por foto | Media | Los productos usan avatar con letra (G, L, P). "Gaseosa Postobón 1,5 L" deja la "L" sola en otra línea. Dice "revisa y corrige", pero las filas no tienen flecha ni lápiz para editar. |
| 13 Carga desde listado | Baja | Las casillas marcadas son un cuadro verde sin check: agregar `check` en blanco. |

### Bloque 3 · Caja

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 16 Abrir caja | Media | Duplica el paso de la 09a (ver arriba). |
| 16a ¿Quién atiende? | Cumple | — |
| 17 Resumen de caja | Media | "Movimientos de hoy" usa un avatar con "C": cambiarlo por Ícono en círculo con `list`. |
| 18 Cierre de caja | Baja | La ayuda "Base + ventas en efectivo…" está en `texto/sutil`. |
| 19 Resultado del cierre | Cumple | — |

### Bloque 4 · Venta

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 20 Vender · hoja de venta | Media | Detrás de la hoja hay un verde liso; usar el Home oscurecido, como en la 21. |
| 20a Vender sin productos | Media | Mismo fondo verde liso que la 20. |
| 21 Vender · lo que dijiste | Cumple | — |
| 22 Venta anotada · deshacer | Alta | Íconos de Registrar gasto y Llegó mercancía como en el Home. Además, "Vendido hoy" subió a $396.500, pero la ganancia sigue en $118.000. |

### Bloque 5 · Gasto

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 27 Registrar gasto | Alta | El ícono de la cámara de "Foto del recibo" está en naranja. |
| 28 Gasto por voz | Baja | Dice "Escuchando…" mientras la tarjeta ya muestra "Entendí esto": el botón debería estar en reposo o decir "Listo". |
| 29 Gasto manual | Cumple | — |
| 30 Gasto por foto | Media | Dice que la mercancía se anota en Inventario › Llegó mercancía, pero la 31 y la 32 la registran como gasto. La 41a también dice que no cuenta como gasto. Decidir por dónde se anota la mercancía. |
| 31 Cómo pagaste el gasto | Media | "Quedé debiendo" usa un avatar con "D": cambiarlo por Ícono en círculo con `clock`. |
| 32 Gasto registrado | Media | "Sumamos 24 productos" lleva el triángulo de alerta sobre una tarjeta de éxito: usar `circle-check`. Depende de la decisión de la 30. |

### Bloque 6 · Mi cuaderno

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 33 Mi cuaderno | Alta | El ícono de "Gasto · Mercancía" está en rojo. El buscador dice "Buscar movimiento Filtros": "Filtros" debe ser un botón aparte. |
| 34 Filtros del cuaderno | Cumple | — |
| 35 Turnos | Media | Los avatares muestran la inicial del día (H, L, D, S, V), no de una persona. Los títulos se parten en dos líneas: acortar a "Dom 21 sep.". |
| 36 Detalle de movimiento | Cumple | — |

### Bloque 8 · Inventario

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 41 Mi inventario | Alta | La alerta "6 productos por agotarse" está en rojo; en el Home el mismo aviso es naranja. El buscador dice "Buscar producto + Agregar". Los productos usan avatares con letra. "Gaseosa Postobón 1,5 L" deja la "L" sola. El detalle "Revisa y pide antes de quedarte sin" queda incompleto. |
| 41a Llegó mercancía | Baja | "+ Agregar producto · o tómale foto a la factura" junta dos acciones en un renglón: separarlas. |
| 42 Ver y editar producto | Cumple | — |
| 43 Alertas de agotado | Media | Huevo AA (quedan 6) sale como "Crítico" aquí y como bajo (naranja) en la 41. El encabezado dice 6 productos, pero la lista muestra 5. Los chips "Crítico" y "Bajo" parecen botones; los productos usan avatares con letra. |
| 44 Sugerencias de compra | Cumple | — |

### Bloque 9 · Perfil

| Pantalla | Prioridad | Qué corregir |
| --- | --- | --- |
| 46 Panel del tendero (Mi tienda) | Alta | El botón "Cerrar sesión" queda tapado por la barra inferior. Notificaciones y Micrófono usan avatares con letra. Ninguna pantalla muestra cómo se llega a Mi tienda: el Home no tiene entrada. El título del bloque dice "Perfil", pero la pantalla se llama "Mi tienda". |

## Plan de corrección

En este orden, las primeras cuatro tareas resuelven las 9 pantallas de prioridad alta.

**Prioridad alta**

- [ ] Pasar a verde o gris el dibujo de los íconos que están en rojo o naranja (09, 10, 15, 22, 27, 33)
- [ ] Unificar "por agotarse" en naranja (Advertencia) y dejar rojo solo para agotado o crítico (15, 41, 43)
- [ ] Separar "Filtros" y "+ Agregar" de los buscadores (33, 41)
- [ ] Subir el botón "Cerrar sesión" para que no lo tape la barra inferior y definir cómo se llega a Mi tienda (46)

**Prioridad media**

- [ ] Cambiar los avatares de cosas que no son personas por Ícono en círculo (12, 17, 31, 35, 41, 43, 46)
- [ ] Decidir por dónde se anota la mercancía y ajustar los textos (30, 31, 32, 41a)
- [ ] Poner el Home oscurecido detrás de todas las hojas inferiores (20, 20a)
- [ ] Dejar una sola versión de Abrir caja, o explicar cuándo aparece cada una (09a, 16)
- [ ] Usar `circle-check` en la alerta de éxito "Sumamos 24 productos" (32)
- [ ] Unificar qué es "crítico" y qué es "bajo", y que el número de productos coincida (41, 43)
- [ ] Agregar flecha o lápiz a las filas que se pueden corregir (12)

**Prioridad baja**

- [ ] Pasar ayudas y legales de `texto/sutil` a `texto/secundario` (02, 03, 18, 28)
- [ ] Agregar `check` blanco a las casillas marcadas (13, 47)
- [ ] Igualar el ancho de las casillas del código (04)
- [ ] Crear los pasos 2 y 3 del registro o quitar "Paso 1 de 3" (06)
- [ ] Ajustar los textos que se parten mal (12, 35, 41) y el estado del botón de voz (28)
- [ ] Revisar que la ganancia suba con cada venta (22)

## Pendiente de verificar en Figma

Las capturas no muestran a qué variables están conectadas las pantallas. Las pantallas usan componentes de otro archivo de librería, así que hay que confirmar que tomen sus colores de "Tiendy · Tema".

Para comprobarlo:

1. Selecciona un botón primario en cualquier pantalla.
2. En el panel derecho, mira el relleno.
3. Si dice `fondo/primario` de la colección "Tiendy · Tema", la pantalla está conectada al kit. Si dice `fondo/acento` o solo un código de color, está conectada a otra librería y hay que cambiar la variable.

Mientras las pantallas estén conectadas a otra librería, un cambio en el kit no se reflejará en ellas.
