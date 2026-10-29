# Tiendy — Auditoría y referencias vs. pantallas de la versión final

> Compara tres cosas del archivo de Figma **Tiendy**:
> 1. La **auditoría de las pantallas v1** (bloque "Auditoría y decisiones de UI", página ⚙️Componentes / Ui kit).
> 2. Las **referencias** de la página 🖇️ Recursos (Frames 1 a 9).
> 3. Las **pantallas de la versión final** (página 📱 Diseño · versión final: 49 pantallas en 9 bloques + la Barra inferior de la versión final).
>
> *Nota (20-10-2026):* en Figma no existe una página con ese nombre. Las pantallas de `design/flujos/` salen de la página **"📱 Diseño v3 · propuesta"** (42 pantallas, con el componente "Barra inferior v3"). La página "📱 Diseño" tiene la v2 ("CDUs Tiendy").
>
> **Cómo se revisó:** se leyó la estructura de las 49 pantallas (textos, capas y qué componentes del UI kit usa cada una) y se miraron capturas de 9 pantallas representativas: 02, 10, 15, 18, 20, 28, 33, 37 y 41.
> Lo marcado *(Figma)* está escrito en el archivo; lo marcado *(observado)* es lectura propia de las pantallas.

---

## 1. Resumen

- **La versión final sí resuelve la mayoría de problemas de la v1:** hay componentes reales, los íconos son Lucide y no letras, hay un solo color primario verde, la tipografía es más fuerte y los botones son grandes.
- **Las referencias se notan claramente:** el header verde oscuro con la hoja crema redondeada, los botones píldora, los chips, los íconos en círculo y una barra inferior con un botón central elevado, que es igual a la de HomePlate.
- **Lo que falta:**
  - 4 de los 13 componentes del UI kit nunca se usan como componente; están dibujados a mano en las pantallas.
  - Las reglas de color (naranja solo para alertas, rojo solo para gastos) no se cumplen en varias pantallas.
  - La barra inferior de la versión final no coincide con la del UI kit.

---

## 2. ¿La versión final resuelve los problemas de la v1?

| # | Problema en v1 *(Figma)* | Estado en la versión final | Evidencia en las pantallas *(observado)* |
|---|---|---|---|
| 1 | 47 pantallas sin un solo componente | ⚠️ **Resuelto en parte** | Las pantallas usan componentes del UI kit: Chip de filtro (90 veces), Ícono en círculo (56), Botón (47), Header (40), Avatar (30), Campo de texto (21) y Barra inferior final (20). **Pero** Fila de lista, Tarjeta de monto, Alerta y Botón de voz **no se usan nunca como componente**: hay 108 capas llamadas "Tarjeta" dibujadas a mano. |
| 2 | Íconos reemplazados por letras ($, C, I, F, !) | ✅ **Resuelto** | Ya no hay letras como íconos: hay 43 íconos Lucide sueltos más los que van dentro de Ícono en círculo (lápiz, cámara, lista, billete, alerta, micrófono…). Las letras que quedan (C, M, J, L…) son **Avatares** con la inicial de una persona o producto, que es el uso correcto. |
| 3 | 12 radios y ~25 combinaciones de texto | ✅ **Resuelto en apariencia** | Las tarjetas, los botones y la hoja de contenido se ven consistentes. *No se midieron uno por uno los radios ni los estilos de texto de cada capa.* |
| 4 | Tres colores compitiendo; naranja para todo | ⚠️ **Resuelto en parte** | El morado y el azul desaparecieron y el verde manda. **Pero** el naranja y el rojo todavía se usan fuera de su regla (ver sección 5). |
| 5 | Texto Light de 13–15 px con bajo contraste | ✅ **Resuelto** | Los textos se ven en pesos regular, semibold y bold. Los montos son grandes ($385.000, $11.500, $341.000) y los botones son de 52 px y ocupan todo el ancho ("Anotar venta · $11.500", "Confirmar cierre"). |

---

## 3. Dónde se ve cada referencia en las pantallas de la versión final

| Referencia (Recursos) | Qué se tomó *(Figma)* | Dónde aparece en la versión final *(observado)* |
|---|---|---|
| **1 · Woolworths** | Verde de supermercado | Verde primario en toda la app. Chips de filtro arriba de las listas: **41 Mi inventario** (Todos / Abarrotes / Bebidas / Lácteos / Aseo). Pantalla de filtros completa en **34 Filtros del cuaderno**. |
| **2 · Daily Basket** | Verde de supermercado | Botones píldora verdes de ancho completo en casi todas las pantallas. **Buscador con micrófono** en **20 Vender · hoja de venta** ("Busca un producto" + botón de mic). Botones − / + para la cantidad en **20** y **21**. Login con pantalla de celular y código (**03**, **04**). |
| **3 · Jollofspace** | Acentos naranja/rojo | Naranja en la alerta "Se está acabando la leche" (**15 Home**) y en el ícono de "Llegó mercancía"; rojo en "Registrar gasto" y en los montos negativos de **33 Mi cuaderno** (−$184.000). |
| **4 · Grab** | Verde de supermercado | **Header verde oscuro con decoración** en todas las pantallas (componente Header, 40 usos). Filas con el valor a la derecha: **17 Resumen de caja**, **33 Mi cuaderno**. |
| **5 · HomePlate** | Acentos naranja | **Barra inferior con botón central elevado en círculo**: en la versión final es "Vender", en HomePlate es el botón naranja del medio. También la pestaña activa resaltada y los íconos de línea. Es la referencia que más se nota en la **Barra inferior final**. |
| **6 · Amigo** | (No se menciona en el archivo) | No se nota en la versión final. Su azul se descartó. Lo único parecido: la Home con accesos grandes en tarjeta ("Registrar gasto", "Llegó mercancía"). |
| **7 · Appointment Marketplace** | Estilo limpio, mucho blanco | Fondo crema/blanco con tarjetas blancas. **Ícono en círculo** para opciones: **10 Cómo cargar productos** (lápiz, cámara, lista) y **27 Registrar gasto** (voz, mano, foto). |
| **8 · Foodzzy** | Verde de supermercado | Resumen tipo carrito en **20 Vender** ("Esta venta" con líneas, cantidades y Total). Bloques de totales en **17 Resumen de caja** y **18 Cierre de caja**. |
| **9 · ekilu** | Estilo limpio, mucho blanco | Campos de texto grises simples (**03**, **06**, **11**, **18**). Opciones en pastilla, como los chips "Efectivo / Nequi" en **20**. |
| **Pantallas de comida (Log In, Recommendations, Help Center)** | Header oscuro, hoja blanca redondeada, píldoras, íconos en círculo | Es la estructura base de casi todas las pantallas: header verde oscuro con la **hoja crema redondeada encima** (**10**, **15**, **18**, **28**, **33**, **37**, **41**…). *Estas pantallas no están en Recursos.* |

---

## 4. Lo que no viene de las referencias: viene de las entrevistas

| Decisión en la versión final | Pantallas | De dónde sale |
|---|---|---|
| Registrar por voz | **20 / 21 Vender** ("Te escuché: 'dos gaseosas y unas papas…'"), **28 Gasto por voz** (micrófono grande, "Escuchando…"), **27** ("Di: 'pagué 20.000 de transporte'") | Esperanza y Marleny prefieren la voz. Las referencias solo traían un micrófono pequeño en el buscador; el **botón de voz grande es propio**. |
| Cargar el inventario rápido | **10** (a mano, con fotos o desde un listado, "Recomendado: desde un listado"), **12 Carga por foto**, **13 Carga desde listado** | Gustavo y Jairo: cargar el inventario al principio es la barrera principal. |
| Ayuda presencial | **10**: "Te ayudamos en tu tienda · Vamos y los cargamos por ti · $19.900" | Esperanza y Marleny necesitan que alguien les enseñe. |
| Saber qué se acaba antes de que el cliente lo pida | **15** (alerta de la leche), **43 Alertas de agotado**, **44 Sugerencias de compra** | Rosalba y Marleny se enteran de lo que falta cuando el cliente lo pide. |
| Varias personas atienden la tienda | **16a ¿Quién atiende?**, **35 Turnos**, **47 Empleados** | Herminio y Jairo: el que usa la app puede ser un familiar. |
| Teclado numérico grande para montos | **16 Abrir caja**, **29 Gasto manual** | Propio: uso rápido en el mostrador. |

---

## 5. Inconsistencias para corregir

### Reglas de color *(regla en Figma vs. lo observado)*

La regla del UI kit dice: **"Naranja solo como acento de alerta (por agotarse). Rojo solo para gastos."**

| Pantalla | Qué pasa | Qué dice la regla |
|---|---|---|
| **41 Mi inventario** | La alerta "6 productos por agotarse" y "Quedan 2" están en **rojo**. | Por agotarse debería ir en **naranja** (y así está en **15 Home**). |
| **10 Cómo cargar productos** | "Recomendado: desde un listado, es lo más rápido" en **naranja**. | No es una alerta: debería ir en verde o en gris. |
| **33 Mi cuaderno** | El encabezado de fecha "Hoy, martes 23" en **naranja**. | No es una alerta. |
| **18 Cierre de caja** | "Faltan $5.000" en **rojo**. | **Decidido:** un faltante de caja es alerta y va en **naranja** (ya está en la regla del kit). Hay que cambiar "Faltan $5.000" a naranja en Figma. |
| **41 Mi inventario** | Los avatares de producto en tono **naranja**. | El naranja queda gastado en algo que no es alerta; mejor un tono neutro o verde. |

### Componentes

| Problema | Detalle |
|---|---|
| **Componentes del UI kit sin usar** | **Fila de lista**, **Tarjeta de monto**, **Alerta** y **Botón de voz** existen en el UI kit, pero en las pantallas están **dibujados a mano** (108 capas "Tarjeta"). Es el mismo problema #1 de la v1, ahora en menor escala. Ejemplos: la tarjeta "Vendido hoy" (**15**), la alerta de la leche (**15**), las filas de **37** y **41**, el micrófono de **28**. |
| **Barra inferior distinta** | UI kit: Inicio · Cuaderno · Inventario · Perfil. **Versión final:** Inicio · **Vender** (central) · Inventario · **Caja** (+ "Ninguno"). **Decidido:** la oficial es la del UI kit. Hay que cambiar las pantallas v3 en Figma para que la usen. |
| **Cuaderno y Perfil sin pestaña propia** | En **33 Mi cuaderno** la pestaña activa es "Caja". **46 Panel del tendero** y **47 Empleados** no tienen una pestaña activa clara. Se resuelve con la barra del UI kit, que tiene pestañas Cuaderno y Perfil (que en la app se llama "Mi tienda"). |
| **Barra de estado** | El componente aparece solo en 2 pantallas; en las demás parece venir dentro del Header. Conviene unificarlo. |

### Otros

- **Faltan números en la secuencia de pantallas:** 07, 08, 14, 24, 25, 26 y 45. **Resuelto:** existen en la v1 (página "Casos de uso" de Figma) y se quitaron en la v3. Se conservan los números para no romper las referencias.
  - 07 Activa tu ubicación · 08 Tipo de negocio · 45 Marketplace de proveedores: eliminadas.
  - 14 Carga presencial: eliminada como pantalla; la opción "Te ayudamos en tu tienda" sigue en 10.
  - 24 Cómo te pagan · 26 Venta registrada: *(observado)* sus pasos quedaron dentro de la hoja de venta: el medio de pago en 20 y la confirmación en 22.
- **Nombre:** el archivo y los logos dicen **Tiendy**; las pantallas de la versión final dicen **Tiendi** ("Tiendi · Versión final"). **Decidido: el nombre es Tiendy.** Falta corregirlo en Figma: el rótulo de la página v3, el logotipo del 01 Splash v3, el rótulo de la página v2, los textos del UI kit y las colecciones de la biblioteca de variables.

---

## 6. Pantallas de la versión final revisadas

| Bloque | Pantallas |
|---|---|
| 1 · Registro e inicio de sesión | 01 Splash · 02 Bienvenida · 03 Ingresa tu celular · 04 Código de verificación · 05 No me llegó el código · 06 Nombre de la tienda |
| 2 · Home y carga de productos | 09 Home por primera vez · 10 Cómo cargar productos · 11 Carga manual · 12 Carga por foto · 13 Carga desde listado · 15 Home |
| 3 · Caja | 16a ¿Quién atiende? · 16 Abrir caja · 17 Resumen de caja · 18 Cierre de caja · 19 Resultado del cierre |
| 4 · Venta | 20 Vender · hoja de venta · 21 Vender · lo que dijiste · 22 Venta anotada · deshacer |
| 5 · Gasto | 27 Registrar gasto · 28 Gasto por voz · 29 Gasto manual · 30 Gasto por foto · 31 Cómo pagaste el gasto · 32 Gasto registrado |
| 6 · Mi cuaderno | 33 Mi cuaderno · 34 Filtros del cuaderno · 35 Turnos · 36 Detalle de movimiento |
| 8 · Inventario | 41 Mi inventario · 41a Llegó mercancía · 42 Ver y editar producto · 43 Alertas de agotado · 44 Sugerencias de compra |
| 9 · Perfil | 46 Panel del tendero · 47 Empleados |
| Componentes nuevos de la versión final | Barra inferior final (Inicio · Inventario · Caja · Ninguno) |
