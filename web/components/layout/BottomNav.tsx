"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  HandCoins,
  House,
  Package,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { UndoToast } from "@/components/tiendy/UndoToast";
import { useTienda } from "@/lib/tienda/store";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; icon: LucideIcon };

const tabsIzquierda: Tab[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/fiados", label: "Fiados", icon: HandCoins },
];

const tabsDerecha: Tab[] = [
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/caja", label: "Caja", icon: Wallet },
];

/** Barra inferior (UI kit §7): Inicio · Fiados · Vender · Inventario · Caja. */
export function BottomNav() {
  const pathname = usePathname();
  const { setVenderAbierto } = useTienda();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const renderTab = ({ href, label, icon: Icon }: Tab) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-col items-center gap-espacio-1 rounded-lg py-espacio-2 text-caption",
          active ? "bg-fondo-primario-suave text-texto-primario" : "text-texto-secundario"
        )}
      >
        <Icon className="size-icono-sm" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-10 grid grid-cols-5 items-end rounded-t-2xl border-t border-borde-default bg-fondo-tarjeta px-espacio-2 pt-espacio-2 pb-[max(var(--espacio-2),env(safe-area-inset-bottom))]"
    >
      {/* Aviso "Venta anotada · Deshacer" (22), justo encima de la barra */}
      <UndoToast />

      {tabsIzquierda.map(renderTab)}

      {/* Vender siempre es el círculo verde que sobresale: abre la hoja de venta (20) */}
      <button
        type="button"
        onClick={() => setVenderAbierto(true)}
        className="flex flex-col items-center gap-espacio-1 text-caption text-texto-primario"
      >
        <span className="-mt-espacio-6 flex size-boton-vender items-center justify-center rounded-full bg-fondo-primario text-texto-inverso">
          <Banknote className="size-icono-md" />
        </span>
        <span className="font-bold">Vender</span>
      </button>

      {tabsDerecha.map(renderTab)}
    </nav>
  );
}
