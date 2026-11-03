"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { leerPesos, pesos } from "@/lib/formato";
import { useTienda } from "@/lib/tienda/store";

type Fila = { nombre: string; precio: number | null; cantidad: number | null; categoria: string };

const claseCampo =
  "h-alto-campo w-full rounded-md bg-fondo-sutil px-espacio-4 text-cuerpo text-texto-principal";

/**
 * Carga por foto (12). Todavía no se reconocen los productos en la foto: queda
 * de referencia mientras se anotan los productos que se ven en ella.
 */
export default function CargaFotoPage() {
  const router = useRouter();
  const { categorias, agregarProductos } = useTienda();
  const ordenadas = [...categorias].sort((a, b) => a.orden - b.orden);
  const filaVacia = (): Fila => ({ nombre: "", precio: null, cantidad: null, categoria: ordenadas[0]?.id ?? "" });

  const [fuente, setFuente] = useState<"productos" | "factura">("productos");
  const [foto, setFoto] = useState<string | null>(null);
  const [filas, setFilas] = useState<Fila[]>(() => [filaVacia()]);
  const archivo = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (foto) URL.revokeObjectURL(foto);
  }, [foto]);

  const completas = filas.filter((f) => f.nombre.trim() && (f.precio ?? 0) > 0);
  const cambiar = (i: number, cambio: Partial<Fila>) =>
    setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, ...cambio } : f)));

  const confirmar = () => {
    agregarProductos(
      completas.map((f) => {
        const nombre = f.nombre.trim();
        return {
          categoria_id: f.categoria,
          nombre,
          nombre_corto: nombre,
          alias: [nombre.toLowerCase()],
          precio_venta: f.precio!,
          costo: null,
          unidades: f.cantidad ?? 0,
          // Sin cantidad contada no hay aviso de agotado (ver estadoStock)
          minimo: f.cantidad ? 5 : 0,
          venta_rapida: false,
          imagen: null,
        };
      })
    );
    router.push("/inventario");
  };

  return (
    <AppScreen
      title="Cargar con foto"
      back="/inventario/cargar"
      withNav={false}
      footer={
        <Button disabled={completas.length === 0} onClick={confirmar}>
          {completas.length === 1 ? "Confirmar 1 producto" : `Confirmar ${completas.length} productos`}
        </Button>
      }
    >
      <ChoiceChips
        etiqueta="Qué vas a fotografiar"
        valor={fuente}
        onChange={setFuente}
        opciones={[
          { valor: "productos", etiqueta: "Productos" },
          { valor: "factura", etiqueta: "Factura del proveedor" },
        ]}
      />

      <button
        type="button"
        onClick={() => archivo.current?.click()}
        className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-fondo-aviso p-espacio-6"
      >
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto local recién tomada
          <img src={foto} alt="Foto para cargar productos" className="max-h-full rounded-md object-contain" />
        ) : (
          <span className="flex size-full items-center justify-center rounded-lg border-2 border-dashed border-texto-inverso px-espacio-6 text-cuerpo text-texto-inverso">
            {fuente === "productos"
              ? "Toma la foto a un grupo de productos del estante"
              : "Toma la foto a la factura del proveedor"}
          </span>
        )}
      </button>
      <input
        ref={archivo}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFoto(URL.createObjectURL(f));
        }}
      />

      <h2 className="text-secundario text-texto-secundario">
        Anota los productos que ves en la foto
      </h2>

      <ul className="flex flex-col gap-espacio-3">
        {filas.map((f, i) => (
          <li key={i} className="flex flex-col gap-espacio-2 rounded-lg bg-fondo-tarjeta p-espacio-4">
            <div className="flex items-center gap-espacio-2">
              <Input
                aria-label="Nombre del producto"
                placeholder="Nombre"
                value={f.nombre}
                onChange={(e) => cambiar(i, { nombre: e.target.value })}
              />
              {filas.length > 1 && (
                <button
                  type="button"
                  aria-label="Quitar producto"
                  onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))}
                  className="text-texto-secundario"
                >
                  <X className="size-icono-sm" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-espacio-2">
              <Input
                aria-label="Precio de venta"
                inputMode="numeric"
                placeholder="Precio"
                value={f.precio === null ? "" : pesos(f.precio)}
                onChange={(e) => cambiar(i, { precio: leerPesos(e.target.value) })}
              />
              <Input
                aria-label="Cantidad"
                inputMode="numeric"
                placeholder="Cantidad"
                value={f.cantidad ?? ""}
                onChange={(e) => cambiar(i, { cantidad: leerPesos(e.target.value) })}
              />
            </div>
            <select
              aria-label="Categoría"
              value={f.categoria}
              onChange={(e) => cambiar(i, { categoria: e.target.value })}
              className={claseCampo}
            >
              {ordenadas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setFilas((fs) => [...fs, filaVacia()])}
        className="flex items-center gap-espacio-1 text-cuerpo-fuerte font-bold text-texto-primario"
      >
        <Plus className="size-icono-sm" /> Otro producto
      </button>
    </AppScreen>
  );
}
