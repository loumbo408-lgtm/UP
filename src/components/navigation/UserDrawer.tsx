"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronRight,
  Compass,
  Lock,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { useUpStore, type Role } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserDrawer({ isOpen, onClose }: UserDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentRole = useUpStore((s) => s.role);
  const setRole = useUpStore((s) => s.setRole);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [logoClicks, setLogoClicks] = useState<number>(0);

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || null);
          const fullName =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Membre UP";
          setUserFullName(fullName);

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.full_name) {
            setUserFullName(profile.full_name);
          }
        }
      } catch {
        // Mode déconnecté
      }
    }

    if (isOpen) {
      getUser();
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    document.cookie = "up_role=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "up_admin_session=; path=/; max-age=0; SameSite=Lax";
    setRole("client");
    setUserEmail(null);
    setUserFullName(null);
    onClose();
    window.location.href = "/";
  };

  const handleSecretLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) {
      onClose();
      router.push("/admin");
      setLogoClicks(0);
    }
  };

  if (!isOpen) return null;

  const isAdminUser =
    userEmail?.toLowerCase() === "obamstephel20@gmail.com" ||
    currentRole === "admin";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1D0F24]/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col justify-between border-l border-[#F0E6F3] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          {/* Header avec Secret Tap sur le Logo */}
          <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-5">
            <div
              onClick={handleSecretLogoClick}
              className="cursor-pointer select-none transition active:scale-95"
              title="UP Gabon"
            >
              <UpLogo size={32} variant="violet" showText={true} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#F0E6F3] bg-[#FAF9FB] text-[#6B5D73] transition hover:border-up-300 hover:text-up-700"
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="mt-5 rounded-2xl border border-up-200 bg-up-50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-up-100 text-up-700 font-display text-lg font-bold">
                {userFullName ? (
                  userFullName.charAt(0).toUpperCase()
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#1D0F24]">
                  {userFullName || "Compte Membre UP"}
                </p>
                <p className="truncate text-xs text-[#6B5D73]">
                  {userEmail || "Membre connecté"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-up-200/60 pt-2.5 text-xs">
              <span className="text-[#6B5D73]">Espace actif :</span>
              <span className="rounded-full bg-up-100 px-2.5 py-0.5 text-[11px] font-bold text-up-700 uppercase">
                {isAdminUser ? "Super-Admin" : currentRole}
              </span>
            </div>
          </div>

          {/* Navigation Links — Strictement Cloisonnés par Rôle */}
          <nav className="mt-6 space-y-1 text-sm">
            {/* Si Administrateur Officiel */}
            {isAdminUser && (
              <Link
                href="/dashboard/admin"
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                  pathname.startsWith("/dashboard/admin")
                    ? "bg-up-500 text-white font-bold shadow-md shadow-up-500/20"
                    : "bg-up-50 text-up-700 font-bold border border-up-200 hover:bg-up-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck size={18} />
                  <span>Console Super-Admin</span>
                </span>
                <ChevronRight size={16} />
              </Link>
            )}

            {/* Navigation Prestataire Exclusif */}
            {currentRole === "prestataire" && !isAdminUser && (
              <>
                <Link
                  href="/dashboard/companion"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname === "/dashboard/companion"
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles size={18} className="text-up-500" />
                    <span>Demandes Radar</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/prestataire/disponibilite"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname.startsWith("/prestataire/disponibilite")
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Briefcase size={18} className="text-up-500" />
                    <span>Missions &amp; Agenda</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/prestataire/gains"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname.startsWith("/prestataire/gains")
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles size={18} className="text-up-500" />
                    <span>Mes Revenus</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/prestataire/profil"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname.startsWith("/prestataire/profil")
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <User size={18} className="text-up-500" />
                    <span>Mon Profil Pro</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>
              </>
            )}

            {/* Navigation Client Exclusif */}
            {currentRole !== "prestataire" && !isAdminUser && (
              <>
                <Link
                  href="/client"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname === "/client"
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Compass size={18} className="text-up-500" />
                    <span>Tableau de bord</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/explore"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname === "/explore"
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Compass size={18} className="text-up-500" />
                    <span>Explorer les profils</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/client/reservations"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname === "/client/reservations"
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Briefcase size={18} className="text-up-500" />
                    <span>Mes Réservations</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/client/messages"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname === "/client/messages"
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-up-500" />
                    <span>Messages</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/client/profil"
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    pathname === "/client/profil"
                      ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                      : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <User size={18} className="text-up-500" />
                    <span>Mon Profil</span>
                  </span>
                  <ChevronRight size={16} />
                </Link>
              </>
            )}
          </nav>

          {/* Invitation inscription dédiée (Client <-> Prestataire) */}
          <div className="mt-6 border-t border-[#F0E6F3] pt-4">
            {currentRole === "client" ? (
              <Link
                href="/auth/signup?role=companion"
                onClick={onClose}
                className="flex items-center justify-between rounded-2xl border border-up-200 bg-up-50/60 p-3.5 text-xs font-semibold text-up-700 transition hover:bg-up-100/60"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-up-500" />
                  <span>Devenir prestataire certifié</span>
                </span>
                <ChevronRight size={14} className="text-up-400" />
              </Link>
            ) : currentRole === "prestataire" ? (
              <Link
                href="/auth/signup?role=client"
                onClick={onClose}
                className="flex items-center justify-between rounded-2xl border border-up-200 bg-up-50/60 p-3.5 text-xs font-semibold text-up-700 transition hover:bg-up-100/60"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-up-500" />
                  <span>Créer un compte Client</span>
                </span>
                <ChevronRight size={14} className="text-up-400" />
              </Link>
            ) : null}
          </div>
        </div>

        {/* Footer actions avec Bouton Caché Admin */}
        <div className="border-t border-[#F0E6F3] pt-4 space-y-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={16} />
            <span>Se déconnecter de UP</span>
          </button>

          {/* Bouton caché / discret administration */}
          <div className="text-center">
            <Link
              href="/admin"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[10px] text-[#6B5D73]/50 hover:text-up-700 transition p-1"
              title="Supervision interne UP"
            >
              <Lock size={10} />
              <span>Administration interne</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
