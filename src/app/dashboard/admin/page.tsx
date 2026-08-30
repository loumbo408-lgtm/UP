"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Lock,
  MapPin,
  Radio,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useUpStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export default function AdminDashboardOverviewPage() {
  const hydrated = useHydrated();

  const kycApplicants = useUpStore((s) => s.kycApplicants);
  const adminEscrows = useUpStore((s) => s.adminEscrows);
  const adminVenues = useUpStore((s) => s.adminVenues);

  // Calculs financiers dynamiques
  const heldEscrows = adminEscrows.filter((e) => e.status === "held" || e.status === "disputed");
  const totalHeldAmountXaf = heldEscrows.reduce(
    (acc, item) => acc + item.totalAmountXaf,
    0,
  );

  const totalCommissionsEarnedXaf = adminEscrows.reduce(
    (acc, item) => acc + item.platformFeeXaf,
    18500, // base commissions
  );

  const pendingKycCount = kycApplicants.filter((a) => a.status === "pending").length;
  const disputedEscrowsCount = adminEscrows.filter((e) => e.status === "disputed").length;

  return (
    <main className="px-5 pt-4 space-y-5">
      {/* En-tête de bienvenue Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-up-gold">
            Tour de Contrôle Plateforme
          </span>
          <h1 className="font-display text-2xl font-bold text-up-white">
            Tableau de Bord Exécutif
          </h1>
          <p className="text-xs text-up-gray">
            Surveillance en temps réel des séquestres, modération KYC et conformité des lieux.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            Opérations Libreville 100% Actives
          </span>
        </div>
      </div>

      {/* 1. Les 4 Métriques Globales Exécutives */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* A. Total sous séquestre */}
        <div className="rounded-3xl border border-up-gold/40 bg-gradient-to-br from-up-surface via-up-surface to-up-gold/10 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-up-gold">
              Fonds sous Séquestre
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-up-gold/20 text-up-gold">
              <Lock size={16} />
            </span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-up-white">
            {hydrated ? totalHeldAmountXaf.toLocaleString("fr-FR") : "—"}{" "}
            <span className="text-xs font-normal text-up-gold">FCFA</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
            <ShieldCheck size={12} />
            <span>{heldEscrows.length} transactions protégées</span>
          </p>
        </div>

        {/* B. Chiffre d'affaires commissions UP */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-up-surface via-up-surface to-emerald-950/20 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
              Commissions UP (10%)
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Coins size={16} />
            </span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-up-white">
            {hydrated ? totalCommissionsEarnedXaf.toLocaleString("fr-FR") : "—"}{" "}
            <span className="text-xs font-normal text-emerald-400">FCFA</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
            <TrendingUp size={12} />
            <span>+24.5% vs semaine dernière</span>
          </p>
        </div>

        {/* C. Prestataires en ligne */}
        <div className="rounded-3xl border border-white/10 bg-up-surface p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-up-gray">
              Prestataires en Ligne
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-up-white">
              <Users size={16} />
            </span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-up-white">
            42 <span className="text-xs font-normal text-up-gray">disponibles</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Akanda, Sablière, Louis, Batterie IV</span>
          </p>
        </div>

        {/* D. Missions du jour */}
        <div className="rounded-3xl border border-white/10 bg-up-surface p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-up-gray">
              Missions du Jour
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-up-white">
              <Activity size={16} />
            </span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-up-white">
            18 <span className="text-xs font-normal text-up-gray">au total</span>
          </p>
          <p className="mt-1 text-[10px] text-up-gold-soft">
            12 clôturées · 4 en cours · 2 prévues ce soir
          </p>
        </div>
      </div>

      {/* 2. Alertes Prioritaires de Gestion & Modération */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Alerte Modération KYC */}
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-up-surface p-5 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <UserCheck size={16} />
                Modération KYC en Attente ({pendingKycCount})
              </span>
              <p className="mt-1 text-xs text-up-gray">
                3 dossiers de nouveaux prestataires avec CNI gabonaise et selfie vidéo nécessitent votre validation.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300">
              Priorité Haute
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex -space-x-2 overflow-hidden">
              {kycApplicants.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-up-black bg-up-surface text-center font-bold text-xs text-up-gold leading-8"
                >
                  {app.fullName.charAt(0)}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/admin/kyc"
              className="flex items-center gap-1.5 rounded-xl bg-up-gold px-3.5 py-2 text-xs font-bold text-up-black hover:bg-up-gold-soft"
            >
              <span>Vérifier les dossiers</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Alerte Litiges & Arbitrage Séquestres */}
        <div className="rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/20 to-up-surface p-5 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <Scale size={16} />
                Litiges &amp; Arbitrage ({disputedEscrowsCount})
              </span>
              <p className="mt-1 text-xs text-up-gray">
                {disputedEscrowsCount > 0
                  ? "1 dossier de litige ouvert suite à un départ anticipé à l'Hôtel Nomad."
                  : "Aucun litige ouvert. Toutes les missions se déroulent normalement."}
              </p>
            </div>
            <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-300">
              Arbitrage Requis
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[11px] font-mono text-up-gray">
              Réf : UP-ESCROW-20260830-AIRTEL-3K8D
            </span>
            <Link
              href="/dashboard/admin/escrows"
              className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/20 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/30"
            >
              <span>Arbitrer le litige</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Activité en Direct (Live Feed) & Lieux Certifiés */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne 1 & 2 : Flux des Transactions & Séquestres */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-up-surface p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
              <Activity size={15} />
              Dernières Transactions &amp; Séquestres Mobile Money
            </span>
            <Link
              href="/dashboard/admin/escrows"
              className="text-[11px] text-up-gold hover:underline"
            >
              Voir tout ({adminEscrows.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {adminEscrows.map((esc) => {
              const isHeld = esc.status === "held";
              const isDisputed = esc.status === "disputed";
              const isReleased = esc.status === "released_to_companion";

              return (
                <div
                  key={esc.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-up-black/50 p-3.5 hover:border-white/15 transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold ${
                        isDisputed
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : isHeld
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {esc.paymentOperator === "airtel_money" ? "AIRTEL" : "MOOV"}
                    </span>
                    <div>
                      <p className="font-semibold text-xs text-up-white">
                        {esc.clientName} ➔ {esc.companionName}
                      </p>
                      <p className="text-[11px] text-up-gray">
                        {esc.venueName} · {esc.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-sm font-bold text-up-gold block">
                      {esc.totalAmountXaf.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isDisputed
                          ? "text-red-400"
                          : isHeld
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}
                    >
                      {isDisputed
                        ? "⚠️ Litige en cours"
                        : isHeld
                          ? "🛡️ Séquestre Bloqué"
                          : "✓ Clôturé & Versé"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne 3 : Réseau des Lieux Publics Certifiés */}
        <div className="rounded-3xl border border-white/10 bg-up-surface p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-up-gold">
              <Building2 size={15} />
              Lieux Partenaires ({adminVenues.length})
            </span>
            <Link
              href="/dashboard/admin/venues"
              className="text-[11px] text-up-gold hover:underline"
            >
              Gérer
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {adminVenues.slice(0, 4).map((venue) => (
              <div
                key={venue.id}
                className="rounded-2xl border border-white/5 bg-up-black/50 p-3 flex items-start justify-between"
              >
                <div>
                  <p className="font-semibold text-up-white text-xs">{venue.name}</p>
                  <p className="text-[11px] text-up-gray">{venue.zone}</p>
                  <p className="mt-1 text-[10px] text-emerald-400 font-medium">
                    ✓ Sécurité 24/7 certifiée UP
                  </p>
                </div>
                <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-bold text-up-gray">
                  {venue.monthlyMissionsCount} missions/mois
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/admin/venues"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-up-gray hover:text-up-white hover:border-white/20"
          >
            <span>Ajouter ou configurer des lieux</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </main>
  );
}
