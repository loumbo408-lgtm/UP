"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
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
import { compressImageFile } from "@/lib/image-upload";

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
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: "L'image sélectionnée dépasse la taille maximale autorisée de 10 Mo.",
      });
      return;
    }

    try {
      setStatusMessage({
        type: "success",
        text: "Optimisation de l'image en cours...",
      });
      const compressed = await compressImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
      });
      setAvatarUrl(compressed);
      setStatusMessage({
        type: "success",
        text: "Photo prête et optimisée. Cliquez sur 'Enregistrer' pour sauvegarder.",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Erreur lors du traitement de la photo.",
      });
    }
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
      const rawPhone = phone.trim();
      let formattedPhone: string | null = null;
      if (rawPhone.length > 0) {
        formattedPhone = rawPhone.startsWith("+")
          ? rawPhone
          : `+241${rawPhone.replace(/^0/, "")}`;
      }

      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: formattedPhone,
          avatarUrl: avatarUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement du profil.");
      }

      setStatusMessage({
        type: "success",
        text: "Profil et photo enregistrés avec succès !",
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
        {/* En-tête profil client */}
        <div className="px-1 py-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-up-700">
            <Sparkles size={13} />
            Espace Client Membre
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1D0F24]">
            Mon Profil &amp; Préférences
          </h1>
          <p className="mt-1 text-xs text-[#6B5D73]">
            Gérez vos informations privées et votre photo de profil
          </p>
        </div>

        {/* Message de statut */}
        {statusMessage && (
          <div
            className={`mt-4 flex items-center gap-2.5 rounded-2xl p-4 text-xs animate-in fade-in ${
              statusMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-600"
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
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 text-center shadow-xs">
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-up-500 shadow-md shadow-up-500/20">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName || "Photo de profil"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-up-50 text-up-600">
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
                className="flex items-center gap-1.5 rounded-full border border-up-200 bg-up-50 px-4 py-2 text-xs font-semibold text-up-700 transition hover:bg-up-100"
              >
                <Camera size={14} />
                <span>Changer la photo</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#6B5D73]">
              Formats acceptés : JPG, PNG, WEBP (Max. 5 Mo)
            </p>
          </div>

          {/* Informations Personnelles */}
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-display text-base font-bold text-[#1D0F24] flex items-center gap-2">
              <User size={16} className="text-up-500" />
              <span>Informations du Compte</span>
            </h2>

            <div>
              <label
                htmlFor="client-fullname"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
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
                className="mt-1.5 w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="client-phone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
              >
                Numéro de Téléphone (Mobile Money)
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Phone size={15} className="absolute left-3.5 text-[#6B5D73]" />
                <input
                  id="client-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+241 074 12 34 56"
                  className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-10 pr-3 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="client-email"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
              >
                Adresse E-mail
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Mail size={15} className="absolute left-3.5 text-[#6B5D73]" />
                <input
                  id="client-email"
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB]/60 py-3 pl-10 pr-3 text-xs text-[#6B5D73] cursor-not-allowed opacity-80"
                />
              </div>
              <p className="mt-1 text-[10px] text-[#6B5D73]">
                L&apos;adresse e-mail est liée à votre authentification sécurisée.
              </p>
            </div>

            <div>
              <label
                htmlFor="client-zone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B5D73]"
              >
                Quartier / Zone Principale
              </label>
              <div className="relative mt-1.5 flex items-center">
                <MapPin size={15} className="absolute left-3.5 text-up-500" />
                <select
                  id="client-zone"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as Zone)}
                  className="w-full appearance-none rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] py-3 pl-10 pr-8 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                >
                  {ZONES.filter((z) => z !== "Toutes").map((z) => (
                    <option key={z} value={z} className="bg-white text-[#1D0F24]">
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-4 text-xs font-bold transition-all disabled:opacity-50"
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

        {/* Devenir Prestataire (Compte Pro dédié) */}
        <div className="mt-8 rounded-3xl border border-up-200 bg-up-50/60 p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-up-700">
            <Sparkles size={18} className="text-up-500" />
            <h3 className="font-display text-sm font-bold text-[#1D0F24]">
              Vous souhaitez proposer vos services ?
            </h3>
          </div>
          <p className="text-xs text-[#6B5D73] leading-relaxed">
            Pour des raisons de conformité et de vérification d&apos;identité (KYC), les prestataires doivent créer un compte professionnel distinct.
          </p>
          <Link
            href="/auth/signup?role=companion"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-up-500 text-white hover:bg-up-600 py-3.5 text-xs font-bold transition shadow-xs"
          >
            <span>Créer un compte Prestataire Pro</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Déconnexion */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/60 py-3.5 text-xs font-semibold text-red-600 transition hover:bg-red-100/60"
          >
            <LogOut size={16} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
