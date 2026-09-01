"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { fetchVerifiedCompanions, type SupabaseCompanion } from "@/lib/supabase/queries";
import { useUpStore } from "@/lib/store";

export default function ClientDashboardPage() {
  const [companions, setCompanions] = useState<SupabaseCompanion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const reservations = useUpStore((s) => s.reservations);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchVerifiedCompanions();
      setCompanions(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNextProfile = () => {
    if (companions.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % companions.length);
    }
  };

  const handlePrevProfile = () => {
    if (companions.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + companions.length) % companions.length);
    }
  };

  // Colonne secondaire : Widgets latéraux (Violet & Blanc)
  const rightSidebarContent = (
    <div className="space-y-6">
      {/* 1. Widget Complétude du Profil */}
      <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
        <h3 className="font-display text-sm font-bold text-[#1D0F24]">
          Complétude du Compte
        </h3>

        <div className="mt-4 flex items-center gap-4">
          {/* Cercle SVG en Violet vibrant */}
          <div className="relative h-18 w-18 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-up-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-up-500"
                strokeDasharray="80, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-[#1D0F24]">
              80%
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1D0F24]">Presque complet !</p>
            <p className="mt-0.5 text-[11px] text-[#6B5D73] leading-relaxed">
              Ajoutez votre numéro Mobile Money pour réserver en 1 clic.
            </p>
          </div>
        </div>

        <Link
          href="/client/profil"
          className="mt-4 block w-full rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] py-2.5 text-center text-xs font-bold transition"
        >
          Compléter mon profil
        </Link>
      </div>

      {/* 2. Widget Mes Réservations en cours */}
      <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-[#1D0F24]">
            Missions &amp; Réservations
          </h3>
          <span className="rounded-full bg-up-50 text-up-700 border border-up-200 px-2.5 py-0.5 text-[10px] font-bold">
            {reservations.length} actives
          </span>
        </div>

        {reservations.length > 0 ? (
          <div className="mt-4 space-y-3">
            {reservations.slice(0, 2).map((res) => (
              <Link
                key={res.id}
                href="/client/reservations"
                className="block rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-3 transition hover:border-up-200"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1D0F24] truncate">{res.companionName}</span>
                  <span className="text-up-700">{res.totalAmount.toLocaleString("fr-FR")} F</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#6B5D73]">
                  <span>{res.date} · {res.time}</span>
                  <span className="text-emerald-600 font-semibold">
                    {res.status === "terminee" ? "Terminée" : res.status === "sequestre_bloque" ? "Séquestre" : "En cours"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-[#F0E6F3] bg-[#FAF9FB] p-4 text-center">
            <p className="text-xs text-[#6B5D73]">Aucune réservation en cours</p>
          </div>
        )}

        <Link
          href="/client/reservations"
          className="mt-4 flex items-center justify-between text-xs font-semibold text-up-700 hover:underline"
        >
          <span>Voir toutes mes réservations</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 3. Widget Disponibilités en direct */}
      <div className="rounded-3xl border border-[#F0E6F3] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-[#1D0F24]">
            En Ligne à Libreville
          </h3>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Direct
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {companions.slice(0, 3).map((comp) => (
            <Link
              key={comp.id}
              href={`/companion/${comp.id}`}
              className="flex items-center justify-between rounded-2xl p-2 transition hover:bg-up-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#F0E6F3]">
                  <Image
                    src={comp.avatar}
                    alt={comp.name}
                    fill
                    className="object-cover"
                  />
                  {comp.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1D0F24]">{comp.name}</p>
                  <p className="text-[10px] text-[#6B5D73]">{comp.zone} · {comp.hourlyRate.toLocaleString("fr-FR")} FCFA/h</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#6B5D73]" />
            </Link>
          ))}
        </div>

        <Link
          href="/explore"
          className="mt-4 flex items-center justify-between text-xs font-semibold text-up-700 hover:underline"
        >
          <span>Consulter tous les profils en ligne</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 4. Widget Protocole de Sécurité */}
      <div className="rounded-3xl border border-up-200 bg-up-50/70 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-up-700">
          <ShieldCheck size={20} />
          <h3 className="font-display text-sm font-bold text-[#1D0F24]">
            Conseils de Sécurité UP
          </h3>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
          Votre sécurité est notre priorité absolue. Les rencontres doivent impérativement se tenir dans un lieu public autorisé (restaurants, hôtels certifiés).
        </p>

        <Link
          href="/#safety"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-up-700 hover:underline"
        >
          <span>En savoir plus sur nos garanties</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );

  return (
    <DashboardShell
      role="client"
      pageTitle="Tableau de bord Client"
      pageSubtitle="Trouvez la présence vérifiée qui correspond à votre moment à Libreville."
      actionButton={{
        label: "Trouver un profil",
        href: "/explore",
        icon: Search,
      }}
      rightSidebar={rightSidebarContent}
    >
      {/* ===================================================================
          1. RANGÉE 1 : PRESTATAIRES RECOMMANDÉS
          =================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#1D0F24]">
              Prestataires Recommandés
            </h2>
            <p className="text-xs text-[#6B5D73]">
              Profils accrédités pour vos événements et rendez-vous d&apos;affaires
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/explore"
              className="text-xs font-bold text-up-700 hover:underline hidden sm:inline"
            >
              Voir tout
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevProfile}
                className="grid h-8 w-8 place-items-center rounded-full border border-[#F0E6F3] bg-white text-[#1D0F24] shadow-xs transition hover:border-up-200"
                aria-label="Profil précédent"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextProfile}
                className="grid h-8 w-8 place-items-center rounded-full border border-[#F0E6F3] bg-white text-[#1D0F24] shadow-xs transition hover:border-up-200"
                aria-label="Profil suivant"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Grille de cartes verticales */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] w-full rounded-3xl border border-[#F0E6F3] bg-white animate-pulse"
              />
            ))}
          </div>
        ) : companions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {companions
              .slice(currentIndex, currentIndex + 3)
              .concat(companions.length < 3 ? companions : [])
              .slice(0, 3)
              .map((companion, idx) => {
                const isLiked = likedIds[companion.id];
                return (
                  <div
                    key={`${companion.id}-${idx}`}
                    className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-[#F0E6F3] bg-[#1D0F24] shadow-xs transition-all duration-300 hover:shadow-xl hover:border-up-200 aspect-[3/4]"
                  >
                    {/* Photo */}
                    <Image
                      src={companion.avatar}
                      alt={companion.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                    />

                    {/* Dégradé */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1D0F24] via-[#1D0F24]/40 to-transparent" />

                    {/* Badge Identité Vérifiée */}
                    <div className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-full border border-up-200 bg-up-50 text-up-700 px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                      <BadgeCheck size={12} className="text-up-500" />
                      <span>Vérifié</span>
                    </div>

                    {/* Bouton Favori Flottant */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(companion.id, e)}
                      className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/90 text-[#1D0F24] backdrop-blur-md transition hover:scale-110 shadow-xs"
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart
                        size={14}
                        className={isLiked ? "fill-red-500 text-red-500" : "text-[#1D0F24]"}
                      />
                    </button>

                    {/* Informations du Profil */}
                    <div className="relative z-10 p-4 text-white">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-display text-xl font-bold tracking-tight text-white truncate">
                          {companion.name}
                        </h3>
                        <span className="font-bold text-xs text-up-300 shrink-0">
                          {companion.hourlyRate.toLocaleString("fr-FR")} FCFA/h
                        </span>
                      </div>

                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-up-100">
                        <MapPin size={11} className="text-up-300" />
                        <span>{companion.zone}, Gabon</span>
                      </p>

                      {/* Tags de Prestations */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {companion.services.slice(0, 2).map((srv) => (
                          <span
                            key={srv}
                            className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[9px] font-medium backdrop-blur-md"
                          >
                            {srv.replace("_", " ")}
                          </span>
                        ))}
                      </div>

                      {/* Dock de 3 Boutons Circulaires */}
                      <div className="mt-4 flex items-center justify-center gap-4 border-t border-white/15 pt-3">
                        {/* Passer */}
                        <button
                          type="button"
                          onClick={handleNextProfile}
                          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white text-red-500 shadow-md transition hover:scale-110 active:scale-95"
                          title="Profil suivant"
                        >
                          <X size={18} strokeWidth={2.5} />
                        </button>

                        {/* Profil */}
                        <Link
                          href={`/companion/${companion.id}`}
                          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white text-amber-500 shadow-md transition hover:scale-110 active:scale-95"
                          title="Voir la fiche détaillée"
                        >
                          <Star size={18} className="fill-amber-400 text-amber-400" />
                        </Link>

                        {/* Réserver (Violet Royal) */}
                        <Link
                          href={`/companion/${companion.id}`}
                          className="grid h-10 w-10 place-items-center rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/30 transition hover:scale-110 active:scale-95"
                          title="Demander une réservation"
                        >
                          <Calendar size={17} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#F0E6F3] bg-white p-8 text-center">
            <p className="text-xs text-[#6B5D73]">
              Aucun profil vérifié disponible pour le moment dans cette zone.
            </p>
          </div>
        )}
      </section>

      {/* ===================================================================
          2. RANGÉE 2 : SÉLECTIONS DU JOUR
          =================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#1D0F24]">
              Sélections du Jour
            </h2>
            <p className="text-xs text-[#6B5D73]">
              Prestataires certifiés UP prêts pour vos rendez-vous de la semaine
            </p>
          </div>

          <Link
            href="/explore"
            className="text-xs font-bold text-up-700 hover:underline"
          >
            Voir tout
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {companions.slice(0, 3).map((comp) => (
            <div
              key={comp.id}
              className="flex items-center gap-3 rounded-2xl border border-[#F0E6F3] bg-white p-3 shadow-xs hover:border-up-200 transition"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#1D0F24]">
                <Image
                  src={comp.avatar}
                  alt={comp.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs text-[#1D0F24] truncate">
                    {comp.name}
                  </h4>
                  <BadgeCheck size={12} className="text-up-500 shrink-0" />
                </div>
                <p className="text-[10px] text-[#6B5D73] flex items-center gap-1">
                  <MapPin size={9} />
                  <span>{comp.zone}</span>
                </p>
                <div className="mt-1 flex gap-1">
                  <span className="rounded-full bg-up-50 border border-up-200 px-2 py-0.5 text-[9px] font-semibold text-up-700">
                    {comp.services[0]?.replace("_", " ") || "Affaires"}
                  </span>
                </div>
              </div>

              <Link
                href={`/companion/${comp.id}`}
                className="grid h-8 w-8 place-items-center rounded-full border border-[#F0E6F3] text-up-700 hover:bg-up-500 hover:text-white transition shrink-0"
              >
                <Calendar size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================
          3. BANNIÈRE INFÉRIEURE : LIEUX PARTENAIRES SÉCURISÉS
          =================================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-up-200 bg-gradient-to-r from-up-50 via-white to-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-up-500 text-white shadow-md shadow-up-500/20 shrink-0">
              <Building2 size={26} />
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#1D0F24]">
                Lieux Publics Agréés à Libreville
              </h3>
              <p className="mt-1 text-xs text-[#6B5D73] max-w-xl leading-relaxed">
                Toutes les réservations UP s&apos;effectuent exclusivement dans des établissements certifiés (Radisson Blu, Onomo, salons protocolaires) pour garantir un cadre d&apos;échange irréprochable.
              </p>
            </div>
          </div>

          <Link
            href="/#safety"
            className="shrink-0 rounded-full bg-up-500 hover:bg-up-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-up-500/20 active:scale-[0.98] transition"
          >
            Consulter les Lieux Certifiés
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}
