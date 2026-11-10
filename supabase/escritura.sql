-- Tiendy · permisos de escritura para Registrar venta (20 → 22)
--
-- Se corre después de schema.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: cada política se borra antes de crearla.
--
-- Hasta ahora todas las tablas eran de solo lectura. Estas políticas abren solo
-- lo que necesita la venta. Como la app todavía no tiene login, cualquiera con
-- el link puede hacer esto: no se guardan datos personales reales.

begin;

-- ventas · insertar: anotar una venta nueva.
drop policy if exists "Cualquiera puede anotar ventas" on public.ventas;
create policy "Cualquiera puede anotar ventas"
  on public.ventas for insert to anon, authenticated
  with check (true);

-- ventas · actualizar: deshacer (22), eliminar o corregir (36) cambian su estado
-- a "deshecha" o "eliminada". La venta no se borra: queda en el cuaderno.
drop policy if exists "Cualquiera puede deshacer ventas" on public.ventas;
create policy "Cualquiera puede deshacer ventas"
  on public.ventas for update to anon, authenticated
  using (true) with check (true);

-- venta_productos · insertar: qué productos y cuántos llevó cada venta.
drop policy if exists "Cualquiera puede anotar productos vendidos" on public.venta_productos;
create policy "Cualquiera puede anotar productos vendidos"
  on public.venta_productos for insert to anon, authenticated
  with check (true);

-- productos · actualizar: la venta descuenta unidades y deshacerla las devuelve.
-- También guarda el precio, costo y unidades que se cambian en 42 y en Llegó mercancía (41a).
drop policy if exists "Cualquiera puede actualizar productos" on public.productos;
create policy "Cualquiera puede actualizar productos"
  on public.productos for update to anon, authenticated
  using (true) with check (true);

-- productos · insertar: un producto cargado en el celular (11, 12, 13) se guarda
-- en la base la primera vez que se vende, porque la venta tiene que apuntar a él.
drop policy if exists "Cualquiera puede agregar productos" on public.productos;
create policy "Cualquiera puede agregar productos"
  on public.productos for insert to anon, authenticated
  with check (true);

-- turnos · insertar: la venta va dentro de un turno. Si la caja se abrió en la
-- app (16), ese turno se guarda en la base junto con su primera venta.
drop policy if exists "Cualquiera puede agregar turnos" on public.turnos;
create policy "Cualquiera puede agregar turnos"
  on public.turnos for insert to anon, authenticated
  with check (true);

-- personas · insertar: la venta queda a nombre de quien atiende. Si es un empleado
-- agregado en la app (47), se guarda en la base junto con su primera venta.
drop policy if exists "Cualquiera puede agregar personas" on public.personas;
create policy "Cualquiera puede agregar personas"
  on public.personas for insert to anon, authenticated
  with check (true);

commit;
