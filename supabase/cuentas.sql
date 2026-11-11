-- Tiendy · permisos para crear tienda, iniciar sesión y guardar la caja
--
-- Se corre después de escritura.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: cada política se borra antes de crearla.
--
-- Iniciar sesión solo lee (buscar la tienda por celular y traer sus datos), y la
-- lectura ya está abierta en schema.sql. Estas políticas abren lo que se escribe
-- desde el registro, Mi tienda y Caja. Como todavía no hay login con SMS,
-- cualquiera con el link puede hacerlo: no se guardan datos personales reales.

begin;

-- tienda · insertar: Tu tienda (06) crea la tienda de un número nuevo.
drop policy if exists "Cualquiera puede crear tiendas" on public.tienda;
create policy "Cualquiera puede crear tiendas"
  on public.tienda for insert to anon, authenticated
  with check (true);

-- tienda · actualizar: Mi tienda (46) cambia nombre, barrio, dirección, horario y NIT.
drop policy if exists "Cualquiera puede editar tiendas" on public.tienda;
create policy "Cualquiera puede editar tiendas"
  on public.tienda for update to anon, authenticated
  using (true) with check (true);

-- personas · actualizar: quitar un empleado (47) lo deja inactivo; no se borra
-- porque sus ventas siguen a su nombre. (Agregar ya lo permite escritura.sql.)
drop policy if exists "Cualquiera puede actualizar personas" on public.personas;
create policy "Cualquiera puede actualizar personas"
  on public.personas for update to anon, authenticated
  using (true) with check (true);

-- turnos · actualizar: cerrar caja (18) guarda lo contado, la diferencia y el
-- motivo. (Abrir caja ya lo permite escritura.sql.)
drop policy if exists "Cualquiera puede cerrar turnos" on public.turnos;
create policy "Cualquiera puede cerrar turnos"
  on public.turnos for update to anon, authenticated
  using (true) with check (true);

commit;
