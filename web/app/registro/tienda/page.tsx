"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTienda } from "@/lib/tienda/store";

/**
 * Tu tienda (06): cuenta nueva. También pide el nombre de la dueña, que el
 * diseño no pide pero el Home y ¿Quién atiende? necesitan.
 */
export default function TuTiendaPage() {
  const router = useRouter();
  const { celularPendiente, crearTienda, iniciarSesion, setModoEntrada } = useTienda();
  const [tienda, setTienda] = useState("");
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const valido = tienda.trim() !== "" && nombre.trim() !== "";

  if (!celularPendiente) {
    return (
      <AppScreen title="Tu tienda" back="/registro/celular" withNav={false}>
        <Link href="/registro/celular" className="text-cuerpo-fuerte text-texto-primario">
          Primero escribe tu número
        </Link>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Tu tienda"
      back="/registro/codigo"
      withNav={false}
      footer={
        <Button
          disabled={!valido || creando || yaRegistrado}
          onClick={async () => {
            setCreando(true);
            const resultado = await crearTienda(celularPendiente, tienda, nombre);
            if (resultado === "creada") return router.push("/");
            // Un celular, una tienda: no se crea otra
            setCreando(false);
            setYaRegistrado(true);
          }}
        >
          {creando ? "Creando tu tienda…" : "Continuar"}
        </Button>
      }
    >
      <div className="flex flex-col gap-espacio-2">
        <h2 className="text-titulo-1 text-texto-principal">¿Cómo se llama tu tienda?</h2>
        <p className="text-cuerpo text-texto-secundario">
          Así aparecerá en tus resúmenes y en lo que compartas con clientes.
        </p>
      </div>

      <label className="flex flex-col gap-espacio-2">
        <span className="text-cuerpo-fuerte">Nombre de la tienda</span>
        <Input value={tienda} placeholder="Tienda Doña Rosa" onChange={(e) => setTienda(e.target.value)} />
      </label>
      <label className="flex flex-col gap-espacio-2">
        <span className="text-cuerpo-fuerte">¿Cómo te dicen?</span>
        <Input value={nombre} placeholder="Doña Rosa" onChange={(e) => setNombre(e.target.value)} />
        <span className="text-secundario text-texto-secundario">Así te saludamos y apareces al abrir la caja.</span>
      </label>

      {yaRegistrado && (
        <div role="alert" className="flex flex-col gap-espacio-3 rounded-lg bg-fondo-tarjeta p-espacio-4">
          <p className="text-cuerpo-fuerte text-texto-principal">Este número ya tiene una tienda</p>
          <p className="text-secundario text-texto-secundario">
            Cada tienda se registra con un solo celular, así que no creamos otra. Entra a la que ya
            tienes.
          </p>
          <Button
            onClick={async () => {
              // El código ya se verificó en 04: entra directo a su tienda
              setModoEntrada("entrar");
              if (await iniciarSesion(celularPendiente)) router.push("/");
            }}
          >
            Entrar a mi tienda
          </Button>
        </div>
      )}
    </AppScreen>
  );
}
