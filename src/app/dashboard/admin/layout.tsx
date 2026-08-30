"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Compass,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Radar,
  Radio,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { PersonaShell } from "@/components/persona-shell";
import { adminNav } from "@/lib/nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();

  const role = useUpStore((s) => s.role);
  const setRole = useUpStore((s) => s.setRole);
  const kycApplicants = useUpStore((s) => s.kycApplicants);
  const adminEscrows = useUpStore((s) => s.adminEscrows);
  const adminVenues = useUpStore((s) => s.adminVenues);

  const pendingKycCount = kycApplicants.filter((a) => a.status === "pending").length;
  const activeEscrowHeldCount = adminEscrows.filter((e) => e.status === "held").length;
  const disputedCount = adminEscrows.filter((e) => e.status === "disputed").length;

  // S'assurer que le rôle est admin et que les cookies sont présents
  useEffect(() => {
    if (typeof document !== "undefined" && role !== "admin") {
      document.cookie = "up_role=admin; path=/; max-age=86400; SameSite=Lax";
      document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
      setRole("admin");
    }
  }, [role, setRole]);

  const navTabs = [
    {
      href: "/dashboard/admin",
      label: "Aperçu",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: "/dashboard/admin/kyc",
      label: "KYC & Identités",
      icon: UserCheck,
      badge: pendingKycCount > 0 ? pendingKycCount : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    {
      href: "/dashboard/admin/escrows",
      label: "Séquestres & Litiges",
      icon: Scale,
      badge: disputedCount > 0 ? `${disputedCount} litige` : activeEscrowHeldCount > 0 ? activeEscrowHeldCount : null,
      badgeColor: disputedCount > 0 ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      href: "/dashboard/admin/venues",
      label: "Lieux Publics",
      icon: Building2,
      badge: adminVenues.length,
      badgeColor: "bg-white/10 text-up-gray border-white/10",
    },
  ];

  return (
    <PersonaShell items={adminNav}>
      <div className="min-h-dvh bg-up-black text-up-white">
        {/* Header Admin avec badge de sécurité et sélecteur de rôle */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-up-black/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/admin" className="flex items-center gap-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-up-white">
                  UP
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-up-gold shadow-[0_0_10px_#d4af37]" />
                <span className="rounded-lg border border-up-gold/40 bg-up-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-up-gold">
                  Supervision UP
                </span>
              </Link>
            </div>

            {/* Passerelle statut & Menu de déconnexion rapide */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                <Radio size={10} className="animate-pulse text-emerald-400" />
                <span>Passerelles Airtel &amp; Moov 100% OK</span>
              </div>

              <div className="flex items-center rounded-xl border border-white/10 bg-up-surface p-0.5">
                <Link
                  href="/explore"
                  onClick={() => setRole("client")}
                  className="rounded-lg px-2 py-1 text-[10px] font-medium text-up-gray hover:text-up-white"
                  title="Basculer vers Client"
                >
                  Client
                </Link>
                <Link
                  href="/dashboard/companion"
                  onClick={() => setRole("prestataire")}
                  className="rounded-lg px-2 py-1 text-[10px] font-medium text-up-gray hover:text-up-white"
                  title="Basculer vers Prestataire"
                >
                  Prestataire
                </Link>
                <span className="rounded-lg bg-up-gold px-2 py-1 text-[10px] font-bold text-up-black shadow">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Onglets de navigation horizontale Admin */}
          <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {navTabs.map((tab) => {
              const isActive =
                tab.href === "/dashboard/admin"
                  ? pathname === "/dashboard/admin"
                  : pathname.startsWith(tab.href);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border border-up-gold/60 bg-up-gold/15 text-up-gold shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                      : "border border-white/5 bg-up-surface/60 text-up-gray hover:border-white/20 hover:text-up-white"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-up-gold" : "text-up-gray"} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${tab.badgeColor}`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Contenu principal de la page admin */}
        <div className="pb-8">{children}</div>
      </div>
    </PersonaShell>
  );
}
