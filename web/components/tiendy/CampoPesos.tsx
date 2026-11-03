import { Input } from "@/components/ui/input";
import { leerPesos, pesos } from "@/lib/formato";

type CampoPesosProps = {
  etiqueta: string;
  valor: number | null;
  onChange: (valor: number | null) => void;
};

/** Campo de plata con su etiqueta: muestra "$3.200" mientras se escribe (11, 42). */
export function CampoPesos({ etiqueta, valor, onChange }: CampoPesosProps) {
  return (
    <label className="flex flex-col gap-espacio-2">
      <span className="text-cuerpo-fuerte">{etiqueta}</span>
      <Input
        inputMode="numeric"
        value={valor === null ? "" : pesos(valor)}
        onChange={(e) => onChange(leerPesos(e.target.value))}
        placeholder="$0"
      />
    </label>
  );
}
