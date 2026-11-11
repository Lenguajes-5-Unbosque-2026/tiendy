-- Tiendy · listado sugerido (13) con los productos que tienen foto
--
-- Se corre una vez sobre la base que ya existe (SQL Editor → pegar → Run).
-- Se puede correr más de una vez.
--
-- 1. Cambia el listado sugerido: antes eran 28 productos sin foto (Harina P.A.N.,
--    Arroz Roa…); ahora son los 40 productos del catálogo, con su foto del
--    bucket "imagenes", empezando por los del diseño de 13 (Arroz Diana, Aceite
--    Premier, Azúcar Manuelita, Huevos AA x30, Panela).
-- 2. Corrige 4 nombres de productos para que digan lo que muestra su foto.
-- No toca ventas, turnos ni ninguna otra tabla.

begin;

alter table public.listado_sugerido add column if not exists imagen text;

delete from public.listado_sugerido;

insert into public.listado_sugerido (id, categoria_id, nombre, nombre_corto, precio_sugerido, imagen) values
  ('ls01', 'c01', 'Arroz Diana 500 g', 'Arroz', 3200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p03-arroz-diana-500g.jpg'),
  ('ls02', 'c01', 'Aceite Premier 1 L', 'Aceite', 11900, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p07-aceite-premier-1l.jpg'),
  ('ls03', 'c01', 'Azúcar Manuelita 1 kg', 'Azúcar', 4800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p08-azucar-manuelita-1kg.jpg'),
  ('ls04', 'c01', 'Huevos AA x30', 'Huevos x30', 18500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p02-huevo-aa.jpg'),
  ('ls05', 'c01', 'Panela 500 g', 'Panela', 3000, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p09-panela.jpg'),
  ('ls06', 'c01', 'Pan tajado Bimbo 600 g', 'Pan tajado', 6800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p06-pan-tajado-bimbo.jpg'),
  ('ls07', 'c01', 'Pan francés', 'Pan', 500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p12-pan-frances.jpg'),
  ('ls08', 'c01', 'Café Sello Rojo 250 g', 'Café', 9800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p13-cafe-sello-rojo.jpg'),
  ('ls09', 'c01', 'Chocolate Corona 250 g', 'Chocolate', 6900, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p14-chocolate-corona.jpg'),
  ('ls10', 'c01', 'Lentejas Diana 500 g', 'Lentejas', 3600, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p15-lentejas.jpg'),
  ('ls11', 'c01', 'Fríjol Diana bola roja 500 g', 'Fríjol', 6200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p16-frijol-bola-roja.jpg'),
  ('ls12', 'c01', 'Pasta Doria spaghetti 250 g', 'Pasta', 2300, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p17-pasta-doria.jpg'),
  ('ls13', 'c01', 'Atún Van Camp''s en aceite 160 g', 'Atún', 6500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p18-atun-van-camps.jpg'),
  ('ls14', 'c01', 'Sal Refisal 1 kg', 'Sal', 2200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p19-sal-refisal.jpg'),
  ('ls15', 'c01', 'Avena en hojuelas Quaker 250 g', 'Avena', 3400, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p20-avena-quaker.jpg'),
  ('ls16', 'c01', 'Arepas de maíz blanco x5', 'Arepas', 3500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p39-arepas-maiz-blanco.jpg'),
  ('ls17', 'c02', 'Gaseosa Postobón 1,5 L', 'Gaseosa 1,5 L', 4500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p04-gaseosa-postobon-1-5l.jpg'),
  ('ls18', 'c02', 'Agua Cristal 600 ml', 'Agua', 2000, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p11-agua-cristal-600ml.jpg'),
  ('ls19', 'c02', 'Coca-Cola 400 ml', 'Coca-Cola', 2800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p21-coca-cola-400ml.jpg'),
  ('ls20', 'c02', 'Cerveza Águila lata 330 ml', 'Águila', 3200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p22-cerveza-aguila-lata.jpg'),
  ('ls21', 'c02', 'Pony Malta 330 ml', 'Pony Malta', 2200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p23-pony-malta.jpg'),
  ('ls22', 'c02', 'Jugo Hit caja 200 ml', 'Hit', 1500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p24-jugo-hit.jpg'),
  ('ls23', 'c02', 'Gatorade 500 ml', 'Gatorade', 4200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p25-gatorade.jpg'),
  ('ls24', 'c02', 'Bolsa de hielo 2 kg', 'Hielo', 2000, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p40-bolsa-hielo.jpg'),
  ('ls25', 'c03', 'Leche Alquería 1 L', 'Leche 1 L', 3900, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p01-leche-alqueria-1l.jpg'),
  ('ls26', 'c03', 'Kumis Alpina 200 g', 'Kumis', 2600, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p26-kumis-alpina.jpg'),
  ('ls27', 'c03', 'Queso campesino Alpina 250 g', 'Queso', 7500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p27-queso-campesino.jpg'),
  ('ls28', 'c03', 'Yogur Alpina fresa 200 g', 'Yogur', 2800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p28-yogur-alpina.jpg'),
  ('ls29', 'c03', 'Margarina La Fina 125 g', 'Margarina', 3200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p29-margarina-la-fina.jpg'),
  ('ls30', 'c04', 'Papel higiénico Familia x4', 'Papel x4', 9500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p10-papel-higienico-familia.jpg'),
  ('ls31', 'c04', 'Jabón Rey barra 300 g', 'Jabón Rey', 3000, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p30-jabon-rey.jpg'),
  ('ls32', 'c04', 'Detergente en polvo Fab Ultra Flash bolsa ahorradora 2 kg', 'Fab 2 kg', 18900, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p31-detergente-fab-2kg.jpg'),
  ('ls33', 'c04', 'Límpido 1 L', 'Límpido', 4900, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p32-limpido-1l.jpg'),
  ('ls34', 'c04', 'Crema dental Colgate Triple Acción 75 ml', 'Colgate', 6500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p33-crema-dental-colgate.jpg'),
  ('ls35', 'c04', 'Champú Sedal sobre 18 ml', 'Sedal sobre', 1000, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p34-champu-sedal.jpg'),
  ('ls36', 'c05', 'Papas Margarita pollo 39 g', 'Papas', 2500, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p05-papas-margarita.jpg'),
  ('ls37', 'c05', 'Chocorramo', 'Chocorramo', 2800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p35-chocorramo.jpg'),
  ('ls38', 'c05', 'Galletas Festival fresa', 'Festival', 1800, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p36-galletas-festival.jpg'),
  ('ls39', 'c05', 'Doritos 45 g', 'Doritos', 3200, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p37-doritos.jpg'),
  ('ls40', 'c05', 'Bon Bon Bum', 'Bon Bon Bum', 300, 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/p38-bon-bon-bum.jpg');

update public.productos set nombre = 'Lentejas Diana 500 g' where nombre = 'Lentejas 500 g';
update public.productos set nombre = 'Fríjol Diana bola roja 500 g' where nombre = 'Fríjol bola roja 500 g';
update public.productos set nombre = 'Queso campesino Alpina 250 g' where nombre = 'Queso campesino 250 g';
update public.productos set nombre = 'Detergente en polvo Fab Ultra Flash bolsa ahorradora 2 kg' where nombre = 'Detergente en polvo Fab Floral bolsa ahorradora 2 kg + 500 g gratis';

commit;
