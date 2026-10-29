# Datos de prueba

Registros inventados pero realistas para una tienda de barrio en Kennedy (Bogotá). Primero alimentan las pantallas en código y después se cargan tal cual a Supabase.

**Periodo:** del 19 al 23 de septiembre de 2026. El 23 es "hoy", como en Figma: el turno de Doña Rosa está abierto desde las 7:02 a.m.

**Formato:** CSV en UTF-8, separado por comas. Los textos con coma van entre comillas ("Gaseosa Postobón 1,5 L"). La plata va en pesos, sin puntos ni decimales (`11500`). Las fechas van en ISO con la hora de Colombia (`2026-09-23T10:24:00-05:00`). Los sí/no van como `true` / `false`.

## Archivos

| Archivo | Registros | Qué es | Pantallas |
|---|---|---|---|
| `tienda.csv` | 1 | La tienda | 06, 09, 46 |
| `personas.csv` | 4 | Quienes atienden: la dueña y los empleados | 16a, 47 |
| `categorias.csv` | 6 | Categorías de productos | 11, 13, 41 |
| `productos.csv` | 40 | Inventario de la tienda | 13, 20, 41, 42, 43, 44 |
| `proveedores.csv` | 6 | Proveedores | 30, 41a |
| `turnos.csv` | 8 | Aperturas y cierres de caja | 16, 17, 18, 19, 35 |
| `ventas.csv` | 49 | Ventas | 20, 21, 22, 33, 36 |
| `venta_productos.csv` | 91 | Los productos de cada venta | 20, 36 |
| `gastos.csv` | 20 | Gastos y salidas de plata | 27–32, 33 |
| `entradas_mercancia.csv` | 3 | Mercancía que llegó | 41a |
| `entrada_productos.csv` | 7 | Los productos de cada entrada | 41a |

## Cómo se relacionan

Cada registro tiene un `id`. Cuando uno pertenece a otro, lleva una columna con el id del otro.

```
tienda ─┬─ personas ─── turnos ─┬─ ventas ── venta_productos ── productos ── categorias
        │                       ├─ gastos ──────────────────── proveedores
        │                       └─ entradas_mercancia ── entrada_productos ── productos
        ├─ productos
        └─ proveedores
```

| Columna | Apunta a |
|---|---|
| `*.tienda_id` | `tienda.id` |
| `productos.categoria_id` | `categorias.id` |
| `turnos.persona_id`, `ventas.persona_id`, `gastos.persona_id`, `entradas_mercancia.persona_id` | `personas.id` (quién atendía o anotó) |
| `ventas.turno_id`, `gastos.turno_id`, `entradas_mercancia.turno_id` | `turnos.id` |
| `venta_productos.venta_id` / `.producto_id` | `ventas.id` / `productos.id` |
| `gastos.proveedor_id`, `entradas_mercancia.proveedor_id` | `proveedores.id` (vacío si no aplica) |
| `entrada_productos.entrada_id` / `.producto_id` | `entradas_mercancia.id` / `productos.id` |

**Lo que no se guarda porque se calcula:**
- Vendido y ganancia del día = suma de las ventas, y precio − costo de cada producto vendido.
- Vueltas = `paga_con` − `total`.

## Valores fijos

| Columna | Valores |
|---|---|
| `personas.rol` | `duena`, `empleado` |
| `turnos.franja` | `manana`, `tarde` |
| `turnos.estado` | `abierto`, `cerrado` |
| `turnos.motivo_diferencia` | `olvide_un_gasto`, `di_mal_vueltas`, `no_se` (vacío si cuadró) |
| `ventas.canal` | `toque` (venta rápida), `busqueda`, `voz` |
| `ventas.medio_pago` | `efectivo`, `transferencia` (Nequi, Daviplata o banco) |
| `ventas.estado` | `anotada`, `deshecha` (tocó Deshacer), `eliminada` (desde el cuaderno) |
| `gastos.categoria` | `transporte`, `servicios`, `arriendo`, `mercancia`, `otro` |
| `gastos.canal` | `voz`, `manual`, `foto` |
| `gastos.medio_pago`, `entradas_mercancia.medio_pago` | `efectivo`, `transferencia`, `quede_debiendo` |
| `productos.origen` | `listado`, `manual`, `foto` (cómo se cargó, CU-02) |
| `productos.alias` | Nombres como los dice la gente, separados por `\|` (para la voz) |

## Casos difíciles incluidos

| Caso | Dónde |
|---|---|
| Nombres muy largos | Producto `p31` ("Detergente en polvo Fab Floral bolsa ahorradora 2 kg + 500 g gratis"), persona `pe03`, proveedor `pr05`, nota del gasto `g11` |
| Texto con coma | `p04` "Gaseosa Postobón 1,5 L", nota de `g11` |
| Registros sin foto | 8 productos sin imagen (`p09`, `p12`, `p20`, `p27`, `p34`, `p38`, `p39`, `p40`) y la mayoría de gastos |
| Valores en cero | Productos agotados con 0 unidades (`p39`, `p40`); costo $0 (`p40`, hielo); turno `tu06` con base $0 y sin ventas |
| Dato faltante | `p36` sin costo (cargado desde el listado sugerido, que no pide costo: no se puede calcular su ganancia) |
| Listas vacías | Categoría `c06` Mascotas sin productos; empleada `pe03` sin turnos; proveedor `pr06` sin compras; turno `tu06` sin ventas ni gastos |
| Persona inactiva | `pe04` Brayan, `activo = false` |
| Diferencias de caja | `tu03` faltaron $3.000; `tu04` sobraron $2.000; los demás cuadraron; `tu08` sigue abierto |
| Venta deshecha y eliminada | `v23` (`deshecha`) y `v41` (`eliminada`): no cuentan en vendido ni en caja |
| Gasto grande | `g11` arriendo de $850.000 por transferencia |
| Quedé debiendo | Gastos `g08`, `g15`, `g18` y entradas `e02`, `e03`, con fecha `pagar_antes_de` |

## Decisiones tomadas para armar los datos

Estas salen de preguntas abiertas de las specs (`specs/README.md`). Si el equipo decide otra cosa, hay que ajustar los datos.

- **Efectivo esperado** = base + ventas en efectivo − gastos en efectivo, como dice la pantalla 18. La mercancía pagada en efectivo **no** entran en la fórmula (inconsistencia 16).
- **Medio digital:** se guarda siempre como `transferencia`, aunque en la hoja de venta diga "Nequi / Daviplata" (inconsistencia 17).
- **Mercancía:** existe como categoría de gasto (como en las pantallas 30–32) y también como entrada de mercancía (41a), porque las pantallas tienen las dos (inconsistencia 14).
- **Huevo:** se vende por unidad a $700 (inconsistencia 23).
- **Fechas:** se usan las de Figma (19 a 23 de septiembre de 2026), aunque en el calendario real el 23 de septiembre de 2026 es miércoles, no martes.

## Imágenes

La columna `imagen` dice el nombre exacto del archivo que está en [`imagenes/`](imagenes/). Son 36 fotos libres de Wikimedia Commons; el autor y la licencia de cada una están en [`imagenes/README.md`](imagenes/README.md).
