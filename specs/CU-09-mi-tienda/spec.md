# Mi tienda

> CU-09 · Pantallas en `design/flujos/Mi tienda/` (en Figma, bloque 9 "Perfil")

## Quién y para qué

**Quién:** la dueña. Es la única que agrega empleados ("Agregar · Solo la dueña", CU-03 · 16a).

**Para qué:** tener a la mano los datos del negocio, decidir quién puede atender y qué puede hacer cada persona, y configurar avisos y micrófono. Los empleados entran sin cuenta ni código: con solo elegir su nombre en el celular de la tienda, todo lo que anoten queda a su nombre.

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 46 | Panel del tendero | Header "Mi tienda" (sin volver). Tarjeta "Tienda Doña Rosa · Tienda de barrio · Kennedy" con "Editar". "Datos del negocio": Dueña Rosa Martínez, Celular +57 300 123 4567, Dirección Cra 78 #38-12, Horario 6:00 a.m. – 9:30 p.m., NIT (opcional) "Agregar". Filas "Empleados · 1 empleado", "Notificaciones · Agotados y fiados vencidos" y "Micrófono · Se activa al tocar · escuchar siempre: apagado". Botón "Cerrar sesión" (tapado por la barra). Barra inferior. |
| 47 | Empleados | Header "Empleados" con volver. "Tus empleados pueden vender, anotar gastos y abrir o cerrar caja. No ven ganancias ni cambian precios." Filas: "Rosa Martínez · Dueña · tú" (avatar oscuro) y "Andrés Martínez · Empleado · puede fiar" con flecha. "Agregar empleado": campo Nombre, ayuda "Entra eligiendo su nombre en el celular de la tienda. No necesita cuenta ni código." y casilla "Puede registrar fiados" (marcada). Botón "Agregar empleado". Barra inferior. |

## Paso a paso

**Caso de ejemplo:** Doña Rosa contrata a su sobrino Andrés Martínez para el turno de la tarde y quiere que pueda fiar a los clientes de confianza.

### Agregar un empleado (46 → 47)

1. Doña Rosa entra a **Mi tienda** (46) (ver Preguntas abiertas: no hay acceso dibujado).
2. Toca **Empleados · 1 empleado**.
3. En **Empleados** (47) ve quién está: ella como **Dueña · tú**.
4. En **Agregar empleado** escribe **Andrés Martínez** y deja marcada **Puede registrar fiados**.
5. Toca **Agregar empleado**. Andrés aparece en la lista como "Empleado · puede fiar".
6. Desde ese momento, Andrés aparece en **¿Quién atiende?** (CU-03 · 16a) y puede abrir su turno eligiendo su nombre.

### Revisar los datos del negocio (46)

1. En **Mi tienda** (46) ve el nombre, el barrio y los datos del negocio.
2. Toca **Editar** para cambiar el nombre o el tipo de tienda, o **Agregar** junto a NIT para agregarlo.
3. Toca **Notificaciones** para elegir qué avisos recibe (agotados y fiados vencidos).
4. Toca **Micrófono** para elegir si escucha solo al tocar o siempre.
5. **Cerrar sesión** sale de la cuenta en ese celular.

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Dato opcional sin llenar | 46 | "NIT (opcional)" con enlace "Agregar". |
| Micrófono solo al tocar | 46 | "Se activa al tocar · escuchar siempre: apagado". |
| Tienda con un empleado | 46, 47 | "1 empleado"; lista con la dueña y Andrés. |
| Empleado que puede fiar | 47 | "Empleado · puede fiar". |
| Agregando empleado | 47 | Campo Nombre y casilla de permiso. |

**Estados sin pantalla en Figma:** editar datos del negocio, pantalla de notificaciones, pantalla de micrófono, detalle o edición de un empleado (la fila de Andrés tiene flecha), desactivar o quitar a un empleado, empleado sin permiso de fiar, confirmación antes de cerrar sesión, tienda sin empleados.

## Qué pasa después

- **Empleado agregado:** aparece en "¿Quién atiende?" (CU-03 · 16a) y en los turnos y movimientos que anote ("Anotó: Andrés", CU-06 · 35 y 36).
- **Permisos de un empleado** (según el texto de 47):
  - Puede vender (CU-04), anotar gastos (CU-05) y abrir o cerrar caja (CU-03).
  - Solo puede fiar (CU-04 · 23) si tiene "Puede registrar fiados".
  - No ve ganancias (Home 15, Caja cerrada 19) ni cambia precios (Inventario 42).
- **Datos del negocio:** el nombre de la tienda aparece en el Home (CU-02 · 09) y "en lo que compartas con clientes" (comprobante de CU-07 · 40, lista de compra de CU-08 · 44).
- **Notificaciones:** activan los avisos de agotados (CU-08) y fiados vencidos (CU-07), y el aviso de faltante al cerrar caja (CU-03 · 18).
- **Micrófono:** define si la voz de Vender (CU-04) y Gasto (CU-05) se activa al tocar o queda escuchando siempre.
- **Cerrar sesión:** vuelve al inicio de sesión (CU-01).

## Datos que usa

**Lee:** tienda (nombre, tipo, barrio, dirección, horario, NIT) · dueña (nombre, celular) · personas de la tienda con su rol y permisos · preferencias de notificaciones y micrófono.

**Guarda**

| Registro | Campos |
|---|---|
| Tienda | nombre · tipo (tienda de barrio) · barrio · dirección · horario de apertura y cierre · NIT (opcional) |
| Persona del mostrador (empleado) | id · tienda · nombre · rol (dueña, empleado) · puede fiar (sí/no) · activo (sí/no) · fecha en que se agregó |
| Preferencias | notificar agotados (sí/no) · notificar fiados vencidos (sí/no) · micrófono (al tocar, siempre) |

## Fuera de alcance

- Crear la cuenta y el nombre de la tienda la primera vez (CU-01).
- Elegir quién atiende al abrir el turno (CU-03 · 16a).
- Suscripción y pagos del plan de pago (el Brief menciona freemium, pero no hay pantallas).
- Varias sedes (fuera de alcance del semestre según el Brief).

## Preguntas abiertas

1. **Cómo se llega a Mi tienda.** Ninguna pantalla muestra la entrada: el Home no tiene acceso y la barra inferior de las pantallas (Inicio · Fiados · Vender · Inventario · Caja) no tiene pestaña. El kit nuevo dice que "Mi tienda se abre desde el Home"; el CLAUDE.md (§6) dice que es una pestaña de la barra. ¿Cuál vale? (auditoría, pantalla 46).
2. **Barra inferior en 46 y 47.** Ninguna pestaña aparece activa. ¿Cuál debería estar activa?
3. **Cerrar sesión tapado.** El botón queda debajo de la barra inferior (auditoría).
4. **Detalle de un empleado.** La fila de Andrés tiene flecha, pero no hay pantalla. ¿Qué se puede cambiar (permiso de fiar, nombre, desactivar)?
5. **Andrés en 16a y 47.** En 16a se llama "Andrés"; en 47 "Andrés Martínez". ¿Se muestra el nombre corto al atender?
6. **Seguridad del empleado.** Sin cuenta ni código, ¿cualquiera con el celular de la tienda puede elegir el nombre de la dueña en 16a?
7. **Nombre "Doña Rosa".** En 16a la dueña aparece como "Doña Rosa" y en 46 y 47 como "Rosa Martínez". ¿Hay un nombre corto o apodo aparte?
8. **Pantallas de Notificaciones, Micrófono y Editar.** Tienen flecha o enlace, pero no tienen pantalla.
9. **Avatares.** Notificaciones y Micrófono usan avatares con letra (N, M); deben ser Ícono en círculo. La casilla "Puede registrar fiados" es un cuadro verde sin check (auditoría).
10. **Nombre del bloque.** En Figma el bloque se llama "Perfil"; el nombre oficial es "Mi tienda" (CLAUDE.md §6).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 46 y 47 de "📱 Diseño v3 · propuesta". |
