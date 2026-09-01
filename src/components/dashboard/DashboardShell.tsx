"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { BottomNav } from "@/components/navigation/BottomNav";
import { UserDrawer } from "@/components/navigation/UserDrawer";
import { createClient } from "@/lib/supabase/client";
import { useUpStore, type Role } from "@/lib/store";

export interface NavItemDef {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string | null;
  badgeColor?: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  role?: Role;
  pageTitle?: string;
  pageSubtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  actionButton?: {
    label: string;
    href: string;
    icon?: React.ElementType;
  };
}

export function DashboardShell({
  children,
  rightSidebar,
  role: propRole,
  pageTitle,
  pageSubtitle,
  showSearch = true,
  searchPlaceholder = "Rechercher un profil, un lieu, une mission...",
  searchValue = "",
  onSearchChange,
  actionButton,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const storeRole = useUpStore((s) => s.role);
  const setRole = useUpStore((s) => s.setRole);
  const reservations = useUpStore((s) => s.reservations);
  const radarDemands = useUpStore((s) => s.radarDemands);
  const kycApplicants = useUpStore((s) => s.kycApplicants);
  const adminEscrows = useUpStore((s) => s.adminEscrows);

  // Rôle effectif
  const currentRole: Role =
    propRole ||
    (pathname.startsWith("/dashboard/admin")
      ? "admin"
      : pathname.startsWith("/dashboard/companion") || pathname.startsWith("/prestataire")
      ? "prestataire"
      : storeRole || "client");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [userName, setUserName] = useState<string>("Membre UP");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState<string>(searchValue);

  const activeReservationsCount = reservations.filter(
    (r) => r.status !== "annulee" && r.status !== "terminee",
  ).length;

  const pendingKycCount = kycApplicants.filter((a) => a.status === "pending").length;
  const disputedEscrowsCount = adminEscrows.filter((e) => e.status === "disputed").length;

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || "");
          const fullName =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Membre UP";
          setUserName(fullName);

          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url, full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.full_name) setUserName(profile.full_name);
            if (profile.avatar_url) setUserAvatar(profile.avatar_url);
          }
        }
      } catch {
        // ignore offline
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = "up_role=; path=/; max-age=0";
    document.cookie = "up_admin_session=; path=/; max-age=0";
    router.push("/");
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  // =========================================================================
  // MENUS STRICTS SELON LE RÔLE RÉEL DE L'UTILISATEUR (Aucun mélange)
  // =========================================================================

  // 1. Menu Rôle CLIENT
  const clientNavItems: NavItemDef[] = [
    {
      href: "/client",
      label: "Tableau de bord",
      icon: LayoutDashboard,
    },
    {
      href: "/explore",
      label: "Explorer",
      icon: Compass,
    },
    {
      href: "/client/reservations",
      label: "Réservations",
      icon: Briefcase,
      badge: activeReservationsCount > 0 ? activeReservationsCount : null,
      badgeColor: "bg-up-500 text-white",
    },
    {
      href: "/client/messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      href: "/explore?filter=favorites",
      label: "Favoris",
      icon: Heart,
    },
    {
      href: "/client/paiement",
      label: "Portefeuille",
      icon: Wallet,
    },
    {
      href: "/client/profil",
      label: "Profil",
      icon: User,
    },
    {
      href: "/client/parametres",
      label: "Paramètres",
      icon: Settings,
    },
    {
      href: "/#safety",
      label: "Aide et sécurité",
      icon: ShieldCheck,
    },
  ];

  // 2. Menu Rôle PRESTATAIRE
  const prestataireNavItems: NavItemDef[] = [
    {
      href: "/dashboard/companion",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      badge: radarDemands.length > 0 ? radarDemands.length : null,
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      href: "/prestataire/disponibilite",
      label: "Missions & Dispos",
      icon: Calendar,
    },
    {
      href: "/prestataire/messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      href: "/prestataire/gains",
      label: "Revenus & Retraits",
      icon: Wallet,
    },
    {
      href: "/prestataire/profil",
      label: "Profil Pro",
      icon: User,
    },
    {
      href: "/prestataire/parametres",
      label: "Paramètres",
      icon: Settings,
    },
    {
      href: "/#safety",
      label: "Aide et sécurité",
      icon: ShieldCheck,
    },
  ];

  // 3. Menu Rôle ADMINISTRATEUR
  const adminNavItems: NavItemDef[] = [
    {
      href: "/dashboard/admin",
      label: "Tableau de bord",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/admin/kyc",
      label: "Modération KYC",
      icon: UserCheck,
      badge: pendingKycCount > 0 ? pendingKycCount : null,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      href: "/dashboard/admin/escrows",
      label: "Séquestres & Litiges",
      icon: Scale,
      badge: disputedEscrowsCount > 0 ? `${disputedEscrowsCount} litige` : null,
      badgeColor: "bg-red-500 text-white",
    },
    {
      href: "/dashboard/admin/venues",
      label: "Lieux Publics Agréés",
      icon: Building2,
    },
    {
      href: "/dashboard/admin/finances",
      label: "Finances & Trésorerie",
      icon: Wallet,
    },
    {
      href: "/dashboard/admin/parametres",
      label: "Paramètres Système",
      icon: Settings,
    },
    {
      href: "/#safety",
      label: "Aide et sécurité",
      icon: ShieldCheck,
    },
  ];

  const navItems =
    currentRole === "admin"
      ? adminNavItems
      : currentRole === "prestataire"
      ? prestataireNavItems
      : clientNavItems;

  // Calcul du titre par défaut si non fourni
  const displayTitle =
    pageTitle ||
    (currentRole === "admin"
      ? "Supervision Exécutive"
      : currentRole === "prestataire"
      ? `Espace Prestataire · ${userName.split(" ")[0]}`
      : `Bonjour, ${userName.split(" ")[0]} 👋`);

  return (
    <div className="flex min-h-screen bg-[#FAF9FB] text-[#1D0F24]">
      {/* =====================================================================
          1. SIDEBAR FIXE GAUCHE (Desktop >= 1200 px : 250 px de large)
          ===================================================================== */}
      <aside
        className="hidden min-[1200px]:flex min-[1200px]:fixed min-[1200px]:inset-y-0 min-[1200px]:left-0 min-[1200px]:w-[250px] min-[1200px]:z-40 min-[1200px]:h-screen flex-col justify-between border-r border-[#F0E6F3] bg-white shadow-[1px_0_10px_rgba(136,7,168,0.02)]"
        aria-label="Navigation principale"
      >
        {/* En-tête Sidebar : Logo UP Officiel */}
        <div className="flex flex-col">
          <div className="flex h-18 items-center border-b border-[#F0E6F3] px-6">
            <UpLogo size={36} showText={true} />
          </div>

          {/* Badge de Rôle Actif */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between rounded-xl bg-up-50 px-3 py-1.5 text-[11px] font-semibold text-up-700">
              <span className="uppercase tracking-wider">Espace</span>
              <span className="rounded-md bg-white px-2 py-0.5 font-bold text-up-900 shadow-xs uppercase">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Liste des Liens de Navigation */}
          <nav className="space-y-1 px-3 py-2 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const isActive =
                item.href === "/client" ||
                item.href === "/dashboard/companion" ||
                item.href === "/dashboard/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500 shadow-xs"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-[#1D0F24] border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`transition-colors shrink-0 ${
                        isActive
                          ? "text-up-500"
                          : "text-[#6B5D73] group-hover:text-up-500"
                      }`}
                      strokeWidth={isActive ? 2.3 : 1.8}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10px] font-bold ${
                        item.badgeColor || "bg-up-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pied de Sidebar : Déconnexion */}
        <div className="border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#6B5D73] transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} className="shrink-0 text-red-500" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          2. ZONE PRINCIPALE : HEADER + CONTENU (Offset 250px sur Desktop >= 1200px)
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-[1200px]:pl-[250px]">
        {/* HEADER PRINCIPAL EN HAUT */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 sm:px-6 min-[1200px]:px-8 backdrop-blur-md">
          {/* Gauche : Hamburger Mobile + Titre Page */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Déclencheur Mobile Drawer */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#F0E6F3] bg-white text-[#1D0F24] shadow-xs min-[1200px]:hidden shrink-0"
              aria-label="Menu principal"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-xl font-bold tracking-tight text-[#1D0F24] truncate">
                {displayTitle}
              </h1>
              {pageSubtitle && (
                <p className="hidden sm:block text-[11px] text-[#6B5D73] truncate">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Centre : Champ de recherche si nécessaire */}
          {showSearch && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5D73]"
                />
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearchInput}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-full border border-[#F0E6F3] bg-[#FAF9FB] py-2 pl-9 pr-4 text-xs text-[#1D0F24] placeholder-[#6B5D73]/70 focus:border-up-500 focus:bg-white focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Droite : Bouton CTA + Notifications + Profil Avatar & Menu Coulissant */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {actionButton && (
              <Link
                href={actionButton.href}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] px-4 py-2 text-xs font-bold transition"
              >
                {actionButton.icon && <actionButton.icon size={13} />}
                <span>{actionButton.label}</span>
              </Link>
            )}

            {/* Notifications */}
            <Link
              href={
                currentRole === "client"
                  ? "/client/reservations"
                  : currentRole === "prestataire"
                  ? "/dashboard/companion"
                  : "/dashboard/admin/escrows"
              }
              className="relative grid h-10 w-10 place-items-center rounded-full border border-[#F0E6F3] bg-white text-[#1D0F24] shadow-2xs transition hover:border-up-500"
              title="Notifications"
            >
              <Bell size={17} />
              {(activeReservationsCount > 0 || radarDemands.length > 0) && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-up-500 ring-2 ring-white" />
              )}
            </Link>

            {/* Avatar & Menu Coulissant du Compte */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white p-1 pr-3 shadow-2xs transition hover:border-up-500"
                aria-label="Menu du compte utilisateur"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-up-50 text-up-700">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center font-bold text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-[#1D0F24] max-w-[110px] truncate">
                  {userName.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-[#6B5D73]" />
              </button>

              {/* Menu Déroulant Rapide */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#F0E6F3] bg-white p-2 shadow-xl animate-in fade-in z-50">
                  <div className="border-b border-[#F0E6F3] px-3 py-2">
                    <p className="truncate text-xs font-bold text-[#1D0F24]">
                      {userName}
                    </p>
                    <p className="truncate text-[10px] text-[#6B5D73]">
                      {userEmail || "Connecté"}
                    </p>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsUserDrawerOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[#6B5D73] hover:bg-up-50 hover:text-[#1D0F24] text-left"
                    >
                      <User size={14} className="text-up-500" />
                      <span>Ouvrir le tiroir complet</span>
                    </button>

                    <Link
                      href={
                        currentRole === "prestataire"
                          ? "/prestataire/profil"
                          : "/client/profil"
                      }
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#6B5D73] hover:bg-up-50 hover:text-[#1D0F24]"
                    >
                      <Settings size={14} className="text-up-500" />
                      <span>Mon Profil &amp; Compte</span>
                    </Link>

                    {/* Bascule de Rôles */}
                    <div className="mt-1 border-t border-[#F0E6F3] pt-1.5 px-3">
                      <span className="text-[10px] uppercase font-bold text-[#6B5D73]">
                        Changer d&apos;espace :
                      </span>
                      <div className="mt-1 grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRole("client");
                            setIsUserDropdownOpen(false);
                            router.push("/client");
                          }}
                          className={`rounded-lg py-1 text-[10px] font-bold ${
                            currentRole === "client"
                              ? "bg-up-500 text-white"
                              : "bg-gray-50 text-[#6B5D73]"
                          }`}
                        >
                          Client
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRole("prestataire");
                            setIsUserDropdownOpen(false);
                            router.push("/dashboard/companion");
                          }}
                          className={`rounded-lg py-1 text-[10px] font-bold ${
                            currentRole === "prestataire"
                              ? "bg-up-500 text-white"
                              : "bg-gray-50 text-[#6B5D73]"
                          }`}
                        >
                          Pro
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRole("admin");
                            setIsUserDropdownOpen(false);
                            router.push("/dashboard/admin");
                          }}
                          className={`rounded-lg py-1 text-[10px] font-bold ${
                            currentRole === "admin"
                              ? "bg-up-500 text-white"
                              : "bg-gray-50 text-[#6B5D73]"
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#F0E6F3] pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL DANS LE CONTENEUR MAX-W 1440 PX */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 min-[1200px]:p-8 pb-24 min-[1200px]:pb-12">
          {rightSidebar ? (
            /* Layout à 2 Colonnes sur Desktop >= 1200 px : Zone centrale flexible + Colonne 300 px */
            <div className="min-[1200px]:flex min-[1200px]:items-start min-[1200px]:gap-6">
              {/* Zone Centrale Flexible */}
              <div className="flex-1 min-w-0 space-y-6">{children}</div>

              {/* Colonne Secondaire (280 à 320 px, fixé à 300 px) */}
              <aside className="w-full min-[1200px]:w-[300px] min-[1200px]:shrink-0 space-y-6 mt-6 min-[1200px]:mt-0">
                {rightSidebar}
              </aside>
            </div>
          ) : (
            /* Layout Pleine Largeur Flexible */
            <div className="w-full space-y-6">{children}</div>
          )}
        </main>

        {/* Bottom Nav Mobile sur les petits écrans */}
        <BottomNav />
      </div>

      {/* =====================================================================
          3. DRAWER COULISSANT MOBILE / TABLETTE (< 1200 px)
          ===================================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex min-[1200px]:hidden">
          {/* Fond obscurci */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#1D0F24]/50 backdrop-blur-xs transition-opacity"
          />

          {/* Tiroir */}
          <div className="relative z-10 flex h-full w-full max-w-xs flex-col justify-between border-r border-[#F0E6F3] bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-250">
            <div>
              <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-4">
                <UpLogo size={32} showText={true} />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#F0E6F3] text-[#6B5D73]"
                  aria-label="Fermer le menu"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 mb-4 rounded-xl bg-up-50 p-2.5 text-xs text-up-700 flex justify-between items-center">
                <span>Espace actif :</span>
                <span className="font-bold text-up-900 uppercase">{currentRole}</span>
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-230px)] overflow-y-auto">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/client" ||
                    item.href === "/dashboard/companion" ||
                    item.href === "/dashboard/admin"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                        isActive
                          ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                          : "text-[#6B5D73] hover:bg-up-50/60 hover:text-[#1D0F24] border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={17}
                          className={isActive ? "text-up-500" : "text-[#6B5D73]"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-up-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-bold text-red-600"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}

      {/* Menu Coulissant du Compte (UserDrawer global) */}
      <UserDrawer isOpen={isUserDrawerOpen} onClose={() => setIsUserDrawerOpen(false)} />
    </div>
  );
}
