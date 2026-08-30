"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import {
  COMPANIONS,
  SERVICE_CATEGORIES,
  ZONES,
  type ServiceCategory,
  type Zone,
} from "@/lib/data";
import { PersonaShell } from "@/components/persona-shell";
import { clientNav } from "@/lib/nav";

const CATEGORY_ICONS: Record<ServiceCategory, typeof Sparkles> = {
  all: Sparkles,
  diner_affaires: Utensils,
  evenementiel: PartyPopper,
  discussion_cafe: Coffee,
  aide_logistique: Briefcase,
};

function ProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-up-surface p-0 animate-pulse">
      <div className="aspect-[16/10] w-full bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg bg-white/10" />
        <div className="h-3 w-full rounded-lg bg-white/5" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-md bg-white/10" />
          <div className="h-5 w-20 rounded-md bg-white/10" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="h-6 w-24 rounded-lg bg-white/10" />
          <div className="h-8 w-24 rounded-xl bg-up-gold/20" />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [selectedZone, setSelectedZone] = useState<Zone>("Toutes");
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restauration des filtres depuis le localStorage (low data / persistance hors-ligne)
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
        // ignore JSON parse errors
      }
      const timer = setTimeout(() => setIsLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sauvegarde des filtres dans le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "up-explore-filters",
          JSON.stringify({ selectedZone, selectedCategory, searchQuery }),
        );
      } catch {
        // ignore quota errors
      }
    }
  }, [selectedZone, selectedCategory, searchQuery]);

  const filteredCompanions = useMemo(() => {
    return COMPANIONS.filter((c) => {
      // Zone filter
      if (selectedZone !== "Toutes" && c.zone !== selectedZone) {
        return false;
      }
      // Service filter
      if (
        selectedCategory !== "all" &&
        !c.services.includes(selectedCategory)
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesBio = c.bio.toLowerCase().includes(query);
        const matchesHeadline = c.headline.toLowerCase().includes(query);
        const matchesSkills = c.skills.some((s) =>
          s.toLowerCase().includes(query),
        );
        const matchesZone = c.zone.toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesBio &&
          !matchesHeadline &&
          !matchesSkills &&
          !matchesZone
        ) {
          return false;
        }
      }
      return true;
    });
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
    <PersonaShell items={clientNav}>
      <div className="min-h-dvh bg-up-black">
        {/* Header Prestige */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-up-black/90 px-5 pb-3 pt-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-up-gold">
                <Sparkles size={13} className="text-up-gold" />
                Sélection Prestige Gabon
              </span>
              <h1 className="font-display text-2xl font-bold text-up-white">
                Explorer
              </h1>
            </div>
            <span className="rounded-full border border-up-gold/30 bg-up-gold/10 px-2.5 py-1 text-[11px] font-medium text-up-gold">
              {filteredCompanions.length}{" "}
              {filteredCompanions.length > 1 ? "profils" : "profil"}
            </span>
          </div>

          {/* Barre de recherche */}
          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-up-gray"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par prénom, compétence, quartier..."
              className="w-full rounded-2xl border border-white/10 bg-up-surface py-2.5 pl-10 pr-9 text-xs text-up-white placeholder-up-gray transition focus:border-up-gold/60 focus:outline-none focus:ring-1 focus:ring-up-gold/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-up-gray hover:text-up-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sélecteur de zone géographique rapide */}
          <div className="mt-3.5 -mx-5 px-5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="flex items-center gap-1 pr-1 text-[11px] font-semibold text-up-gray">
                <MapPin size={12} className="text-up-gold" />
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
                        ? "bg-up-gold text-up-black font-semibold shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                        : "border border-white/10 bg-up-surface text-up-gray hover:border-white/20 hover:text-up-white"
                    }`}
                  >
                    {zone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtre par type d'accompagnement */}
          <div className="mt-2.5 -mx-5 px-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SERVICE_CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.id];
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-all ${
                      isSelected
                        ? "border border-up-gold/60 bg-up-gold/15 text-up-white font-medium"
                        : "border border-white/5 bg-up-surface/60 text-up-gray hover:bg-up-surface hover:text-up-white"
                    }`}
                  >
                    <IconComponent
                      size={13}
                      className={isSelected ? "text-up-gold" : "text-up-gray"}
                    />
                    <span>{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Corps de la page */}
        <main className="px-5 py-4">
          {/* Bannière de réassurance KYC & Confidentialité */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-up-gold/20 bg-gradient-to-r from-up-gold/10 via-up-surface to-up-surface p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-up-gold/20 text-up-gold">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="font-semibold text-up-white">
                  Garantie UP Discrétion &amp; Sécurité
                </p>
                <p className="text-[11px] text-up-gray">
                  Identité vérifiée (KYC) · Rencontres en lieux publics sécurisés
                </p>
              </div>
            </div>
          </div>

          {/* Reset rapide si des filtres sont actifs */}
          {hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between text-xs text-up-gray">
              <span>
                Filtres :{" "}
                <span className="text-up-white">
                  {selectedZone !== "Toutes" ? selectedZone : "Toutes zones"} ·{" "}
                  {selectedCategory !== "all"
                    ? SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)
                        ?.shortLabel
                    : "Tous services"}
                </span>
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 font-medium text-up-gold hover:underline"
              >
                <X size={12} />
                Réinitialiser
              </button>
            </div>
          )}

          {/* Grille de profils avec Skeleton UI */}
          {isLoading ? (
            <div className="space-y-4">
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
            </div>
          ) : filteredCompanions.length > 0 ? (
            <div className="space-y-4">
              {filteredCompanions.map((companion, index) => (
                <article
                  key={companion.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-up-surface transition-all duration-300 hover:border-up-gold/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                >
                  {/* Photo & Overlays */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-up-black">
                    <Image
                      src={companion.avatar}
                      alt={companion.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 448px"
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                      priority={index < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-up-surface via-up-surface/30 to-transparent" />

                    {/* Badge KYC vérifié */}
                    <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-up-gold/40 bg-up-black/80 px-2.5 py-1 text-[11px] font-semibold text-up-gold backdrop-blur-md shadow-lg">
                      <BadgeCheck size={14} className="text-up-gold" />
                      <span>Identité Vérifiée</span>
                    </div>

                    {/* Note & Avis */}
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full border border-white/10 bg-up-black/80 px-2.5 py-1 text-xs font-semibold text-up-white backdrop-blur-md">
                      <Star size={13} className="fill-up-gold text-up-gold" />
                      <span>{companion.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-up-gray">
                        ({companion.reviewCount})
                      </span>
                    </div>

                    {/* Zone & Âge en bas de photo */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-xl font-bold text-up-white">
                            {companion.name}, {companion.age} ans
                          </h2>
                        </div>
                        <p className="flex items-center gap-1 text-xs text-up-gray">
                          <MapPin size={12} className="text-up-gold" />
                          <span>Libreville · {companion.zone}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu de la fiche */}
                  <div className="p-4 pt-3">
                    <p className="text-xs font-medium text-up-gold-soft line-clamp-1">
                      {companion.headline}
                    </p>

                    <p className="mt-2 text-xs leading-relaxed text-up-gray line-clamp-2">
                      {companion.bio}
                    </p>

                    {/* Badges de compétences & services */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {companion.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-up-gray"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Tarifs et Action */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-up-gray">
                          Tarif horaire
                        </p>
                        <p className="font-display text-base font-bold text-up-white">
                          {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
                          <span className="text-xs font-normal text-up-gold">
                            FCFA / h
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/companion/${companion.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-up-gold px-4 py-2.5 text-xs font-semibold text-up-black transition hover:bg-up-gold-soft hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
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
            <div className="grid place-items-center rounded-3xl border border-white/10 bg-up-surface px-6 py-16 text-center">
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-up-gold">
                <Filter size={24} />
              </div>
              <h3 className="font-display text-base font-semibold text-up-white">
                Aucun prestataire trouvé
              </h3>
              <p className="mt-1 max-w-[16rem] text-xs text-up-gray">
                Aucun profil ne correspond actuellement à vos critères à{" "}
                {selectedZone !== "Toutes" ? selectedZone : "Libreville"}.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-up-gold px-4 py-2 text-xs font-semibold text-up-black transition hover:bg-up-gold-soft"
              >
                Afficher tous les profils
              </button>
            </div>
          )}
        </main>
      </div>
    </PersonaShell>
  );
}
