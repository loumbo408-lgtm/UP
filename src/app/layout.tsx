import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { NetworkStatusBanner } from "@/components/network-status-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UP — Conciergerie privée & accompagnement social",
  description:
    "La conciergerie privée premium et l'accompagnement social, partout au Gabon.",
  applicationName: "UP",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-up-black font-sans text-up-white antialiased">
        <NetworkStatusBanner />
        {/* Coquille mobile-first : largeur contrainte, centrée sur grand écran */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-up-black">
          {children}
        </div>
      </body>
    </html>
  );
}
