-- Tiendy · gastos y entradas de mercancía en Supabase
--
-- Se corre después de cuentas.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: cada política se borra antes de crearla.
--
-- Hasta ahora los gastos (27 → 32) y Llegó mercancía (41a) se guardaban solo en
-- el celular. Estas políticas dejan que la app los guarde aquí, para verlos desde
-- cualquier celular y que la caja cuadre igual en todos.

begin;

-- La mercancía puede llegar con la caja cerrada: la entrada no siempre tiene turno.
alter table public.entradas_mercancia alter column turno_id drop not null;

-- gastos · insertar: registrar un gasto (31).
drop policy if exists "Cualquiera puede anotar gastos" on public.gastos;
create policy "Cualquiera puede anotar gastos"
  on public.gastos for insert to anon, authenticated
  with check (true);

-- gastos · borrar: eliminar un gasto desde el cuaderno (36) o reemplazarlo al corregirlo.
-- A diferencia de la venta, el gasto no tiene estado: se borra.
drop policy if exists "Cualquiera puede borrar gastos" on public.gastos;
create policy "Cualquiera puede borrar gastos"
  on public.gastos for delete to anon, authenticated
  using (true);

-- entradas_mercancia · insertar: Llegó mercancía (41a), con proveedor, total y pago.
drop policy if exists "Cualquiera puede anotar entradas de mercancía" on public.entradas_mercancia;
create policy "Cualquiera puede anotar entradas de mercancía"
  on public.entradas_mercancia for insert to anon, authenticated
  with check (true);

-- entrada_productos · insertar: qué productos llegaron, cuántos y a qué costo.
drop policy if exists "Cualquiera puede anotar productos que llegaron" on public.entrada_productos;
create policy "Cualquiera puede anotar productos que llegaron"
  on public.entrada_productos for insert to anon, authenticated
  with check (true);

commit;
