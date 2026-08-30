"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Repeat,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUpStore, type Role } from "@/lib/store";
import { ZONES, type Zone } from "@/lib/data";

export default function ClientProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setRole = useUpStore((s) => s.setRole);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile Form States
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<Zone>("Libreville" as Zone);
  const [kycStatus, setKycStatus] = useState<string>("pending");

  useEffect(() => {
    async function loadUserProfile() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setEmail(user.email || "");

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            setFullName(profile.full_name || user.user_metadata?.full_name || "");
            setPhone(profile.phone || user.user_metadata?.phone || "");
            setAvatarUrl(
              profile.avatar_url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
            );
            setKycStatus(profile.kyc_status || "pending");
          } else {
            setFullName(user.user_metadata?.full_name || "");
            setPhone(user.user_metadata?.phone || "");
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  // Handle Photo Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: "L'image sélectionnée dépasse la taille maximale autorisée de 5 Mo.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setAvatarUrl(event.target.result);
        setStatusMessage({
          type: "success",
          text: "Nouvelle photo prête. Cliquez sur 'Enregistrer' pour sauvegarder.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setStatusMessage({
        type: "error",
        text: "Vous devez être connecté pour sauvegarder vos modifications.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const supabase = createClient();
      const formattedPhone = phone.trim().startsWith("+")
        ? phone.trim()
        : `+241${phone.trim().replace(/^0/, "")}`;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          phone: formattedPhone,
          avatar_url: avatarUrl,
        });

      if (error) {
        throw error;
      }

      setStatusMessage({
        type: "success",
        text: "Profil et photo mis à jour avec succès !",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Erreur lors de l'enregistrement du profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchRole = (newRole: Role) => {
    setRole(newRole);
    document.cookie = `up_role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    if (newRole === "prestataire") {
      router.push("/dashboard/companion");
    } else if (newRole === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/explore");
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
    router.push("/");
  };

  return (
    <AppShell showHeader={true} showBottomNav={true} maxWidth="md">
      <div className="pt-2 pb-12">
        {/* En-tête profil */}
        <div className="px-1 py-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
            <Sparkles size={13} />
            Espace Membre Client
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
            Mon Profil &amp; Paramètres
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Gérez vos informations privées et votre photo de profil
          </p>
        </div>

        {/* Message de statut */}
        {statusMessage && (
          <div
            className={`mt-4 flex items-center gap-2.5 rounded-2xl p-4 text-xs animate-in fade-in ${
              statusMessage.type === "success"
                ? "border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]"
                : "border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Formulaire de Profil & Téléversement de Photo */}
        <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
          {/* Carte Avatar */}
          <div className="rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 text-center shadow-xl">
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName || "Photo de profil"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[#202024] text-[#D4AF37]">
                  <User size={40} />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
              >
                <Camera size={14} />
                <span>Changer la photo</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#A1A1AA]">
              Formats acceptés : JPG, PNG, WEBP (Max. 5 Mo)
            </p>
          </div>

          {/* Informations Personnelles */}
          <div className="rounded-[28px] border border-white/10 bg-[#151518] p-6 shadow-xl space-y-4">
            <h2 className="font-display text-base font-bold text-[#FAFAF9] flex items-center gap-2">
              <User size={16} className="text-[#D4AF37]" />
              <span>Informations du Compte</span>
            </h2>

            <div>
              <label
                htmlFor="client-fullname"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Nom et Prénom
              </label>
              <input
                id="client-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jean-Paul Mba"
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#0B0B0D] p-3 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="client-phone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Numéro de Téléphone (Mobile Money)
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Phone size={15} className="absolute left-3.5 text-[#A1A1AA]" />
                <input
                  id="client-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+241 074 12 34 56"
                  className="w-full rounded-2xl border border-white/10 bg-[#0B0B0D] py-3 pl-10 pr-3 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="client-email"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Adresse E-mail
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Mail size={15} className="absolute left-3.5 text-[#A1A1AA]" />
                <input
                  id="client-email"
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-2xl border border-white/5 bg-[#0B0B0D]/50 py-3 pl-10 pr-3 text-xs text-[#A1A1AA] cursor-not-allowed opacity-80"
                />
              </div>
              <p className="mt-1 text-[10px] text-[#A1A1AA]/60">
                L&apos;adresse e-mail est liée à votre authentification sécurisée.
              </p>
            </div>

            <div>
              <label
                htmlFor="client-zone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Quartier / Zone Principale
              </label>
              <div className="relative mt-1.5 flex items-center">
                <MapPin size={15} className="absolute left-3.5 text-[#D4AF37]" />
                <select
                  id="client-zone"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as Zone)}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0B0B0D] py-3 pl-10 pr-8 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                >
                  {ZONES.filter((z) => z !== "Toutes").map((z) => (
                    <option key={z} value={z} className="bg-[#151518] text-[#FAFAF9]">
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bouton d'enregistrement */}
          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] py-4 text-xs font-bold text-[#0B0B0D] transition-all hover:bg-[#F1D875] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
          >
            {isSaving ? (
              <span>Enregistrement en cours...</span>
            ) : (
              <>
                <Save size={16} />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </form>

        {/* Changer d'espace / Rôle */}
        <div className="mt-8 rounded-[28px] border border-white/10 bg-[#151518] p-6 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Espaces &amp; Navigation
          </p>

          <button
            type="button"
            onClick={() => handleSwitchRole("prestataire")}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0B0B0D] p-3.5 text-xs font-semibold text-[#FAFAF9] transition hover:border-[#D4AF37]"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#F1D875]" />
              <span>Accéder à l&apos;Espace Prestataire</span>
            </span>
            <Repeat size={14} className="text-[#A1A1AA]" />
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0B0B0D] py-3 text-xs font-semibold text-[#EF4444] transition hover:bg-[#EF4444]/10 hover:border-[#EF4444]/30"
          >
            <LogOut size={16} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
