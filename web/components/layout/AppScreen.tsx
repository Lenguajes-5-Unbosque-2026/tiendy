import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";

type AppScreenProps = {
  title: string;
  subtitle?: string;
  /** Las pantallas principales llevan barra inferior; los flujos paso a paso no. */
  withNav?: boolean;
  children?: React.ReactNode;
};

/** Estructura de una pantalla: header, hoja crema que sube encima y barra inferior. */
export function AppScreen({
  title,
  subtitle,
  withNav = true,
  children,
}: AppScreenProps) {
  return (
    <>
      <AppHeader title={title} subtitle={subtitle} />
      <main className="-mt-solape-hoja flex flex-1 flex-col gap-espacio-4 rounded-t-2xl bg-fondo-app px-margen-pantalla pt-espacio-6 pb-espacio-6">
        {children}
      </main>
      {withNav && <BottomNav />}
    </>
  );
}
