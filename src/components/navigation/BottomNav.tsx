"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Briefcase,
  Heart,
  User,
  Radar,
  Wallet,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { useUpStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const currentRole = useUpStore((s) => s.role);

  // Hidden on admin dashboard which has its own dedicated desktop sidebar / header
  if (pathname.startsWith("/dashboard/admin")) {
    return null;
  }

  const isPrestataire =
    currentRole === "prestataire" ||
    pathname.startsWith("/dashboard/companion") ||
    pathname.startsWith("/prestataire");

  // Client Items : Accueil (Dashboard) · Explorer · Réservations · Favoris · Compte
  const clientItems = [
    {
      href: "/client",
      label: "Accueil",
      icon: LayoutDashboard,
      isActive: pathname === "/client",
    },
    {
      href: "/explore",
      label: "Explorer",
      icon: Compass,
      isActive: pathname === "/explore" || pathname.startsWith("/companion/"),
    },
    {
      href: "/client/reservations",
      label: "Réservations",
      icon: Briefcase,
      isActive:
        pathname.startsWith("/client/reservations") ||
        pathname.startsWith("/client/paiement/"),
    },
    {
      href: "/explore?filter=favorites",
      label: "Favoris",
      icon: Heart,
      isActive: pathname.includes("filter=favorites"),
    },
    {
      href: "/client/profil",
      label: "Compte",
      icon: User,
      isActive: pathname === "/client/profil",
    },
  ];

  // Prestataire Items : Demandes · Missions · Revenus · Profil
  const prestataireItems = [
    {
      href: "/dashboard/companion",
      label: "Demandes",
      icon: Radar,
      isActive: pathname === "/dashboard/companion",
    },
    {
      href: "/prestataire/disponibilite",
      label: "Missions",
      icon: Clock,
      isActive:
        pathname.startsWith("/prestataire/disponibilite") ||
        pathname.startsWith("/mission/"),
    },
    {
      href: "/prestataire/gains",
      label: "Revenus",
      icon: Wallet,
      isActive: pathname.startsWith("/prestataire/gains"),
    },
    {
      href: "/prestataire/profil",
      label: "Profil",
      icon: User,
      isActive: pathname.startsWith("/prestataire/profil"),
    },
  ];

  const items = isPrestataire ? prestataireItems : clientItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#F0E6F3] bg-white/95 px-3 pt-2 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] backdrop-blur-lg md:hidden shadow-[0_-4px_20px_rgba(136,7,168,0.06)]"
      aria-label="Navigation principale mobile"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors ${
                item.isActive
                  ? "text-up-500"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
              }`}
            >
              <span
                className={`relative grid h-8 w-8 place-items-center rounded-full transition-all ${
                  item.isActive ? "bg-up-50 text-up-500" : ""
                }`}
              >
                <Icon size={18} strokeWidth={item.isActive ? 2.3 : 1.8} />
                {item.isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#8807A8] shadow-[0_0_6px_#8807A8]" />
                )}
              </span>
              <span className="mt-1 text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
