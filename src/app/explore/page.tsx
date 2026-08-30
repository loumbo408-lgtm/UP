"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Coffee,
  Filter,
  MapPin,
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

function ProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] p-0 animate-pulse">
      <div className="aspect-[16/11] w-full bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg bg-white/10" />
        <div className="h-3 w-full rounded-lg bg-white/5" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-md bg-white/10" />
          <div className="h-5 w-20 rounded-md bg-white/10" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="h-6 w-24 rounded-lg bg-white/10" />
          <div className="h-8 w-24 rounded-xl bg-[#D4AF37]/20" />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [selectedZone, setSelectedZone] = useState<Zone>("Toutes");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [companions, setCompanions] = useState<SupabaseCompanion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restauration des filtres depuis le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("up-explore-filters");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedZone) setSelectedZone(parsed.selectedZone);
          if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
          if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        }
      } catch {
        // ignore
      }
    }
  }, []);

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

  // Sauvegarde des filtres dans le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "up-explore-filters",
          JSON.stringify({ selectedZone, selectedCategory, searchQuery }),
        );
      } catch {
        // ignore
      }
    }
  }, [selectedZone, selectedCategory, searchQuery]);

  const hasActiveFilters =
    selectedZone !== "Toutes" ||
    selectedCategory !== "all" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setSelectedZone("Toutes");
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <AppShell showHeader={true} showBottomNav={true} maxWidth="7xl">
      <div className="pt-4 pb-8">
        {/* Header & Filtres */}
        <div className="rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] p-5 shadow-lg sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
                <Sparkles size={13} className="text-[#D4AF37]" />
                Sélection Certifiée Gabon
              </span>
              <h1 className="mt-1 font-display text-2xl font-bold text-[#FAFAF9] sm:text-3xl">
                Explorer les Profils
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadCompanions}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#202024] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] transition hover:text-[#FAFAF9]"
              >
                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                <span>Actualiser</span>
              </button>
              <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                {companions.length} {companions.length > 1 ? "profils vérifiés" : "profil vérifié"}
              </span>
            </div>
          </div>

          {/* Barre de Recherche */}
          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par prénom, compétence, quartier..."
              className="w-full rounded-2xl border border-white/10 bg-[#0B0B0D] py-3 pl-10 pr-9 text-xs text-[#FAFAF9] placeholder-[#A1A1AA]/50 transition focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FAFAF9]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sélecteur de Zone */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="flex items-center gap-1 pr-1 text-[11px] font-semibold text-[#A1A1AA] shrink-0">
              <MapPin size={12} className="text-[#D4AF37]" />
              Zone :
            </span>
            {ZONES.map((zone) => {
              const isSelected = selectedZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#D4AF37] text-[#0B0B0D] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                      : "border border-white/10 bg-[#202024] text-[#A1A1AA] hover:border-white/20 hover:text-[#FAFAF9]"
                  }`}
                >
                  {zone}
                </button>
              );
            })}
          </div>

          {/* Filtres par Services */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-all ${
                    isSelected
                      ? "border border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#FAFAF9] font-medium"
                      : "border border-white/5 bg-[#202024]/60 text-[#A1A1AA] hover:bg-[#202024] hover:text-[#FAFAF9]"
                  }`}
                >
                  <Icon
                    size={13}
                    className={isSelected ? "text-[#D4AF37]" : "text-[#A1A1AA]"}
                  />
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bannière de Sécurité & Rassurance */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.22)] bg-gradient-to-r from-[#D4AF37]/10 via-[#151518] to-[#151518] p-3.5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="font-semibold text-[#FAFAF9]">
                Charte UP : Respect, Discrétion &amp; Lieux Publics
              </p>
              <p className="text-[11px] text-[#A1A1AA]">
                Chaque profil affiché a complété sa vérification d&apos;identité KYC.
              </p>
            </div>
          </div>
        </div>

        {/* Reset filtres */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between text-xs text-[#A1A1AA] px-1">
            <span>
              Filtres appliqués :{" "}
              <span className="text-[#FAFAF9]">
                {selectedZone !== "Toutes" ? selectedZone : "Toutes zones"} ·{" "}
                {selectedCategory !== "all"
                  ? SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.shortLabel
                  : "Tous types"}
              </span>
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 font-medium text-[#D4AF37] hover:underline"
            >
              <X size={12} />
              Réinitialiser
            </button>
          </div>
        )}

        {/* Grille Responsive */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
            </div>
          ) : companions.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {companions.map((companion, idx) => (
                <article
                  key={companion.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                >
                  <div>
                    {/* Photo & Overlays */}
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0B0B0D]">
                      <Image
                        src={companion.avatar}
                        alt={companion.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition duration-500 group-hover:scale-105"
                        priority={idx < 2}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#151518] via-[#151518]/20 to-transparent" />

                      {/* Badge KYC vérifié */}
                      <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0B0B0D]/85 px-2.5 py-1 text-[11px] font-semibold text-[#D4AF37] backdrop-blur-md shadow-lg">
                        <BadgeCheck size={14} className="text-[#D4AF37]" />
                        <span>Identité Vérifiée</span>
                      </div>

                      {/* Note réelle si disponible */}
                      {companion.reviewCount > 0 && (
                        <div className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full border border-white/10 bg-[#0B0B0D]/85 px-2.5 py-1 text-xs font-semibold text-[#FAFAF9] backdrop-blur-md">
                          <Star size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
                          <span>{companion.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-[#A1A1AA]">
                            ({companion.reviewCount})
                          </span>
                        </div>
                      )}

                      {/* Nom & Localisation */}
                      <div className="absolute bottom-3 left-3.5 right-3.5">
                        <h2 className="font-display text-lg font-bold text-[#FAFAF9]">
                          {companion.name}
                        </h2>
                        <p className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                          <MapPin size={12} className="text-[#D4AF37]" />
                          <span>{companion.zone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4 pt-3">
                      <p className="text-xs leading-relaxed text-[#A1A1AA] line-clamp-2">
                        {companion.bio}
                      </p>

                      {/* Services & Compétences */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {companion.services.slice(0, 2).map((srv) => (
                          <span
                            key={srv}
                            className="rounded-lg border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#A1A1AA]"
                          >
                            {srv.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tarifs et Action */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">
                          Tarif horaire
                        </p>
                        <p className="font-display text-base font-bold text-[#FAFAF9]">
                          {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
                          <span className="text-xs font-normal text-[#D4AF37]">
                            FCFA/h
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/companion/${companion.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      >
                        <span>Réserver</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* État vide soigné et professionnel */
            <div className="grid place-items-center rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] px-6 py-16 text-center shadow-xl">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                <Filter size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-[#FAFAF9]">
                Aucun profil vérifié disponible
              </h3>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#A1A1AA]">
                Nos équipes procèdent actuellement à la validation des dossiers d&apos;identité KYC des nouveaux prestataires de Libreville et Akanda.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/auth/signup?role=companion"
                  className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875]"
                >
                  Devenir prestataire
                </Link>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-xl border border-white/10 bg-[#202024] px-5 py-2.5 text-xs font-semibold text-[#FAFAF9] transition hover:border-white/20"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
