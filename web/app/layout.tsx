import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--fuente-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tiendy",
  description: "Todo tu negocio a la mano: ventas, caja, fiados e inventario.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* En desktop la app se ve centrada con el ancho de un celular */}
        <div className="mx-auto flex min-h-dvh w-full max-w-pantalla flex-col bg-fondo-app">
          {children}
        </div>
      </body>
    </html>
  );
}
