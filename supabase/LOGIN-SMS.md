# Prender el login por SMS y cerrar los datos por tienda

Hoy la app acepta cualquier código de 6 dígitos y cualquiera con la llave pública puede leer todas las tiendas. Estos pasos hacen que el código llegue por SMS de verdad y que cada tienda solo vea lo suyo.

**El orden importa.** Si se cierran los permisos (paso 4) antes de que la app publicada use el SMS (paso 3), la app deja de ver los datos.

## 1. Twilio

1. Crea una cuenta en [twilio.com](https://www.twilio.com).
2. Compra un número que pueda enviar SMS a Colombia.
3. En **Messaging → Services**, crea un *Messaging Service* y agrégale ese número como remitente.
4. Anota tres datos: el **Account SID** y el **Auth Token** (están en la página principal de la consola) y el **Messaging Service SID** (empieza por `MG`).

En la cuenta de prueba de Twilio solo llegan SMS a los números que verifiques en la consola. Para que le llegue a cualquier tendero, la cuenta tiene que ser de pago. Cada SMS cuesta unos centavos de dólar.

## 2. Supabase

1. Ve a **Authentication → Sign In / Providers → Phone**.
2. Activa **Enable Phone provider**.
3. En **SMS provider**, elige **Twilio** y pega el Account SID, el Auth Token y el Messaging Service SID.
4. En **Test Phone Numbers and OTPs**, escribe `573001234567=123456`. Así se entra a la tienda de prueba (t01) con el código `123456` sin enviar un SMS real. Puedes agregar más números de prueba, separados por comas.
5. Guarda.

Si quieres, en **Authentication → Rate Limits** puedes ajustar cuántos SMS se envían por hora.

## 3. La app

1. Agrega `NEXT_PUBLIC_LOGIN_SMS=1` en dos lugares:
   - `web/.env.local`, para probar en tu computador;
   - Vercel → el proyecto → **Settings → Environment Variables**.
2. Vuelve a desplegar en Vercel. Las variables `NEXT_PUBLIC_` solo cambian al desplegar de nuevo.
3. Prueba primero con el número de prueba (`300 123 4567` y el código `123456`). Después prueba con tu celular: debe llegar el SMS, un código equivocado debe mostrar el error y "Reenviar código" debe mandar otro.

Al prender el SMS, quien ya tenía la app abierta vuelve a la pantalla de Bienvenida y tiene que entrar con su código. Lo que tenía anotado en el celular no se pierde: se sube después de entrar.

## 4. Cerrar los datos por tienda

Cuando el paso 3 funcione en Vercel, en Supabase ve a **SQL Editor**, pega `supabase/permisos-por-tienda.sql` y dale **Run**.

Después revisa dos cosas:
- **En la app,** entra con una tienda: tiene que ver sus ventas, productos y caja como antes.
- **Con la llave pública,** ya no se debe ver la tabla `tienda` sin entrar. Por ejemplo, abre `https://<tu-proyecto>.supabase.co/rest/v1/tienda?select=id&apikey=<llave pública>` en el navegador: debe responder `[]`.

En el panel de Supabase (Table Editor y la vista `ventas_con_nombres`) se sigue viendo todo.

## Para volver atrás

- **Apagar el SMS:** quita `NEXT_PUBLIC_LOGIN_SMS` (o ponla en `0`) y vuelve a desplegar.
- **Reabrir los permisos:** antes de apagar el SMS, corre `permisos-abiertos.sql` y después otra vez `escritura.sql`, `cuentas.sql` y `gastos.sql`. Si no, la app sin SMS no ve nada.
