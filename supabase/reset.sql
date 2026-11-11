-- Tiendy · REINICIA LA BASE DE DATOS DESDE CERO
--
-- ⚠ BORRA TODOS LOS DATOS, incluidas las ventas y demás registros creados desde
--   la app, y vuelve a dejar solo los datos de prueba de data/mock/.
--
-- Se corre de una vez (SQL Editor → New query → pegar → Run). Todo va en una sola
-- transacción: si algo falla, no se borra nada.
--
-- Orden:
--   1. Borra las tablas de Tiendy, de las que dependen de otras hacia las básicas.
--      Con ellas se van sus políticas. No toca auth ni storage: las fotos del
--      bucket "imagenes" se quedan.
--   2. Crea las tablas otra vez, carga los datos de prueba y deja todo de solo
--      lectura (contenido de schema.sql).
--   3. Cambia el nombre de cada foto por su URL pública (contenido de imagenes.sql).
--   4. Abre los permisos de escritura de Registrar venta (contenido de escritura.sql)
--      y los de crear tienda, caja y empleados (contenido de cuentas.sql).
--
-- Si cambian schema.sql, imagenes.sql, escritura.sql o cuentas.sql, este archivo se arma otra
-- vez con ellos.

begin;

-- ═════════════════════════════════════════════════════════════
-- 1. Borrar las tablas
-- ═════════════════════════════════════════════════════════════

drop table if exists public.entrada_productos cascade;
drop table if exists public.entradas_mercancia cascade;
drop table if exists public.gastos cascade;
drop table if exists public.venta_productos cascade;
drop table if exists public.ventas cascade;
drop table if exists public.turnos cascade;
drop table if exists public.proveedores cascade;
drop table if exists public.listado_sugerido cascade;
drop table if exists public.productos cascade;
drop table if exists public.categorias cascade;
drop table if exists public.personas cascade;
drop table if exists public.tienda cascade;

-- ═════════════════════════════════════════════════════════════
-- 2. Tablas, datos de prueba y lectura pública (schema.sql)
-- ═════════════════════════════════════════════════════════════

-- Tiendy · esquema inicial de la base de datos con los datos de prueba de data/mock/
--
-- Se corre una sola vez en un proyecto de Supabase vacío (SQL Editor → pegar → Run).
-- Crea una tabla por cada CSV, carga todos sus registros y activa Row Level Security
-- con permiso solo de lectura. Todavía nadie puede escribir.
--
-- Convenciones (las mismas de data/mock/README.md):
-- · Los id son texto y se conservan tal cual vienen en los CSV (t01, pe01, v01…).
-- · La plata va en pesos enteros, sin decimales.
-- · Las fechas con hora se guardan con zona horaria (hora de Colombia, -05:00).
-- · Los valores fijos (rol, medio de pago, estado…) se validan con check.
-- · Lo que se calcula (vendido, ganancia, vueltas) no se guarda.


-- ─────────────────────────────────────────────────────────────
-- 1. Tablas
-- ─────────────────────────────────────────────────────────────

-- La tienda
create table public.tienda (
  id                text primary key,
  nombre            text not null,
  tipo              text,
  barrio            text,
  direccion         text,
  ciudad            text,
  horario_apertura  time,
  horario_cierre    time,
  nit               text,
  celular           text not null unique,         -- un celular, una tienda: con él se inicia sesión
  creada_en         timestamptz not null default now()
);

-- Quienes atienden: la dueña y los empleados
create table public.personas (
  id            text primary key,
  tienda_id     text not null references public.tienda (id),
  nombre        text not null,
  nombre_corto  text not null,
  rol           text not null check (rol in ('duena', 'empleado')),
  activo        boolean not null default true,
  creada_en     timestamptz not null default now()
);

-- Categorías de productos (compartidas por todas las tiendas)
create table public.categorias (
  id      text primary key,
  nombre  text not null,
  orden   integer not null
);

-- Inventario de la tienda
create table public.productos (
  id            text primary key,
  tienda_id     text not null references public.tienda (id),
  categoria_id  text not null references public.categorias (id),
  nombre        text not null,
  nombre_corto  text not null,
  alias         text[] not null default '{}',   -- como lo dice la gente (para la voz)
  precio_venta  integer not null check (precio_venta >= 0),
  costo         integer check (costo >= 0),     -- vacío si no se sabe (p. ej. viene del listado)
  unidades      integer not null default 0 check (unidades >= 0),
  minimo        integer not null default 0 check (minimo >= 0),
  venta_rapida  boolean not null default false,
  origen        text not null check (origen in ('listado', 'manual', 'foto')),
  imagen        text,
  creado_en     timestamptz not null default now()
);

-- Productos típicos que se ofrecen al cargar desde el listado (pantalla 13)
create table public.listado_sugerido (
  id               text primary key,
  categoria_id     text not null references public.categorias (id),
  nombre           text not null,
  nombre_corto     text not null,
  precio_sugerido  integer not null check (precio_sugerido >= 0),
  imagen           text                           -- foto del bucket "imagenes" (la misma del producto)
);

-- Proveedores
create table public.proveedores (
  id          text primary key,
  tienda_id   text not null references public.tienda (id),
  nombre      text not null,
  celular     text,
  dia_visita  text check (dia_visita in ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'))
);

-- Aperturas y cierres de caja
create table public.turnos (
  id                 text primary key,
  tienda_id          text not null references public.tienda (id),
  persona_id         text not null references public.personas (id),
  fecha              date not null,
  franja             text not null check (franja in ('manana', 'tarde')),
  abierto_en         timestamptz not null,
  cerrado_en         timestamptz,                 -- vacío mientras está abierto
  base               integer not null check (base >= 0),
  efectivo_esperado  integer,
  efectivo_contado   integer,
  diferencia         integer,                     -- contado − esperado
  motivo_diferencia  text check (motivo_diferencia in ('olvide_un_gasto', 'di_mal_vueltas', 'no_se')),
  estado             text not null check (estado in ('abierto', 'cerrado'))
);

-- Ventas
create table public.ventas (
  id           text primary key,
  tienda_id    text not null references public.tienda (id),
  turno_id     text not null references public.turnos (id),
  persona_id   text not null references public.personas (id),
  fecha_hora   timestamptz not null,
  canal        text not null check (canal in ('toque', 'busqueda', 'voz')),
  lo_que_dijo  text,                              -- solo si fue por voz
  medio_pago   text not null check (medio_pago in ('efectivo', 'transferencia')),
  total        integer not null check (total >= 0),
  paga_con     integer check (paga_con >= 0),     -- para calcular las vueltas
  estado       text not null default 'anotada' check (estado in ('anotada', 'deshecha', 'eliminada'))
);

-- Los productos de cada venta
create table public.venta_productos (
  id               text primary key,
  venta_id         text not null references public.ventas (id) on delete cascade,
  producto_id      text not null references public.productos (id),
  cantidad         integer not null check (cantidad > 0),
  precio_unitario  integer not null check (precio_unitario >= 0),
  costo_unitario   integer check (costo_unitario >= 0),
  subtotal         integer not null check (subtotal >= 0)
);

-- Gastos y salidas de plata
create table public.gastos (
  id              text primary key,
  tienda_id       text not null references public.tienda (id),
  turno_id        text not null references public.turnos (id),
  persona_id      text not null references public.personas (id),
  fecha_hora      timestamptz not null,
  monto           integer not null check (monto > 0),
  categoria       text not null check (categoria in ('transporte', 'servicios', 'arriendo', 'mercancia', 'otro')),
  nota            text,
  proveedor_id    text references public.proveedores (id),
  canal           text not null check (canal in ('voz', 'manual', 'foto')),
  lo_que_dijo     text,
  medio_pago      text not null check (medio_pago in ('efectivo', 'transferencia', 'quede_debiendo')),
  pagar_antes_de  date,                           -- solo si quedó debiendo
  imagen          text
);

-- Mercancía que llegó (pantalla 41a)
create table public.entradas_mercancia (
  id              text primary key,
  tienda_id       text not null references public.tienda (id),
  proveedor_id    text references public.proveedores (id),
  turno_id        text not null references public.turnos (id),
  persona_id      text not null references public.personas (id),
  fecha_hora      timestamptz not null,
  total           integer not null check (total >= 0),
  medio_pago      text not null check (medio_pago in ('efectivo', 'transferencia', 'quede_debiendo')),
  pagar_antes_de  date,
  imagen          text
);

-- Los productos de cada entrada de mercancía
create table public.entrada_productos (
  id              text primary key,
  entrada_id      text not null references public.entradas_mercancia (id) on delete cascade,
  producto_id     text not null references public.productos (id),
  cantidad        integer not null check (cantidad > 0),
  costo_unitario  integer not null check (costo_unitario >= 0),
  subtotal        integer not null check (subtotal >= 0)
);

-- Índices en las columnas que apuntan a otra tabla (Postgres no los crea solo)
create index on public.personas (tienda_id);
create index on public.productos (tienda_id);
create index on public.productos (categoria_id);
create index on public.listado_sugerido (categoria_id);
create index on public.proveedores (tienda_id);
create index on public.turnos (tienda_id);
create index on public.turnos (persona_id);
create index on public.ventas (tienda_id);
create index on public.ventas (turno_id);
create index on public.ventas (persona_id);
create index on public.venta_productos (venta_id);
create index on public.venta_productos (producto_id);
create index on public.gastos (tienda_id);
create index on public.gastos (turno_id);
create index on public.gastos (persona_id);
create index on public.gastos (proveedor_id);
create index on public.entradas_mercancia (tienda_id);
create index on public.entradas_mercancia (proveedor_id);
create index on public.entradas_mercancia (turno_id);
create index on public.entradas_mercancia (persona_id);
create index on public.entrada_productos (entrada_id);
create index on public.entrada_productos (producto_id);

-- ─────────────────────────────────────────────────────────────
-- 2. Datos de prueba (generados desde data/mock/*.csv)
-- ─────────────────────────────────────────────────────────────

-- tienda (1)
insert into public.tienda (id, nombre, tipo, barrio, direccion, ciudad, horario_apertura, horario_cierre, nit, celular, creada_en) values
  ('t01', 'Tienda Doña Rosa', 'Tienda de barrio', 'Kennedy', 'Cra 78 #38-12', 'Bogotá', '06:00', '21:30', null, '+573001234567', '2026-09-01T08:15:00-05:00');

-- personas (4)
insert into public.personas (id, tienda_id, nombre, nombre_corto, rol, activo, creada_en) values
  ('pe01', 't01', 'Rosa Martínez', 'Doña Rosa', 'duena', true, '2026-09-01T08:15:00-05:00'),
  ('pe02', 't01', 'Andrés Martínez', 'Andrés', 'empleado', true, '2026-09-02T17:40:00-05:00'),
  ('pe03', 't01', 'Yeimy Alexandra Castañeda Rodríguez', 'Yeimy', 'empleado', true, '2026-09-22T19:05:00-05:00'),
  ('pe04', 't01', 'Brayan Stiven Gómez', 'Brayan', 'empleado', false, '2026-09-03T09:00:00-05:00');

-- categorias (6)
insert into public.categorias (id, nombre, orden) values
  ('c01', 'Abarrotes', 1),
  ('c02', 'Bebidas', 2),
  ('c03', 'Lácteos', 3),
  ('c04', 'Aseo', 4),
  ('c05', 'Snacks', 5),
  ('c06', 'Mascotas', 6);

-- productos (40)
insert into public.productos (id, tienda_id, categoria_id, nombre, nombre_corto, alias, precio_venta, costo, unidades, minimo, venta_rapida, origen, imagen, creado_en) values
  ('p01', 't01', 'c03', 'Leche Alquería 1 L', 'Leche 1 L', array['leche', 'una leche', 'bolsa de leche'], 3900, 3100, 2, 6, true, 'listado', 'p01-leche-alqueria-1l.jpg', '2026-09-01T09:00:00-05:00'),
  ('p02', 't01', 'c01', 'Huevo AA', 'Huevo', array['huevo', 'un huevo', 'huevos'], 700, 617, 6, 10, true, 'listado', 'p02-huevo-aa.jpg', '2026-09-01T09:00:00-05:00'),
  ('p03', 't01', 'c01', 'Arroz Diana 500 g', 'Arroz', array['arroz', 'una libra de arroz'], 3200, 2600, 24, 5, false, 'manual', 'p03-arroz-diana-500g.jpg', '2026-09-01T09:12:00-05:00'),
  ('p04', 't01', 'c02', 'Gaseosa Postobón 1,5 L', 'Gaseosa 1,5 L', array['gaseosa', 'una gaseosa', 'gaseosa grande'], 4500, 3200, 18, 6, true, 'foto', 'p04-gaseosa-postobon-1-5l.jpg', '2026-09-01T09:20:00-05:00'),
  ('p05', 't01', 'c05', 'Papas Margarita pollo 39 g', 'Papas', array['papas', 'unas papas', 'margarita'], 2500, 1900, 30, 8, true, 'foto', 'p05-papas-margarita.jpg', '2026-09-01T09:20:00-05:00'),
  ('p06', 't01', 'c01', 'Pan tajado Bimbo 600 g', 'Pan tajado', array['pan tajado', 'un bimbo'], 6800, 5300, 3, 4, false, 'foto', 'p06-pan-tajado-bimbo.jpg', '2026-09-01T09:20:00-05:00'),
  ('p07', 't01', 'c01', 'Aceite Premier 1 L', 'Aceite', array['aceite', 'un aceite'], 11900, 9900, 4, 3, false, 'listado', 'p07-aceite-premier-1l.jpg', '2026-09-01T09:00:00-05:00'),
  ('p08', 't01', 'c01', 'Azúcar Manuelita 1 kg', 'Azúcar', array['azúcar', 'un kilo de azúcar'], 4800, 3900, 15, 5, false, 'listado', 'p08-azucar-manuelita-1kg.jpg', '2026-09-01T09:00:00-05:00'),
  ('p09', 't01', 'c01', 'Panela 500 g', 'Panela', array['panela', 'una panela'], 3000, 2300, 12, 4, false, 'listado', 'p09-panela.jpg', '2026-09-01T09:00:00-05:00'),
  ('p10', 't01', 'c04', 'Papel higiénico Familia x4', 'Papel x4', array['papel', 'un paquete de papel'], 9500, 7600, 5, 4, false, 'manual', 'p10-papel-higienico-familia.jpg', '2026-09-01T09:30:00-05:00'),
  ('p11', 't01', 'c02', 'Agua Cristal 600 ml', 'Agua', array['agua', 'una agua'], 2000, 1100, 20, 6, false, 'manual', 'p11-agua-cristal-600ml.jpg', '2026-09-01T09:31:00-05:00'),
  ('p12', 't01', 'c01', 'Pan francés', 'Pan', array['pan', 'un pan'], 500, 300, 40, 15, true, 'manual', 'p12-pan-frances.jpg', '2026-09-01T09:33:00-05:00'),
  ('p13', 't01', 'c01', 'Café Sello Rojo 250 g', 'Café', array['café', 'un café'], 9800, 8100, 8, 3, false, 'listado', 'p13-cafe-sello-rojo.jpg', '2026-09-01T09:00:00-05:00'),
  ('p14', 't01', 'c01', 'Chocolate Corona 250 g', 'Chocolate', array['chocolate', 'un chocolate'], 6900, 5600, 6, 3, false, 'listado', 'p14-chocolate-corona.jpg', '2026-09-01T09:00:00-05:00'),
  ('p15', 't01', 'c01', 'Lentejas Diana 500 g', 'Lentejas', array['lentejas', 'una libra de lentejas'], 3600, 2800, 10, 4, false, 'listado', 'p15-lentejas.jpg', '2026-09-01T09:00:00-05:00'),
  ('p16', 't01', 'c01', 'Fríjol Diana bola roja 500 g', 'Fríjol', array['fríjol', 'una libra de fríjol'], 6200, 5000, 7, 3, false, 'listado', 'p16-frijol-bola-roja.jpg', '2026-09-01T09:00:00-05:00'),
  ('p17', 't01', 'c01', 'Pasta Doria spaghetti 250 g', 'Pasta', array['pasta', 'una pasta'], 2300, 1800, 14, 5, false, 'listado', 'p17-pasta-doria.jpg', '2026-09-01T09:00:00-05:00'),
  ('p18', 't01', 'c01', 'Atún Van Camp''s en aceite 160 g', 'Atún', array['atún', 'un atún'], 6500, 5300, 9, 3, false, 'listado', 'p18-atun-van-camps.jpg', '2026-09-01T09:00:00-05:00'),
  ('p19', 't01', 'c01', 'Sal Refisal 1 kg', 'Sal', array['sal', 'un kilo de sal'], 2200, 1600, 10, 3, false, 'listado', 'p19-sal-refisal.jpg', '2026-09-01T09:00:00-05:00'),
  ('p20', 't01', 'c01', 'Avena en hojuelas Quaker 250 g', 'Avena', array['avena', 'una avena'], 3400, 2700, 8, 3, false, 'listado', 'p20-avena-quaker.jpg', '2026-09-01T09:00:00-05:00'),
  ('p21', 't01', 'c02', 'Coca-Cola 400 ml', 'Coca-Cola', array['coca', 'una coca'], 2800, 2000, 24, 8, false, 'foto', 'p21-coca-cola-400ml.jpg', '2026-09-01T09:20:00-05:00'),
  ('p22', 't01', 'c02', 'Cerveza Águila lata 330 ml', 'Águila', array['pola', 'una pola', 'cerveza'], 3200, 2500, 36, 12, false, 'foto', 'p22-cerveza-aguila-lata.jpg', '2026-09-01T09:20:00-05:00'),
  ('p23', 't01', 'c02', 'Pony Malta 330 ml', 'Pony Malta', array['pony', 'una pony'], 2200, 1600, 18, 6, false, 'foto', 'p23-pony-malta.jpg', '2026-09-01T09:20:00-05:00'),
  ('p24', 't01', 'c02', 'Jugo Hit caja 200 ml', 'Hit', array['hit', 'un hit', 'jugo'], 1500, 1050, 24, 8, false, 'listado', 'p24-jugo-hit.jpg', '2026-09-01T09:00:00-05:00'),
  ('p25', 't01', 'c02', 'Gatorade 500 ml', 'Gatorade', array['gatorade', 'un gatorade'], 4200, 3300, 6, 3, false, 'listado', 'p25-gatorade.jpg', '2026-09-01T09:00:00-05:00'),
  ('p26', 't01', 'c03', 'Kumis Alpina 200 g', 'Kumis', array['kumis', 'un kumis'], 2600, 2000, 8, 4, false, 'listado', 'p26-kumis-alpina.jpg', '2026-09-01T09:00:00-05:00'),
  ('p27', 't01', 'c03', 'Queso campesino Alpina 250 g', 'Queso', array['queso', 'un queso'], 7500, 6000, 4, 3, false, 'manual', 'p27-queso-campesino.jpg', '2026-09-01T09:40:00-05:00'),
  ('p28', 't01', 'c03', 'Yogur Alpina fresa 200 g', 'Yogur', array['yogur', 'un yogur'], 2800, 2200, 10, 4, false, 'listado', 'p28-yogur-alpina.jpg', '2026-09-01T09:00:00-05:00'),
  ('p29', 't01', 'c03', 'Margarina La Fina 125 g', 'Margarina', array['margarina', 'una la fina'], 3200, 2500, 6, 3, false, 'listado', 'p29-margarina-la-fina.jpg', '2026-09-01T09:00:00-05:00'),
  ('p30', 't01', 'c04', 'Jabón Rey barra 300 g', 'Jabón Rey', array['jabón', 'un jabón rey'], 3000, 2300, 12, 4, false, 'listado', 'p30-jabon-rey.jpg', '2026-09-01T09:00:00-05:00'),
  ('p31', 't01', 'c04', 'Detergente en polvo Fab Ultra Flash bolsa ahorradora 2 kg', 'Fab 2 kg', array['fab', 'un fab', 'detergente'], 18900, 15600, 3, 2, false, 'manual', 'p31-detergente-fab-2kg.jpg', '2026-09-01T09:45:00-05:00'),
  ('p32', 't01', 'c04', 'Límpido 1 L', 'Límpido', array['límpido', 'un límpido'], 4900, 3800, 6, 3, false, 'listado', 'p32-limpido-1l.jpg', '2026-09-01T09:00:00-05:00'),
  ('p33', 't01', 'c04', 'Crema dental Colgate Triple Acción 75 ml', 'Colgate', array['crema dental', 'una colgate'], 6500, 5200, 5, 2, false, 'listado', 'p33-crema-dental-colgate.jpg', '2026-09-01T09:00:00-05:00'),
  ('p34', 't01', 'c04', 'Champú Sedal sobre 18 ml', 'Sedal sobre', array['champú', 'un sobre de sedal'], 1000, 650, 40, 10, false, 'manual', 'p34-champu-sedal.jpg', '2026-09-01T09:50:00-05:00'),
  ('p35', 't01', 'c05', 'Chocorramo', 'Chocorramo', array['chocorramo', 'un chocorramo'], 2800, 2100, 12, 6, false, 'foto', 'p35-chocorramo.jpg', '2026-09-01T09:20:00-05:00'),
  ('p36', 't01', 'c05', 'Galletas Festival fresa', 'Festival', array['festival', 'unas festival'], 1800, null, 20, 6, false, 'listado', 'p36-galletas-festival.jpg', '2026-09-01T09:00:00-05:00'),
  ('p37', 't01', 'c05', 'Doritos 45 g', 'Doritos', array['doritos', 'unos doritos'], 3200, 2400, 10, 4, false, 'foto', 'p37-doritos.jpg', '2026-09-01T09:20:00-05:00'),
  ('p38', 't01', 'c05', 'Bon Bon Bum', 'Bon Bon Bum', array['bombón', 'un bombón'], 300, 190, 50, 20, false, 'manual', 'p38-bon-bon-bum.jpg', '2026-09-01T09:52:00-05:00'),
  ('p39', 't01', 'c01', 'Arepas de maíz blanco x5', 'Arepas', array['arepas', 'un paquete de arepas'], 3500, 2600, 0, 4, false, 'manual', 'p39-arepas-maiz-blanco.jpg', '2026-09-01T09:55:00-05:00'),
  ('p40', 't01', 'c02', 'Bolsa de hielo 2 kg', 'Hielo', array['hielo', 'una bolsa de hielo'], 2000, 0, 0, 5, false, 'manual', 'p40-bolsa-hielo.jpg', '2026-09-01T09:58:00-05:00');

-- listado_sugerido (40)
insert into public.listado_sugerido (id, categoria_id, nombre, nombre_corto, precio_sugerido, imagen) values
  ('ls01', 'c01', 'Arroz Diana 500 g', 'Arroz', 3200, 'p03-arroz-diana-500g.jpg'),
  ('ls02', 'c01', 'Aceite Premier 1 L', 'Aceite', 11900, 'p07-aceite-premier-1l.jpg'),
  ('ls03', 'c01', 'Azúcar Manuelita 1 kg', 'Azúcar', 4800, 'p08-azucar-manuelita-1kg.jpg'),
  ('ls04', 'c01', 'Huevos AA x30', 'Huevos x30', 18500, 'p02-huevo-aa.jpg'),
  ('ls05', 'c01', 'Panela 500 g', 'Panela', 3000, 'p09-panela.jpg'),
  ('ls06', 'c01', 'Pan tajado Bimbo 600 g', 'Pan tajado', 6800, 'p06-pan-tajado-bimbo.jpg'),
  ('ls07', 'c01', 'Pan francés', 'Pan', 500, 'p12-pan-frances.jpg'),
  ('ls08', 'c01', 'Café Sello Rojo 250 g', 'Café', 9800, 'p13-cafe-sello-rojo.jpg'),
  ('ls09', 'c01', 'Chocolate Corona 250 g', 'Chocolate', 6900, 'p14-chocolate-corona.jpg'),
  ('ls10', 'c01', 'Lentejas Diana 500 g', 'Lentejas', 3600, 'p15-lentejas.jpg'),
  ('ls11', 'c01', 'Fríjol Diana bola roja 500 g', 'Fríjol', 6200, 'p16-frijol-bola-roja.jpg'),
  ('ls12', 'c01', 'Pasta Doria spaghetti 250 g', 'Pasta', 2300, 'p17-pasta-doria.jpg'),
  ('ls13', 'c01', 'Atún Van Camp''s en aceite 160 g', 'Atún', 6500, 'p18-atun-van-camps.jpg'),
  ('ls14', 'c01', 'Sal Refisal 1 kg', 'Sal', 2200, 'p19-sal-refisal.jpg'),
  ('ls15', 'c01', 'Avena en hojuelas Quaker 250 g', 'Avena', 3400, 'p20-avena-quaker.jpg'),
  ('ls16', 'c01', 'Arepas de maíz blanco x5', 'Arepas', 3500, 'p39-arepas-maiz-blanco.jpg'),
  ('ls17', 'c02', 'Gaseosa Postobón 1,5 L', 'Gaseosa 1,5 L', 4500, 'p04-gaseosa-postobon-1-5l.jpg'),
  ('ls18', 'c02', 'Agua Cristal 600 ml', 'Agua', 2000, 'p11-agua-cristal-600ml.jpg'),
  ('ls19', 'c02', 'Coca-Cola 400 ml', 'Coca-Cola', 2800, 'p21-coca-cola-400ml.jpg'),
  ('ls20', 'c02', 'Cerveza Águila lata 330 ml', 'Águila', 3200, 'p22-cerveza-aguila-lata.jpg'),
  ('ls21', 'c02', 'Pony Malta 330 ml', 'Pony Malta', 2200, 'p23-pony-malta.jpg'),
  ('ls22', 'c02', 'Jugo Hit caja 200 ml', 'Hit', 1500, 'p24-jugo-hit.jpg'),
  ('ls23', 'c02', 'Gatorade 500 ml', 'Gatorade', 4200, 'p25-gatorade.jpg'),
  ('ls24', 'c02', 'Bolsa de hielo 2 kg', 'Hielo', 2000, 'p40-bolsa-hielo.jpg'),
  ('ls25', 'c03', 'Leche Alquería 1 L', 'Leche 1 L', 3900, 'p01-leche-alqueria-1l.jpg'),
  ('ls26', 'c03', 'Kumis Alpina 200 g', 'Kumis', 2600, 'p26-kumis-alpina.jpg'),
  ('ls27', 'c03', 'Queso campesino Alpina 250 g', 'Queso', 7500, 'p27-queso-campesino.jpg'),
  ('ls28', 'c03', 'Yogur Alpina fresa 200 g', 'Yogur', 2800, 'p28-yogur-alpina.jpg'),
  ('ls29', 'c03', 'Margarina La Fina 125 g', 'Margarina', 3200, 'p29-margarina-la-fina.jpg'),
  ('ls30', 'c04', 'Papel higiénico Familia x4', 'Papel x4', 9500, 'p10-papel-higienico-familia.jpg'),
  ('ls31', 'c04', 'Jabón Rey barra 300 g', 'Jabón Rey', 3000, 'p30-jabon-rey.jpg'),
  ('ls32', 'c04', 'Detergente en polvo Fab Ultra Flash bolsa ahorradora 2 kg', 'Fab 2 kg', 18900, 'p31-detergente-fab-2kg.jpg'),
  ('ls33', 'c04', 'Límpido 1 L', 'Límpido', 4900, 'p32-limpido-1l.jpg'),
  ('ls34', 'c04', 'Crema dental Colgate Triple Acción 75 ml', 'Colgate', 6500, 'p33-crema-dental-colgate.jpg'),
  ('ls35', 'c04', 'Champú Sedal sobre 18 ml', 'Sedal sobre', 1000, 'p34-champu-sedal.jpg'),
  ('ls36', 'c05', 'Papas Margarita pollo 39 g', 'Papas', 2500, 'p05-papas-margarita.jpg'),
  ('ls37', 'c05', 'Chocorramo', 'Chocorramo', 2800, 'p35-chocorramo.jpg'),
  ('ls38', 'c05', 'Galletas Festival fresa', 'Festival', 1800, 'p36-galletas-festival.jpg'),
  ('ls39', 'c05', 'Doritos 45 g', 'Doritos', 3200, 'p37-doritos.jpg'),
  ('ls40', 'c05', 'Bon Bon Bum', 'Bon Bon Bum', 300, 'p38-bon-bon-bum.jpg');

-- proveedores (6)
insert into public.proveedores (id, tienda_id, nombre, celular, dia_visita) values
  ('pr01', 't01', 'Distribuidora El Sol', '+573104567890', 'lunes'),
  ('pr02', 't01', 'Postobón preventa', '+573156781234', 'viernes'),
  ('pr03', 't01', 'Alpina', '+573172223344', 'jueves'),
  ('pr04', 't01', 'Bimbo', null, 'martes'),
  ('pr05', 't01', 'Distribuidora Mayorista La 80 Ltda. · Granos y aseo al por mayor', null, null),
  ('pr06', 't01', 'Hielo La Montaña', '+573209998877', 'sábado');

-- turnos (8)
insert into public.turnos (id, tienda_id, persona_id, fecha, franja, abierto_en, cerrado_en, base, efectivo_esperado, efectivo_contado, diferencia, motivo_diferencia, estado) values
  ('tu01', 't01', 'pe01', '2026-09-19', 'manana', '2026-09-19T06:02:00-05:00', '2026-09-19T14:00:00-05:00', 70000, 84700, 84700, 0, null, 'cerrado'),
  ('tu02', 't01', 'pe02', '2026-09-19', 'tarde', '2026-09-19T14:05:00-05:00', '2026-09-19T21:28:00-05:00', 100000, 20500, 20500, 0, null, 'cerrado'),
  ('tu03', 't01', 'pe01', '2026-09-20', 'manana', '2026-09-20T06:05:00-05:00', '2026-09-20T21:20:00-05:00', 80000, 133300, 130300, -3000, 'di_mal_vueltas', 'cerrado'),
  ('tu04', 't01', 'pe02', '2026-09-21', 'manana', '2026-09-21T07:00:00-05:00', '2026-09-21T21:00:00-05:00', 60000, 141800, 143800, 2000, 'no_se', 'cerrado'),
  ('tu05', 't01', 'pe01', '2026-09-22', 'manana', '2026-09-22T06:00:00-05:00', '2026-09-22T13:30:00-05:00', 80000, 46900, 46900, 0, null, 'cerrado'),
  ('tu06', 't01', 'pe02', '2026-09-22', 'tarde', '2026-09-22T13:35:00-05:00', '2026-09-22T14:10:00-05:00', 0, 0, 0, 0, null, 'cerrado'),
  ('tu07', 't01', 'pe01', '2026-09-22', 'tarde', '2026-09-22T14:12:00-05:00', '2026-09-22T21:30:00-05:00', 50000, 58200, 58200, 0, null, 'cerrado'),
  ('tu08', 't01', 'pe01', '2026-09-23', 'manana', '2026-09-23T07:02:00-05:00', null, 80000, null, null, null, null, 'abierto');

-- ventas (49)
insert into public.ventas (id, tienda_id, turno_id, persona_id, fecha_hora, canal, lo_que_dijo, medio_pago, total, paga_con, estado) values
  ('v01', 't01', 'tu01', 'pe01', '2026-09-19T07:07:00-05:00', 'busqueda', null, 'transferencia', 22800, null, 'anotada'),
  ('v02', 't01', 'tu01', 'pe01', '2026-09-19T08:06:00-05:00', 'toque', null, 'efectivo', 11900, 20000, 'anotada'),
  ('v03', 't01', 'tu01', 'pe01', '2026-09-19T09:02:00-05:00', 'toque', null, 'transferencia', 4500, null, 'anotada'),
  ('v05', 't01', 'tu01', 'pe01', '2026-09-19T10:56:00-05:00', 'voz', 'un huevo, en efectivo', 'efectivo', 700, null, 'anotada'),
  ('v06', 't01', 'tu01', 'pe01', '2026-09-19T11:52:00-05:00', 'voz', 'un queso, en efectivo, me paga con 10 mil', 'efectivo', 7500, 10000, 'anotada'),
  ('v07', 't01', 'tu01', 'pe01', '2026-09-19T12:57:00-05:00', 'toque', null, 'efectivo', 2600, null, 'anotada'),
  ('v08', 't01', 'tu02', 'pe02', '2026-09-19T14:55:00-05:00', 'voz', 'una gaseosa, tres leches, dos fab y unas papas, por Nequi', 'transferencia', 56500, null, 'anotada'),
  ('v09', 't01', 'tu02', 'pe02', '2026-09-19T15:47:00-05:00', 'toque', null, 'efectivo', 17200, null, 'anotada'),
  ('v11', 't01', 'tu02', 'pe02', '2026-09-19T17:52:00-05:00', 'busqueda', null, 'efectivo', 1400, 2000, 'anotada'),
  ('v12', 't01', 'tu02', 'pe02', '2026-09-19T18:44:00-05:00', 'toque', null, 'efectivo', 3900, 5000, 'anotada'),
  ('v13', 't01', 'tu02', 'pe02', '2026-09-19T19:42:00-05:00', 'toque', null, 'efectivo', 3500, 5000, 'anotada'),
  ('v14', 't01', 'tu02', 'pe02', '2026-09-19T20:33:00-05:00', 'busqueda', null, 'efectivo', 2500, null, 'anotada'),
  ('v15', 't01', 'tu03', 'pe01', '2026-09-20T07:22:00-05:00', 'toque', null, 'efectivo', 3200, null, 'anotada'),
  ('v17', 't01', 'tu03', 'pe01', '2026-09-20T10:16:00-05:00', 'busqueda', null, 'transferencia', 14600, null, 'anotada'),
  ('v18', 't01', 'tu03', 'pe01', '2026-09-20T11:47:00-05:00', 'toque', null, 'transferencia', 7000, null, 'anotada'),
  ('v19', 't01', 'tu03', 'pe01', '2026-09-20T12:51:00-05:00', 'busqueda', null, 'efectivo', 20800, null, 'anotada'),
  ('v20', 't01', 'tu03', 'pe01', '2026-09-20T14:23:00-05:00', 'voz', 'una leche, cinco huevos, dos fab y una avena, en efectivo', 'efectivo', 48600, null, 'anotada'),
  ('v22', 't01', 'tu03', 'pe01', '2026-09-20T17:17:00-05:00', 'toque', null, 'transferencia', 38200, null, 'anotada'),
  ('v23', 't01', 'tu03', 'pe01', '2026-09-20T18:38:00-05:00', 'voz', 'dos lentejas, en efectivo', 'efectivo', 7200, null, 'deshecha'),
  ('v24', 't01', 'tu03', 'pe01', '2026-09-20T20:03:00-05:00', 'busqueda', null, 'efectivo', 6700, 10000, 'anotada'),
  ('v25', 't01', 'tu04', 'pe02', '2026-09-21T08:33:00-05:00', 'voz', 'tres festival y un bimbo, en efectivo, me paga con 20 mil', 'efectivo', 12200, 20000, 'anotada'),
  ('v26', 't01', 'tu04', 'pe02', '2026-09-21T09:50:00-05:00', 'toque', null, 'efectivo', 14600, 20000, 'anotada'),
  ('v28', 't01', 'tu04', 'pe02', '2026-09-21T12:26:00-05:00', 'toque', null, 'efectivo', 6400, null, 'anotada'),
  ('v29', 't01', 'tu04', 'pe02', '2026-09-21T14:04:00-05:00', 'voz', 'tres yogures, en efectivo, me paga con 10 mil', 'efectivo', 8400, 10000, 'anotada'),
  ('v30', 't01', 'tu04', 'pe02', '2026-09-21T15:26:00-05:00', 'voz', 'tres cremas dentales y un aceite, en efectivo', 'efectivo', 31400, null, 'anotada'),
  ('v31', 't01', 'tu04', 'pe02', '2026-09-21T16:51:00-05:00', 'toque', null, 'efectivo', 11800, null, 'anotada'),
  ('v33', 't01', 'tu04', 'pe02', '2026-09-21T19:36:00-05:00', 'voz', 'unas papas, una leche y dos cocas, en efectivo, me paga con 20 mil', 'efectivo', 12000, 20000, 'anotada'),
  ('v34', 't01', 'tu05', 'pe01', '2026-09-22T06:54:00-05:00', 'voz', 'un paquete de papel, en efectivo', 'efectivo', 9500, null, 'anotada'),
  ('v35', 't01', 'tu05', 'pe01', '2026-09-22T08:19:00-05:00', 'toque', null, 'efectivo', 15100, null, 'anotada'),
  ('v36', 't01', 'tu05', 'pe01', '2026-09-22T09:10:00-05:00', 'toque', null, 'transferencia', 11400, null, 'anotada'),
  ('v37', 't01', 'tu05', 'pe01', '2026-09-22T10:12:00-05:00', 'voz', 'un kumis, dos panelas y tres bombones, en efectivo', 'efectivo', 9500, null, 'anotada'),
  ('v38', 't01', 'tu05', 'pe01', '2026-09-22T11:12:00-05:00', 'busqueda', null, 'efectivo', 1800, null, 'anotada'),
  ('v40', 't01', 'tu07', 'pe01', '2026-09-22T15:12:00-05:00', 'toque', null, 'efectivo', 19700, null, 'anotada'),
  ('v41', 't01', 'tu07', 'pe01', '2026-09-22T15:54:00-05:00', 'toque', null, 'efectivo', 2500, 5000, 'eliminada'),
  ('v42', 't01', 'tu07', 'pe01', '2026-09-22T16:49:00-05:00', 'voz', 'una leche, por Nequi', 'transferencia', 3900, null, 'anotada'),
  ('v43', 't01', 'tu07', 'pe01', '2026-09-22T17:46:00-05:00', 'busqueda', null, 'efectivo', 5500, null, 'anotada'),
  ('v44', 't01', 'tu07', 'pe01', '2026-09-22T18:43:00-05:00', 'toque', null, 'efectivo', 2500, null, 'anotada'),
  ('v46', 't01', 'tu07', 'pe01', '2026-09-22T20:26:00-05:00', 'busqueda', null, 'efectivo', 7500, 10000, 'anotada'),
  ('v47', 't01', 'tu08', 'pe01', '2026-09-23T07:16:00-05:00', 'toque', null, 'efectivo', 8000, 10000, 'anotada'),
  ('v48', 't01', 'tu08', 'pe01', '2026-09-23T07:41:00-05:00', 'voz', 'cuatro huevos, en efectivo, me paga con 5 mil', 'efectivo', 2800, 5000, 'anotada'),
  ('v49', 't01', 'tu08', 'pe01', '2026-09-23T08:09:00-05:00', 'voz', 'unas papas, en efectivo', 'efectivo', 2500, null, 'anotada'),
  ('v51', 't01', 'tu08', 'pe01', '2026-09-23T09:01:00-05:00', 'voz', 'un kilo de sal y un pan, por Nequi', 'transferencia', 2700, null, 'anotada'),
  ('v52', 't01', 'tu08', 'pe01', '2026-09-23T09:20:00-05:00', 'toque', null, 'efectivo', 4200, null, 'anotada'),
  ('v53', 't01', 'tu08', 'pe01', '2026-09-23T09:32:00-05:00', 'toque', null, 'efectivo', 6000, 10000, 'anotada'),
  ('v55', 't01', 'tu08', 'pe01', '2026-09-23T10:25:00-05:00', 'busqueda', null, 'efectivo', 18600, null, 'anotada'),
  ('v56', 't01', 'tu08', 'pe01', '2026-09-23T10:49:00-05:00', 'toque', null, 'efectivo', 4500, null, 'anotada'),
  ('v57', 't01', 'tu08', 'pe01', '2026-09-23T10:57:00-05:00', 'voz', 'un chocorramo y una libra de fríjol, en efectivo', 'efectivo', 9000, null, 'anotada'),
  ('v59', 't01', 'tu08', 'pe01', '2026-09-23T11:36:00-05:00', 'voz', 'una gaseosa, en efectivo', 'efectivo', 4500, null, 'anotada'),
  ('v60', 't01', 'tu08', 'pe01', '2026-09-23T12:12:00-05:00', 'busqueda', null, 'efectivo', 25700, null, 'anotada');

-- venta_productos (91)
insert into public.venta_productos (id, venta_id, producto_id, cantidad, precio_unitario, costo_unitario, subtotal) values
  ('vp001', 'v01', 'p29', 1, 3200, 2500, 3200),
  ('vp002', 'v01', 'p13', 2, 9800, 8100, 19600),
  ('vp003', 'v02', 'p07', 1, 11900, 9900, 11900),
  ('vp004', 'v03', 'p04', 1, 4500, 3200, 4500),
  ('vp009', 'v05', 'p02', 1, 700, 617, 700),
  ('vp010', 'v06', 'p27', 1, 7500, 6000, 7500),
  ('vp011', 'v07', 'p26', 1, 2600, 2000, 2600),
  ('vp012', 'v08', 'p04', 1, 4500, 3200, 4500),
  ('vp013', 'v08', 'p01', 3, 3900, 3100, 11700),
  ('vp014', 'v08', 'p31', 2, 18900, 15600, 37800),
  ('vp015', 'v08', 'p05', 1, 2500, 1900, 2500),
  ('vp016', 'v09', 'p04', 1, 4500, 3200, 4500),
  ('vp017', 'v09', 'p01', 2, 3900, 3100, 7800),
  ('vp018', 'v09', 'p32', 1, 4900, 3800, 4900),
  ('vp023', 'v11', 'p02', 2, 700, 617, 1400),
  ('vp024', 'v12', 'p01', 1, 3900, 3100, 3900),
  ('vp025', 'v13', 'p02', 1, 700, 617, 700),
  ('vp026', 'v13', 'p21', 1, 2800, 2000, 2800),
  ('vp027', 'v14', 'p05', 1, 2500, 1900, 2500),
  ('vp028', 'v15', 'p22', 1, 3200, 2500, 3200),
  ('vp032', 'v17', 'p32', 1, 4900, 3800, 4900),
  ('vp033', 'v17', 'p02', 4, 700, 617, 2800),
  ('vp034', 'v17', 'p05', 1, 2500, 1900, 2500),
  ('vp035', 'v17', 'p23', 2, 2200, 1600, 4400),
  ('vp036', 'v18', 'p02', 6, 700, 617, 4200),
  ('vp037', 'v18', 'p35', 1, 2800, 2100, 2800),
  ('vp038', 'v19', 'p04', 1, 4500, 3200, 4500),
  ('vp039', 'v19', 'p23', 2, 2200, 1600, 4400),
  ('vp040', 'v19', 'p07', 1, 11900, 9900, 11900),
  ('vp041', 'v20', 'p01', 1, 3900, 3100, 3900),
  ('vp042', 'v20', 'p02', 5, 700, 617, 3500),
  ('vp043', 'v20', 'p31', 2, 18900, 15600, 37800),
  ('vp044', 'v20', 'p20', 1, 3400, 2700, 3400),
  ('vp048', 'v22', 'p05', 1, 2500, 1900, 2500),
  ('vp049', 'v22', 'p07', 3, 11900, 9900, 35700),
  ('vp050', 'v23', 'p15', 2, 3600, 2800, 7200),
  ('vp051', 'v24', 'p02', 4, 700, 617, 2800),
  ('vp052', 'v24', 'p01', 1, 3900, 3100, 3900),
  ('vp053', 'v25', 'p36', 3, 1800, null, 5400),
  ('vp054', 'v25', 'p06', 1, 6800, 5300, 6800),
  ('vp055', 'v26', 'p16', 2, 6200, 5000, 12400),
  ('vp056', 'v26', 'p19', 1, 2200, 1600, 2200),
  ('vp060', 'v28', 'p03', 1, 3200, 2600, 3200),
  ('vp061', 'v28', 'p29', 1, 3200, 2500, 3200),
  ('vp062', 'v29', 'p28', 3, 2800, 2200, 8400),
  ('vp063', 'v30', 'p33', 3, 6500, 5200, 19500),
  ('vp064', 'v30', 'p07', 1, 11900, 9900, 11900),
  ('vp065', 'v31', 'p19', 1, 2200, 1600, 2200),
  ('vp066', 'v31', 'p22', 3, 3200, 2500, 9600),
  ('vp070', 'v33', 'p05', 1, 2500, 1900, 2500),
  ('vp071', 'v33', 'p01', 1, 3900, 3100, 3900),
  ('vp072', 'v33', 'p21', 2, 2800, 2000, 5600),
  ('vp073', 'v34', 'p10', 1, 9500, 7600, 9500),
  ('vp074', 'v35', 'p12', 5, 500, 300, 2500),
  ('vp075', 'v35', 'p04', 1, 4500, 3200, 4500),
  ('vp076', 'v35', 'p02', 6, 700, 617, 4200),
  ('vp077', 'v35', 'p01', 1, 3900, 3100, 3900),
  ('vp078', 'v36', 'p25', 2, 4200, 3300, 8400),
  ('vp079', 'v36', 'p09', 1, 3000, 2300, 3000),
  ('vp080', 'v37', 'p26', 1, 2600, 2000, 2600),
  ('vp081', 'v37', 'p09', 2, 3000, 2300, 6000),
  ('vp082', 'v37', 'p38', 3, 300, 190, 900),
  ('vp083', 'v38', 'p36', 1, 1800, null, 1800),
  ('vp088', 'v40', 'p32', 3, 4900, 3800, 14700),
  ('vp089', 'v40', 'p05', 2, 2500, 1900, 5000),
  ('vp090', 'v41', 'p12', 5, 500, 300, 2500),
  ('vp091', 'v42', 'p01', 1, 3900, 3100, 3900),
  ('vp092', 'v43', 'p05', 1, 2500, 1900, 2500),
  ('vp093', 'v43', 'p30', 1, 3000, 2300, 3000),
  ('vp094', 'v44', 'p05', 1, 2500, 1900, 2500),
  ('vp098', 'v46', 'p05', 3, 2500, 1900, 7500),
  ('vp099', 'v47', 'p18', 1, 6500, 5300, 6500),
  ('vp100', 'v47', 'p12', 3, 500, 300, 1500),
  ('vp101', 'v48', 'p02', 4, 700, 617, 2800),
  ('vp102', 'v49', 'p05', 1, 2500, 1900, 2500),
  ('vp107', 'v51', 'p19', 1, 2200, 1600, 2200),
  ('vp108', 'v51', 'p12', 1, 500, 300, 500),
  ('vp109', 'v52', 'p02', 6, 700, 617, 4200),
  ('vp110', 'v53', 'p04', 1, 4500, 3200, 4500),
  ('vp111', 'v53', 'p12', 3, 500, 300, 1500),
  ('vp116', 'v55', 'p29', 3, 3200, 2500, 9600),
  ('vp117', 'v55', 'p09', 1, 3000, 2300, 3000),
  ('vp118', 'v55', 'p30', 2, 3000, 2300, 6000),
  ('vp119', 'v56', 'p04', 1, 4500, 3200, 4500),
  ('vp120', 'v57', 'p35', 1, 2800, 2100, 2800),
  ('vp121', 'v57', 'p16', 1, 6200, 5000, 6200),
  ('vp126', 'v59', 'p04', 1, 4500, 3200, 4500),
  ('vp127', 'v60', 'p28', 3, 2800, 2200, 8400),
  ('vp128', 'v60', 'p18', 1, 6500, 5300, 6500),
  ('vp129', 'v60', 'p32', 2, 4900, 3800, 9800),
  ('vp130', 'v60', 'p12', 2, 500, 300, 1000);

-- gastos (20)
insert into public.gastos (id, tienda_id, turno_id, persona_id, fecha_hora, monto, categoria, nota, proveedor_id, canal, lo_que_dijo, medio_pago, pagar_antes_de, imagen) values
  ('g01', 't01', 'tu01', 'pe01', '2026-09-19T07:30:00-05:00', 8000, 'transporte', null, null, 'voz', 'pagué 8 mil de transporte', 'efectivo', null, null),
  ('g02', 't01', 'tu01', 'pe01', '2026-09-19T10:15:00-05:00', 45000, 'servicios', 'Recibo de la luz (Enel)', null, 'manual', null, 'transferencia', null, null),
  ('g03', 't01', 'tu02', 'pe02', '2026-09-19T15:40:00-05:00', 12000, 'otro', 'Almuerzo', null, 'manual', null, 'efectivo', null, null),
  ('g04', 't01', 'tu02', 'pe02', '2026-09-19T18:20:00-05:00', 96000, 'mercancia', null, 'pr04', 'foto', null, 'efectivo', null, null),
  ('g05', 't01', 'tu03', 'pe01', '2026-09-20T06:45:00-05:00', 6000, 'transporte', null, null, 'voz', 'pagué 6 mil de transporte', 'efectivo', null, null),
  ('g06', 't01', 'tu03', 'pe01', '2026-09-20T09:10:00-05:00', 20000, 'otro', 'Saqué para el mercado de la casa', null, 'voz', 'pagué 20 mil de otros', 'efectivo', null, null),
  ('g07', 't01', 'tu03', 'pe01', '2026-09-20T12:30:00-05:00', 38500, 'servicios', 'Internet del local', null, 'manual', null, 'transferencia', null, null),
  ('g08', 't01', 'tu03', 'pe01', '2026-09-20T16:00:00-05:00', 54000, 'mercancia', null, 'pr03', 'foto', null, 'quede_debiendo', '2026-09-27', null),
  ('g09', 't01', 'tu04', 'pe02', '2026-09-21T08:00:00-05:00', 10000, 'transporte', null, null, 'manual', null, 'efectivo', null, null),
  ('g10', 't01', 'tu04', 'pe02', '2026-09-21T13:45:00-05:00', 5000, 'otro', 'Bolsas plásticas y servilletas', null, 'manual', null, 'efectivo', null, null),
  ('g11', 't01', 'tu04', 'pe02', '2026-09-21T19:30:00-05:00', 850000, 'arriendo', 'Arriendo del local de septiembre, pagado a Don Hernando por Nequi; queda pendiente la parte del agua, que él manda el recibo la otra semana', null, 'manual', null, 'transferencia', null, null),
  ('g12', 't01', 'tu05', 'pe01', '2026-09-22T07:20:00-05:00', 7000, 'transporte', null, null, 'voz', 'pagué 7 mil de transporte', 'efectivo', null, null),
  ('g13', 't01', 'tu05', 'pe01', '2026-09-22T11:00:00-05:00', 62000, 'servicios', 'Gas natural', null, 'manual', null, 'efectivo', null, null),
  ('g14', 't01', 'tu07', 'pe01', '2026-09-22T15:10:00-05:00', 15000, 'otro', null, null, 'voz', 'pagué 15 mil de otros', 'efectivo', null, null),
  ('g15', 't01', 'tu07', 'pe01', '2026-09-22T17:45:00-05:00', 72000, 'mercancia', null, 'pr05', 'manual', null, 'quede_debiendo', '2026-09-29', null),
  ('g16', 't01', 'tu07', 'pe01', '2026-09-22T20:30:00-05:00', 12000, 'transporte', 'Domicilio a Doña Gladys', null, 'manual', null, 'efectivo', null, null),
  ('g17', 't01', 'tu08', 'pe01', '2026-09-23T08:30:00-05:00', 20000, 'transporte', null, null, 'voz', 'pagué 20 mil de transporte', 'efectivo', null, null),
  ('g18', 't01', 'tu08', 'pe01', '2026-09-23T09:50:00-05:00', 184000, 'mercancia', null, 'pr01', 'foto', null, 'quede_debiendo', '2026-10-01', 'g18-factura-distribuidora-el-sol.jpg'),
  ('g19', 't01', 'tu08', 'pe01', '2026-09-23T11:05:00-05:00', 22000, 'otro', 'Almuerzo', null, 'manual', null, 'efectivo', null, null),
  ('g20', 't01', 'tu08', 'pe01', '2026-09-23T12:10:00-05:00', 20000, 'servicios', 'Botellón de agua', null, 'voz', 'pagué 20 mil de servicios', 'efectivo', null, null);

-- entradas_mercancia (3)
insert into public.entradas_mercancia (id, tienda_id, proveedor_id, turno_id, persona_id, fecha_hora, total, medio_pago, pagar_antes_de, imagen) values
  ('e01', 't01', 'pr02', 'tu04', 'pe02', '2026-09-21T10:30:00-05:00', 144000, 'efectivo', null, null),
  ('e02', 't01', 'pr03', 'tu05', 'pe01', '2026-09-22T09:30:00-05:00', 50400, 'quede_debiendo', '2026-09-29', null),
  ('e03', 't01', 'pr02', 'tu08', 'pe01', '2026-09-23T11:30:00-05:00', 90000, 'quede_debiendo', '2026-09-25', null);

-- entrada_productos (7)
insert into public.entrada_productos (id, entrada_id, producto_id, cantidad, costo_unitario, subtotal) values
  ('ep01', 'e01', 'p04', 24, 3200, 76800),
  ('ep02', 'e01', 'p21', 24, 2000, 48000),
  ('ep03', 'e01', 'p23', 12, 1600, 19200),
  ('ep04', 'e02', 'p26', 12, 2000, 24000),
  ('ep05', 'e02', 'p28', 12, 2200, 26400),
  ('ep06', 'e03', 'p04', 24, 3200, 76800),
  ('ep07', 'e03', 'p11', 12, 1100, 13200);

-- ─────────────────────────────────────────────────────────────
-- 3. Row Level Security: todas las tablas, solo lectura para cualquiera
-- ─────────────────────────────────────────────────────────────
-- Con RLS activo, lo que no tiene política queda prohibido. Por eso, al no haber
-- políticas de insert, update ni delete, nadie puede escribir desde la app.

do $$
declare
  t text;
begin
  foreach t in array array[
    'tienda', 'personas', 'categorias', 'productos', 'listado_sugerido', 'proveedores',
    'turnos', 'ventas', 'venta_productos', 'gastos', 'entradas_mercancia', 'entrada_productos'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Cualquiera puede leer" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;


-- ═════════════════════════════════════════════════════════════
-- 3. URLs de las fotos (imagenes.sql)
-- ═════════════════════════════════════════════════════════════

-- Tiendy · cambia el nombre de archivo de cada foto por su URL pública en Storage
--
-- Se corre después de schema.sql, una vez subidas las fotos de data/mock/imagenes/
-- al bucket público "imagenes" (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: lo que ya es URL no se vuelve a tocar.
-- Los registros sin foto se quedan con imagen vacía.


update public.productos
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';

update public.gastos
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';

update public.entradas_mercancia
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';

update public.listado_sugerido
set imagen = 'https://dtrdbutpvutmxpapmbjw.supabase.co/storage/v1/object/public/imagenes/' || imagen
where imagen is not null and imagen not like 'https://%';


-- ═════════════════════════════════════════════════════════════
-- 4. Permisos de escritura (escritura.sql y cuentas.sql)
-- ═════════════════════════════════════════════════════════════

-- Tiendy · permisos de escritura para Registrar venta (20 → 22)
--
-- Se corre después de schema.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: cada política se borra antes de crearla.
--
-- Hasta ahora todas las tablas eran de solo lectura. Estas políticas abren solo
-- lo que necesita la venta. Como la app todavía no tiene login, cualquiera con
-- el link puede hacer esto: no se guardan datos personales reales.


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


-- Tiendy · permisos para crear tienda, iniciar sesión y guardar la caja
--
-- Se corre después de escritura.sql (SQL Editor → pegar → Run).
-- Se puede correr más de una vez: cada política se borra antes de crearla.
--
-- Iniciar sesión solo lee (buscar la tienda por celular y traer sus datos), y la
-- lectura ya está abierta en schema.sql. Estas políticas abren lo que se escribe
-- desde el registro, Mi tienda y Caja. Como todavía no hay login con SMS,
-- cualquiera con el link puede hacerlo: no se guardan datos personales reales.


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
