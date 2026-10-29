import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";

type AppScreenProps = {
  title: string;
  subtitle?: string;
  back?: string | (() => void);
  /** Las pantallas principales llevan barra inferior; los flujos paso a paso no. */
  withNav?: boolean;
  /** La acción principal: un botón a ancho completo al final de la pantalla. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

/** Estructura de una pantalla: header, hoja crema que sube encima y barra inferior. */
export function AppScreen({
  title,
  subtitle,
  back,
  withNav = true,
  footer,
  children,
}: AppScreenProps) {
  return (
    <>
      <AppHeader title={title} subtitle={subtitle} back={back} />
      <main className="relative -mt-solape-hoja flex flex-1 flex-col gap-espacio-4 rounded-t-2xl bg-fondo-app px-margen-pantalla pt-espacio-6 pb-espacio-6">
        {children}
        {footer && <div className="mt-auto pt-espacio-4">{footer}</div>}
      </main>
      {withNav && <BottomNav />}
    </>
  );
}
