-- Tiendy · sincronizar la app con la base y filtrar todo por tienda
--
-- Se corre después de gastos.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez.
--
-- Hace tres cosas:
--
-- 1. Cada producto vendido (venta_productos) y cada producto que llegó
--    (entrada_productos) queda con el id de su tienda (tienda_id), como las
--    demás tablas. Así en el Table Editor se puede filtrar todo por tienda.
--    La base lo llena sola con la tienda de la venta o de la entrada: la app no
--    tiene que mandarlo.
--
-- 2. Crea la vista ventas_con_nombres: cada venta con el nombre de la tienda,
--    su celular, quién atendía y qué se vendió, para reconocerla a simple vista.
--
-- 3. Activa el tiempo real (Realtime) en las tablas de la tienda. Cuando algo
--    cambia aquí (desde otro celular o editando a mano en el Table Editor), la
--    app abierta se entera y lo vuelve a leer. Sin esto, la app igual vuelve a
--    leer cada 30 segundos y cada vez que se abre.

begin;

-- ─────────────────────────────────────────────────────────────
-- 1. tienda_id en los productos de cada venta y de cada entrada
-- ─────────────────────────────────────────────────────────────

alter table public.venta_productos add column if not exists tienda_id text references public.tienda (id);
alter table public.entrada_productos add column if not exists tienda_id text references public.tienda (id);

-- Los que ya están toman la tienda de su venta o de su entrada
update public.venta_productos l
  set tienda_id = v.tienda_id
  from public.ventas v
  where v.id = l.venta_id and l.tienda_id is distinct from v.tienda_id;

update public.entrada_productos l
  set tienda_id = e.tienda_id
  from public.entradas_mercancia e
  where e.id = l.entrada_id and l.tienda_id is distinct from e.tienda_id;

-- Los nuevos también (aunque la app no lo mande, o mande otro)
create or replace function public.tienda_de_la_venta()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.tienda_id := (select tienda_id from public.ventas where id = new.venta_id);
  return new;
end;
$$;

create or replace function public.tienda_de_la_entrada()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.tienda_id := (select tienda_id from public.entradas_mercancia where id = new.entrada_id);
  return new;
end;
$$;

drop trigger if exists poner_tienda on public.venta_productos;
create trigger poner_tienda
  before insert or update of venta_id on public.venta_productos
  for each row execute function public.tienda_de_la_venta();

drop trigger if exists poner_tienda on public.entrada_productos;
create trigger poner_tienda
  before insert or update of entrada_id on public.entrada_productos
  for each row execute function public.tienda_de_la_entrada();

alter table public.venta_productos alter column tienda_id set not null;
alter table public.entrada_productos alter column tienda_id set not null;

create index if not exists venta_productos_tienda_id_idx on public.venta_productos (tienda_id);
create index if not exists entrada_productos_tienda_id_idx on public.entrada_productos (tienda_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Ventas con nombres, para leerlas en el Table Editor
-- ─────────────────────────────────────────────────────────────
-- En las tablas solo salen ids (t-179…, pe-179…). Esta vista muestra cada venta
-- con el nombre y el celular de la tienda, quién atendía y qué se vendió.
-- Se filtra por tienda_nombre, tienda_celular o atendio. Solo se lee.

create or replace view public.ventas_con_nombres
with (security_invoker = true) as
select
  v.id,
  v.fecha_hora at time zone 'America/Bogota' as fecha_hora_colombia,
  t.id         as tienda_id,
  t.nombre     as tienda_nombre,
  t.celular    as tienda_celular,
  p.nombre     as atendio,
  v.turno_id,
  v.medio_pago,
  v.total,
  v.estado,
  v.canal,
  (
    select string_agg(l.cantidad || ' × ' || pr.nombre_corto, ', ' order by l.id)
    from public.venta_productos l
    join public.productos pr on pr.id = l.producto_id
    where l.venta_id = v.id
  ) as productos
from public.ventas v
join public.tienda t on t.id = v.tienda_id
join public.personas p on p.id = v.persona_id;

grant select on public.ventas_con_nombres to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. Tiempo real en las tablas de la tienda
-- ─────────────────────────────────────────────────────────────
-- Supabase avisa por la publicación supabase_realtime. Solo se agregan las
-- tablas que todavía no están (agregar una repetida da error).

do $$
declare
  t text;
begin
  foreach t in array array[
    'tienda', 'personas', 'productos', 'turnos', 'ventas', 'venta_productos',
    'gastos', 'entradas_mercancia', 'entrada_productos'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

commit;
