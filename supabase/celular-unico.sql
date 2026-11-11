-- Tiendy · un celular, una tienda
--
-- Se corre una vez sobre la base que ya existe (SQL Editor → pegar → Run).
-- Se puede correr más de una vez.
--
-- Cada tienda se registra con un solo celular y con ese mismo número se inicia
-- sesión. Esta regla hace que la base rechace una segunda tienda con un celular
-- que ya está registrado (la app avisa y lleva a iniciar sesión).
--
-- Si falla con "could not create unique index", es que ya hay dos tiendas con el
-- mismo celular: hay que borrar o cambiar una de ellas antes de correrlo.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tienda_celular_key'
  ) then
    alter table public.tienda add constraint tienda_celular_key unique (celular);
  end if;
end $$;
