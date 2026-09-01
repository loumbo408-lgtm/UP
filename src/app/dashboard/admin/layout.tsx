"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Radio,
  Scale,
  UserCheck,
} from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { UpLogo } from "@/components/brand/UpLogo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hydrated = useHydrated();

  const role = useUpStore((s) => s.role);
  const setRole = useUpStore((s) => s.setRole);
  const kycApplicants = useUpStore((s) => s.kycApplicants);
  const adminEscrows = useUpStore((s) => s.adminEscrows);
  const adminVenues = useUpStore((s) => s.adminVenues);

  const pendingKycCount = kycApplicants.filter((a) => a.status === "pending").length;
  const activeEscrowHeldCount = adminEscrows.filter((e) => e.status === "held").length;
  const disputedCount = adminEscrows.filter((e) => e.status === "disputed").length;

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
      label: "Aperçu Global",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: "/dashboard/admin/kyc",
      label: "Modération KYC",
      icon: UserCheck,
      badge: pendingKycCount > 0 ? pendingKycCount : null,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      href: "/dashboard/admin/escrows",
      label: "Séquestres & Litiges",
      icon: Scale,
      badge:
        disputedCount > 0
          ? `${disputedCount} litige`
          : activeEscrowHeldCount > 0
          ? activeEscrowHeldCount
          : null,
      badgeColor:
        disputedCount > 0
          ? "bg-red-50 text-red-600 border-red-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      href: "/dashboard/admin/venues",
      label: "Lieux Publics Agréés",
      icon: Building2,
      badge: adminVenues.length,
      badgeColor: "bg-up-50 text-up-700 border-up-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FB] text-[#1D0F24]">
      {/* Header Admin avec badge de sécurité et sélecteur de rôle */}
      <header className="sticky top-0 z-40 border-b border-[#F0E6F3] bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <UpLogo size={32} variant="violet" showText={true} />
              <span className="rounded-full border border-up-200 bg-up-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-up-700">
                Supervision UP
              </span>
            </Link>
          </div>

          {/* Passerelle statut & Menu de rôle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
              <Radio size={11} className="animate-pulse text-emerald-600" />
              <span>Passerelles Airtel &amp; Moov 100% Actives</span>
            </div>

            <div className="flex items-center rounded-full border border-[#F0E6F3] bg-[#FAF9FB] p-1 shadow-xs">
              <Link
                href="/client"
                onClick={() => setRole("client")}
                className="rounded-full px-3 py-1 text-[11px] font-medium text-[#6B5D73] hover:text-[#1D0F24] transition"
                title="Basculer vers Client"
              >
                Client
              </Link>
              <Link
                href="/dashboard/companion"
                onClick={() => setRole("prestataire")}
                className="rounded-full px-3 py-1 text-[11px] font-medium text-[#6B5D73] hover:text-[#1D0F24] transition"
                title="Basculer vers Prestataire"
              >
                Prestataire
              </Link>
              <span className="rounded-full bg-up-500 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Onglets de navigation horizontale Admin */}
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border border-up-500 bg-up-50 text-up-700 shadow-xs font-bold"
                    : "border border-[#F0E6F3] bg-white text-[#6B5D73] hover:border-up-200 hover:text-[#1D0F24]"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-up-700" : "text-[#6B5D73]"}
                />
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
      <div className="max-w-[1600px] mx-auto pb-12 pt-4 px-4 sm:px-6">{children}</div>
    </div>
  );
}
