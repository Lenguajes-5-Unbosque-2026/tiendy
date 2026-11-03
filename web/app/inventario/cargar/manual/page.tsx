"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampoPesos } from "@/components/tiendy/CampoPesos";
import { ChoiceChips } from "@/components/tiendy/ChoiceChips";
import { QuantityStepper } from "@/components/tiendy/QuantityStepper";
import { useTienda } from "@/lib/tienda/store";

/** Aviso de "por agotarse" para un producto nuevo; se cambia después en 42. */
const MINIMO_INICIAL = 5;

const vacio = { nombre: "", precio: null as number | null, costo: null as number | null, categoria: null as string | null, cantidad: 0 };

/** Carga manual (11): un producto con nombre, precio, costo, categoría y cantidad. */
export default function CargaManualPage() {
  const router = useRouter();
  const { categorias, agregarProductos } = useTienda();
  const [form, setForm] = useState(vacio);
  const [foto, setFoto] = useState<string | null>(null);
  const [guardados, setGuardados] = useState(0);
  const archivo = useRef<HTMLInputElement>(null);
  const valido = form.nombre.trim() !== "" && (form.precio ?? 0) > 0 && form.categoria !== null;

  useEffect(() => () => {
    if (foto) URL.revokeObjectURL(foto);
  }, [foto]);

  const guardar = (otro: boolean) => {
    if (!valido) return;
    const nombre = form.nombre.trim();
    agregarProductos([
      {
        categoria_id: form.categoria!,
        nombre,
        nombre_corto: nombre,
        alias: [nombre.toLowerCase()],
        precio_venta: form.precio!,
        costo: form.costo,
        unidades: form.cantidad,
        minimo: MINIMO_INICIAL,
        venta_rapida: false,
        // Las fotos todavía no se guardan: llegan con Supabase Storage
        imagen: null,
      },
    ]);
    if (otro) {
      setForm(vacio);
      setFoto(null);
      setGuardados((n) => n + 1);
    } else {
      router.push("/inventario");
    }
  };

  return (
    <AppScreen
      title="Agregar producto"
      back="/inventario/cargar"
      withNav={false}
      footer={
        <div className="flex flex-col gap-espacio-3">
          <Button disabled={!valido} onClick={() => guardar(false)}>
            Guardar producto
          </Button>
          <Button variant="secondary" disabled={!valido} onClick={() => guardar(true)}>
            Guardar y agregar otro
          </Button>
        </div>
      }
    >
      {guardados > 0 && (
        <p role="status" className="text-secundario font-bold text-texto-primario">
          Llevas {guardados} {guardados === 1 ? "producto guardado" : "productos guardados"}
        </p>
      )}

      <button
        type="button"
        onClick={() => archivo.current?.click()}
        className="flex h-alto-grafica flex-col items-center justify-center gap-espacio-2 overflow-hidden rounded-lg border-2 border-dashed border-borde-fuerte bg-fondo-sutil text-secundario font-bold text-texto-primario"
      >
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto local recién tomada
          <img src={foto} alt="Foto del producto" className="size-full object-cover" />
        ) : (
          <>
            <span className="flex size-icono-circulo-m items-center justify-center rounded-full bg-fondo-primario-suave">
              <Plus className="size-icono-sm" />
            </span>
            Foto del producto (opcional)
          </>
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

      <label className="flex flex-col gap-espacio-2">
        <span className="text-cuerpo-fuerte">Nombre</span>
        <Input
          value={form.nombre}
          placeholder="Ej: Arroz Diana 500 g"
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </label>

      <div className="grid grid-cols-2 gap-espacio-3">
        <CampoPesos etiqueta="Precio de venta" valor={form.precio} onChange={(precio) => setForm({ ...form, precio })} />
        <CampoPesos etiqueta="Costo" valor={form.costo} onChange={(costo) => setForm({ ...form, costo })} />
      </div>

      <div className="flex flex-col gap-espacio-3">
        <h2 className="text-cuerpo-fuerte">Categoría</h2>
        <ChoiceChips
          etiqueta="Categoría"
          valor={form.categoria}
          onChange={(categoria) => setForm({ ...form, categoria })}
          opciones={[...categorias]
            .sort((a, b) => a.orden - b.orden)
            .map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
        />
      </div>

      <div className="flex items-center justify-between gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4">
        <div className="flex flex-col gap-espacio-1">
          <span className="text-cuerpo-fuerte">Cantidad</span>
          <span className="text-secundario text-texto-secundario">
            Aviso cuando queden {MINIMO_INICIAL}
          </span>
        </div>
        <QuantityStepper
          valor={form.cantidad}
          etiqueta={form.nombre || "Producto nuevo"}
          onMenos={() => setForm({ ...form, cantidad: Math.max(0, form.cantidad - 1) })}
          onMas={() => setForm({ ...form, cantidad: form.cantidad + 1 })}
          masRelleno
        />
      </div>
    </AppScreen>
  );
}
