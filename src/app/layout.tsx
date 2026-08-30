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
  title: "UP Gabon — Conciergerie Privée & Accompagnement d'Élite",
  description:
    "Plateforme officielle d'accompagnement social encadré, protocolaire et d'assistance de conciergerie privée au Gabon.",
  applicationName: "UP Gabon",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} dark`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-dvh bg-[#0B0B0D] font-sans text-[#FAFAF9] antialiased select-none selection:bg-[#D4AF37]/30 selection:text-[#FAFAF9]">
        <NetworkStatusBanner />
        <div className="min-h-dvh flex flex-col w-full bg-[#0B0B0D]">
          {children}
        </div>
      </body>
    </html>
  );
}
