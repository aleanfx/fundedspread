import type { Metadata } from "next";
import { Orbitron, Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Funded Spread",
  description:
    "Empresa de fondeo para traders. Supera la evaluación, escala tu cuenta y quédate con hasta el 90% de las ganancias. Paga con cripto.",
  openGraph: {
    title: "Funded Spread",
    description: "Empresa de fondeo para traders. Supera la evaluación, escala tu cuenta y quédate con hasta el 90% de las ganancias.",
    url: "https://www.funded-spread.com",
    siteName: "Funded Spread",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Funded Spread Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable} antialiased`}
      >
        <LanguageProvider>
          <LayoutShell>{children}</LayoutShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
