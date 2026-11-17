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
--
-- El conteo a mano (42, Ver y editar producto) sigue escribiendo las unidades
-- directamente: es el número que la persona contó en el estante.
--
-- Las unidades nunca quedan negativas (la base no lo permite): si se vende más
-- de lo que había, quedan en 0, como en la app.
--
-- Lo que ya está en la base no se vuelve a contar: esto solo aplica a lo nuevo.

begin;

-- Vendido: resta, solo si la venta cuenta (una venta que sube ya deshecha no resta)
create or replace function public.restar_vendido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from ventas where id = new.venta_id and estado = 'anotada') then
    update productos
      set unidades = greatest(0, unidades - new.cantidad)
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

-- Llegó mercancía: suma y deja el costo de esta compra
create or replace function public.sumar_llegada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update productos
    set unidades = unidades + new.cantidad,
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
