# Registro e inicio de sesión

> CU-01 · Pantallas en `design/flujos/Registro e inicio de sesión/`

## Quién y para qué

**Quién:** la dueña o el dueño de la tienda la primera vez que abre Tiendy, o cuando vuelve a entrar desde un celular nuevo. Los empleados **no** pasan por aquí: entran eligiendo su nombre en el celular de la tienda (CU-03 · 16a y CU-09 · 47).

**Para qué:** crear la cuenta de la tienda con solo el número de celular, sin contraseña, y dejarla lista para empezar a vender. El mismo número sirve para recuperar la cuenta.

## Pantallas

| ID | Pantalla | Qué muestra |
|---|---|---|
| 01 | Splash | Logo de Tiendy (tienda con toldo), "Tiendy", "Tu tienda en orden, sin cuaderno", tres puntos de paginación y "Hecho para las tiendas de barrio". |
| 02 | Bienvenida | Foto de un tendero en su mostrador, "Tu tienda en orden, sin cuaderno", "Anota ventas, gastos y fiados con un toque o hablando. Siempre sabrás cuánta plata tienes y qué se te está acabando.", botón "Empezar" y legal "Al continuar aceptas los Términos y la Política de datos." |
| 03 | Ingresa tu celular | Header "Tu celular" con volver. "¿Cuál es tu número?", explicación del SMS, campo "Número de celular" con +57, ayuda "Sirve para crear cuenta o para iniciar sesión.", botón "Enviar código" y el legal. |
| 04 | Código de verificación | Header "Verificación". "Escribe el código", "Lo enviamos por SMS al +57 300 ••• 4567", seis casillas, "Reenviar en 0:42", enlace "No me llegó el código" y botón "Verificar". |
| 05 | No me llegó el código | Header "¿No te llegó?". Tarjeta "Causas comunes" (número mal escrito, sin señal, bandeja de SMS llena). Botones "Reenviar SMS (0:30)", "Llamarme con el código", "Cambiar mi número" y enlace "¿Sigues sin código? Escríbenos por WhatsApp". |
| 06 | Nombre de la tienda | Header "Tu tienda · Paso 1 de 3". "¿Cómo se llama tu tienda?", "Así aparecerá en tus resúmenes y en lo que compartas con clientes.", campo "Nombre de la tienda" y botón "Continuar". |

## Paso a paso

**Caso de ejemplo:** Rosa Martínez instala Tiendy en su celular +57 300 123 4567 para su tienda en Kennedy.

1. Abre la app y ve el **Splash** (01).
2. Pasa a **Bienvenida** (02) y toca **Empezar**.
3. En **Tu celular** (03) escribe **300 123 4567** (el +57 ya está puesto) y toca **Enviar código**.
4. Le llega un SMS. En **Verificación** (04) ve su número enmascarado ("+57 300 ••• 4567") y escribe los seis dígitos. Toca **Verificar**.
   - Si el SMS no llega, espera la cuenta "Reenviar en 0:42" o toca **No me llegó el código** y va a 05.
5. En **¿No te llegó?** (05) puede:
   - **Reenviar SMS** cuando termine la cuenta (0:30) → vuelve a 04.
   - **Llamarme con el código** → recibe una llamada con el código → vuelve a 04.
   - **Cambiar mi número** → vuelve a 03.
   - Escribir por **WhatsApp** a soporte.
6. Como es una cuenta nueva, llega a **Tu tienda · Paso 1 de 3** (06). Escribe **Tienda Doña Rosa** y toca **Continuar**.
7. Termina en el **Home por primera vez** (CU-02 · 09), con el saludo "Hola, Doña Rosa" y "Tienda Doña Rosa".

## Estados

| Estado | Pantalla | Cómo se ve |
|---|---|---|
| Número escrito | 03 | Campo con +57 y el número. |
| Código a medio escribir | 04 | Tres casillas llenas, la cuarta activa con borde verde, las demás vacías. |
| Esperando para reenviar | 04, 05 | Cuenta regresiva ("Reenviar en 0:42", "Reenviar SMS (0:30)"). |
| Código no llegó | 05 | Causas comunes y tres salidas. |

**Estados sin pantalla en Figma:** número inválido o incompleto, código incorrecto, código vencido, demasiados intentos, sin conexión, cuenta que ya existe (inicio de sesión: ¿salta 06 y va directo al Home?), botón "Enviar código" o "Verificar" deshabilitado.

## Qué pasa después

- Queda creada la cuenta de la dueña con su celular y una tienda con el nombre escrito.
- El nombre de la tienda aparece en el Home (09, debajo del saludo) y en Mi tienda (CU-09 · 46).
- La dueña aparece como primera persona en "¿Quién atiende?" (CU-03 · 16a) y en Empleados (CU-09 · 47) como "Dueña · tú".
- El siguiente paso que propone el Home es abrir la caja y cargar productos (CU-02).

## Datos que usa

**Lee:** si el número ya tiene cuenta (para decidir entre crear cuenta o iniciar sesión).

**Guarda**

| Registro | Campos |
|---|---|
| Usuario (dueña) | id · celular (+57) · fecha de registro |
| Tienda | id · nombre · dueña (usuario) · fecha de creación |
| Persona del mostrador (la dueña) | id · tienda · nombre · rol = dueña |
| Sesión | la maneja el login por SMS (Supabase Auth con OTP por teléfono) |

Aceptación de Términos y Política de datos: fecha en que la aceptó (implícita al continuar en 02 y 03).

## Fuera de alcance

- Agregar empleados (CU-09 · 47) y elegir quién atiende (CU-03 · 16a).
- Editar los datos de la tienda después (CU-09 · 46).
- Cerrar sesión (botón en CU-09 · 46).
- Contenido de los Términos y la Política de datos.

## Preguntas abiertas

1. **Pasos 2 y 3.** 06 dice "Paso 1 de 3", pero no hay pantallas 07 y 08 (se quitaron de la v1). ¿Se quita "Paso 1 de 3" o se diseñan los pasos que faltan? (auditoría, pantalla 06).
2. **Nombre de la dueña.** El Home saluda "Hola, Doña Rosa" y Mi tienda muestra "Dueña · Rosa Martínez", pero ningún paso del registro pide el nombre de la persona. ¿Dónde se pide?
3. **Barrio, dirección y horario.** Mi tienda (46) los muestra ("Kennedy", "Cra 78 #38-12", "6:00 a.m. – 9:30 p.m."). ¿Se piden en los pasos 2 y 3 o solo se editan después?
4. **Splash con puntos.** 01 tiene tres puntos de paginación. ¿Hay un carrusel de bienvenida de tres pantallas o solo dura unos segundos?
5. **Inicio de sesión.** Si el número ya tiene cuenta, ¿04 lleva directo al Home (15) y se salta 06?
6. **Llamada con el código.** ¿Es un servicio que se va a implementar en esta versión o queda solo el SMS?
7. **Soporte por WhatsApp.** ¿A qué número va el enlace de 05?
8. **Contraste.** La ayuda de 03 y el legal de 02 y 03 están en `texto/sutil`, que no cumple contraste: pasarlos a `texto/secundario` (auditoría).
9. **Casillas del código.** La casilla activa de 04 es más ancha (52px) que las demás (48px) (auditoría).

## Cambios

| Fecha | Cambio |
|---|---|
| 27-10-2026 | Primera versión, a partir de las pantallas 01 a 06 de "📱 Diseño v3 · propuesta". |
