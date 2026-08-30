"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Coffee,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  PartyPopper,
  Search,
  Sparkles,
  Star,
  Utensils,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  SERVICE_CATEGORIES,
  ZONES,
  type ServiceCategory,
  type Zone,
} from "@/lib/data";
import { AppShell } from "@/components/layout/AppShell";
import { fetchVerifiedCompanions, type SupabaseCompanion } from "@/lib/supabase/queries";

const CATEGORY_ICONS: Record<ServiceCategory, typeof Sparkles> = {
  all: Sparkles,
  diner_affaires: Utensils,
  evenementiel: PartyPopper,
  discussion_cafe: Coffee,
  aide_logistique: Briefcase,
};

type PillTab = "all" | "new" | "nearby";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PillTab>("all");
  const [selectedZone, setSelectedZone] = useState<Zone>("Toutes");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [companions, setCompanions] = useState<SupabaseCompanion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch real data from Supabase
  const loadCompanions = async () => {
    setIsLoading(true);
    const data = await fetchVerifiedCompanions({
      zone: selectedZone !== "Toutes" ? selectedZone : undefined,
      service: selectedCategory !== "all" ? selectedCategory : undefined,
      query: searchQuery.trim() || undefined,
    });
    setCompanions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCompanions();
  }, [selectedZone, selectedCategory, searchQuery]);

  const resetFilters = () => {
    setActiveTab("all");
    setSelectedZone("Toutes");
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <AppShell showHeader={true} showBottomNav={true} maxWidth="7xl">
      <div className="pt-2 pb-10">
        {/* En-tête de page type "Matches" de l'illustration */}
        <div className="flex items-center justify-between px-1 py-3">
          <div>
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              <Sparkles size={12} />
              Conciergerie Privée
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-3xl">
              Sélection d&apos;Élite
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadCompanions}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#151518] text-[#A1A1AA] transition hover:border-white/20 hover:text-[#FAFAF9]"
              title="Actualiser les profils"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            </button>
            <span className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-2 text-xs font-bold text-[#D4AF37]">
              {companions.length} {companions.length > 1 ? "profils" : "profil"}
            </span>
          </div>
        </div>

        {/* Barre de Filtres Segmentés en Pilules (Style ILLUSTRATION2.webp) */}
        <div className="mt-2 flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
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

          {/* Sélecteur de Zone Rapide */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value as Zone)}
              className="rounded-full border border-white/10 bg-[#151518] px-3.5 py-1.5 text-xs font-semibold text-[#FAFAF9] focus:border-[#D4AF37] focus:outline-none"
            >
              {ZONES.map((z) => (
                <option key={z} value={z} className="bg-[#151518] text-[#FAFAF9]">
                  {z === "Toutes" ? "Toutes les zones" : z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barre de Recherche Minimale */}
        <div className="relative mt-2">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par prénom, langue, quartier..."
            className="w-full rounded-2xl border border-white/10 bg-[#151518] py-2.5 pl-10 pr-9 text-xs text-[#FAFAF9] placeholder-[#A1A1AA]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FAFAF9]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Catégories de Services en Pilules Translucides */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                  isSelected
                    ? "border border-[#D4AF37] bg-[#D4AF37]/15 text-[#FAFAF9] font-semibold"
                    : "border border-white/5 bg-[#151518]/70 text-[#A1A1AA] hover:text-[#FAFAF9]"
                }`}
              >
                <Icon
                  size={12}
                  className={isSelected ? "text-[#D4AF37]" : "text-[#A1A1AA]"}
                />
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Grille de Cartes Profil (Style ILLUSTRATION2.webp) */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] w-full rounded-[28px] border border-white/5 bg-[#151518] animate-pulse"
                />
              ))}
            </div>
          ) : companions.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {companions.map((companion, idx) => {
                const isLiked = likedIds[companion.id];
                return (
                  <article
                    key={companion.id}
                    className="group relative flex flex-col justify-end overflow-hidden rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[#151518] shadow-2xl transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    {/* Photo de fond immersive */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0B0B0D]">
                      <Image
                        src={companion.avatar}
                        alt={companion.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition duration-500 group-hover:scale-105"
                        priority={idx < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/30 to-transparent" />

                      {/* Barres de story en haut de la carte (Style ILLUSTRATION2.webp) */}
                      <div className="absolute left-4 right-4 top-3.5 flex gap-1 z-10">
                        <div className="h-1 flex-1 rounded-full bg-white/70 shadow-sm" />
                        <div className="h-1 flex-1 rounded-full bg-white/30" />
                        <div className="h-1 flex-1 rounded-full bg-white/30" />
                      </div>

                      {/* Badge KYC vérifié haut gauche */}
                      <div className="absolute left-4 top-7 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-[#FAFAF9] backdrop-blur-md">
                        <BadgeCheck size={13} className="text-[#D4AF37]" />
                        <span>Vérifié</span>
                      </div>

                      {/* Badge En Ligne / Statut haut droite */}
                      <div className="absolute right-4 top-7 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        <span>En ligne</span>
                      </div>

                      {/* Contenu superposé en bas de la photo (Style ILLUSTRATION2.webp) */}
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

                        {/* Localisation / Distance */}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-[#FAFAF9] backdrop-blur-md">
                            <MapPin size={11} className="text-[#D4AF37]" />
                            <span>{companion.zone}</span>
                          </span>
                          {companion.reviewCount > 0 && (
                            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-[#FAFAF9] backdrop-blur-md">
                              <Star size={11} className="fill-[#D4AF37] text-[#D4AF37]" />
                              <span>{companion.rating.toFixed(1)}</span>
                            </span>
                          )}
                        </div>

                        {/* Tags de compétences en pilules translucides */}
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {companion.services.slice(0, 3).map((srv) => (
                            <span
                              key={srv}
                              className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-[#FAFAF9] backdrop-blur-md"
                            >
                              {srv.replace("_", " ")}
                            </span>
                          ))}
                        </div>

                        {/* Boutons d'action circulaires flottants (Style ILLUSTRATION2.webp) */}
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                          <button
                            type="button"
                            onClick={(e) => toggleLike(companion.id, e)}
                            className={`grid h-11 w-11 place-items-center rounded-full border transition ${
                              isLiked
                                ? "border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]"
                                : "border-white/15 bg-black/60 text-[#FAFAF9] hover:border-white/30 backdrop-blur-md"
                            }`}
                            aria-label="Aimer ce profil"
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
                            aria-label="Voir la fiche détaillée"
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
          ) : (
            /* État vide élégant sans faux profil */
            <div className="grid place-items-center rounded-[28px] border border-[rgba(212,175,55,0.22)] bg-[#151518] px-6 py-16 text-center shadow-2xl">
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
      </div>
    </AppShell>
  );
}
