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
  title: "FUNDED SPREAD — Prop Firm",
  description:
    "The ultimate prop trading platform. Pass your evaluation, scale your account through Checkpoints, and trade your way to the top.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable} antialiased`}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
