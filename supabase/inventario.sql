-- Tiendy · la base lleva las unidades del inventario
--
-- Se corre después de sincronizar.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez.
--
-- Antes, cada celular mandaba cuántas unidades le quedaban a cada producto
-- ("quedan 9"). Si dos celulares de la misma tienda vendían casi al tiempo, el
-- último pisaba al otro y el inventario quedaba mal. Ahora la base suma y resta
-- sola, con cada movimiento:
--
-- · Producto vendido (venta_productos): resta la cantidad, si la venta está anotada.
-- · Venta deshecha (22) o eliminada (36): devuelve lo que se había restado.
-- · Mercancía que llegó (entrada_productos): suma la cantidad y deja el costo nuevo.
--   Si estaba en negativo, cuenta desde 0.
--
-- El conteo a mano (42, Ver y editar producto) sigue escribiendo las unidades
-- directamente: es el número que la persona contó en el estante.
--
-- Vender de más: se puede vender aunque el inventario diga agotado (había en el
-- estante sin anotar). Las unidades quedan en negativo (−2 = vendiste 2 que no
-- estaban anotadas) y la app lo muestra en naranja. Cuando llega mercancía se
-- cuenta desde 0 (lo de más ya se vendió) y el conteo a mano (42) pone el número
-- que se contó.
--
-- Si ya habías corrido este archivo, córrelo otra vez: quita la regla que no
-- dejaba unidades negativas y cambia las dos funciones.
--
-- Lo que ya está en la base no se vuelve a contar: esto solo aplica a lo nuevo.

begin;

-- Las unidades pueden quedar en negativo (vender de más)
do $$
declare
  regla text;
begin
  for regla in
    select conname from pg_constraint
    where conrelid = 'public.productos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%unidades >= 0%'
  loop
    execute format('alter table public.productos drop constraint %I', regla);
  end loop;
end $$;

-- Vendido: resta, solo si la venta cuenta (una venta que sube ya deshecha no resta).
-- Puede quedar en negativo: se vendió lo que había en el estante sin anotar
create or replace function public.restar_vendido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from ventas where id = new.venta_id and estado = 'anotada') then
    update productos
      set unidades = unidades - new.cantidad
      where id = new.producto_id;
  end if;
  return new;
end;
$$;

drop trigger if exists restar_vendido on public.venta_productos;
create trigger restar_vendido
  after insert on public.venta_productos
  for each row execute function public.restar_vendido();

-- Deshecha o eliminada: lo vendido vuelve al estante
create or replace function public.devolver_vendido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.estado = 'anotada' and new.estado <> 'anotada' then
    update productos p
      set unidades = p.unidades + l.cantidad
      from (
        select producto_id, sum(cantidad) as cantidad
        from venta_productos
        where venta_id = new.id
        group by producto_id
      ) l
      where p.id = l.producto_id;
  end if;
  return new;
end;
$$;

drop trigger if exists devolver_vendido on public.ventas;
create trigger devolver_vendido
  after update of estado on public.ventas
  for each row execute function public.devolver_vendido();

-- Llegó mercancía: suma y deja el costo de esta compra. Si estaba en negativo
-- (vendido de más), cuenta desde 0
create or replace function public.sumar_llegada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update productos
    set unidades = greatest(0, unidades) + new.cantidad,
        costo = new.costo_unitario
    where id = new.producto_id;
  return new;
end;
$$;

drop trigger if exists sumar_llegada on public.entrada_productos;
create trigger sumar_llegada
  after insert on public.entrada_productos
  for each row execute function public.sumar_llegada();

-- Las funciones solo las usan los triggers: nadie las llama desde afuera
revoke execute on function public.restar_vendido() from public, anon, authenticated;
revoke execute on function public.devolver_vendido() from public, anon, authenticated;
revoke execute on function public.sumar_llegada() from public, anon, authenticated;

-- La app pregunta esto al abrir: si existe, deja de mandar las unidades después
-- de vender o de recibir mercancía (si no, las sigue mandando como antes)
create or replace function public.inventario_por_movimientos()
returns boolean
language sql
stable
as $$ select true $$;

grant execute on function public.inventario_por_movimientos() to anon, authenticated;

commit;
