-- Tiendy · deshace permisos-por-tienda.sql: vuelve a abrir la lectura para todos
--
-- Solo se usa para volver atrás, por ejemplo si se apaga el login por SMS
-- (NEXT_PUBLIC_LOGIN_SMS). Después de este se corren otra vez escritura.sql,
-- cuentas.sql y gastos.sql, que vuelven a abrir la escritura.
--
-- Se puede correr más de una vez.

begin;

do $$
declare
  pol record;
  t text;
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

  foreach t in array array[
    'tienda', 'personas', 'categorias', 'productos', 'listado_sugerido', 'proveedores',
    'turnos', 'ventas', 'venta_productos', 'gastos', 'entradas_mercancia', 'entrada_productos'
  ] loop
    execute format('create policy "Cualquiera puede leer" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

commit;
