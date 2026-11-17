// Login por SMS (CU-01) con Supabase Auth, que envía el código por Twilio.
//
// Se prende con NEXT_PUBLIC_LOGIN_SMS=1 (en web/.env.local y en Vercel), después
// de configurar Twilio en Supabase (Authentication → Sign In / Providers → Phone).
// Apagado, la app funciona como antes: no se envía SMS y sirve cualquier código.
//
// Con el SMS prendido y supabase/permisos-por-tienda.sql corrido, la base sabe
// qué celular entró y solo le deja ver y cambiar su propia tienda.
import { supabase } from "@/lib/supabase";

export const conSms = process.env.NEXT_PUBLIC_LOGIN_SMS === "1";

/** Por qué no se pudo enviar o verificar el código. */
export type FallaCodigo = "sin-conexion" | "muchos-intentos" | "codigo-malo" | "otra";

export class ErrorCodigo extends Error {
  constructor(readonly falla: FallaCodigo) {
    super(falla);
  }
}

function falla(error: { status?: number; code?: string; name?: string }): FallaCodigo {
  if (error.status === 429 || error.code === "over_sms_send_rate_limit") return "muchos-intentos";
  if (!error.status || error.name === "AuthRetryableFetchError") return "sin-conexion";
  return "otra";
}

/** Tu celular (03), Reenviar (04) y ¿No te llegó? (05): manda el SMS con el código. */
export async function enviarCodigo(celular: string) {
  if (!conSms) return;
  const { error } = await supabase.auth.signInWithOtp({ phone: celular });
  if (error) {
    console.error("No se pudo enviar el SMS", error);
    throw new ErrorCodigo(falla(error));
  }
}

/** Verificación (04): revisa el código. Con el SMS apagado, cualquiera de 6 dígitos sirve. */
export async function verificarCodigo(celular: string, codigo: string) {
  if (!conSms) return;
  const { error } = await supabase.auth.verifyOtp({ phone: celular, token: codigo, type: "sms" });
  if (error) {
    console.warn("No se pudo verificar el código", error);
    const f = falla(error);
    // Supabase responde 4xx (otp_expired, invalid…) cuando el código no es o ya venció
    throw new ErrorCodigo(f === "otra" ? "codigo-malo" : f);
  }
}

/** El celular que verificó su código y sigue con sesión, o null. */
export async function celularConSesion(): Promise<string | null> {
  if (!conSms) return null;
  const { data } = await supabase.auth.getSession();
  const telefono = data.session?.user.phone;
  return telefono ? `+${telefono.replace(/\D/g, "")}` : null;
}

/** Cerrar sesión (Mi tienda). */
export async function salir() {
  if (!conSms) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.warn("No se pudo cerrar la sesión en Supabase", error);
}

/** Avisa cuando Supabase cierra la sesión (venció o se cerró en otra pestaña). */
export function alSalir(hacer: () => void) {
  if (!conSms) return () => {};
  const { data } = supabase.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_OUT") hacer();
  });
  return () => data.subscription.unsubscribe();
}
