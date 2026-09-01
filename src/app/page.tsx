"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building,
  CheckCircle2,
  Coffee,
  MapPin,
  PartyPopper,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Utensils,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function LandingPage() {
  const activeZones = [
    {
      name: "Libreville",
      desc: "Centre-ville, Glass, Louis, Batterie IV, Sablière",
      active: true,
    },
    {
      name: "Akanda",
      desc: "Avorbam, Angondjé, Cap Caravane",
      active: true,
    },
    {
      name: "Owendo",
      desc: "Zone portuaire, Boulevard d'Owendo",
      active: true,
    },
    {
      name: "Port-Gentil",
      desc: "Zone pétrolière & Centre d'affaires",
      active: true,
    },
  ];

  return (
    <AppShell
      showHeader={true}
      showBottomNav={false}
      maxWidth="full"
      className="px-0 sm:px-0 lg:px-0"
    >
      {/* 1. HERO SECTION (VIOLET ROYAL & BLANC) */}
      <section className="relative overflow-hidden border-b border-[#F0E6F3] bg-gradient-to-b from-up-50/60 via-white to-white px-4 pt-14 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        {/* Halos subtils violet royal */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-up-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-10 h-80 w-80 rounded-full bg-up-100/50 blur-2xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge officiel de conciergerie */}
          <div className="inline-flex items-center gap-2 rounded-full border border-up-200 bg-up-50 px-4 py-1.5 text-xs font-semibold text-up-700 shadow-xs">
            <Sparkles size={14} className="text-up-500" />
            <span>Conciergerie Privée &amp; Accompagnement Professionnel au Gabon</span>
          </div>

          {/* Grand Titre Officiel */}
          <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-[#1D0F24] sm:text-6xl lg:text-7xl lg:leading-tight">
            Trouvez la présence qui correspond à votre moment.
          </h1>

          {/* Sous-titre Officiel */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6B5D73] sm:text-lg">
            Découvrez des profils vérifiés pour vos événements, rendez-vous professionnels et moments de compagnie encadrés à Libreville et dans tout le Gabon.
          </p>

          {/* Boutons d'Action Principaux */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/explore"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] px-8 py-4 text-sm font-bold transition-all sm:w-auto"
            >
              <span>Trouver un profil</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/auth/signup?role=companion"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-up-200 bg-white px-8 py-4 text-sm font-bold text-up-700 shadow-xs transition-all hover:bg-up-50 hover:border-up-300 sm:w-auto"
            >
              <Sparkles size={16} className="text-up-500" />
              <span>Proposer mes services</span>
            </Link>
          </div>

          {/* Badges d'activités encadrées */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white px-4 py-2 text-xs font-semibold text-[#1D0F24] shadow-xs">
              <Utensils size={14} className="text-up-500" />
              <span>Dîners d&apos;Affaires</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white px-4 py-2 text-xs font-semibold text-[#1D0F24] shadow-xs">
              <PartyPopper size={14} className="text-up-500" />
              <span>Événements &amp; Galas</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white px-4 py-2 text-xs font-semibold text-[#1D0F24] shadow-xs">
              <Briefcase size={14} className="text-up-500" />
              <span>Guidage &amp; Délégations</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F0E6F3] bg-white px-4 py-2 text-xs font-semibold text-[#1D0F24] shadow-xs">
              <Coffee size={14} className="text-up-500" />
              <span>Sorties &amp; Écoute</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. AVANTAGES CLIENT & PRESTATAIRE */}
      <section id="advantages" className="border-b border-[#F0E6F3] bg-[#FAF9FB] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-up-600">
              Une Plateforme d&apos;Élite
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#1D0F24] sm:text-4xl">
              Des garanties claires pour chaque utilisateur
            </h2>
            <p className="mt-3 text-sm text-[#6B5D73]">
              UP structure l&apos;accompagnement social et événementiel au Gabon avec des protocoles rigoureux.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {/* Colonne Avantages Client */}
            <div className="rounded-[32px] border border-[#F0E6F3] bg-white p-8 shadow-xs hover:shadow-md hover:border-up-200 transition">
              <div className="flex items-center gap-3 border-b border-[#F0E6F3] pb-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-up-50 text-up-600">
                  <UserCheck size={22} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#1D0F24]">
                    Pour les Clients
                  </h3>
                  <p className="text-xs text-[#6B5D73]">
                    Accompagnement de qualité en toute sérénité
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-4 text-sm text-[#1D0F24]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Profils vérifiés</strong> : Identités nationales et compétences contrôlées par UP.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Réservation simple</strong> : Choix du créneau, du lieu public et confirmation rapide.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Lieux publics autorisés</strong> : Rencontres exclusivement dans des établissements certifiés.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Paiement encadré</strong> : Séquestre sécurisé via Mobile Money (Airtel / Moov).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Support dédié</strong> : Assistance rapide et ligne d&apos;urgence en cas d&apos;incident.</span>
                </li>
              </ul>
            </div>

            {/* Colonne Avantages Prestataire */}
            <div className="rounded-[32px] border border-[#F0E6F3] bg-white p-8 shadow-xs hover:shadow-md hover:border-up-200 transition">
              <div className="flex items-center gap-3 border-b border-[#F0E6F3] pb-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-up-50 text-up-700">
                  <Briefcase size={22} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#1D0F24]">
                    Pour les Prestataires
                  </h3>
                  <p className="text-xs text-[#6B5D73]">
                    Monétisez votre présence et votre savoir-être
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-4 text-sm text-[#1D0F24]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-up-600 shrink-0 mt-0.5" />
                  <span><strong>Profil professionnel</strong> : Mise en valeur de votre parcours, langues et atouts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-up-600 shrink-0 mt-0.5" />
                  <span><strong>Services autorisés</strong> : Choisissez librement les types de prestations proposées.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-up-600 shrink-0 mt-0.5" />
                  <span><strong>Disponibilités maîtrisées</strong> : Activez ou désactivez votre visibilité à tout moment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-up-600 shrink-0 mt-0.5" />
                  <span><strong>Réception des demandes</strong> : Notification immédiate et acceptation en un clic.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-up-600 shrink-0 mt-0.5" />
                  <span><strong>Revenus garantis</strong> : Versement direct de vos gains après validation de mission.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FONCTIONNEMENT EN 4 ÉTAPES */}
      <section id="how-it-works" className="border-b border-[#F0E6F3] bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-up-700">
            Processus Simple &amp; Transparent
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#1D0F24] sm:text-4xl">
            Comment fonctionne UP ?
          </h2>
          <p className="mt-3 text-sm text-[#6B5D73] max-w-2xl mx-auto">
            Une mise en relation fluide, encadrée du début à la fin de la mission.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="rounded-[28px] border border-[#F0E6F3] bg-[#FAF9FB] p-6 hover:border-up-200 transition">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-500 text-sm font-bold text-white shadow-xs">
                1
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-[#1D0F24]">
                Découvrir
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
                Consultez les fiches des prestataires vérifiés selon vos critères, compétences et quartiers à Libreville.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#F0E6F3] bg-[#FAF9FB] p-6 hover:border-up-200 transition">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-500 text-sm font-bold text-white shadow-xs">
                2
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-[#1D0F24]">
                Demander
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
                Précisez l&apos;horaire, le type d&apos;événement et sélectionnez un établissement public partenaire sécurisé.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#F0E6F3] bg-[#FAF9FB] p-6 hover:border-up-200 transition">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-500 text-sm font-bold text-white shadow-xs">
                3
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-[#1D0F24]">
                Confirmer
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
                Le prestataire valide la demande. Les fonds sont bloqués sous séquestre jusqu&apos;à l&apos;exécution complète.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#F0E6F3] bg-[#FAF9FB] p-6 hover:border-up-200 transition">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-up-500 text-sm font-bold text-white shadow-xs">
                4
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-[#1D0F24]">
                Réaliser
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6B5D73]">
                La rencontre a lieu dans le lieu public convenu. Validation de clôture sécurisée par code OTP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SÉCURITÉ & LIEUX PUBLICS */}
      <section id="safety" className="border-b border-[#F0E6F3] bg-[#FAF9FB] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[36px] border border-up-500/30 bg-[#1D0F24] p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-up-500/20 px-3.5 py-1 text-xs font-semibold text-up-300">
                <ShieldCheck size={14} />
                Charte de Sécurité UP
              </span>
              <h2 className="mt-4 font-display text-2xl sm:text-4xl font-bold tracking-tight">
                Un engagement absolu envers votre sécurité et votre intégrité
              </h2>
              <p className="mt-3 text-sm text-up-100 leading-relaxed">
                Toutes les réservations effectuées sur UP sont soumises à des règles de conduite formelles afin de garantir un cadre sain, courtois et respectueux.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Shield size={20} className="text-up-400" />
                <h4 className="mt-3 font-display text-base font-bold">Identités Vérifiées</h4>
                <p className="mt-1 text-xs text-up-100/80">Contrôle strict des pièces d&apos;identité gabonaises avant tout agrément.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Building size={20} className="text-up-400" />
                <h4 className="mt-3 font-display text-base font-bold">Lieux Publics Obligatoires</h4>
                <p className="mt-1 text-xs text-up-100/80">Prestations exclusivement en restaurants, hôtels, salons d&apos;affaires ou galas.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <ShieldAlert size={20} className="text-up-400" />
                <h4 className="mt-3 font-display text-base font-bold">Signalement &amp; Support</h4>
                <p className="mt-1 text-xs text-up-100/80">Intervention d&apos;urgence et assistance téléphonique permanente au Gabon.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ZONES COUVERTES AU GABON */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-up-600">
            Disponibilité Géographique
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#1D0F24]">
            Présents dans les grands pôles du Gabon
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {activeZones.map((zone) => (
              <div
                key={zone.name}
                className="rounded-[28px] border border-[#F0E6F3] bg-[#FAF9FB] p-5 shadow-xs hover:border-up-200 transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-up-500" />
                  <h3 className="font-display text-base font-bold text-[#1D0F24]">{zone.name}</h3>
                </div>
                <p className="mt-2 text-xs text-[#6B5D73] leading-relaxed">{zone.desc}</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Zone active</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-up-500 text-white hover:bg-up-600 shadow-md shadow-up-500/20 active:scale-[0.98] px-8 py-3.5 text-xs font-bold transition"
            >
              <span>Accéder aux prestataires disponibles</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
