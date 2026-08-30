"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  ShieldCheck,
  Briefcase,
  Compass,
  LogOut,
  ChevronRight,
  Sparkles,
  Lock,
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
  const currentRole = useUpStore((s) => s.role);
  const setRole = useUpStore((s) => s.setRole);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || null);
          setUserFullName(user.user_metadata?.full_name || null);
        }
      } catch {
        // ignore offline errors
      }
    }
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSwitchRole = (role: Role) => {
    setRole(role);
    document.cookie = `up_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    if (role === "admin") {
      document.cookie = "up_admin_session=true; path=/; max-age=86400; SameSite=Lax";
      router.push("/dashboard/admin");
    } else if (role === "prestataire") {
      router.push("/dashboard/companion");
    } else {
      router.push("/explore");
    }
    onClose();
  };

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col justify-between border-l border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <UpLogo size={32} showText={true} />
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#A1A1AA] transition hover:border-white/20 hover:text-[#FAFAF9]"
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="mt-5 rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#202024]/60 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] font-display text-lg font-bold">
                {userFullName ? userFullName.charAt(0).toUpperCase() : <User size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#FAFAF9]">
                  {userFullName || "Compte Membre UP"}
                </p>
                <p className="truncate text-xs text-[#A1A1AA]">
                  {userEmail || "Membre connecté"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs">
              <span className="text-[#A1A1AA]">Espace actif :</span>
              <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#D4AF37] uppercase">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 text-sm">
            <Link
              href="/explore"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[#A1A1AA] transition hover:bg-white/5 hover:text-[#FAFAF9]"
            >
              <span className="flex items-center gap-3">
                <Compass size={18} className="text-[#D4AF37]" />
                <span>Explorer les profils</span>
              </span>
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/client/reservations"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[#A1A1AA] transition hover:bg-white/5 hover:text-[#FAFAF9]"
            >
              <span className="flex items-center gap-3">
                <Briefcase size={18} className="text-[#D4AF37]" />
                <span>Mes Réservations</span>
              </span>
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/dashboard/companion"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[#A1A1AA] transition hover:bg-white/5 hover:text-[#FAFAF9]"
            >
              <span className="flex items-center gap-3">
                <Sparkles size={18} className="text-[#F1D875]" />
                <span>Espace Prestataire</span>
              </span>
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/dashboard/admin"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[#A1A1AA] transition hover:bg-white/5 hover:text-[#FAFAF9]"
            >
              <span className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#22C55E]" />
                <span>Supervision &amp; Modération UP</span>
              </span>
              <Lock size={14} className="text-[#A1A1AA]" />
            </Link>
          </nav>

          {/* Role Switcher */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Changer d&apos;espace
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchRole("client")}
                className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                  currentRole === "client"
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#FAFAF9]"
                    : "border-white/10 bg-white/5 text-[#A1A1AA] hover:text-[#FAFAF9]"
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("prestataire")}
                className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                  currentRole === "prestataire"
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#FAFAF9]"
                    : "border-white/10 bg-white/5 text-[#A1A1AA] hover:text-[#FAFAF9]"
                }`}
              >
                Prestataire
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("admin")}
                className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                  currentRole === "admin"
                    ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#FAFAF9]"
                    : "border-white/10 bg-white/5 text-[#A1A1AA] hover:text-[#FAFAF9]"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-[#A1A1AA] transition hover:border-[#EF4444]/40 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
          <p className="mt-3 text-center text-[10px] text-[#A1A1AA]/60">
            UP Gabon v1.0 · Conciergerie Privée Encadrée
          </p>
        </div>
      </aside>
    </div>
  );
}
