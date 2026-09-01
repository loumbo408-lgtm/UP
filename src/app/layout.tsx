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
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UP Gabon — Conciergerie Privée & Accompagnement Professionnel",
  description:
    "Plateforme de mise en relation sécurisée avec des prestataires et accompagnateurs vérifiés au Gabon pour vos événements, rendez-vous d'affaires et moments de partage.",
  applicationName: "UP Gabon",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UP Gabon",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: "/brand/up-logo.svg",
    apple: "/brand/up-logo.jpeg",
  },
};

export const viewport: Viewport = {
  themeColor: "#8807A8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-dvh bg-[#FAF9FB] font-sans text-[#1D0F24] antialiased select-none selection:bg-up-100 selection:text-up-900">
        <NetworkStatusBanner />
        <div className="min-h-dvh flex flex-col w-full bg-[#FAF9FB]">
          {children}
        </div>
      </body>
    </html>
  );
}
