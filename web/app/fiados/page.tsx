import Image from "next/image";

import { AppScreen } from "@/components/layout/AppScreen";

import foto from "@/public/img/fiados-proximamente.jpg";

/** Fiados · próximamente: la pestaña se queda en la barra, pero la sección aún no existe. */
export default function FiadosPage() {
  return (
    <AppScreen title="Fiados">
      <Image
        src={foto}
        alt="Tendero atendiendo a un cliente en el mostrador"
        priority
        className="h-auto w-full rounded-xl"
      />
      <p className="text-center text-titulo-2 text-texto-principal">
        Pronto podrás agregar los fiados de tu negocio en esta sección
      </p>
    </AppScreen>
  );
}
