-- Tiendy · cada tienda solo ve y cambia lo suyo
--
-- ⚠ Se corre AL FINAL, cuando el login por SMS ya funciona en la app publicada
--   (Twilio configurado en Supabase y NEXT_PUBLIC_LOGIN_SMS=1 en Vercel).
--   Desde que se corre, sin haber verificado el código por SMS no se lee ni se
--   escribe nada: una app sin login por SMS deja de ver los datos.
--
-- Se corre después de inventario.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez.
--
-- Hasta ahora cualquiera con la llave pública podía leer y escribir todas las
-- tiendas ("Cualquiera puede…"). Con esto:
--
-- · Quien verificó su celular por SMS (Supabase Auth) solo ve y cambia la tienda
--   que tiene ese celular, y todo lo que tiene su tienda_id.
-- · Solo puede crear una tienda con su propio celular.
-- · Las categorías y el listado sugerido (13) siguen abiertos: son los mismos
--   para todas las tiendas.
-- · Antes de entrar, la app solo puede preguntar si un celular ya tiene tienda
--   (celular_registrado): sí o no, sin ver nada de la tienda.
--
-- El Table Editor del panel de Supabase no cambia: ahí se sigue viendo todo.
--
-- Para volver a abrir todo (por ejemplo, para probar sin SMS), se corre
-- permisos-abiertos.sql y después otra vez escritura.sql, cuentas.sql y gastos.sql.

begin;

-- ─────────────────────────────────────────────────────────────
-- 1. Quién entró
-- ─────────────────────────────────────────────────────────────

-- Solo los dígitos: Supabase guarda "573001234567" y la tienda "+573001234567"
create or replace function public.solo_digitos(texto text)
returns text
language sql
immutable
as $$ select regexp_replace(coalesce(texto, ''), '\D', '', 'g') $$;

-- El celular verificado de quien hace la consulta ('' si no entró)
create or replace function public.mi_celular()
returns text
language sql
stable
as $$ select public.solo_digitos(auth.jwt() ->> 'phone') $$;

-- La tienda de ese celular (null si no entró o no tiene tienda)
create or replace function public.mi_tienda()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from tienda
  where public.mi_celular() <> '' and public.solo_digitos(celular) = public.mi_celular()
  limit 1
$$;

-- Tu celular (03): si un número ya tiene tienda, antes de iniciar sesión
create or replace function public.celular_registrado(cel text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from tienda
    where public.solo_digitos(cel) <> '' and public.solo_digitos(celular) = public.solo_digitos(cel)
  )
$$;

grant execute on function public.mi_tienda() to authenticated;
grant execute on function public.celular_registrado(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Se quitan los permisos de "Cualquiera puede…"
-- ─────────────────────────────────────────────────────────────

do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in (
      'tienda', 'personas', 'categorias', 'productos', 'listado_sugerido', 'proveedores',
      'turnos', 'ventas', 'venta_productos', 'gastos', 'entradas_mercancia', 'entrada_productos'
    )
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Permisos nuevos
-- ─────────────────────────────────────────────────────────────

-- Lo mismo para todas las tiendas: lo lee cualquiera
create policy "Cualquiera puede leer" on public.categorias
  for select to anon, authenticated using (true);
create policy "Cualquiera puede leer" on public.listado_sugerido
  for select to anon, authenticated using (true);

-- La tienda: la ve y la cambia quien tiene su celular; se crea solo con el propio
create policy "Ve su tienda" on public.tienda
  for select to authenticated using (id = public.mi_tienda());
create policy "Crea su tienda con su celular" on public.tienda
  for insert to authenticated
  with check (public.mi_celular() <> '' and public.solo_digitos(celular) = public.mi_celular());
create policy "Cambia su tienda" on public.tienda
  for update to authenticated
  using (id = public.mi_tienda())
  with check (public.solo_digitos(celular) = public.mi_celular());

-- Todo lo que tiene tienda_id: solo lo de su tienda (leer, anotar, cambiar y borrar)
do $$
declare
  t text;
begin
  foreach t in array array[
    'personas', 'productos', 'proveedores', 'turnos', 'ventas', 'venta_productos',
    'gastos', 'entradas_mercancia', 'entrada_productos'
  ] loop
    execute format(
      'create policy "Solo su tienda" on public.%I for all to authenticated
         using (tienda_id = public.mi_tienda())
         with check (tienda_id = public.mi_tienda())',
      t
    );
  end loop;
end $$;

commit;
