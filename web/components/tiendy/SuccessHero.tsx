import { Check } from "lucide-react";

type SuccessHeroProps = {
  titulo: string;
  texto?: string;
};

/** Pantalla de éxito (19, 32, 40): área verde con check grande, título y texto. */
export function SuccessHero({ titulo, texto }: SuccessHeroProps) {
  return (
    <div className="flex flex-col items-center gap-espacio-4 text-center">
      <div className="flex w-full items-center justify-center rounded-xl bg-fondo-exito-suave py-espacio-6">
        <span className="flex size-avatar-l items-center justify-center rounded-full bg-fondo-exito text-texto-inverso">
          <Check className="size-icono-lg" />
        </span>
      </div>
      <h2 className="text-titulo-2 text-texto-principal">{titulo}</h2>
      {texto && <p className="text-cuerpo text-texto-secundario">{texto}</p>}
    </div>
  );
}
