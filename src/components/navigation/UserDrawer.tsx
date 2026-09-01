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

  const handleSwitchRole = (newRole: Role) => {
    setRole(newRole);
    document.cookie = `up_role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    onClose();
    if (newRole === "prestataire") {
      router.push("/dashboard/companion");
    } else if (newRole === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/client");
    }
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
        className="fixed inset-0 bg-[#1D0F24]/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col justify-between border-l border-[#F0E6F3] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-5">
            <UpLogo size={32} variant="violet" showText={true} />
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
                {currentRole}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 text-sm">
            <Link
              href="/client"
              onClick={onClose}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
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
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
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
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
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
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                pathname === "/client/messages"
                  ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                  : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare size={18} className="text-up-500" />
                <span>Messages &amp; Échanges</span>
              </span>
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/dashboard/companion"
              onClick={onClose}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                pathname === "/dashboard/companion"
                  ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                  : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
              }`}
            >
              <span className="flex items-center gap-3">
                <Sparkles size={18} className="text-up-500" />
                <span>Espace Prestataire</span>
              </span>
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/dashboard/admin"
              onClick={onClose}
              className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                pathname.startsWith("/dashboard/admin")
                  ? "bg-up-50 text-up-700 font-bold border-l-4 border-up-500"
                  : "text-[#6B5D73] hover:bg-up-50/60 hover:text-up-700"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Supervision &amp; Modération UP</span>
              </span>
              <Lock size={14} className="text-[#6B5D73]" />
            </Link>
          </nav>

          {/* Role Switcher */}
          <div className="mt-6 border-t border-[#F0E6F3] pt-4">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]">
              Changer d&apos;espace
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchRole("client")}
                className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                  currentRole === "client"
                    ? "border-up-500 bg-up-500 text-white shadow-sm"
                    : "border-[#F0E6F3] bg-up-50/50 text-[#6B5D73] hover:text-up-700"
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("prestataire")}
                className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                  currentRole === "prestataire"
                    ? "border-up-500 bg-up-500 text-white shadow-sm"
                    : "border-[#F0E6F3] bg-up-50/50 text-[#6B5D73] hover:text-up-700"
                }`}
              >
                Prestataire
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("admin")}
                className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                  currentRole === "admin"
                    ? "border-up-500 bg-up-500 text-white shadow-sm"
                    : "border-[#F0E6F3] bg-up-50/50 text-[#6B5D73] hover:text-up-700"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#F0E6F3] pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={16} />
            <span>Se déconnecter de UP</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
