"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Coffee,
  Compass,
  Lock,
  MapPin,
  PartyPopper,
  Shield,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wallet,
  Users,
  Building,
} from "lucide-react";
import { UpLogo } from "@/components/brand/UpLogo";
import { AppShell } from "@/components/layout/AppShell";

export default function LandingPage() {
  const activeZones = [
    { name: "Libreville", desc: "Centre-ville, Glass, Louis, Batterie IV", active: true },
    { name: "Akanda", desc: "Sablière, Avorbam, Angondjé", active: true },
    { name: "Owendo", desc: "Zone portuaire, Boulevard d'Owendo", active: true },
    { name: "Port-Gentil", desc: "Zone pétrolière & Centre d'affaires", active: true },
  ];

  return (
    <AppShell showHeader={true} showBottomNav={false} maxWidth="full" className="px-0 sm:px-0 lg:px-0">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[rgba(212,175,55,0.22)] bg-gradient-to-b from-[#151518] via-[#0B0B0D] to-[#0B0B0D] px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-20 lg:pb-32">
        {/* Glow ambient effects */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-2xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge officiel */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.3)] bg-[#151518]/90 px-4 py-1.5 text-xs font-semibold text-[#D4AF37] backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Sparkles size={14} className="text-[#D4AF37]" />
            <span>Conciergerie Privée &amp; Accompagnement d&apos;Élite au Gabon</span>
          </div>

          {/* Titre Principal */}
          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-[#FAFAF9] sm:text-5xl lg:text-6xl lg:leading-tight">
            Votre temps mérite <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FAFAF9] via-[#F1D875] to-[#D4AF37] bg-clip-text text-transparent">
              une présence de qualité.
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base lg:text-lg">
            Découvrez des profils vérifiés pour vos événements, rendez-vous professionnels et moments de compagnie encadrés.
          </p>

          {/* Boutons d'Action Principaux */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
            <Link
              href="/explore"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-8 py-4 text-sm font-bold text-[#0B0B0D] transition-all hover:bg-[#F1D875] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] sm:w-auto"
            >
              <Compass size={18} />
              <span>Trouver un profil</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/auth/signup?role=companion"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(212,175,55,0.3)] bg-[#151518] px-8 py-4 text-sm font-bold text-[#FAFAF9] transition-all hover:border-[#D4AF37] hover:bg-[#202024] sm:w-auto"
            >
              <Sparkles size={18} className="text-[#D4AF37]" />
              <span>Proposer mes services</span>
            </Link>
          </div>

          {/* Garanties clés */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#151518]/60 p-3 text-left">
              <ShieldCheck size={16} className="text-[#22C55E] shrink-0" />
              <span className="text-xs font-medium text-[#FAFAF9]">Identités Vérifiées</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#151518]/60 p-3 text-left">
              <Building size={16} className="text-[#D4AF37] shrink-0" />
              <span className="text-xs font-medium text-[#FAFAF9]">Lieux Publics Certifiés</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#151518]/60 p-3 text-left">
              <Lock size={16} className="text-[#D4AF37] shrink-0" />
              <span className="text-xs font-medium text-[#FAFAF9]">Séquestre Mobile Money</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#151518]/60 p-3 text-left">
              <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
              <span className="text-xs font-medium text-[#FAFAF9]">Validation par Code OTP</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION POSITIONNEMENT */}
      <section id="positioning" className="border-b border-white/5 bg-[#0B0B0D] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
            Notre Démarche
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-4xl">
            Un cadre professionnel, élégant et strictement sécurisé
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
            UP est une plateforme de conciergerie privée qui met en relation des clients distingués avec des accompagnateurs et hôtes qualifiés. Toutes les prestations sont formellement encadrées, réservées dans des établissements publics renommés et validées par un processus d&apos;identité rigoureux.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 text-left">
            <div className="rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 shadow-xl">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                <Utensils size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#FAFAF9]">
                Dîners &amp; Affaires
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                Présence soignée et aisance relationnelle pour vos déjeuners d&apos;affaires, réceptions diplomatiques et délégations.
              </p>
            </div>

            <div className="rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 shadow-xl">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F1D875]/15 text-[#F1D875]">
                <PartyPopper size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#FAFAF9]">
                Événementiel &amp; Galas
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                Hôtes et hôtesses d&apos;excellence pour vos soirées privées, vernissages, cocktails et cérémonies officielles.
              </p>
            </div>

            <div className="rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#151518] p-6 shadow-xl">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                <Briefcase size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#FAFAF9]">
                Assistance &amp; Logistique
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                Accueil aéroport Léon-Mba, coordination de vos déplacements et guidage exécutif en toute discrétion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION AVANTAGES CLIENT & PRESTATAIRE */}
      <section className="border-b border-white/5 bg-[#151518] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Espace Client */}
            <div className="rounded-3xl border border-[rgba(212,175,55,0.22)] bg-[#0B0B0D] p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Compass size={20} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#FAFAF9]">
                    Pour les Clients
                  </h3>
                  <p className="text-xs text-[#D4AF37]">Expérience sur-mesure &amp; Sérénité</p>
                </div>
              </div>

              <ul className="mt-6 space-y-4 text-xs text-[#A1A1AA]">
                <li className="flex items-start gap-3">
                  <BadgeCheck size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Profils 100% vérifiés :</strong> Contrôle des pièces d&apos;identité et agrément préalable par nos équipes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Sélection par zone &amp; compétences :</strong> Trouver instantanément l&apos;accompagnement adapté à votre quartier.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Paiement consigné (Séquestre) :</strong> Vos fonds restent protégés jusqu&apos;à la confirmation effective du rendez-vous.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Assistance conciergerie :</strong> Une équipe dédiée et un bouton d&apos;urgence pour veiller sur vos missions.</span>
                </li>
              </ul>

              <Link
                href="/explore"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875]"
              >
                <span>Explorer les profils</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Espace Prestataire */}
            <div className="rounded-3xl border border-white/10 bg-[#0B0B0D] p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1D875]/20 text-[#F1D875]">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#FAFAF9]">
                    Pour les Prestataires
                  </h3>
                  <p className="text-xs text-[#F1D875]">Indépendance &amp; Revenus garantis</p>
                </div>
              </div>

              <ul className="mt-6 space-y-4 text-xs text-[#A1A1AA]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Profil professionnel soigné :</strong> Valorisez vos compétences linguistiques, culturelles et protocolaires.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Radar de demandes en direct :</strong> Recevez des propositions ciblées et choisissez vos missions librement.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Wallet size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Retraits Mobile Money instantanés :</strong> Virement direct vers votre compte Airtel Money ou Moov Money.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
                  <span><strong className="text-[#FAFAF9]">Sécurité totale :</strong> Rencontres obligatoires dans les restaurants et hôtels certifiés de Libreville.</span>
                </li>
              </ul>

              <Link
                href="/auth/signup?role=companion"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(212,175,55,0.3)] bg-[#151518] py-3 text-xs font-bold text-[#FAFAF9] transition hover:border-[#D4AF37] hover:bg-[#202024]"
              >
                <span>Devenir prestataire certifié</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION FONCTIONNEMENT */}
      <section id="how-it-works" className="border-b border-white/5 bg-[#0B0B0D] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
            Simplicité &amp; Rigueur
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-4xl">
            Comment fonctionne UP ?
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-4 text-left">
            <div className="rounded-3xl border border-white/10 bg-[#151518] p-5">
              <span className="font-display text-2xl font-bold text-[#D4AF37]">01</span>
              <h4 className="mt-3 text-sm font-bold text-[#FAFAF9]">Choisir un profil</h4>
              <p className="mt-1.5 text-xs text-[#A1A1AA]">
                Consultez les compétences, langues et tarifs des accompagnateurs vérifiés.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#151518] p-5">
              <span className="font-display text-2xl font-bold text-[#D4AF37]">02</span>
              <h4 className="mt-3 text-sm font-bold text-[#FAFAF9]">Envoyer la demande</h4>
              <p className="mt-1.5 text-xs text-[#A1A1AA]">
                Indiquez la date, l&apos;horaire et sélectionnez un lieu public sécurisé.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#151518] p-5">
              <span className="font-display text-2xl font-bold text-[#D4AF37]">03</span>
              <h4 className="mt-3 text-sm font-bold text-[#FAFAF9]">Séquestre garanti</h4>
              <p className="mt-1.5 text-xs text-[#A1A1AA]">
                Consignez les fonds en toute sécurité via Airtel Money ou Moov Money.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#151518] p-5">
              <span className="font-display text-2xl font-bold text-[#D4AF37]">04</span>
              <h4 className="mt-3 text-sm font-bold text-[#FAFAF9]">Clôture par code OTP</h4>
              <p className="mt-1.5 text-xs text-[#A1A1AA]">
                À la fin du rendez-vous, validez la fin de mission avec le code partagé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION SÉCURITÉ & CHARTE */}
      <section id="safety" className="border-b border-white/5 bg-[#151518] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#22C55E]">
            Engagement &amp; Éthique
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#FAFAF9] sm:text-4xl">
            La sécurité comme premier standard
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA]">
            UP garantit un environnement respectueux, strictement conforme aux lois gabonaises et dédié exclusivement aux prestations d&apos;accompagnement social, culturel et professionnel.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 text-left">
            <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-[#0B0B0D] p-5">
              <ShieldCheck size={22} className="text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#FAFAF9]">Vérification KYC obligatoire</h4>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Pièce d&apos;identité officielle et vérification de conformité avant toute visibilité publique.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-[#0B0B0D] p-5">
              <Building size={22} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#FAFAF9]">Lieux publics agréés</h4>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Les rencontres s&apos;effectuent uniquement dans des restaurants, hôtels et salons publics partenaires.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-[#0B0B0D] p-5">
              <Lock size={22} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#FAFAF9]">Confidentialité &amp; Protection</h4>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Vos coordonnées privées restent strictement protégées et ne sont jamais communiquées sans accord.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-[#0B0B0D] p-5">
              <Shield size={22} className="text-[#22C55E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#FAFAF9]">Support &amp; Signalement réactif</h4>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Ligne d&apos;assistance permanente pour répondre à tout incident ou comportement inadapté.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION ZONES COUVERTES */}
      <section className="border-b border-white/5 bg-[#0B0B0D] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
            Territoire
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#FAFAF9]">
            Zones d&apos;intervention au Gabon
          </h2>
          <p className="mt-2 text-xs text-[#A1A1AA]">
            Disponibilité progressive sur les principaux pôles urbains et économiques
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-4 text-left">
            {activeZones.map((zone) => (
              <div
                key={zone.name}
                className="rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#151518] p-4 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold text-[#FAFAF9]">{zone.name}</span>
                  <span className="flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    Actif
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-[#A1A1AA] leading-relaxed">{zone.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. APPEL À L'ACTION FINAL */}
      <section className="border-b border-white/5 bg-gradient-to-b from-[#151518] to-[#0B0B0D] px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <UpLogo size={48} showText={false} className="mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-[#FAFAF9] sm:text-4xl">
            Prêt à vivre une expérience d&apos;exception ?
          </h2>
          <p className="mt-4 text-xs leading-relaxed text-[#A1A1AA] sm:text-sm">
            Rejoignez dès maintenant la communauté UP et accédez aux profils les plus qualifiés de Libreville.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup?role=client"
              className="w-full rounded-2xl bg-[#D4AF37] px-8 py-4 text-xs font-bold text-[#0B0B0D] transition hover:bg-[#F1D875] sm:w-auto"
            >
              Créer mon compte client
            </Link>
            <Link
              href="/auth/signup?role=companion"
              className="w-full rounded-2xl border border-white/10 bg-[#151518] px-8 py-4 text-xs font-bold text-[#FAFAF9] transition hover:border-[#D4AF37] sm:w-auto"
            >
              Devenir prestataire
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER OFFICIEL */}
      <footer className="bg-[#0B0B0D] px-4 py-12 text-xs text-[#A1A1AA] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <UpLogo size={32} showText={true} />
            <p className="mt-2 text-[11px] text-[#A1A1AA]/80 max-w-xs">
              Plateforme d&apos;accompagnement social encadré et de conciergerie privée au Gabon.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs">
            <Link href="/explore" className="hover:text-[#FAFAF9]">
              Explorer
            </Link>
            <Link href="/#how-it-works" className="hover:text-[#FAFAF9]">
              Fonctionnement
            </Link>
            <Link href="/#safety" className="hover:text-[#FAFAF9]">
              Charte de sécurité
            </Link>
            <Link href="/auth/login" className="hover:text-[#D4AF37]">
              Connexion
            </Link>
            <Link href="/dashboard/admin" className="hover:text-[#D4AF37]">
              Accès Administration
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A1A1AA]/60">
          <p>© 2026 UP Gabon. Tous droits réservés.</p>
          <p className="mt-2 sm:mt-0">Fait avec prestige pour Libreville, Akanda &amp; Port-Gentil</p>
        </div>
      </footer>
    </AppShell>
  );
}
