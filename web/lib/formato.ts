// Formatos de la app (UI kit §5): "$11.500", "7:02 a.m.".

export function pesos(valor: number): string {
  const signo = valor < 0 ? "−" : "";
  const miles = Math.abs(Math.round(valor))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${signo}$${miles}`;
}

/** Solo los dígitos de un texto escrito por la persona ("$20.000" → 20000). */
export function leerPesos(texto: string): number | null {
  const digitos = texto.replace(/\D/g, "");
  return digitos === "" ? null : Number(digitos);
}

/** Hora de una fecha ISO de Colombia ("2026-09-23T07:02:00-05:00" → "7:02 a.m."). */
export function hora(fechaIso: string): string {
  const [h, m] = fechaIso.slice(11, 16).split(":").map(Number);
  const sufijo = h < 12 ? "a.m." : "p.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

/** Inicial para el círculo, sin contar el trato ("Don Carlos Pérez" → "C"). */
export function inicial(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/);
  const sinTrato = palabras.filter((p) => !/^(don|doña|profe|señor|señora)$/i.test(p));
  return (sinTrato[0] ?? palabras[0] ?? "").charAt(0).toUpperCase();
}

export function plural(n: number, singular: string, varios: string): string {
  return `${n} ${n === 1 ? singular : varios}`;
}

const MESES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];

/** "2026-09-30" o una fecha ISO → "30 sep.". */
export function fechaCorta(fecha: string): string {
  const [, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  return `${dia} ${MESES[mes - 1]}`;
}

/** "+573114567788" → "+57 311 456 7788". */
export function celular(numero: string): string {
  const m = numero.match(/^\+57(\d{3})(\d{3})(\d{4})$/);
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : numero;
}
