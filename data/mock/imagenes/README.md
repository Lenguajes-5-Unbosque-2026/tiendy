# Imágenes de los datos de prueba

Cada foto tiene el nombre **exacto** que dice la columna `imagen` de su CSV (`productos.csv`, `gastos.csv` y `entradas_mercancia.csv`). Todas están cuadradas a 600 × 600 px en JPG; las de productos van sobre fondo blanco.

Las mismas fotos están subidas al bucket público `imagenes` de Supabase. Cambiar una foto aquí **no** la cambia allá: hay que subirla otra vez al bucket con el mismo nombre (Storage → `imagenes` → borrar la vieja → Upload files).

## Productos (`p01` … `p40`)

Fotos del empaque real de cada producto, que dio el equipo (noviembre de 2026). Se usan solo como datos de prueba de la clase.

**Cuidado:** muestran marcas y empaques de terceros (Alquería, Diana, Postobón, Bimbo, Alpina…), que tienen derechos de autor y de marca. Sirven para el prototipo; si la app se publica de verdad, hay que reemplazarlas por fotos propias o con licencia libre.

## Factura de gasto

Es de [Wikimedia Commons](https://commons.wikimedia.org), con licencia libre. Las licencias CC BY y CC BY-SA piden nombrar al autor y la licencia; si las fotos se muestran en la app publicada, esta tabla debe quedar enlazada desde algún lugar visible.

| Archivo | Foto original · autor · licencia |
|---|---|
| `g18-factura-distribuidora-el-sol.jpg` | [Invoice from The French Gallery (DPLA).jpg](https://commons.wikimedia.org/wiki/File:Invoice_from_The_French_Gallery_-_DPLA_-_19fe291896d2bdd0a68728d27df727c2.jpg) · The French Gallery · Dominio público |
