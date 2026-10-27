# Componentes · Tiendy

Cada componente del UI kit (`design/tiendy-ui-kit.md`, sección 7), si existe un equivalente en shadcn/ui o hay que construirlo desde cero, y en qué pantallas aparece. Ordenado de los que más se repiten a los que menos.

**Cómo leer la tabla**

- **shadcn/ui:** el componente de la librería que sirve de base. Se instala con `npx shadcn@latest add <nombre>` y queda en `web/components/ui/`.
- **Trabajo:**
  - **Adaptar:** existe en shadcn; solo se ajustan variantes y tokens.
  - **Componer:** se arma con piezas de shadcn y un poco de código propio.
  - **Desde cero:** no hay nada parecido en shadcn. Son los que más tiempo toman.
- **Pantallas:** IDs de `design/flujos/`. Hay 44 pantallas. Entre paréntesis, las que usan el componente de forma incorrecta según la auditoría.
- **En código:** dónde vive el componente propio de Tiendy (`web/components/tiendy/` o `web/components/layout/`).

## 1. Componentes del UI kit

| # | Componente | shadcn/ui | Trabajo | Pantallas | Cuántas | En código |
|---|---|---|---|---|---|---|
| 1 | **Barra de estado** | — | Ninguno (solo diseño) | Todas menos 20 y 20a | 42 | En código es el área segura del celular (`env(safe-area-inset-top)`) |
| 2 | **Header** (volver, subtítulo) | — | **Desde cero** | 03, 04, 05, 06, 09, 10, 11, 12, 13, 15, 16, 16a, 17, 18, 19, 22, 23, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 41a, 42, 43, 44, 46, 47 | 38 | `layout/AppHeader` (incluye la hoja crema que sube encima) |
| 3 | **Botón** (Primario, Secundario, Borde, Texto, deshabilitado) | `button` | Adaptar | 02, 03, 04, 05, 06, 09a, 11, 12, 13, 16, 16a, 17, 18, 19, 20, 20a, 21, 23, 28, 29, 30, 31, 32, 34, 36, 38, 39, 40, 41a, 42, 43, 44, 46, 47 | 34 | `ui/button` con variantes `default`, `secondary`, `outline` y `ghost`, alto `--alto-boton` y `--radio-full` |
| 4 | **Chip de filtro** (elegido / sin elegir; una o varias respuestas) | `toggle-group` | Adaptar | 09a, 11, 12, 13, 16, 18, 20, 21, 23, 27, 29, 31, 33, 34, 35, 37, 39, 41, 41a, 43 | 20 | `ui/toggle-group` (`type="single"` para una respuesta, `"multiple"` para filtros) |
| 5 | **Fila de lista** (ícono o avatar · título · detalle · valor y/o flecha · elegida) | `card` (base) | **Desde cero** | 10, 12, 13, 15, 17, 23, 27, 31, 33, 35, 37, 38, 40, 41, 43, 44, 46, 47 | 18 | `tiendy/ListItem` |
| 6 | **Barra inferior** (Inicio · Fiados · Vender · Inventario · Caja) | — | **Desde cero** | 09, 15, 17, 19, 22, 32, 33, 35, 37, 38, 40, 41, 41a, 42, 43, 44, 46, 47 | 18 | `layout/BottomNav` |
| 7 | **Ícono en círculo** (M/L · 8 tonos) | — | **Desde cero** (simple) | 09, 10, 15, 18, 19, 20a, 21, 22, 27, 31, 32, 33, 36, 38, 40, 41, 42, 46 | 18 | `tiendy/IconBadge` + `lucide-react` |
| 8 | **Tarjeta de monto** (oscura / clara · compacta · centrada) | `card` | Componer | 09a, 15, 16, 17, 18, 19, 20, 21, 22, 23, 29, 31, 33, 38, 39 | 15 | `tiendy/AmountCard` sobre `ui/card` |
| 9 | **Campo de texto** (vacío / lleno / activo · con ícono · con +57) | `input` + `label` | Adaptar | 03, 11, 13, 18, 20, 23, 29, 33, 34, 37, 41, 41a, 42, 47 | 14 | `ui/input` con alto `--alto-campo` y fondo `--fondo-sutil` |
| 10 | **Avatar** (inicial · Primario / Oscuro / Neutro · M/L) | `avatar` | Adaptar | 16a, 23, 37, 47 (+ mal usado en 12, 17, 31, 35, 41, 43, 46) | 4 (+7) | `ui/avatar` con `AvatarFallback` |
| 11 | **Alerta** (Advertencia / Peligro / Éxito · con flecha) | `alert` | Adaptar | 15, 18, 22, 32, 41 | 5 | `ui/alert` con variantes `advertencia`, `peligro` y `exito` |
| 12 | **Botón de voz** (reposo / escuchando) | — | **Desde cero** | 28 (grande); 20 (botón de micrófono pequeño junto al buscador) | 2 | `tiendy/VoiceButton`. Además necesita la lógica de voz (Web Speech API u otra) |

## 2. Patrones de las pantallas que no están en el kit

Aparecen en las pantallas pero el UI kit no los define como componente. Hay que construirlos igual; conviene agregarlos al kit primero (CLAUDE.md §5).

| # | Patrón | shadcn/ui | Trabajo | Pantallas | Cuántas | En código |
|---|---|---|---|---|---|---|
| 13 | **Tarjeta de detalle** (filas clave–valor: "Monto · $184.000") | `card` + `separator` | Componer | 17, 18, 28, 30, 32, 36, 39, 40, 46 | 9 | `tiendy/DetailCard` |
| 14 | **Opción elegible** (fila o tarjeta con borde verde al elegirla: método de carga, cómo pagaste, cliente, quién atiende) | `radio-group` | Componer | 10, 16a, 23, 27, 31 | 5 | `tiendy/OptionCard` sobre `ui/radio-group` (reusa `ListItem`) |
| 15 | **Selector de cantidad** (− número +) | `button` | **Desde cero** (simple) | 11, 20, 21, 42, 44 | 5 | `tiendy/QuantityStepper` |
| 16 | **Hoja inferior** (sube sobre el Home oscurecido, con agarradera y "Cancelar") | `drawer` | Adaptar | 09a, 20, 20a, 21 | 4 | `ui/drawer` (usa vaul: se cierra deslizando hacia abajo) |
| 17 | **Tarjeta de acción grande** (Abrir caja, Vender, Registrar gasto, Llegó mercancía, Cargar productos) | `card` | Componer | 09, 15, 22 | 3 | `tiendy/ActionCard` (usa `IconBadge` L) |
| 18 | **Pantalla de éxito** (área verde con check grande y título) | — | **Desde cero** (simple) | 19, 32, 40 | 3 | `tiendy/SuccessHero` |
| 19 | **Teclado numérico** (1–9, 000, 0, Borrar) | — | **Desde cero** | 16, 29 | 2 | `tiendy/NumberPad` con `--alto-tecla` |
| 20 | **Área de cámara** (marco punteado, fondo oscuro) | — | **Desde cero** | 12, 30 | 2 | `tiendy/CameraFrame` (usa la cámara del celular con `<input type="file" capture>` o `getUserMedia`) |
| 21 | **Casilla de verificación** | `checkbox` | Adaptar | 13, 47 | 2 | `ui/checkbox` (con el check blanco que pide la auditoría) |
| 22 | **Encabezado de grupo de lista** ("Hoy, martes 23", "Movimientos", "Datos del negocio") | — | Ninguno (texto con estilo `secundario`) | 33, 38, 46 | 3 | Solo estilos |
| 23 | **Tarjeta "Te escuché"** (transcripción de la voz) | `alert` | Componer | 21 | 1 | `tiendy/VoiceTranscript` |
| 24 | **Aviso con Deshacer** ("Venta anotada · $11.500 · Deshacer") | `sonner` | Adaptar | 22 | 1 | `ui/sonner` (`toast` con `action`) |
| 25 | **Código de verificación** (6 casillas) | `input-otp` | Adaptar | 04 | 1 | `ui/input-otp` |
| 26 | **Selector de fecha** ("Desde 1 sep. 2026") | `popover` + `calendar` | Componer | 34 | 1 | Date picker de shadcn |
| 27 | **Gráfica de barras** (ventas de los últimos 7 días) | `chart` (Recharts) | Adaptar | 42 | 1 | `ui/chart` con `--chart-1` y `--chart-2` |
| 28 | **Estado vacío** (ícono, título, texto y botón) | — | **Desde cero** (simple) | 20a | 1 | `tiendy/EmptyState` |
| 29 | **Foto opcional** (área punteada con "+ Foto del producto (opcional)") | — | **Desde cero** (simple) | 11 | 1 | `tiendy/PhotoPicker` |
| 30 | **Splash** (logo, nombre, puntos de paginación) | — | **Desde cero** (simple) | 01 | 1 | Página `app/page.tsx` del inicio |

## 3. Los que más trabajo darán (sesión 4)

Los que quedaron **desde cero**, de más a menos trabajo:

1. **Botón de voz** (12): el componente es simple, pero detrás va el reconocimiento de voz, que es el riesgo técnico más grande del Brief.
2. **Header** (2): la hoja crema que sube sobre el header con `--radio-2xl`, la decoración de círculos y las dos alturas.
3. **Barra inferior** (6): el círculo central de "Vender" que sobresale y la pestaña activa en pastilla.
4. **Fila de lista** (5): muchas combinaciones (ícono o avatar, valor de color, flecha, elegida, detalle en rojo).
5. **Área de cámara** (20): acceso a la cámara del celular y lectura de la foto.
6. **Teclado numérico** (19): formato de plata ("$80.000") mientras se escribe.
7. **Ícono en círculo** (7), **Selector de cantidad** (15), **Pantalla de éxito** (18), **Estado vacío** (28) y **Foto opcional** (29): simples, se hacen rápido.

## 4. Íconos

Todos de `lucide-react` (es el que usa shadcn/ui). Lista completa en el UI kit, sección 8. En la versión 0.460 de Lucide, `funnel` se llama `filter`.

## 5. Notas de la auditoría que afectan a los componentes

- **Avatar** se usa mal en 7 pantallas (12, 17, 31, 35, 41, 43, 46) para cosas que no son personas: en código esas filas usan **Ícono en círculo**.
- **Fila de lista, Tarjeta de monto, Alerta y Botón de voz** estaban dibujados a mano en Figma, no como componente. En código sí se construyen como componentes.
- Los buscadores de 33 y 41 tienen "Filtros" y "+ Agregar" escritos dentro: en código van como botón aparte, junto al **Campo de texto**.
- La **Barra inferior** de las pantallas y la del UI kit nuevo coinciden (Inicio · Fiados · Vender · Inventario · Caja), pero el CLAUDE.md (§6) dice otra cosa. Ver `specs/README.md`, inconsistencia 2.
