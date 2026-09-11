import type { Metadata, Viewport } from "next";
import { Manrope, Marcellus } from "next/font/google";
import MotionProvider from "../components/MotionProvider";
import NavBar from "../components/NavBar";
import "./globals.css";

/* Tipografías de la plantilla Noir: serif para títulos, sans liviana para el resto. */
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Joyasamormio",
  description:
    "Catálogo de joyas en oro, plata, acero quirúrgico y variedad. Consultá por WhatsApp.",
  icons: {
    icon: "/3006691.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#141210",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${marcellus.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* `MotionConfig` no renderiza ningún elemento: no altera este flex. */}
        <MotionProvider>
          {/*
           * El nav se monta acá, no en cada página: así sobrevive a la
           * navegación y su subrayado puede deslizarse entre secciones en vez
           * de reaparecer de cero en cada ruta.
           */}
          <NavBar />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
