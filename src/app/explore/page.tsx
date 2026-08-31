"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Calendar,
  Coffee,
  Eye,
  Filter,
  Flame,
  Heart,
  Layers,
  LayoutGrid,
  MapPin,
  MessageCircle,
  PartyPopper,
  Radio,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
  Utensils,
  X,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  SERVICE_CATEGORIES,
  ZONES,
  type ServiceCategory,
  type Zone,
} from "@/lib/data";
import { AppShell } from "@/components/layout/AppShell";
import { fetchVerifiedCompanions, type SupabaseCompanion } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_ICONS: Record<ServiceCategory, typeof Sparkles> = {
  all: Sparkles,
  diner_affaires: Utensils,
  evenementiel: PartyPopper,
  discussion_cafe: Coffee,
  aide_logistique: Briefcase,
};

type PillTab = "all" | "new" | "nearby";
type ViewMode = "deck" | "grid";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PillTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("deck");
  const [selectedZone, setSelectedZone] = useState<Zone>("Toutes");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [companions, setCompanions] = useState<SupabaseCompanion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Fetch current user avatar
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.avatar_url) {
            setUserAvatar(profile.avatar_url);
          }
        }
      } catch {
        // ignore
      }
    }
    loadUser();
  }, []);

  // Fetch verified companions from Supabase
  const loadCompanions = async () => {
    setIsLoading(true);
    const data = await fetchVerifiedCompanions({
      zone: selectedZone !== "Toutes" ? selectedZone : undefined,
      service: selectedCategory !== "all" ? selectedCategory : undefined,
      query: searchQuery.trim() || undefined,
    });
    setCompanions(data);
    setCurrentIndex(0);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCompanions();
  }, [selectedZone, selectedCategory, searchQuery]);

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const nextCard = () => {
    if (companions.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % companions.length);
    }
  };

  const prevCard = () => {
    if (companions.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + companions.length) % companions.length);
    }
  };

  const resetFilters = () => {
    setActiveTab("all");
    setSelectedZone("Toutes");
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const currentCompanion = companions[currentIndex];
  const nextCompanion1 = companions[(currentIndex + 1) % companions.length];
  const nextCompanion2 = companions[(currentIndex + 2) % companions.length];

  return (
    <AppShell showHeader={true} showBottomNav={true} maxWidth="7xl">
      <div className="pt-2 pb-10 max-w-4xl mx-auto">
        {/* ===================================================================
            1. TOP BAR (Inspiré fidèlement de ILLUSTRATION2.webp - Middle Phone)
            Avatar utilisateur | Titre Élégant "Matches / Découvrir" | Cloche Notif
            =================================================================== */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-white/5">
          <Link
            href="/client/profil"
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/50 transition hover:scale-105"
            title="Mon profil"
          >
            <Image
              src={
                userAvatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
              }
              alt="Mon avatar"
              fill
              className="object-cover"
            />
          </Link>

          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-3xl">
              Découvrir
            </h1>
            <p className="text-[10px] uppercase font-semibold tracking-widest text-[#D4AF37]">
              Sélection d&apos;Élite Libreville
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/client/reservations"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#151518] text-[#FAFAF9] transition hover:border-[#D4AF37]/40"
              title="Mes notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#3B82F6] text-[9px] font-bold text-white shadow-[0_0_8px_#3B82F6]">
                1
              </span>
            </Link>
          </div>
        </div>

        {/* ===================================================================
            2. BARRE DE FILTRES EN PILULES (Style ILLUSTRATION2.webp)
            Tous · Nouveaux · À proximité · Bouton filtre
            =================================================================== */}
        <div className="mt-4 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#151518]/90 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setSelectedZone("Toutes");
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-[#D4AF37] text-[#0B0B0D] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  : "text-[#A1A1AA] hover:text-[#FAFAF9]"
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("new");
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "new"
                  ? "bg-[#D4AF37] text-[#0B0B0D] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  : "text-[#A1A1AA] hover:text-[#FAFAF9]"
              }`}
            >
              Nouveaux
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("nearby");
                setSelectedZone("Sablière");
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "nearby"
                  ? "bg-[#D4AF37] text-[#0B0B0D] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  : "text-[#A1A1AA] hover:text-[#FAFAF9]"
              }`}
            >
              À proximité
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Bascule Mode Card Deck / Grille */}
            <div className="flex items-center rounded-full border border-white/10 bg-[#151518] p-1">
              <button
                type="button"
                onClick={() => setViewMode("deck")}
                className={`grid h-7 w-7 place-items-center rounded-full transition ${
                  viewMode === "deck"
                    ? "bg-[#D4AF37] text-[#0B0B0D]"
                    : "text-[#A1A1AA] hover:text-[#FAFAF9]"
                }`}
                title="Mode Cartes Empilées"
              >
                <Layers size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`grid h-7 w-7 place-items-center rounded-full transition ${
                  viewMode === "grid"
                    ? "bg-[#D4AF37] text-[#0B0B0D]"
                    : "text-[#A1A1AA] hover:text-[#FAFAF9]"
                }`}
                title="Mode Galerie Grille"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {/* Sélecteur de Zone */}
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value as Zone)}
              className="rounded-full border border-white/10 bg-[#151518] px-3.5 py-1.5 text-xs font-semibold text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
            >
              {ZONES.map((z) => (
                <option key={z} value={z} className="bg-[#151518] text-[#FAFAF9]">
                  {z === "Toutes" ? "Quartiers" : z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barre de Recherche Minimale */}
        <div className="relative mt-3 px-1">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par prénom, langue, centre d'intérêt..."
            className="w-full rounded-2xl border border-white/10 bg-[#151518] py-2.5 pl-10 pr-9 text-xs text-[#FAFAF9] placeholder-[#A1A1AA]/50 focus:border-[#D4AF37] focus:outline-none shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FAFAF9]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ===================================================================
            3. AFFICHAGE PRINCIPAL : MODE CARD STACK (CARD DECK 3D)
            =================================================================== */}
        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <div className="aspect-[3/4] w-full max-w-sm rounded-[32px] border border-white/10 bg-[#151518] animate-pulse" />
          </div>
        ) : companions.length > 0 ? (
          viewMode === "deck" && currentCompanion ? (
            <div className="mt-6 flex flex-col items-center">
              {/* Conteneur du Deck 3D */}
              <div className="relative aspect-[3/4] w-full max-w-[340px] sm:max-w-[380px]">
                {/* 3ème carte en arrière-plan (Effet 3D subtil) */}
                {companions.length > 2 && nextCompanion2 && (
                  <div className="absolute inset-0 card-layer-back-2 rounded-[32px] overflow-hidden bg-[#202024] border border-white/5 shadow-2xl">
                    <Image
                      src={nextCompanion2.avatar}
                      alt={nextCompanion2.name}
                      fill
                      className="object-cover opacity-30"
                    />
                  </div>
                )}

                {/* 2ème carte en arrière-plan */}
                {companions.length > 1 && nextCompanion1 && (
                  <div className="absolute inset-0 card-layer-back-1 rounded-[32px] overflow-hidden bg-[#151518] border border-white/10 shadow-2xl">
                    <Image
                      src={nextCompanion1.avatar}
                      alt={nextCompanion1.name}
                      fill
                      className="object-cover opacity-50"
                    />
                  </div>
                )}

                {/* CARTE PRINCIPALE AVANT-PLAN (Style ILLUSTRATION2.webp) */}
                <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-[rgba(212,175,55,0.35)] bg-[#0B0B0D] shadow-[0_20px_60px_rgba(0,0,0,0.9)] transition-transform duration-300">
                  <Image
                    src={currentCompanion.avatar}
                    alt={currentCompanion.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    priority
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/35 to-black/20" />

                  {/* 1. Barres d'indicateur de Story en haut de la carte */}
                  <div className="absolute left-5 right-5 top-4 flex gap-1.5 z-20">
                    <div className="h-1 flex-1 rounded-full bg-white shadow-md" />
                    <div className="h-1 flex-1 rounded-full bg-white/40" />
                    <div className="h-1 flex-1 rounded-full bg-white/40" />
                  </div>

                  {/* 2. Badge d'accréditation KYC & En Ligne */}
                  <div className="absolute left-5 top-8 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold text-[#FAFAF9] backdrop-blur-md shadow-lg z-20">
                    <BadgeCheck size={14} className="text-[#D4AF37]" />
                    <span>Identité Certifiée</span>
                  </div>

                  <div className="absolute right-5 top-8 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-black/60 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md shadow-lg z-20">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                    <span>En ligne</span>
                  </div>

                  {/* 3. Informations du Profil (Style Exact ILLUSTRATION2.webp) */}
                  <div className="absolute bottom-5 left-5 right-5 z-20 text-left">
                    <div className="flex items-baseline justify-between">
                      <h2 className="font-display text-3xl font-bold tracking-tight text-[#FAFAF9]">
                        {currentCompanion.name}
                      </h2>
                      <span className="font-display text-base font-bold text-[#D4AF37]">
                        {currentCompanion.hourlyRate.toLocaleString("fr-FR")}{" "}
                        <span className="text-[10px] font-normal text-[#A1A1AA]">
                          FCFA/h
                        </span>
                      </span>
                    </div>

                    {/* Localisation + Drapeau Gabon + Distance */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium text-[#FAFAF9] backdrop-blur-md">
                        <span>🇬🇦 Gabon, {currentCompanion.zone}</span>
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#FAFAF9] backdrop-blur-md">
                        2.8 km
                      </span>
                    </div>

                    {/* Tags de compétences en pilules translucides */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {currentCompanion.services.slice(0, 3).map((srv) => (
                        <span
                          key={srv}
                          className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium text-[#FAFAF9] backdrop-blur-md"
                        >
                          <span className="text-[#D4AF37]">✦</span>
                          <span>{srv.replace("_", " ")}</span>
                        </span>
                      ))}
                    </div>

                    <p className="mt-2.5 line-clamp-2 text-xs text-[#A1A1AA] leading-relaxed">
                      {currentCompanion.bio || "Accompagnement raffiné pour vos dîners, vernissages et rendez-vous d'affaires."}
                    </p>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  4. BOUTONS D'ACTION CIRCULAIRES FLOTTANTS
                  (Inspiré à 100% de la barre d'action de ILLUSTRATION2.webp)
                  Passer (X) | Réserver (Cœur / Calendrier) | Détails (Message)
                  ============================================================= */}
              <div className="mt-6 flex items-center justify-center gap-6">
                {/* Bouton Gauche : Passer au profil suivant (X) */}
                <button
                  type="button"
                  onClick={nextCard}
                  className="floating-action-btn grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-[#151518] text-[#FAFAF9] backdrop-blur-md hover:border-white/40 hover:bg-[#202024]"
                  aria-label="Passer au profil suivant"
                >
                  <X size={22} className="text-[#A1A1AA]" />
                </button>

                {/* Bouton Central : Réserver / Coup de cœur (Large & Lumineux) */}
                <Link
                  href={`/companion/${currentCompanion.id}`}
                  className="floating-action-btn grid h-16 w-16 place-items-center rounded-full border border-[#F1D875] bg-[#D4AF37] text-[#0B0B0D] shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:bg-[#F1D875]"
                  aria-label="Réserver ce profil"
                >
                  <Calendar size={26} strokeWidth={2.4} />
                </Link>

                {/* Bouton Droit : Voir la fiche complète & Messagerie */}
                <Link
                  href={`/companion/${currentCompanion.id}`}
                  className="floating-action-btn grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-[#151518] text-[#FAFAF9] backdrop-blur-md hover:border-white/40 hover:bg-[#202024]"
                  aria-label="Voir la fiche détaillée"
                >
                  <MessageCircle size={22} className="text-[#A1A1AA]" />
                </Link>
              </div>

              {/* Compteur d'index */}
              <div className="mt-4 text-[11px] font-medium text-[#A1A1AA]">
                Profil {currentIndex + 1} sur {companions.length}
              </div>
            </div>
          ) : (
            /* MODE GALERIE GRILLE */
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companions.map((companion, idx) => {
                const isLiked = likedIds[companion.id];
                return (
                  <article
                    key={companion.id}
                    className="group relative flex flex-col justify-end overflow-hidden rounded-[32px] border border-[rgba(212,175,55,0.22)] bg-[#151518] shadow-2xl transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0B0B0D]">
                      <Image
                        src={companion.avatar}
                        alt={companion.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/30 to-transparent" />

                      {/* Barres de story */}
                      <div className="absolute left-4 right-4 top-3.5 flex gap-1 z-10">
                        <div className="h-1 flex-1 rounded-full bg-white/80 shadow-sm" />
                        <div className="h-1 flex-1 rounded-full bg-white/30" />
                        <div className="h-1 flex-1 rounded-full bg-white/30" />
                      </div>

                      {/* Badges */}
                      <div className="absolute left-4 top-7 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-[#FAFAF9] backdrop-blur-md">
                        <BadgeCheck size={13} className="text-[#D4AF37]" />
                        <span>Vérifié</span>
                      </div>

                      <div className="absolute right-4 top-7 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <span>En ligne</span>
                      </div>

                      {/* Infos */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="flex items-baseline justify-between">
                          <h2 className="font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
                            {companion.name}
                          </h2>
                          <span className="font-display text-base font-bold text-[#D4AF37]">
                            {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
                            <span className="text-[10px] font-normal text-[#A1A1AA]">
                              FCFA/h
                            </span>
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-[#FAFAF9] backdrop-blur-md">
                            <span>🇬🇦 {companion.zone}</span>
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] text-white backdrop-blur-md">
                            2.8 km
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                          <button
                            type="button"
                            onClick={(e) => toggleLike(companion.id, e)}
                            className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                              isLiked
                                ? "border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]"
                                : "border-white/15 bg-black/60 text-[#FAFAF9] hover:border-white/30 backdrop-blur-md"
                            }`}
                            aria-label="Aimer"
                          >
                            <Heart
                              size={18}
                              className={isLiked ? "fill-[#EF4444]" : ""}
                            />
                          </button>

                          <Link
                            href={`/companion/${companion.id}`}
                            className="flex flex-1 mx-2.5 items-center justify-center gap-2 rounded-full bg-[#D4AF37] py-2.5 text-xs font-bold text-[#0B0B0D] transition-all hover:bg-[#F1D875] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                          >
                            <Sparkles size={14} />
                            <span>Réserver</span>
                          </Link>

                          <Link
                            href={`/companion/${companion.id}`}
                            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/60 text-[#FAFAF9] transition hover:border-white/30 backdrop-blur-md"
                            aria-label="Détails"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : (
          /* État vide */
          <div className="mt-8 grid place-items-center rounded-[32px] border border-[rgba(212,175,55,0.22)] bg-[#151518] px-6 py-16 text-center shadow-2xl">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
              <Filter size={28} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FAFAF9]">
              Aucun profil vérifié dans cette sélection
            </h3>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[#A1A1AA]">
              Nos équipes procèdent à la validation des dossiers d&apos;identité KYC des nouveaux prestataires au Gabon.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/signup?role=companion"
                className="rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875]"
              >
                Devenir prestataire
              </Link>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-white/10 bg-[#202024] px-5 py-2.5 text-xs font-semibold text-[#FAFAF9] transition hover:border-white/20"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
