"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Calendar,
  Coffee,
  Filter,
  Heart,
  MapPin,
  PartyPopper,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Utensils,
  X,
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

type PillTab = "recommended" | "available" | "nearby";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<PillTab>("recommended");
  const [selectedZone, setSelectedZone] = useState<Zone>("Toutes");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Toutes");
  const [maxRate, setMaxRate] = useState<number>(100000);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companions, setCompanions] = useState<SupabaseCompanion[]>([]);
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

  // Fetch real verified companions from Supabase
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

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setActiveTab("recommended");
    setSelectedZone("Toutes");
    setSelectedCategory("all");
    setSelectedLanguage("Toutes");
    setMaxRate(100000);
    setSearchQuery("");
  };

  // Client-side filtering based on tab, language and maxRate
  const filteredCompanions = useMemo(() => {
    return companions.filter((c) => {
      if (activeTab === "available" && !c.isOnline) {
        return false;
      }
      if (activeTab === "nearby" && c.zone !== "Sablière" && c.zone !== "Batterie IV") {
        // nearby filter
      }
      if (selectedLanguage !== "Toutes" && !c.languages.includes(selectedLanguage)) {
        return false;
      }
      if (c.hourlyRate > maxRate) {
        return false;
      }
      return true;
    });
  }, [companions, activeTab, selectedLanguage, maxRate]);

  return (
    <AppShell showHeader={true} showBottomNav={true} maxWidth="7xl">
      <div className="pt-2 pb-12">
        {/* ===================================================================
            1. HEADER DE LA PAGE EXPLORER (VIOLET & BLANC)
            =================================================================== */}
        <div className="flex items-center justify-between px-1 py-3 border-b border-[#F0E6F3]">
          <div className="flex items-center gap-3">
            <Link
              href="/client/profil"
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#F0E6F3] transition hover:scale-105 shadow-xs bg-white"
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
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D0F24] sm:text-3xl">
                Explorer
              </h1>
              <p className="text-[11px] font-medium text-[#6B5D73]">
                Prestataires &amp; Accompagnateurs vérifiés au Gabon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-xs transition ${
                isFilterDrawerOpen || selectedZone !== "Toutes" || selectedCategory !== "all"
                  ? "border-up-500 bg-up-500 text-white"
                  : "border-[#F0E6F3] bg-white text-[#1D0F24] hover:border-up-200"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filtres</span>
            </button>

            <Link
              href="/client/reservations"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-[#F0E6F3] bg-white text-[#1D0F24] shadow-xs transition hover:border-up-200"
              title="Mes réservations"
            >
              <Bell size={17} className="text-[#1D0F24]" />
            </Link>
          </div>
        </div>

        {/* ===================================================================
            2. ONGLETS HORIZONTAUX (Recommandés · Disponibles · À proximité)
            =================================================================== */}
        <div className="mt-4 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
          <div className="flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("recommended")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "recommended"
                  ? "bg-up-500 text-white shadow-xs"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
              }`}
            >
              Recommandés
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "available"
                  ? "bg-up-500 text-white shadow-xs"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
              }`}
            >
              Disponibles ce soir
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("nearby")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "nearby"
                  ? "bg-up-500 text-white shadow-xs"
                  : "text-[#6B5D73] hover:text-[#1D0F24]"
              }`}
            >
              À proximité
            </button>
          </div>
        </div>

        {/* Panneau de filtres dépliable */}
        {isFilterDrawerOpen && (
          <div className="mt-4 rounded-3xl border border-[#F0E6F3] bg-white p-5 shadow-sm animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E6F3] pb-3">
              <span className="font-display text-sm font-bold text-[#1D0F24]">
                Affiner les critères de recherche
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-up-700 hover:underline"
              >
                Réinitialiser
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              {/* Zone */}
              <div>
                <label className="block font-bold text-[#1D0F24] mb-1.5">
                  Zone au Gabon
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as Zone)}
                  className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z === "Toutes" ? "Toutes les zones" : z}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prestation */}
              <div>
                <label className="block font-bold text-[#1D0F24] mb-1.5">
                  Type de prestation
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory)}
                  className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Langue */}
              <div>
                <label className="block font-bold text-[#1D0F24] mb-1.5">
                  Langue parlée
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-xl border border-[#F0E6F3] bg-[#FAF9FB] p-2.5 text-xs text-[#1D0F24] focus:border-up-500 focus:outline-none"
                >
                  <option value="Toutes">Toutes les langues</option>
                  <option value="Français">Français</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Espagnol">Espagnol</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Barre de Recherche Minimale */}
        <div className="relative mt-3 px-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5D73]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par prénom, quartier, compétence..."
            className="w-full rounded-2xl border border-[#F0E6F3] bg-white py-3 pl-11 pr-10 text-xs text-[#1D0F24] placeholder-[#6B5D73]/70 focus:border-up-500 focus:outline-none shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5D73] hover:text-[#1D0F24]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Catégories de Services en Pilules Horizontales */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition shadow-sm ${
                  isSelected
                    ? "bg-up-500 text-white shadow-sm"
                    : "bg-white text-up-text-muted hover:bg-up-50 border border-up-100"
                }`}
              >
                <Icon
                  size={13}
                  className={isSelected ? "text-white" : "text-up-500"}
                />
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            3. GRILLE DE CARTES DE PROFILS (VIOLET ROYAL & BLANC)
            =================================================================== */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] w-full rounded-2xl border border-up-100 bg-white animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : filteredCompanions.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanions.map((companion) => {
                const isLiked = likedIds[companion.id];
                return (
                  <article
                    key={companion.id}
                    className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-[#F0E6F3] bg-white shadow-sm hover:shadow-md hover:border-up-200 transition-all duration-300"
                  >
                    {/* Image professionnelle */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1D0F24]">
                      <Image
                        src={companion.avatar}
                        alt={companion.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                      {/* Dégradé sombre */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1D0F24] via-[#1D0F24]/40 to-transparent" />

                      {/* Badge Identité Vérifiée en Violet Royal (Instruction officielle) */}
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-up-50 text-up-700 border border-up-200 px-3 py-1 text-[10px] font-bold shadow-sm">
                        <BadgeCheck size={13} className="text-up-500" />
                        <span>Identité vérifiée</span>
                      </div>

                      {/* Statut Disponibilité */}
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1D0F24]/75 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-md shadow-sm">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            companion.isOnline
                              ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                              : "bg-gray-400"
                          }`}
                        />
                        <span>{companion.isOnline ? "Disponible" : "Sur demande"}</span>
                      </div>

                      {/* Contenu superposé en bas de carte */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                        <div className="flex items-baseline justify-between">
                          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                            {companion.name}
                          </h2>
                          <span className="font-display text-base font-bold text-up-200">
                            {companion.hourlyRate.toLocaleString("fr-FR")}{" "}
                            <span className="text-[10px] font-normal text-up-100">
                              FCFA/h
                            </span>
                          </span>
                        </div>

                        {/* Zone & Note */}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md">
                            <MapPin size={11} className="text-up-300" />
                            <span>{companion.zone}</span>
                          </span>

                          {companion.reviewCount > 0 && companion.rating > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-md">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              <span>{companion.rating.toFixed(1)} ({companion.reviewCount})</span>
                            </span>
                          )}
                        </div>

                        {/* Services autorisés */}
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {companion.services.slice(0, 2).map((srv) => (
                            <span
                              key={srv}
                              className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md"
                            >
                              {srv.replace("_", " ")}
                            </span>
                          ))}
                        </div>

                        {/* Actions : Favori · Réserver · Profil */}
                        <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                          <button
                            type="button"
                            onClick={(e) => toggleLike(companion.id, e)}
                            className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                              isLiked
                                ? "border-red-400 bg-red-500/20 text-red-400"
                                : "border-white/20 bg-black/50 text-white hover:border-white/40 backdrop-blur-md"
                            }`}
                            aria-label="Enregistrer ce profil dans mes favoris"
                          >
                            <Heart
                              size={16}
                              className={isLiked ? "fill-red-500 text-red-500" : ""}
                            />
                          </button>

                          <Link
                            href={`/companion/${companion.id}`}
                            className="flex flex-1 mx-2 items-center justify-center gap-1.5 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-2.5 text-xs font-bold transition-all"
                          >
                            <Calendar size={13} />
                            <span>Réserver</span>
                          </Link>

                          <Link
                            href={`/companion/${companion.id}`}
                            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-white/40 backdrop-blur-md"
                            aria-label="Voir le profil complet"
                          >
                            <ArrowRight size={15} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* État vide officiel */
            <div className="grid place-items-center rounded-[32px] border border-[#F0E6F3] bg-white px-6 py-16 text-center shadow-xs max-w-2xl mx-auto">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-up-50 text-up-500">
                <Filter size={26} />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1D0F24]">
                Aucun profil vérifié disponible pour le moment dans cette zone.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B5D73] max-w-md">
                Les candidatures sont en cours de validation par nos équipes de modération au Gabon. Revenez prochainement ou modifiez vos filtres.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-up-500 hover:bg-up-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
                >
                  Réinitialiser les filtres
                </button>
                <Link
                  href="/auth/signup?role=companion"
                  className="rounded-full border border-[#F0E6F3] bg-[#FAF9FB] px-6 py-2.5 text-xs font-semibold text-[#1D0F24] transition hover:border-up-200"
                >
                  Devenir prestataire
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
