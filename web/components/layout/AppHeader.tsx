type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

/**
 * Header verde oscuro con título centrado (UI kit §7 · Header).
 * La hoja crema que sube encima la pone AppScreen.
 */
export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header
      className={`flex flex-col items-center gap-espacio-1 bg-fondo-encabezado px-margen-pantalla pt-alto-barra-estado text-center ${
        subtitle ? "min-h-alto-header-subtitulo" : "min-h-alto-header"
      }`}
    >
      <h1 className="pt-espacio-6 text-monto-m text-texto-inverso">{title}</h1>
      {subtitle && (
        <p className="text-secundario text-texto-inverso-suave">{subtitle}</p>
      )}
    </header>
  );
}
