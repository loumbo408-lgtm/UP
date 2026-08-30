"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Briefcase, Sparkles, User, ShieldCheck } from "lucide-react";
import { useUpStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const currentRole = useUpStore((s) => s.role);

  // Hidden on admin dashboard which has its own dedicated navigation
  if (pathname.startsWith("/dashboard/admin")) {
    return null;
  }

  const items = [
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
      isActive: pathname.startsWith("/client/reservations") || pathname.startsWith("/client/paiement/"),
    },
    {
      href: "/dashboard/companion",
      label: "Prestataire",
      icon: Sparkles,
      isActive: pathname.startsWith("/dashboard/companion") || pathname.startsWith("/prestataire/"),
    },
    {
      href: currentRole === "admin" ? "/dashboard/admin" : "/client/profil",
      label: "Compte",
      icon: currentRole === "admin" ? ShieldCheck : User,
      isActive: pathname === "/client/profil" || pathname === "/prestataire/profil",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(212,175,55,0.22)] bg-[#151518]/95 px-3 pt-2 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] backdrop-blur-lg md:hidden"
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
                item.isActive ? "text-[#D4AF37]" : "text-[#A1A1AA] hover:text-[#FAFAF9]"
              }`}
            >
              <span
                className={`relative grid h-8 w-8 place-items-center rounded-xl transition-all ${
                  item.isActive ? "bg-[#D4AF37]/15 text-[#D4AF37]" : ""
                }`}
              >
                <Icon size={18} />
                {item.isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
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
