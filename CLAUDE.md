# Tiendy

## 1. Qué es el producto

- **Nombre:** Tiendy, en código, textos de la app y documentos.
- **Problema:** en las ~500.000 tiendas de barrio de Colombia casi nada queda registrado (ventas por varios medios de pago, fiados, gastos, mercancía, turnos). Todo vive en la memoria, la caja no cuadra y el tendero pierde el control de su plata.
- **Objetivo:** que el tendero tenga todo su negocio a la mano, en el celular. En cualquier momento puede ver cuánto ha vendido, cuánta plata tiene y por qué medio, cuánto le deben, qué le queda en el estante y cuánto le deja el negocio de verdad. Cada venta registrada alimenta a la vez la caja, el inventario y los fiados. Desde el día uno el registro cubre: ventas y medio de pago · fiados y abonos, con nombre · gastos y salidas de plata, con motivo · entradas de mercancía y su costo · inventario · turnos y cierre de caja, con quién atendía. Detalle en `docs/Brief.md` §2.
- **Usuario:** el tendero de barrio (y sus empleados o familiares en el mostrador), con poca experiencia tecnológica y sin tiempo para parar de atender.
- **Propuesta de valor:** registrar cada venta en menos de tres segundos —hablando, tocando una lista o con una foto— mantiene cuadradas la caja, el inventario y los fiados, sin soltar al cliente.
- **Secundaria:** cada turno abre y cierra con la plata contada, así el tendero sabe qué pasó aunque no estuviera detrás del mostrador.

## 2. Stack

- **Next.js + TypeScript:** pantallas, rutas y lógica de servidor.
- **Tailwind + shadcn/ui:** estilos y componentes; aquí viven los tokens y el kit.
- **Supabase:** base de datos, login, fotos y permisos.
- **Vercel:** despliegue.

## 3. Mapa del repo

| Carpeta | Qué hay |
|---|---|
| `docs/` | Contexto del producto: `Brief.md` (documento de corte 1: problema, objetivo, oportunidad, hipótesis, propuesta de valor, alcance y riesgos), `Guion entrevistas.md` y `Conclusiones de entrevistas.md` (discovery con 6 tenderos; las entrevistas 4 a 6 son simuladas). |
| `design/` | `Tiendy_UI_kit.md` (tokens de color y medidas, tipografía, íconos Lucide, componentes con su equivalente en shadcn/ui y cómo se nombran los tokens en código) y `Auditoria de pantallas.md` (pantallas vs. auditoría v1 y referencias, con inconsistencias por corregir). |
| `design/flujos/` | Pantallas exportadas de Figma (PNG), una carpeta por flujo. |
| `specs/` | Una carpeta por caso de uso (`CU-01-registro/` … `CU-09-mi-tienda/`) con `spec.md`, `plan.md` y `tareas.md`. Todavía no hay ninguna spec escrita. |
| `data/` | Modelo de datos (`modelo-datos.md`, aún no existe). |
| `web/` | Todo el código de la app (Next.js). Se crea en la sesión 2. |
| `.github/` | `CODEOWNERS`. |

**Figma** (archivo Tiendy):
- UI kit: https://www.figma.com/design/bzbPDyDL2y6K6ED0FjBYxX/Tiendy?node-id=3-4
- Pantallas de los flujos ("📱 Diseño v3 · propuesta", aprobada: es el diseño definitivo): https://www.figma.com/design/bzbPDyDL2y6K6ED0FjBYxX/Tiendy?node-id=2048-1528
- Las variables (colecciones "Tema" y "Medidas") vienen de una biblioteca publicada aparte, no del archivo Tiendy.

## 4. Flujos

| CU | Carpeta en `design/flujos/` | Flujo | Pantallas |
|---|---|---|---|
| CU-01 | `Registro e inicio de sesión/` | Registro e inicio de sesión | 01 Splash · 02 Bienvenida · 03 Ingresa tu celular · 04 Código de verificación · 05 No me llegó el código · 06 Nombre de la tienda |
| CU-02 | `Home y carga de productos/` | Home y carga de productos | 09 Home por primera vez · 10 Cómo cargar productos · 11 Carga manual · 12 Carga por foto · 13 Carga desde listado · 15 Home |
| CU-03 | `Caja/` | Caja | 16 Abrir caja · 16a ¿Quién atiende? · 17 Resumen de caja · 18 Cierre de caja · 19 Resultado del cierre |
| CU-04 | `Vender/` | Vender | 20 Vender · hoja de venta · 21 Vender · lo que dijiste · 22 Venta anotada · deshacer · 23 Fiado: elegir cliente (desde la hoja) |
| CU-05 | `Gasto/` | Gasto | 27 Registrar gasto · 28 Gasto por voz · 29 Gasto manual · 30 Gasto por foto · 31 Cómo pagaste el gasto · 32 Gasto registrado |
| CU-06 | `Mi cuaderno/` | Mi cuaderno | 33 Mi cuaderno · 34 Filtros del cuaderno · 35 Turnos · 36 Detalle de movimiento |
| CU-07 | `Fiados/` | Fiados | 37 Lista de fiados · 38 Detalle del fiado · 39 Registrar abono · 40 Deuda saldada |
| CU-08 | `Inventario/` | Inventario | 41 Mi inventario · 41a Llegó mercancía · 42 Ver y editar producto · 43 Alertas de agotado · 44 Sugerencias de compra |
| CU-09 | `Mi tienda/` | Mi tienda | 46 Panel del tendero · 47 Empleados |

Los números que faltan (07, 08, 14, 24, 25, 26, 45) son pantallas de la v1 que se quitaron; se conservan los números para no romper referencias. En los nombres de archivo, `:` y `?` aparecen como `_` porque Windows no los permite.

## 5. Cómo trabajamos

- Construimos por vibe coding, por bloques de pantallas. La referencia principal son las imágenes de design/flujos/.
- Las specs de specs/ son apoyo para entender estados y datos. Si una spec y una pantalla no coinciden, gana la pantalla.
- Alcance del MVP: Inventario de productos (pantalla de lectura), Registrar venta (acción de escritura) y Resumen del día (complemento). No construyas flujos fuera de esta lista salvo que te lo pidamos.
- Mobile-first: todo se diseña para celular.
- Componentes: shadcn/ui según design/componentes.md; los custom se crean como componentes reutilizables.
- Estilos: siempre con los tokens del tema. Nunca valores sueltos.
- Datos: primero de data/mock/; después de Supabase.
- Todo el código vive dentro de web/.

## 6. Decisiones tomadas

- **Diseño definitivo:** la página "📱 Diseño v3 · propuesta" de Figma está aprobada; es la que se implementa.
- **Barra inferior oficial:** Inicio · Fiados · Vender · Inventario · Caja, como en las pantallas de `design/flujos/` y en `design/tiendy-ui-kit.md`. Vender es el círculo central y abre la hoja de venta (20); también se abre desde la tarjeta "Vender" del Home. Mi cuaderno se abre desde Caja y Mi tienda desde el Home (no tienen pestaña).
- **Mi tienda:** es el nombre oficial de la sección que en Figma se llama "Perfil" (bloque 9, pestaña `Activo=Perfil` del kit). En la app el texto visible es "Mi tienda".
- **Colores de estado:** naranja solo para alertas (por agotarse, fiados vencidos, faltante en el cierre de caja); rojo solo para gastos y deudas.
- **Tokens en código:** mismos nombres que en Figma, con `-` en vez de `/` (`--fondo-primario`, `--espacio-4`, `--radio-lg`). Las variables de shadcn/ui apuntan a ellas. Detalle en `design/Tiendy_UI_kit.md`.