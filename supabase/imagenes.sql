-- Tiendy · cambia el nombre de archivo de cada foto por su URL pública en Storage
--
-- Se corre después de schema.sql, una vez subidas las fotos de data/mock/imagenes/
-- al bucket público "imagenes" (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: lo que ya es URL no se vuelve a tocar.
-- Los registros sin foto se quedan con imagen vacía.

begin;

update public.productos
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';

update public.gastos
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';

update public.entradas_mercancia
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';

commit;
