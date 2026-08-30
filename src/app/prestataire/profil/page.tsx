"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Coins,
  Globe,
  GraduationCap,
  LogOut,
  MapPin,
  Phone,
  Repeat,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  AlertCircle,
  Clock,
  Briefcase,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useUpStore, type Role } from "@/lib/store";
import { SERVICE_CATEGORIES, ZONES, type Zone, type ServiceCategory } from "@/lib/data";

const AVAILABLE_LANGUAGES = [
  "Français",
  "Anglais",
  "Espagnol",
  "Italien",
  "Chinois (Mandarin)",
  "Arabe",
  "Allemand",
  "Portugais",
];

export default function PrestataireProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setRole = useUpStore((s) => s.setRole);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Companion Profile States
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [bio, setBio] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number>(25000);
  const [eveningRate, setEveningRate] = useState<number>(75000);
  const [selectedZone, setSelectedZone] = useState<Zone>("Libreville" as Zone);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "diner_affaires",
    "evenementiel",
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "Français",
    "Anglais",
  ]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [kycStatus, setKycStatus] = useState<string>("pending");

  useEffect(() => {
    async function loadCompanionProfile() {
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
            .select(`
              *,
              companion_details (*)
            `)
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

            const details = Array.isArray(profile.companion_details)
              ? profile.companion_details[0]
              : profile.companion_details;

            if (details) {
              setBio(details.bio || "");
              setEducationLevel(details.education_level || "");
              setHourlyRate(details.hourly_rate_xaf || 25000);
              setEveningRate(details.evening_rate_xaf || 75000);
              setSelectedZone((details.zone_preference as Zone) || "Libreville");
              if (details.services_offered && details.services_offered.length > 0) {
                setSelectedServices(details.services_offered);
              }
              if (details.languages && details.languages.length > 0) {
                setSelectedLanguages(details.languages);
              }
              setIsOnline(details.is_online ?? true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading companion profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanionProfile();
  }, []);

  // Handle Photo Select
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: "L'image sélectionnée dépasse la limite autorisée de 5 Mo.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setAvatarUrl(event.target.result);
        setStatusMessage({
          type: "success",
          text: "Nouvelle photo prête. Cliquez sur 'Enregistrer mon profil' pour valider.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleService = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== srvId));
      }
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setStatusMessage({
        type: "error",
        text: "Vous devez être connecté pour sauvegarder votre profil.",
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

      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          phone: formattedPhone,
          avatar_url: avatarUrl,
        });

      if (profileError) throw profileError;

      // 2. Update companion_details table
      const { error: detailsError } = await supabase
        .from("companion_details")
        .upsert({
          companion_id: userId,
          bio: bio.trim(),
          education_level: educationLevel.trim(),
          hourly_rate_xaf: hourlyRate,
          evening_rate_xaf: eveningRate,
          services_offered: selectedServices,
          languages: selectedLanguages,
          zone_preference: selectedZone,
          is_online: isOnline,
        });

      if (detailsError) throw detailsError;

      setStatusMessage({
        type: "success",
        text: "Profil, tarifs et disponibilités enregistrés avec succès !",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Erreur lors de l'enregistrement du profil prestataire.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchRole = (newRole: Role) => {
    setRole(newRole);
    document.cookie = `up_role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
    if (newRole === "client") {
      router.push("/explore");
    } else if (newRole === "admin") {
      router.push("/dashboard/admin");
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
        {/* En-tête profil prestataire */}
        <div className="px-1 py-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
            <Sparkles size={13} />
            Espace Prestataire Certifié
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
            Paramètres &amp; Grille Tarifaire
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Gérez vos honoraires, vos prestations et votre disponibilité radar
          </p>
        </div>

        {/* Message de notification */}
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

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* 1. Photo de profil */}
          <div className="rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 text-center shadow-xl">
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Image
                src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"}
                alt={fullName || "Avatar Prestataire"}
                fill
                className="object-cover object-top"
              />
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
                <span>Mettre à jour ma photo</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#A1A1AA]">
              Photo soignée, professionnelle et représentative (Max. 5 Mo)
            </p>
          </div>

          {/* 2. Interrupteur Radar de Disponibilité (Live Switch) */}
          <div className="rounded-[28px] border border-white/10 bg-[#151518] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-base font-bold text-[#FAFAF9] flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isOnline
                        ? "bg-[#22C55E] shadow-[0_0_10px_#22c55e] animate-pulse"
                        : "bg-[#A1A1AA]"
                    }`}
                  />
                  <span>Disponibilité Radar</span>
                </span>
                <p className="mt-0.5 text-[11px] text-[#A1A1AA]">
                  {isOnline
                    ? "Votre profil apparaît comme actif et prêt pour les missions."
                    : "Votre profil est masqué des demandes instantanées."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                  isOnline
                    ? "bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E]"
                    : "bg-[#202024] border border-white/10 text-[#A1A1AA]"
                }`}
              >
                {isOnline ? (
                  <>
                    <ToggleRight size={20} className="text-[#22C55E]" />
                    <span>EN LIGNE</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={20} className="text-[#A1A1AA]" />
                    <span>HORS LIGNE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Tarifs Prestataire */}
          <div className="rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 shadow-xl space-y-4">
            <h2 className="font-display text-base font-bold text-[#FAFAF9] flex items-center gap-2">
              <Coins size={16} className="text-[#D4AF37]" />
              <span>Paramétrage des Tarifs (FCFA)</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rate-hourly"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
                >
                  Tarif Horaire (FCFA/h)
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="rate-hourly"
                    type="number"
                    min={15000}
                    step={2500}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-[#0B0B0D] p-3 text-xs font-bold text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#D4AF37] font-semibold">
                    FCFA
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="rate-evening"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
                >
                  Forfait Soirée (5h+)
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="rate-evening"
                    type="number"
                    min={50000}
                    step={5000}
                    value={eveningRate}
                    onChange={(e) => setEveningRate(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-[#0B0B0D] p-3 text-xs font-bold text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#D4AF37] font-semibold">
                    FCFA
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#A1A1AA]/80">
              💡 Les honoraires sont consignés sur le compte séquestre et reversés dès clôture OTP.
            </p>
          </div>

          {/* 4. Présentation, Biographie & Formation */}
          <div className="rounded-[28px] border border-white/10 bg-[#151518] p-6 shadow-xl space-y-4">
            <h2 className="font-display text-base font-bold text-[#FAFAF9] flex items-center gap-2">
              <GraduationCap size={16} className="text-[#D4AF37]" />
              <span>Présentation &amp; Parcours</span>
            </h2>

            <div>
              <label
                htmlFor="companion-fullname"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Nom d&apos;affichage / Prénom
              </label>
              <input
                id="companion-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Awa N."
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#0B0B0D] p-3 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="companion-phone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Téléphone Airtel / Moov Money pour versements
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Phone size={15} className="absolute left-3.5 text-[#A1A1AA]" />
                <input
                  id="companion-phone"
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
                htmlFor="companion-bio"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Biographie &amp; Description de votre profil
              </label>
              <textarea
                id="companion-bio"
                rows={3}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Décrivez votre aisance relationnelle, vos centres d'intérêts et votre expérience..."
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#0B0B0D] p-3 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="companion-education"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Diplôme ou niveau d&apos;études
              </label>
              <input
                id="companion-education"
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="Ex: Master en Droit & Relations Internationales (UOB)"
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#0B0B0D] p-3 text-xs text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="companion-zone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]"
              >
                Quartier de prédilection
              </label>
              <div className="relative mt-1.5 flex items-center">
                <MapPin size={15} className="absolute left-3.5 text-[#D4AF37]" />
                <select
                  id="companion-zone"
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

          {/* 5. Prestations Proposées */}
          <div className="rounded-[28px] border border-white/10 bg-[#151518] p-6 shadow-xl space-y-3">
            <h2 className="font-display text-base font-bold text-[#FAFAF9] flex items-center gap-2">
              <Briefcase size={16} className="text-[#D4AF37]" />
              <span>Prestations proposées</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {SERVICE_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                const isSelected = selectedServices.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleService(cat.id)}
                    className={`rounded-2xl border p-3 text-left text-xs transition ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#FAFAF9] font-semibold shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                        : "border-white/10 bg-[#0B0B0D] text-[#A1A1AA] hover:text-[#FAFAF9]"
                    }`}
                  >
                    {cat.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Langues Maîtrisées */}
          <div className="rounded-[28px] border border-white/10 bg-[#151518] p-6 shadow-xl space-y-3">
            <h2 className="font-display text-base font-bold text-[#FAFAF9] flex items-center gap-2">
              <Globe size={16} className="text-[#D4AF37]" />
              <span>Langues maîtrisées</span>
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "border border-[#D4AF37] bg-[#D4AF37] text-[#0B0B0D] font-bold"
                        : "border border-white/10 bg-[#0B0B0D] text-[#A1A1AA] hover:text-[#FAFAF9]"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
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
                <span>Enregistrer mon profil prestataire</span>
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
            onClick={() => handleSwitchRole("client")}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0B0B0D] p-3.5 text-xs font-semibold text-[#FAFAF9] transition hover:border-[#D4AF37]"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <span>Accéder à l&apos;Espace Client</span>
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
